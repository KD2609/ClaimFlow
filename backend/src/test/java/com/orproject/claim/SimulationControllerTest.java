package com.orproject.claim;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orproject.claim.dto.SimulationRequestDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SimulationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetSensitivityExperimentsReturnsAllThreeExperiments() throws Exception {
        mockMvc.perform(get("/api/simulation/experiments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.experiment1_arrivalRate").isArray())
                .andExpect(jsonPath("$.experiment1_arrivalRate[0].arrivalRate").exists())
                .andExpect(jsonPath("$.experiment1_arrivalRate[0].manualWaitTime").exists())
                .andExpect(jsonPath("$.experiment1_arrivalRate[0].automatedWaitTime").exists())
                .andExpect(jsonPath("$.experiment2_employeeScaling").isArray())
                .andExpect(jsonPath("$.experiment2_employeeScaling[0].employeeCount").exists())
                .andExpect(jsonPath("$.experiment2_employeeScaling[0].manualWaitTime").exists())
                .andExpect(jsonPath("$.experiment2_employeeScaling[0].manualUtilization").exists())
                .andExpect(jsonPath("$.experiment3_botScaling").isArray())
                .andExpect(jsonPath("$.experiment3_botScaling[0].botCount").exists())
                .andExpect(jsonPath("$.experiment3_botScaling[0].costSavingsPercent").exists())
                .andExpect(jsonPath("$.experiment3_botScaling[0].botWaitTime").exists());
    }

    @Test
    void testRunSimulationEndpoint() throws Exception {
        SimulationRequestDto request = new SimulationRequestDto();
        request.setNumClaims(250);
        request.setDurationHours(40.0);
        request.setNumEmployees(4);
        request.setNumBots(3);
        request.setArrivalRate(12.0);

        mockMvc.perform(post("/api/simulation/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scenarioA_manual").exists())
                .andExpect(jsonPath("$.scenarioB_automated").exists())
                .andExpect(jsonPath("$.comparison").exists());
    }
}

