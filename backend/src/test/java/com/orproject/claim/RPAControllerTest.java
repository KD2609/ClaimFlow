package com.orproject.claim;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orproject.claim.dto.RPABatchRequest;
import com.orproject.claim.model.ClaimStatus;
import com.orproject.claim.model.InsuranceClaim;
import com.orproject.claim.model.InsuranceType;
import com.orproject.claim.repository.InsuranceClaimRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RPAControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private InsuranceClaimRepository claimRepository;

    private InsuranceClaim testClaim1;
    private InsuranceClaim testClaim2;

    @BeforeEach
    void setUp() {
        claimRepository.deleteAll();

        testClaim1 = new InsuranceClaim();
        testClaim1.setClaimNumber("CLM-TEST-RPA-01");
        testClaim1.setCustomerName("RPA Claimant One");
        testClaim1.setPolicyNumber("POL-RPA-001");
        testClaim1.setInsuranceType(InsuranceType.HEALTH);
        testClaim1.setClaimAmount(new BigDecimal("1500.00"));
        testClaim1.setCoverageAmount(new BigDecimal("25000.00"));
        testClaim1.setAttachedDocuments("MedicalInvoice.pdf");
        testClaim1.setFraudRiskScore(15);
        testClaim1.setClaimStatus(ClaimStatus.SUBMITTED);
        testClaim1.setSubmissionDate(LocalDateTime.now());
        testClaim1 = claimRepository.save(testClaim1);

        testClaim2 = new InsuranceClaim();
        testClaim2.setClaimNumber("CLM-TEST-RPA-02");
        testClaim2.setCustomerName("RPA Claimant Two");
        testClaim2.setPolicyNumber("POL-RPA-002");
        testClaim2.setInsuranceType(InsuranceType.VEHICLE);
        testClaim2.setClaimAmount(new BigDecimal("3000.00"));
        testClaim2.setCoverageAmount(new BigDecimal("15000.00"));
        testClaim2.setAttachedDocuments("RepairBill.pdf");
        testClaim2.setFraudRiskScore(20);
        testClaim2.setClaimStatus(ClaimStatus.SUBMITTED);
        testClaim2.setSubmissionDate(LocalDateTime.now());
        testClaim2 = claimRepository.save(testClaim2);
    }

    @Test
    void testExecuteSingleWithRunPathAndQueryParams() throws Exception {
        mockMvc.perform(post("/api/rpa/run/" + testClaim1.getId())
                        .param("botId", "RPA-BOT-01")
                        .param("botHourlyCost", "4.20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.claimId").value(testClaim1.getId()))
                .andExpect(jsonPath("$.claimStatus").value("APPROVED"))
                .andExpect(jsonPath("$.executionDurationMs").isNumber())
                .andExpect(jsonPath("$.operationalCost").isNumber());
    }

    @Test
    void testExecuteSingleWithProcessPathAndJsonBody() throws Exception {
        RPABatchRequest body = new RPABatchRequest();
        body.setBotId("RPA-BOT-02");
        body.setBotHourlyCost(4.50);

        mockMvc.perform(post("/api/rpa/process/" + testClaim2.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.claimId").value(testClaim2.getId()))
                .andExpect(jsonPath("$.claimStatus").value("APPROVED"))
                .andExpect(jsonPath("$.executionDurationMs").isNumber());
    }

    @Test
    void testExecuteBatchProcessing() throws Exception {
        RPABatchRequest request = new RPABatchRequest();
        request.setLimit(5);
        request.setBotId("RPA-BOT-01");
        request.setBotHourlyCost(4.20);

        mockMvc.perform(post("/api/rpa/batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProcessed").isNumber())
                .andExpect(jsonPath("$.approvedCount").isNumber())
                .andExpect(jsonPath("$.results").isArray());
    }

    @Test
    void testGetRecentLogsWithBothEndpointAliases() throws Exception {
        // First run a single claim to generate an audit log entry
        mockMvc.perform(post("/api/rpa/run/" + testClaim1.getId()))
                .andExpect(status().isOk());

        // Test primary endpoint: /api/rpa/recent-logs
        mockMvc.perform(get("/api/rpa/recent-logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].botId").exists())
                .andExpect(jsonPath("$[0].executionStatus").exists());

        // Test alias endpoint: /api/rpa/logs/recent
        mockMvc.perform(get("/api/rpa/logs/recent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].botId").exists())
                .andExpect(jsonPath("$[0].executionStatus").exists());
    }

    @Test
    void testGetLogsPagination() throws Exception {
        mockMvc.perform(get("/api/rpa/logs?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").isNumber());
    }
}

