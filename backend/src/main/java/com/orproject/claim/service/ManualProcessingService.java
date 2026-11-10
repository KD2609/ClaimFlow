package com.orproject.claim.service;

import com.orproject.claim.dto.ManualDecisionRequest;
import com.orproject.claim.dto.ManualStageProgressRequest;
import com.orproject.claim.model.ClaimStatus;
import com.orproject.claim.model.InsuranceClaim;
import com.orproject.claim.model.ProcessingMode;
import com.orproject.claim.model.ProcessingStage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ManualProcessingService {

    private final ClaimService claimService;

    public ManualProcessingService(ClaimService claimService) {
        this.claimService = claimService;
    }

    @Transactional
    public InsuranceClaim progressStage(ManualStageProgressRequest request) {
        InsuranceClaim claim = claimService.getClaimById(request.getClaimId());

        claim.setProcessingMode(ProcessingMode.MANUAL);
        claim.setClaimStatus(ClaimStatus.IN_REVIEW);

        if (request.getStage() != null) {
            claim.setCurrentStage(request.getStage());
        }

        // Accumulate active processing duration and labor expense
        double durationMin = request.getDurationMinutes() != null ? request.getDurationMinutes() : 4.5;
        double wageRate = request.getHourlyCost() != null ? request.getHourlyCost() : 28.50;
        double addedLaborCost = (durationMin / 60.0) * wageRate;

        claim.setProcessingTimeMinutes(claim.getProcessingTimeMinutes() + durationMin);
        claim.setOperationalCost(claim.getOperationalCost() + addedLaborCost);

        if (request.getNotes() != null) {
            String existingNotes = claim.getAdjudicationNotes() != null ? claim.getAdjudicationNotes() + " | " : "";
            claim.setAdjudicationNotes(existingNotes + "[" + claim.getCurrentStage() + "] " + request.getNotes());
        }

        return claimService.save(claim);
    }

    @Transactional
    public InsuranceClaim submitDecision(ManualDecisionRequest request) {
        InsuranceClaim claim = claimService.getClaimById(request.getClaimId());

        claim.setCurrentStage(ProcessingStage.FINAL_DECISION);
        claim.setProcessedDate(LocalDateTime.now());

        double extraMin = request.getAdditionalDurationMinutes() != null ? request.getAdditionalDurationMinutes() : 2.0;
        double wageRate = request.getHourlyCost() != null ? request.getHourlyCost() : 28.50;
        double extraCost = (extraMin / 60.0) * wageRate;

        claim.setProcessingTimeMinutes(claim.getProcessingTimeMinutes() + extraMin);
        claim.setOperationalCost(claim.getOperationalCost() + extraCost);

        if ("APPROVED".equalsIgnoreCase(request.getDecision())) {
            claim.setClaimStatus(ClaimStatus.APPROVED);
            if (request.getApprovedAmount() != null) {
                claim.setEligiblePayoutAmount(BigDecimal.valueOf(request.getApprovedAmount()));
            }
        } else {
            claim.setClaimStatus(ClaimStatus.REJECTED);
            claim.setEligiblePayoutAmount(BigDecimal.ZERO);
        }

        if (request.getNotes() != null) {
            String existingNotes = claim.getAdjudicationNotes() != null ? claim.getAdjudicationNotes() + " | " : "";
            claim.setAdjudicationNotes(existingNotes + "[FINAL] " + request.getNotes());
        }

        return claimService.save(claim);
    }

    public List<Map<String, Object>> getStageHistory(Long claimId) {
        InsuranceClaim claim = claimService.getClaimById(claimId);
        List<Map<String, Object>> history = new ArrayList<>();

        if (claim.getProcessingTimeMinutes() > 0) {
            history.add(Map.of(
                "processingStage", claim.getCurrentStage().name(),
                "durationMinutes", claim.getProcessingTimeMinutes(),
                "laborCost", claim.getOperationalCost(),
                "notes", claim.getAdjudicationNotes() != null ? claim.getAdjudicationNotes() : "Manual verification active",
                "performerType", "HUMAN_ADJUSTER",
                "timestamp", claim.getSubmissionDate() != null ? claim.getSubmissionDate().toString() : LocalDateTime.now().toString()
            ));
        }
        return history;
    }
}
