package com.orproject.claim.repository;

import com.orproject.claim.model.ClaimStatus;
import com.orproject.claim.model.InsuranceClaim;
import com.orproject.claim.model.InsuranceType;
import com.orproject.claim.model.ProcessingMode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceClaimRepository extends JpaRepository<InsuranceClaim, Long>, JpaSpecificationExecutor<InsuranceClaim> {
    interface DashboardAggregateProjection {
        Long getTotalClaims();
        Long getPendingClaims();
        Long getInProgressClaims();
        Long getApprovedClaims();
        Long getRejectedClaims();
        Long getHealthClaims();
        Long getVehicleClaims();
        Long getLifeClaims();
        Double getAverageProcessingTimeMinutes();
        Double getTotalOperationalCost();
        Long getManualProcessedCount();
        Long getAutomatedProcessedCount();
        Double getManualOperationalCost();
        Double getAutomatedOperationalCost();
        Double getManualServiceTimeMinutes();
        Double getAutomatedServiceTimeMinutes();
        Long getDemoClaimMatches();
    }

    boolean existsByClaimNumber(String claimNumber);

    Optional<InsuranceClaim> findByClaimNumber(String claimNumber);

    List<InsuranceClaim> findByClaimStatus(ClaimStatus status);

    List<InsuranceClaim> findByClaimStatusIn(List<ClaimStatus> statuses);

    long countByClaimStatus(ClaimStatus status);

    long countByInsuranceType(InsuranceType type);

    long countByProcessingMode(ProcessingMode processingMode);

    @Query("SELECT AVG(c.processingTimeMinutes) FROM InsuranceClaim c WHERE c.claimStatus IN ('APPROVED', 'REJECTED') AND c.processingTimeMinutes > 0")
    Double getAverageProcessingTimeMinutes();

    @Query("SELECT AVG(c.processingTimeMinutes) FROM InsuranceClaim c WHERE c.processingMode = :processingMode AND c.processingTimeMinutes > 0")
    Double getAverageProcessingTimeByProcessingMode(@Param("processingMode") ProcessingMode processingMode);

    @Query("SELECT COALESCE(SUM(c.operationalCost), 0) FROM InsuranceClaim c")
    Double getTotalOperationalCost();

    @Query("SELECT COALESCE(SUM(c.operationalCost), 0) FROM InsuranceClaim c WHERE c.processingMode = :processingMode")
    Double getOperationalCostByProcessingMode(@Param("processingMode") ProcessingMode processingMode);

    @Query("""
        SELECT
            COUNT(c) AS totalClaims,
            COALESCE(SUM(CASE WHEN c.claimStatus IN (com.orproject.claim.model.ClaimStatus.SUBMITTED, com.orproject.claim.model.ClaimStatus.REQUIRES_MANUAL_REVIEW) THEN 1L ELSE 0L END), 0L) AS pendingClaims,
            COALESCE(SUM(CASE WHEN c.claimStatus = com.orproject.claim.model.ClaimStatus.IN_REVIEW THEN 1L ELSE 0L END), 0L) AS inProgressClaims,
            COALESCE(SUM(CASE WHEN c.claimStatus = com.orproject.claim.model.ClaimStatus.APPROVED THEN 1L ELSE 0L END), 0L) AS approvedClaims,
            COALESCE(SUM(CASE WHEN c.claimStatus = com.orproject.claim.model.ClaimStatus.REJECTED THEN 1L ELSE 0L END), 0L) AS rejectedClaims,
            COALESCE(SUM(CASE WHEN c.insuranceType = com.orproject.claim.model.InsuranceType.HEALTH THEN 1L ELSE 0L END), 0L) AS healthClaims,
            COALESCE(SUM(CASE WHEN c.insuranceType = com.orproject.claim.model.InsuranceType.VEHICLE THEN 1L ELSE 0L END), 0L) AS vehicleClaims,
            COALESCE(SUM(CASE WHEN c.insuranceType = com.orproject.claim.model.InsuranceType.LIFE THEN 1L ELSE 0L END), 0L) AS lifeClaims,
            AVG(CASE WHEN c.claimStatus IN (com.orproject.claim.model.ClaimStatus.APPROVED, com.orproject.claim.model.ClaimStatus.REJECTED) AND c.processingTimeMinutes > 0 THEN c.processingTimeMinutes ELSE NULL END) AS averageProcessingTimeMinutes,
            COALESCE(SUM(c.operationalCost), 0.0) AS totalOperationalCost,
            COALESCE(SUM(CASE WHEN c.processingMode = com.orproject.claim.model.ProcessingMode.MANUAL THEN 1L ELSE 0L END), 0L) AS manualProcessedCount,
            COALESCE(SUM(CASE WHEN c.processingMode = com.orproject.claim.model.ProcessingMode.AUTOMATED THEN 1L ELSE 0L END), 0L) AS automatedProcessedCount,
            COALESCE(SUM(CASE WHEN c.processingMode = com.orproject.claim.model.ProcessingMode.MANUAL THEN c.operationalCost ELSE 0.0 END), 0.0) AS manualOperationalCost,
            COALESCE(SUM(CASE WHEN c.processingMode = com.orproject.claim.model.ProcessingMode.AUTOMATED THEN c.operationalCost ELSE 0.0 END), 0.0) AS automatedOperationalCost,
            AVG(CASE WHEN c.processingMode = com.orproject.claim.model.ProcessingMode.MANUAL AND c.processingTimeMinutes > 0 THEN c.processingTimeMinutes ELSE NULL END) AS manualServiceTimeMinutes,
            AVG(CASE WHEN c.processingMode = com.orproject.claim.model.ProcessingMode.AUTOMATED AND c.processingTimeMinutes > 0 THEN c.processingTimeMinutes ELSE NULL END) AS automatedServiceTimeMinutes,
            COALESCE(SUM(CASE WHEN c.claimNumber = :demoClaimNumber THEN 1L ELSE 0L END), 0L) AS demoClaimMatches
        FROM InsuranceClaim c
    """)
    DashboardAggregateProjection getDashboardAggregates(@Param("demoClaimNumber") String demoClaimNumber);

    List<InsuranceClaim> findTop10ByOrderBySubmissionDateDesc();
}
