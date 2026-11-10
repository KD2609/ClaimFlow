package com.orproject.claim.repository;

import com.orproject.claim.model.ClaimStatus;
import com.orproject.claim.model.InsuranceClaim;
import com.orproject.claim.model.InsuranceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceClaimRepository extends JpaRepository<InsuranceClaim, Long> {
    Optional<InsuranceClaim> findByClaimNumber(String claimNumber);

    List<InsuranceClaim> findByClaimStatus(ClaimStatus status);

    List<InsuranceClaim> findByClaimStatusIn(List<ClaimStatus> statuses);

    @Query("SELECT c FROM InsuranceClaim c WHERE " +
           "(:status IS NULL OR c.claimStatus = :status) AND " +
           "(:type IS NULL OR c.insuranceType = :type) AND " +
           "(:query IS NULL OR LOWER(c.claimNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(c.customerName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(c.policyNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<InsuranceClaim> searchClaims(@Param("status") ClaimStatus status,
                                      @Param("type") InsuranceType type,
                                      @Param("query") String query,
                                      Pageable pageable);

    long countByClaimStatus(ClaimStatus status);

    long countByInsuranceType(InsuranceType type);

    @Query("SELECT AVG(c.processingTimeMinutes) FROM InsuranceClaim c WHERE c.claimStatus IN ('APPROVED', 'REJECTED') AND c.processingTimeMinutes > 0")
    Double getAverageProcessingTimeMinutes();

    @Query("SELECT SUM(c.operationalCost) FROM InsuranceClaim c WHERE c.operationalCost > 0")
    Double getTotalOperationalCost();

    List<InsuranceClaim> findTop10ByOrderBySubmissionDateDesc();
}
