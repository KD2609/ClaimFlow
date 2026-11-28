package com.orproject.claim;

import com.orproject.claim.model.ClaimStatus;
import com.orproject.claim.model.InsuranceClaim;
import com.orproject.claim.model.InsuranceType;
import com.orproject.claim.model.ProcessingMode;
import com.orproject.claim.repository.InsuranceClaimRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ClaimApiOptimizationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private InsuranceClaimRepository claimRepository;

    @BeforeEach
    void setUp() {
        claimRepository.deleteAll();
    }

    @Test
    void testDashboardStatsOnEmptyDatabase() throws Exception {
        mockMvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalClaims").value(0))
                .andExpect(jsonPath("$.pendingClaims").value(0))
                .andExpect(jsonPath("$.inProgressClaims").value(0))
                .andExpect(jsonPath("$.approvedClaims").value(0))
                .andExpect(jsonPath("$.rejectedClaims").value(0))
                .andExpect(jsonPath("$.totalOperationalCost").value(0.0));
    }

    @Test
    void testFilterClaimsByMultipleStatusesForManualWorkbench() throws Exception {
        InsuranceClaim submitted = new InsuranceClaim(
                "CLM-OPT-001", "Alice Smith", "alice@example.com", "POL-HLT-001",
                InsuranceType.HEALTH, new BigDecimal("2500.00"), "Outpatient visit", "Invoice.pdf"
        );
        submitted.setClaimStatus(ClaimStatus.SUBMITTED);

        InsuranceClaim inReview = new InsuranceClaim(
                "CLM-OPT-002", "Bob Jones", "bob@example.com", "POL-VEH-002",
                InsuranceType.VEHICLE, new BigDecimal("4200.00"), "Bumper repair", "Estimate.pdf"
        );
        inReview.setClaimStatus(ClaimStatus.IN_REVIEW);
        inReview.setProcessingTimeMinutes(6.5);
        inReview.setOperationalCost(3.09);

        InsuranceClaim approved = new InsuranceClaim(
                "CLM-OPT-003", "Carol Lee", "carol@example.com", "POL-LIF-003",
                InsuranceType.LIFE, new BigDecimal("10000.00"), "Settled claim", "Cert.pdf"
        );
        approved.setClaimStatus(ClaimStatus.APPROVED);
        approved.setProcessingMode(ProcessingMode.AUTOMATED);
        approved.setProcessingTimeMinutes(1.2);
        approved.setOperationalCost(0.08);
        approved.setSubmissionDate(LocalDateTime.now().minusMinutes(5));

        claimRepository.save(submitted);
        claimRepository.save(inReview);
        claimRepository.save(approved);

        mockMvc.perform(get("/api/claims")
                        .queryParam("statuses", "SUBMITTED,IN_REVIEW,REQUIRES_MANUAL_REVIEW")
                        .queryParam("size", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.totalElements").value(2));

        mockMvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalClaims").value(3))
                .andExpect(jsonPath("$.pendingClaims").value(1))
                .andExpect(jsonPath("$.inProgressClaims").value(1))
                .andExpect(jsonPath("$.approvedClaims").value(1))
                .andExpect(jsonPath("$.manualProcessedCount").value(2))
                .andExpect(jsonPath("$.automatedProcessedCount").value(1));
    }
}

