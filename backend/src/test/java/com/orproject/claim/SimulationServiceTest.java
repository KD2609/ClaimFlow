package com.orproject.claim;

import com.orproject.claim.dto.SimulationRequestDto;
import com.orproject.claim.dto.SimulationResponseDto;
import com.orproject.claim.service.SimulationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class SimulationServiceTest {

    @Autowired
    private SimulationService simulationService;

    @Test
    void testSimulationExecutionAndORMetrics() {
        SimulationRequestDto req = new SimulationRequestDto();
        req.setNumClaims(200);
        req.setDurationHours(40.0);
        req.setNumEmployees(4);
        req.setNumBots(3);
        req.setArrivalRate(12.0);
        req.setEmployeeHourlyRate(28.50);
        req.setBotHourlyRate(4.20);
        req.setExceptionRate(0.18);

        SimulationResponseDto response = simulationService.runSimulation(req);

        assertNotNull(response);

        // Validate Scenario A (Manual)
        Map<String, Object> manual = response.getScenarioAManual();
        assertNotNull(manual);
        assertTrue(manual.containsKey("avgProcessingTimeMinutes"));
        assertTrue(manual.containsKey("totalOperationalCost"));
        assertTrue(manual.containsKey("resourceUtilizationPercent"));

        // Validate Scenario B (Automated)
        Map<String, Object> auto = response.getScenarioBAutomated();
        assertNotNull(auto);
        assertTrue(auto.containsKey("avgProcessingTimeMinutes"));
        assertTrue(auto.containsKey("straightThroughRatePercent"));

        // Validate Comparison Deltas
        Map<String, Object> comparison = response.getComparison();
        assertNotNull(comparison);
        assertTrue(comparison.containsKey("costReductionPercent"));
    }
}
