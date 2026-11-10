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
    Optional<InsuranceClaim> findByClaimNumber(String claimNumber);

    List<InsuranceClaim> findByClaimStatus(ClaimStatus status);

    List<InsuranceClaim> findByClaimStatusIn(List<ClaimStatus> statuses);

    long countByClaimStatus(ClaimStatus status);

    long countByInsuranceType(InsuranceType type);

    long countByProcessingMode(ProcessingMode processingMode);

    @Query("SELECT AVG(c.processingTimeMinutes) FROM InsuranceClaim c WHERE c.claimStatus IN ('APPROVED', 'REJECTED') AND c.processingTimeMinutes > 0")
    Double getAverageProcessingTimeMinutes();

    @Query("SELECT COALESCE(SUM(c.operationalCost), 0) FROM InsuranceClaim c")
    Double getTotalOperationalCost();

    @Query("SELECT COALESCE(SUM(c.operationalCost), 0) FROM InsuranceClaim c WHERE c.processingMode = :processingMode")
    Double getOperationalCostByProcessingMode(@Param("processingMode") ProcessingMode processingMode);

    List<InsuranceClaim> findTop10ByOrderBySubmissionDateDesc();
}
