package com.orproject.claim.service;

import com.orproject.claim.dto.ClaimCreateRequest;
import com.orproject.claim.exception.ResourceNotFoundException;
import com.orproject.claim.model.ClaimStatus;
import com.orproject.claim.model.InsuranceClaim;
import com.orproject.claim.model.InsuranceType;
import com.orproject.claim.model.ProcessingMode;
import com.orproject.claim.repository.InsuranceClaimRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Random;

@Service
public class ClaimService {

    private final InsuranceClaimRepository claimRepository;
    private final Random random = new Random(42);

    public ClaimService(InsuranceClaimRepository claimRepository) {
        this.claimRepository = claimRepository;
    }

    public Page<InsuranceClaim> getClaims(ClaimStatus status, InsuranceType type, String search, Pageable pageable) {
        return claimRepository.searchClaims(status, type, search, pageable);
    }

    public InsuranceClaim getClaimById(Long id) {
        return claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance Claim not found with ID: " + id));
    }

    @Transactional
    public InsuranceClaim createClaim(ClaimCreateRequest request) {
        String claimNumber = "CLM-2026-" + String.format("%04d", claimRepository.count() + 1);

        String custName = request.getCustomerName() != null ? request.getCustomerName() : "Claimant " + (claimRepository.count() + 1);
        String custEmail = request.getCustomerEmail() != null ? request.getCustomerEmail() : "claimant@example.com";
        String polNo = request.getPolicyNumber() != null ? request.getPolicyNumber() : "POL-2026-" + String.format("%04d", random.nextInt(9000) + 1000);

        InsuranceClaim claim = new InsuranceClaim();
        claim.setClaimNumber(claimNumber);
        claim.setCustomerName(custName);
        claim.setCustomerEmail(custEmail);
        claim.setPolicyNumber(polNo);
        claim.setInsuranceType(request.getInsuranceType() != null ? request.getInsuranceType() : InsuranceType.HEALTH);
        claim.setClaimAmount(request.getClaimAmount() != null ? request.getClaimAmount() : new BigDecimal("2500.00"));
        claim.setEligiblePayoutAmount(claim.getClaimAmount());
        claim.setDescription(request.getDescription() != null ? request.getDescription() : "Standard claim submission.");
        claim.setAttachedDocuments(request.getAttachedDocuments() != null ? request.getAttachedDocuments() : "Hospital_Invoice.pdf, Identity_Card.pdf");
        claim.setClaimStatus(ClaimStatus.SUBMITTED);
        claim.setProcessingMode(ProcessingMode.MANUAL);
        claim.setSubmissionDate(LocalDateTime.now());

        // Simple heuristic fraud score
        int fraudScore = random.nextInt(35) + 5;
        if (claim.getClaimAmount().compareTo(new BigDecimal("15000")) > 0) {
            fraudScore += 35;
        }
        claim.setFraudRiskScore(fraudScore);

        return claimRepository.save(claim);
    }

    @Transactional
    public void deleteClaim(Long id) {
        InsuranceClaim claim = getClaimById(id);
        claimRepository.delete(claim);
    }

    @Transactional
    public InsuranceClaim save(InsuranceClaim claim) {
        return claimRepository.save(claim);
    }
}
