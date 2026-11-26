package com.orproject.claim;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orproject.claim.dto.DashboardStatsDto;
import com.orproject.claim.model.InsuranceType;
import com.orproject.claim.model.ProcessingMode;
import com.orproject.claim.repository.InsuranceClaimRepository;
import com.orproject.claim.repository.RPAExecutionLogRepository;
import com.orproject.claim.service.DashboardService;
import com.orproject.claim.service.DataSeederService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class DashboardAndSeederIntegrationTest {

    @Autowired
    private DataSeederService dataSeederService;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private InsuranceClaimRepository claimRepository;

    @Autowired
    private RPAExecutionLogRepository rpaLogRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testSeedingAndDashboardThreeChartsMetrics() throws Exception {
        // 1. Seed demo dataset (250 claims, 150 RPA logs)
        Map<String, Object> seedResult = dataSeederService.seedDemoData(true);
        assertNotNull(seedResult);
        assertEquals("SUCCESS", seedResult.get("status"));
        assertEquals(250, seedResult.get("seededClaims"));
        assertEquals(150, seedResult.get("seededRpaLogs"));

        // 2. Verify database records
        assertEquals(250L, claimRepository.count(), "Total claims in database must equal 250");
        assertEquals(150L, rpaLogRepository.count(), "Total RPA execution logs in database must equal 150");
        assertEquals(100L, claimRepository.countByInsuranceType(InsuranceType.HEALTH), "Health claims must equal 100");
        assertEquals(90L, claimRepository.countByInsuranceType(InsuranceType.VEHICLE), "Vehicle claims must equal 90");
        assertEquals(60L, claimRepository.countByInsuranceType(InsuranceType.LIFE), "Life claims must equal 60");
        assertEquals(100L, claimRepository.countByProcessingMode(ProcessingMode.MANUAL), "Manual claims must equal 100");
        assertEquals(150L, claimRepository.countByProcessingMode(ProcessingMode.AUTOMATED), "Automated claims must equal 150");

        // 3. Verify Dashboard stats
        DashboardStatsDto stats = dashboardService.getDashboardStats();
        assertNotNull(stats);
        assertEquals(250, stats.getTotalClaims());
        assertEquals("demo-data", stats.getDataSource());

        // 4. Verify Chart 1: Service & Queue Wait Times (Minutes)
        assertEquals(24.0, stats.getManualServiceTimeMinutes(), 0.5, "Manual service time ~24 min");
        assertEquals(1.2, stats.getAutomatedServiceTimeMinutes(), 0.5, "Automated service time ~1.2 min");
        assertEquals(38.5, stats.getManualWaitTimeMinutes(), 0.5, "Manual wait time ~38.5 min");
        assertEquals(0.3, stats.getAutomatedWaitTimeMinutes(), 0.5, "Automated wait time ~0.3 min");
        assertEquals(62.5, stats.getManualTotalCycleTimeMinutes(), 1.0, "Manual cycle time ~62.5 min");
        assertEquals(1.5, stats.getAutomatedTotalCycleTimeMinutes(), 1.0, "Automated cycle time ~1.5 min");
        assertEquals(97.6, stats.getCycleTimeReductionPercent(), 1.0, "Cycle time drop must equal 97.6% Faster");

        // 5. Verify Chart 2: Total Operational Cost & Cost Per Claim ($)
        assertTrue(stats.getManualOperationalCost() > 0, "Manual cost must be > 0");
        assertTrue(stats.getAutomatedOperationalCost() > 0, "Automated cost must be > 0");
        assertEquals(22.80, stats.getManualCostPerClaim(), 1.0, "Manual unit cost ~22.80");
        assertEquals(3.67, stats.getAutomatedCostPerClaim(), 1.0, "Automated unit cost ~3.67");
        assertEquals(83.9, stats.getCostReductionPercent(), 1.0, "Cost drop must equal 83.9% Saved");

        // 6. Verify Chart 3: Daily Processing Capacity (Claims / Day)
        assertEquals(48.0, stats.getManualThroughputPerDay(), 0.1, "Manual throughput = 48 claims/day");
        assertEquals(144.0, stats.getAutomatedThroughputPerDay(), 0.1, "Automated throughput = 144 claims/day");
        assertEquals(200.0, stats.getThroughputIncreasePercent(), 0.1, "Throughput surge must equal 200.0% Surge");

        System.out.println("=== DASHBOARD STATS TELEMETRY VERIFICATION ===");
        System.out.println(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(stats));
    }
}
