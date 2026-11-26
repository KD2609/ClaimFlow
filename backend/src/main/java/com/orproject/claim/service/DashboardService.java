package com.orproject.claim.service;

import com.orproject.claim.dto.DashboardStatsDto;
import com.orproject.claim.model.ClaimStatus;
import com.orproject.claim.model.ProcessingMode;
import com.orproject.claim.model.InsuranceType;
import com.orproject.claim.repository.InsuranceClaimRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final InsuranceClaimRepository claimRepository;
    private final DataSeederService dataSeederService;

    public DashboardService(InsuranceClaimRepository claimRepository, DataSeederService dataSeederService) {
        this.claimRepository = claimRepository;
        this.dataSeederService = dataSeederService;
    }

    public DashboardStatsDto getDashboardStats() {
        long total = claimRepository.count();
        long pending = claimRepository.countByClaimStatus(ClaimStatus.SUBMITTED);
        long inReview = claimRepository.countByClaimStatus(ClaimStatus.IN_REVIEW);
        long approved = claimRepository.countByClaimStatus(ClaimStatus.APPROVED);
        long rejected = claimRepository.countByClaimStatus(ClaimStatus.REJECTED);
        long manualReview = claimRepository.countByClaimStatus(ClaimStatus.REQUIRES_MANUAL_REVIEW);

        Double avgTime = claimRepository.getAverageProcessingTimeMinutes();
        Double totalCost = claimRepository.getTotalOperationalCost();

        DashboardStatsDto dto = new DashboardStatsDto();
        dto.setTotalClaims((int) total);
        dto.setPendingClaims((int) (pending + manualReview));
        dto.setInProgressClaims((int) inReview);
        dto.setApprovedClaims((int) approved);
        dto.setRejectedClaims((int) rejected);
        dto.setHealthClaims((int) claimRepository.countByInsuranceType(InsuranceType.HEALTH));
        dto.setVehicleClaims((int) claimRepository.countByInsuranceType(InsuranceType.VEHICLE));
        dto.setLifeClaims((int) claimRepository.countByInsuranceType(InsuranceType.LIFE));
        dto.setAverageProcessingTimeMinutes(avgTime != null ? avgTime : 0.0);
        dto.setTotalOperationalCost(totalCost != null ? totalCost : 0.0);

        // Breakdowns for Dashboard charts
        dto.setManualProcessedCount((int) claimRepository.countByProcessingMode(ProcessingMode.MANUAL));
        dto.setAutomatedProcessedCount((int) claimRepository.countByProcessingMode(ProcessingMode.AUTOMATED));
        dto.setManualOperationalCost(claimRepository.getOperationalCostByProcessingMode(ProcessingMode.MANUAL));
        dto.setAutomatedOperationalCost(claimRepository.getOperationalCostByProcessingMode(ProcessingMode.AUTOMATED));
        dto.setDataSource(dataSeederService.isDemoDataActive() ? "demo-data" : "live-database");

        return dto;
    }
}
