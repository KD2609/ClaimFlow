package com.orproject.claim;

import com.orproject.claim.dto.RoiTrajectoryRequestDto;
import com.orproject.claim.dto.RoiTrajectoryResponseDto;
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
public class QueueingTheoryTest {

    @Autowired
    private SimulationService simulationService;

    @Test
    void testErlangCAgainstTextbookStandardValues() {
        // Textbook Case: c = 2 servers, lambda = 2.0/hr, mu = 1.5/hr (mean service = 40 min)
        // a = 2.0 / 1.5 = 4/3, rho = a / c = 2/3 = 0.66667
        // Expected P_C = 8/15 = 0.53333
        int c = 2;
        double meanServiceMin = 40.0;
        double lambda = 2.0;
        double a = lambda / (60.0 / meanServiceMin);

        double pc = simulationService.erlangC(c, a);
        assertEquals(8.0 / 15.0, pc, 0.001, "Erlang-C delay probability must match textbook value (8/15)");

        double wqMin = simulationService.mmcWaitTimeMinutes(c, a, meanServiceMin);
        assertEquals(32.0, wqMin, 0.01, "Wq must equal 32.0 minutes (8/15 hours)");
    }

    @Test
    void testAllenCunneenApproximationAndCsRecovery() {
        // When Cs = 1.0 (exponential service times), M/G/c must equal M/M/c
        int c = 4;
        double lambda = 8.0;
        double meanServiceMin = 20.0; // mu = 3/hr, a = 8/3 = 2.667, rho = 2.667 / 4 = 0.667
        double exponentialStdDevMin = 20.0; // Cs = 1.0

        double a = lambda / (60.0 / meanServiceMin);
        double mmcWait = simulationService.mmcWaitTimeMinutes(c, a, meanServiceMin);
        double mgcWait = simulationService.mgcAllenCunneenWaitTimeMinutes(c, lambda, meanServiceMin, exponentialStdDevMin);

        assertEquals(mmcWait, mgcWait, 0.001, "Allen-Cunneen with Cs=1.0 must exactly recover M/M/c wait time");

        // When Cs < 1.0 (e.g. human adjusters with std=8 min on mean=24 min -> Cs = 1/3)
        // Allen-Cunneen factor = (1 + 1/9)/2 = 5/9 = 0.5556
        double humanStdDev = 8.0;
        double mgcHumanWait = simulationService.mgcAllenCunneenWaitTimeMinutes(c, lambda, 24.0, humanStdDev);
        assertTrue(mgcHumanWait > 0 && !Double.isInfinite(mgcHumanWait), "M/G/c wait time must be positive and finite");
    }

    @Test
    void testStabilityBoundaryEnforcement() {
        // Lambda = 20 claims/hr, c = 4 adjusters, mean service = 24 min
        // Max capacity = 4 * (60 / 24) = 10 claims/hr
        // rho = 20 / 10 = 2.0 >= 1.0 -> Unstable!
        SimulationRequestDto req = new SimulationRequestDto();
        req.setArrivalRate(20.0);
        req.setNumEmployees(4);
        req.setMeanManualTimeMinutes(24.0);
        req.setNumClaims(100);

        SimulationResponseDto res = simulationService.runSimulation(req);
        assertNotNull(res);
        assertFalse(res.isStable(), "System must report unstable when traffic intensity rho >= 1.0");
        assertNotNull(res.getStabilityWarning(), "Stability warning message must be populated");
        assertTrue(res.getStabilityWarning().contains("unstable"), "Warning must explicitly state unstable");
    }

    @Test
    void testLittlesLawOnAnalyticalOutput() {
        SimulationRequestDto req = new SimulationRequestDto();
        req.setArrivalRate(6.0); // Safe stable arrival rate
        req.setNumEmployees(4);
        req.setMeanManualTimeMinutes(24.0); // capacity = 10/hr, rho = 0.6
        req.setNumClaims(200);

        SimulationResponseDto res = simulationService.runSimulation(req);
        Map<String, Object> manual = res.getScenarioAManual();

        double wqMin = ((Number) manual.get("avgWaitingTimeMinutes")).doubleValue();
        double wMin = ((Number) manual.get("avgTotalCycleTimeMinutes")).doubleValue();
        double lq = ((Number) manual.get("queueLengthLq")).doubleValue();
        double l = ((Number) manual.get("systemCountL")).doubleValue();

        double expectedLq = 6.0 * (wqMin / 60.0);
        double expectedL = 6.0 * (wMin / 60.0);

        assertEquals(expectedLq, lq, 0.5, "Little's Law Lq = lambda * Wq must hold within rounding tolerance");
        assertEquals(expectedL, l, 0.5, "Little's Law L = lambda * W must hold within rounding tolerance");
    }

    @Test
    void testRoiEdgeCases() {
        // Case 1: Standard positive case
        RoiTrajectoryRequestDto req1 = new RoiTrajectoryRequestDto();
        req1.setInitialCapital(15000.0);
        req1.setAnnualMaintenance(2500.0);
        req1.setMonthlyVolume(1000);
        req1.setManualUnitCost(22.80);
        req1.setAutomatedUnitCost(4.48);

        RoiTrajectoryResponseDto res1 = simulationService.calculateRoiTrajectory(req1);
        assertNotNull(res1.getPaybackMonths());
        assertTrue(res1.getPaybackMonths() > 0 && res1.getPaybackMonths() < 12, "Payback should be within ~1 year");
        assertTrue(res1.getThreeYearRoiPercent() > 100.0, "3-Year ROI should be positive and substantial");
        assertEquals(37, res1.getTrajectoryData().size(), "37 monthly points (M0 to M36) must be generated");

        // Case 2: Negative net benefit (upkeep exceeds savings)
        RoiTrajectoryRequestDto req2 = new RoiTrajectoryRequestDto();
        req2.setInitialCapital(10000.0);
        req2.setAnnualMaintenance(50000.0); // Extremely high upkeep
        req2.setMonthlyVolume(10);
        req2.setManualUnitCost(10.0);
        req2.setAutomatedUnitCost(9.0);

        RoiTrajectoryResponseDto res2 = simulationService.calculateRoiTrajectory(req2);
        assertNull(res2.getPaybackMonths(), "Payback must be null (infinite) when monthly benefit is non-positive");
        assertTrue(res2.getThreeYearNetProfit() < 0, "Net profit must be negative");

        // Case 3: Zero initial capex
        RoiTrajectoryRequestDto req3 = new RoiTrajectoryRequestDto();
        req3.setInitialCapital(0.0);
        req3.setAnnualMaintenance(0.0);
        req3.setMonthlyVolume(500);
        req3.setManualUnitCost(20.0);
        req3.setAutomatedUnitCost(5.0);

        RoiTrajectoryResponseDto res3 = simulationService.calculateRoiTrajectory(req3);
        assertEquals(0.0, res3.getPaybackMonths(), 0.01, "Zero capital expenditure means immediate 0-month payback");
    }
}
