package com.orproject.claim.service;

import com.orproject.claim.dto.RPABatchRequest;
import com.orproject.claim.dto.RPABatchResponse;
import com.orproject.claim.dto.RPARunResultDto;
import com.orproject.claim.model.ClaimStatus;
import com.orproject.claim.model.InsuranceClaim;
import com.orproject.claim.model.ProcessingMode;
import com.orproject.claim.model.ProcessingStage;
import com.orproject.claim.model.RPAExecutionLog;
import com.orproject.claim.repository.InsuranceClaimRepository;
import com.orproject.claim.repository.RPAExecutionLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RPAExecutionService {

    private final InsuranceClaimRepository claimRepository;
    private final RPAExecutionLogRepository logRepository;

    public RPAExecutionService(InsuranceClaimRepository claimRepository, RPAExecutionLogRepository logRepository) {
        this.claimRepository = claimRepository;
        this.logRepository = logRepository;
    }

    @Transactional
    public RPARunResultDto processSingleClaim(Long claimId, String botId, Double botHourlyCost) {
        InsuranceClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found with ID: " + claimId));

        return executeBotRules(claim, botId != null ? botId : "RPA-BOT-01", botHourlyCost != null ? botHourlyCost : 4.20);
    }

    @Transactional
    public RPABatchResponse processBatch(RPABatchRequest request) {
        int limit = (request != null && request.getLimit() != null) ? request.getLimit() : 10;
        String botId = (request != null && request.getBotId() != null) ? request.getBotId() : "RPA-BOT-01";
        double hourlyCost = (request != null && request.getBotHourlyCost() != null) ? request.getBotHourlyCost() : 4.20;

        List<InsuranceClaim> pending = claimRepository.findByClaimStatus(ClaimStatus.SUBMITTED);
        if (pending.size() > limit) {
            pending = pending.subList(0, limit);
        }

        int approved = 0;
        int manualReview = 0;
        int rejected = 0;
        double totalDurationMs = 0.0;
        double totalCost = 0.0;
        List<RPARunResultDto> results = new ArrayList<>();

        for (InsuranceClaim claim : pending) {
            RPARunResultDto res = executeBotRules(claim, botId, hourlyCost);
            results.add(res);
            totalDurationMs += res.getExecutionDurationMs();
            totalCost += res.getOperationalCost();

            if (res.getClaimStatus() == ClaimStatus.APPROVED) {
                approved++;
            } else if (res.getClaimStatus() == ClaimStatus.REQUIRES_MANUAL_REVIEW) {
                manualReview++;
            } else {
                rejected++;
            }
        }

        return new RPABatchResponse(results.size(), approved, manualReview, rejected, totalDurationMs, totalCost, results);
    }

    private RPARunResultDto executeBotRules(InsuranceClaim claim, String botId, double botHourlyCost) {
        long startTime = System.currentTimeMillis();

        claim.setProcessingMode(ProcessingMode.AUTOMATED);
        claim.setCurrentStage(ProcessingStage.FINAL_DECISION);
        claim.setProcessedDate(LocalDateTime.now());

        // Simulated bot runtime: ~80ms to ~180ms
        double durationMs = 85.0 + (Math.random() * 95.0);
        double durationMin = durationMs / 60000.0;
        double botRunCost = (durationMin / 60.0) * botHourlyCost;

        claim.setProcessingTimeMinutes(durationMin);
        claim.setOperationalCost(botRunCost);

        String executionStatus = "SUCCESS";
        String details;

        // Rule 1: Fraud Risk Score Check
        if (claim.getFraudRiskScore() != null && claim.getFraudRiskScore() > 65) {
            claim.setClaimStatus(ClaimStatus.REQUIRES_MANUAL_REVIEW);
            claim.setAdjudicationNotes("[RPA BOT] Anomaly detected: Fraud risk score (" + claim.getFraudRiskScore() + ") exceeds straight-through threshold (65). Escalated to human examiner.");
            executionStatus = "EXCEPTION";
            details = "Flagged for manual review due to elevated fraud anomaly risk (" + claim.getFraudRiskScore() + "/100).";
        }
        // Rule 2: Document Completeness Check
        else if (claim.getAttachedDocuments() == null || claim.getAttachedDocuments().trim().isEmpty()) {
            claim.setClaimStatus(ClaimStatus.REQUIRES_MANUAL_REVIEW);
            claim.setAdjudicationNotes("[RPA BOT] Missing attachments: OCR verification could not locate medical bill or invoice. Routed to human adjuster.");
            executionStatus = "EXCEPTION";
            details = "Incomplete documentation. Claimant did not upload invoice attachments.";
        }
        // Rule 3: Coverage Limit Exceeded
        else if (claim.getClaimAmount().compareTo(claim.getCoverageAmount()) > 0) {
            claim.setClaimStatus(ClaimStatus.REJECTED);
            claim.setEligiblePayoutAmount(BigDecimal.ZERO);
            claim.setAdjudicationNotes("[RPA BOT] Claim amount ($" + claim.getClaimAmount() + ") exceeds active policy coverage limit ($" + claim.getCoverageAmount() + ").");
            executionStatus = "FAILED";
            details = "Rejected: Claimed amount exceeds policy coverage ceiling.";
        }
        // Rule 4: Straight-Through Processing Approval (STP)
        else {
            // Apply standard 10% policy deductible
            BigDecimal eligible = claim.getClaimAmount().multiply(new BigDecimal("0.90"));
            claim.setEligiblePayoutAmount(eligible);
            claim.setClaimStatus(ClaimStatus.APPROVED);
            claim.setAdjudicationNotes("[RPA BOT] Straight-Through Approval: Policy active, documents verified via OCR, 10% deductible applied ($" + eligible + " approved).");
            executionStatus = "SUCCESS";
            details = "Straight-Through Approved ($" + eligible + " eligible payout).";
        }

        claimRepository.save(claim);

        // Audit Trail Record
        RPAExecutionLog log = new RPAExecutionLog(
                claim.getId(),
                claim.getClaimNumber(),
                botId,
                executionStatus,
                durationMs,
                botRunCost,
                details
        );
        logRepository.save(log);

        return new RPARunResultDto(
                claim.getId(),
                claim.getClaimNumber(),
                claim.getClaimStatus(),
                durationMs,
                botRunCost,
                details
        );
    }

    public Page<RPAExecutionLog> getExecutionLogs(Pageable pageable) {
        return logRepository.findAllByOrderByTimestampDesc(pageable);
    }

    public List<RPAExecutionLog> getRecentLogs() {
        return logRepository.findTop10ByOrderByTimestampDesc();
    }
}
