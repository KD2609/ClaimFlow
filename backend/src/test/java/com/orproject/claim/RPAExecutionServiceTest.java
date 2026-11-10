package com.orproject.claim;

import com.orproject.claim.dto.RPABatchRequest;
import com.orproject.claim.dto.RPABatchResponse;
import com.orproject.claim.dto.RPARunResultDto;
import com.orproject.claim.model.ClaimStatus;
import com.orproject.claim.model.InsuranceClaim;
import com.orproject.claim.model.InsuranceType;
import com.orproject.claim.repository.InsuranceClaimRepository;
import com.orproject.claim.service.RPAExecutionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class RPAExecutionServiceTest {

    @Autowired
    private RPAExecutionService rpaExecutionService;

    @Autowired
    private InsuranceClaimRepository claimRepository;

    @Test
    void testProcessSingleClaimStraightThrough() {
        InsuranceClaim claim = new InsuranceClaim();
        claim.setClaimNumber("CLM-TEST-001");
        claim.setCustomerName("Test Claimant");
        claim.setPolicyNumber("POL-TEST-001");
        claim.setInsuranceType(InsuranceType.HEALTH);
        claim.setClaimAmount(new BigDecimal("2000.00"));
        claim.setCoverageAmount(new BigDecimal("20000.00"));
        claim.setAttachedDocuments("Invoice.pdf");
        claim.setFraudRiskScore(10);
        claim.setClaimStatus(ClaimStatus.SUBMITTED);
        claim = claimRepository.save(claim);

        RPARunResultDto result = rpaExecutionService.processSingleClaim(claim.getId(), "RPA-BOT-01", 4.20);

        assertNotNull(result);
        assertEquals(ClaimStatus.APPROVED, result.getClaimStatus());
        assertTrue(result.getExecutionDurationMs() > 0);
    }
}
