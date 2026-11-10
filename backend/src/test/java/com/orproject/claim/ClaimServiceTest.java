package com.orproject.claim;

import com.orproject.claim.dto.ClaimCreateRequest;
import com.orproject.claim.model.ClaimStatus;
import com.orproject.claim.model.InsuranceClaim;
import com.orproject.claim.model.InsuranceType;
import com.orproject.claim.service.ClaimService;
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
public class ClaimServiceTest {

    @Autowired
    private ClaimService claimService;

    @Test
    void testCreateClaim() {
        ClaimCreateRequest req = new ClaimCreateRequest();
        req.setCustomerName("Jane Doe");
        req.setCustomerEmail("jane.doe@example.com");
        req.setPolicyNumber("POL-HLT-9999");
        req.setInsuranceType(InsuranceType.HEALTH);
        req.setClaimAmount(new BigDecimal("3500.00"));
        req.setDescription("Medical outpatient claim.");

        InsuranceClaim created = claimService.createClaim(req);

        assertNotNull(created);
        assertNotNull(created.getId());
        assertNotNull(created.getClaimNumber());
        assertEquals("Jane Doe", created.getCustomerName());
        assertEquals(ClaimStatus.SUBMITTED, created.getClaimStatus());
    }
}
