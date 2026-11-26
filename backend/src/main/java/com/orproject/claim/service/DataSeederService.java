package com.orproject.claim.service;

import com.orproject.claim.model.*;
import com.orproject.claim.repository.InsuranceClaimRepository;
import com.orproject.claim.repository.RPAExecutionLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Demo Data Seeder for ClaimFlow.
 * Seeds a consistent, mathematically rigorous 250-claim dataset
 * grounded in M/G/c queueing theory and RPA operational parameters.
 * Idempotent: never overwrites existing records or production data.
 */
@Service
public class DataSeederService implements CommandLineRunner {
    private static final Logger LOGGER = LoggerFactory.getLogger(DataSeederService.class);

    public static final String DEMO_CLAIM_PREFIX = "CLM-DEMO-";
    public static final int TARGET_DEMO_CLAIMS = 250;

    private final InsuranceClaimRepository claimRepository;
    private final RPAExecutionLogRepository rpaLogRepository;
    private final Environment environment;

    @Value("${claimflow.seed-demo-data:false}")
    private boolean seedDemoDataProperty;

    private boolean demoDataActive = false;

    public DataSeederService(InsuranceClaimRepository claimRepository,
                             RPAExecutionLogRepository rpaLogRepository,
                             Environment environment) {
        this.claimRepository = claimRepository;
        this.rpaLogRepository = rpaLogRepository;
        this.environment = environment;
    }

    public boolean isDemoDataActive() {
        return demoDataActive || claimRepository.findByClaimNumber(DEMO_CLAIM_PREFIX + "0001").isPresent();
    }

    @Override
    public void run(String... args) {
        boolean isDemoProfile = Arrays.asList(environment.getActiveProfiles()).contains("demo");
        if (seedDemoDataProperty || isDemoProfile) {
            seedDemoData(false);
        } else {
            LOGGER.info("Startup demo data seeder skipped (seed-demo-data=false). Database running in clean production mode.");
        }
    }

    @Transactional
    public synchronized Map<String, Object> seedDemoData(boolean force) {
        Map<String, Object> response = new LinkedHashMap<>();

        // 1. Idempotency check: if CLM-DEMO-0001 exists and not forced, skip
        Optional<InsuranceClaim> firstDemoClaim = claimRepository.findByClaimNumber(DEMO_CLAIM_PREFIX + "0001");
        if (firstDemoClaim.isPresent() && !force) {
            LOGGER.info("Demo claims already present in database (found {}0001). Skipping seed.", DEMO_CLAIM_PREFIX);
            demoDataActive = true;
            response.put("status", "ALREADY_SEEDED");
            response.put("totalClaims", claimRepository.count());
            response.put("message", "Demo dataset is already seeded. To re-seed, specify force=true.");
            return response;
        }

        LOGGER.info("Seeding {} realistic demonstration claims and linked RPA execution logs...", TARGET_DEMO_CLAIMS);

        String[] firstNames = {
                "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
                "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
                "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
                "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
                "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle"
        };
        String[] lastNames = {
                "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
                "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
                "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
                "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
                "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores"
        };

        String[] botIds = {"RPA-BOT-01", "RPA-BOT-02", "RPA-BOT-03"};

        // Queuing theory constants
        final double humanHourlyWage = 28.50; // $/hr
        final double botHourlyRate = 4.20;    // $/hr

        // Random generator with fixed seed for deterministic repeatability
        Random rng = new Random(42);

        // Lognormal distribution parameters for human adjuster service time (mean 24.0 min, std 6.0 min)
        double meanM = 24.0;
        double stdM = 6.0;
        double varRatioM = (stdM / meanM) * (stdM / meanM);
        double sigmaLogM = Math.sqrt(Math.log(1.0 + varRatioM));
        double muLogM = Math.log(meanM) - 0.5 * (sigmaLogM * sigmaLogM);

        LocalDateTime currentTime = LocalDateTime.now();
        // Claims arrive across the past 30 days
        LocalDateTime arrivalPointer = currentTime.minusDays(30);

        List<InsuranceClaim> claimsToSave = new ArrayList<>(TARGET_DEMO_CLAIMS);
        List<RPAExecutionLog> rpaLogsToSave = new ArrayList<>(150);

        // Portfolio allocation: 100 Health, 90 Vehicle, 60 Life = 250 Total
        for (int i = 1; i <= TARGET_DEMO_CLAIMS; i++) {
            String claimNumber = String.format("%s%04d", DEMO_CLAIM_PREFIX, i);

            // If already present, don't duplicate
            if (claimRepository.findByClaimNumber(claimNumber).isPresent()) {
                continue;
            }

            String firstName = firstNames[rng.nextInt(firstNames.length)];
            String lastName = lastNames[rng.nextInt(lastNames.length)];
            String customerName = firstName + " " + lastName;
            String customerEmail = firstName.toLowerCase() + "." + lastName.toLowerCase() + "@example.com";

            InsuranceType type;
            BigDecimal claimAmount;
            BigDecimal coverageAmount;
            String polPrefix;

            if (i <= 100) {
                type = InsuranceType.HEALTH;
                polPrefix = "POL-HLT";
                claimAmount = BigDecimal.valueOf(1200 + rng.nextInt(8300) + (rng.nextDouble() * 100)).setScale(2, RoundingMode.HALF_UP);
                coverageAmount = new BigDecimal("50000.00");
            } else if (i <= 190) {
                type = InsuranceType.VEHICLE;
                polPrefix = "POL-VEH";
                claimAmount = BigDecimal.valueOf(850 + rng.nextInt(14000) + (rng.nextDouble() * 100)).setScale(2, RoundingMode.HALF_UP);
                coverageAmount = new BigDecimal("75000.00");
            } else {
                type = InsuranceType.LIFE;
                polPrefix = "POL-LIF";
                claimAmount = BigDecimal.valueOf(15000 + rng.nextInt(45000) + (rng.nextDouble() * 100)).setScale(2, RoundingMode.HALF_UP);
                coverageAmount = new BigDecimal("100000.00");
            }

            String policyNumber = String.format("%s-%05d", polPrefix, 10000 + i);

            // Poisson interarrival delta: mean = 5 minutes = 300 seconds
            double u = Math.max(0.0001, rng.nextDouble());
            double interarrivalMinutes = -5.0 * Math.log(1.0 - u);
            arrivalPointer = arrivalPointer.plusSeconds((long) (interarrivalMinutes * 60.0));
            if (arrivalPointer.isAfter(currentTime)) {
                arrivalPointer = currentTime.minusMinutes(rng.nextInt(180) + 10);
            }

            InsuranceClaim claim = new InsuranceClaim();
            claim.setClaimNumber(claimNumber);
            claim.setCustomerName(customerName);
            claim.setCustomerEmail(customerEmail);
            claim.setPolicyNumber(policyNumber);
            claim.setInsuranceType(type);
            claim.setClaimAmount(claimAmount);
            claim.setCoverageAmount(coverageAmount);
            claim.setSubmissionDate(arrivalPointer);
            claim.setDescription("[DEMO] " + type.name() + " claim filing for incident assessment.");
            claim.setAttachedDocuments("PolicyDossier_" + i + ".pdf, EvidenceReport_" + i + ".pdf");

            // Processing assignment:
            // Claims 1 to 100: Manual Processing Workflow (Scenario A)
            // Claims 101 to 250: RPA Automated Pipeline (Scenario B, 150 claims)
            if (i <= 100) {
                claim.setProcessingMode(ProcessingMode.MANUAL);

                if (i <= 65) {
                    // 65 Approved claims
                    claim.setClaimStatus(ClaimStatus.APPROVED);
                    claim.setCurrentStage(ProcessingStage.FINAL_DECISION);
                    claim.setEligiblePayoutAmount(claimAmount.multiply(new BigDecimal("0.92")).setScale(2, RoundingMode.HALF_UP));
                    claim.setFraudRiskScore(5 + rng.nextInt(25));

                    // Lognormal human service duration (mean ~24 min)
                    double norm = rng.nextGaussian();
                    double durationMin = Math.max(12.0, Math.exp(muLogM + sigmaLogM * norm));
                    claim.setProcessingTimeMinutes(Math.round(durationMin * 10.0) / 10.0);
                    double cost = (durationMin / 60.0) * humanHourlyWage;
                    claim.setOperationalCost(Math.round(cost * 100.0) / 100.0);
                    claim.setProcessedDate(arrivalPointer.plusMinutes((long) (durationMin + 35)));
                    claim.setAdjudicationNotes("[DEMO] Approved by claims adjuster after 5-stage documentation and invoice review.");
                } else if (i <= 75) {
                    // 10 Rejected claims (anomalous or policy exclusion)
                    claim.setClaimStatus(ClaimStatus.REJECTED);
                    claim.setCurrentStage(ProcessingStage.FINAL_DECISION);
                    claim.setEligiblePayoutAmount(BigDecimal.ZERO);
                    claim.setFraudRiskScore(72 + rng.nextInt(24)); // High risk score

                    double durationMin = 22.0 + rng.nextDouble() * 10.0;
                    claim.setProcessingTimeMinutes(Math.round(durationMin * 10.0) / 10.0);
                    double cost = (durationMin / 60.0) * humanHourlyWage;
                    claim.setOperationalCost(Math.round(cost * 100.0) / 100.0);
                    claim.setProcessedDate(arrivalPointer.plusMinutes((long) (durationMin + 45)));
                    claim.setAdjudicationNotes("[DEMO] Rejected: Document discrepancy and high fraud risk score exceeding policy threshold.");
                } else if (i <= 90) {
                    // 15 In-Review claims (currently progressing through stages)
                    claim.setClaimStatus(ClaimStatus.IN_REVIEW);
                    claim.setCurrentStage(rng.nextBoolean() ? ProcessingStage.POLICY_VALIDATION : ProcessingStage.AMOUNT_VERIFICATION);
                    claim.setEligiblePayoutAmount(claimAmount);
                    claim.setFraudRiskScore(15 + rng.nextInt(30));

                    double durationMin = 10.0 + rng.nextDouble() * 8.0;
                    claim.setProcessingTimeMinutes(Math.round(durationMin * 10.0) / 10.0);
                    double cost = (durationMin / 60.0) * humanHourlyWage;
                    claim.setOperationalCost(Math.round(cost * 100.0) / 100.0);
                    claim.setAdjudicationNotes("[DEMO] Claim undergoing manual line-item audit.");
                } else {
                    // 10 Submitted claims waiting in queue buffer
                    claim.setClaimStatus(ClaimStatus.SUBMITTED);
                    claim.setCurrentStage(ProcessingStage.DOCUMENT_VERIFICATION);
                    claim.setEligiblePayoutAmount(claimAmount);
                    claim.setFraudRiskScore(8 + rng.nextInt(25));
                    claim.setProcessingTimeMinutes(0.0);
                    claim.setOperationalCost(0.0);
                    claim.setAdjudicationNotes("[DEMO] Queued in manual adjuster queue buffer.");
                }
            } else {
                // 150 RPA Automated Pipeline claims (Scenario B: claims 101 to 250)
                int rpaIndex = i - 100;
                String assignedBot = botIds[rng.nextInt(botIds.length)];

                if (rpaIndex <= 123) {
                    // 82% Clean STP (Straight-Through Processing) Approved: 123 claims
                    claim.setProcessingMode(ProcessingMode.AUTOMATED);
                    claim.setClaimStatus(ClaimStatus.APPROVED);
                    claim.setCurrentStage(ProcessingStage.FINAL_DECISION);
                    claim.setEligiblePayoutAmount(claimAmount.multiply(new BigDecimal("0.95")).setScale(2, RoundingMode.HALF_UP));
                    claim.setFraudRiskScore(4 + rng.nextInt(20)); // Low risk

                    // RPA execution time: Mean 1.5 min, std 0.2 min (~1.1 to 1.9 min)
                    double botDurationMin = Math.max(0.8, 1.5 + rng.nextGaussian() * 0.2);
                    claim.setProcessingTimeMinutes(Math.round(botDurationMin * 10.0) / 10.0);
                    double cost = (botDurationMin / 60.0) * botHourlyRate;
                    claim.setOperationalCost(Math.round(cost * 100.0) / 100.0);
                    claim.setProcessedDate(arrivalPointer.plusSeconds((long) (botDurationMin * 60.0)));
                    claim.setAdjudicationNotes("[DEMO] STP Automated Settlement: OCR passed (confidence: 99.4%), coverage verified, instant payout dispatched.");

                    // Generate corresponding RPAExecutionLog record
                    RPAExecutionLog log = new RPAExecutionLog();
                    log.setClaimNumber(claimNumber);
                    log.setBotId(assignedBot);
                    log.setExecutionStatus("SUCCESS");
                    log.setExecutionDurationMs(Math.round(botDurationMin * 60.0 * 1000.0 * 10.0) / 10.0);
                    log.setOperationalCost(Math.round(cost * 100.0) / 100.0);
                    log.setExecutionDetails("Clean claim straight-through automated processing. OCR verification and bank dispatch complete.");
                    log.setTimestamp(claim.getProcessedDate());
                    rpaLogsToSave.add(log);
                } else if (rpaIndex <= 138) {
                    // 15 Exception claims currently awaiting manual investigation
                    claim.setProcessingMode(ProcessingMode.MANUAL);
                    claim.setClaimStatus(ClaimStatus.REQUIRES_MANUAL_REVIEW);
                    claim.setCurrentStage(ProcessingStage.FRAUD_DETECTION);
                    claim.setEligiblePayoutAmount(claimAmount);
                    claim.setFraudRiskScore(68 + rng.nextInt(22)); // Anomaly score > 65

                    double botDurationMin = 1.5;
                    claim.setProcessingTimeMinutes(botDurationMin);
                    double botCost = (botDurationMin / 60.0) * botHourlyRate;
                    claim.setOperationalCost(Math.round(botCost * 100.0) / 100.0);
                    claim.setAdjudicationNotes("[DEMO] RPA Exception Escalation: Fraud anomaly score (78) exceeds automated threshold. Routed to human adjuster workbench.");

                    RPAExecutionLog log = new RPAExecutionLog();
                    log.setClaimNumber(claimNumber);
                    log.setBotId(assignedBot);
                    log.setExecutionStatus("EXCEPTION");
                    log.setExecutionDurationMs(90000.0);
                    log.setOperationalCost(Math.round(botCost * 100.0) / 100.0);
                    log.setExecutionDetails("Automated OCR complete; risk anomaly flagged. Escalated to human adjuster queue.");
                    log.setTimestamp(arrivalPointer.plusMinutes(2));
                    rpaLogsToSave.add(log);
                } else if (rpaIndex <= 148) {
                    // 10 Escalated claims cleared and approved by human adjuster
                    claim.setProcessingMode(ProcessingMode.MANUAL);
                    claim.setClaimStatus(ClaimStatus.APPROVED);
                    claim.setCurrentStage(ProcessingStage.FINAL_DECISION);
                    claim.setEligiblePayoutAmount(claimAmount.multiply(new BigDecimal("0.90")).setScale(2, RoundingMode.HALF_UP));
                    claim.setFraudRiskScore(48 + rng.nextInt(15));

                    // Combined time: 1.5 min bot + 12 min human escalation review
                    double totalTimeMin = 13.5 + rng.nextGaussian() * 1.5;
                    claim.setProcessingTimeMinutes(Math.round(totalTimeMin * 10.0) / 10.0);
                    double totalCost = (1.5 / 60.0 * botHourlyRate) + ((totalTimeMin - 1.5) / 60.0 * humanHourlyWage);
                    claim.setOperationalCost(Math.round(totalCost * 100.0) / 100.0);
                    claim.setProcessedDate(arrivalPointer.plusMinutes((long) totalTimeMin));
                    claim.setAdjudicationNotes("[DEMO] Escalated exception resolved: Hospital clinic phone verification cleared by human adjuster.");

                    RPAExecutionLog log = new RPAExecutionLog();
                    log.setClaimNumber(claimNumber);
                    log.setBotId(assignedBot);
                    log.setExecutionStatus("EXCEPTION");
                    log.setExecutionDurationMs(90000.0);
                    log.setOperationalCost(0.11);
                    log.setExecutionDetails("Flagged for exception audit; subsequent manual adjuster inspection cleared claim for settlement.");
                    log.setTimestamp(arrivalPointer.plusMinutes(2));
                    rpaLogsToSave.add(log);
                } else {
                    // 2 Escalated claims rejected by human adjuster (confirmed fraud/ineligible)
                    claim.setProcessingMode(ProcessingMode.MANUAL);
                    claim.setClaimStatus(ClaimStatus.REJECTED);
                    claim.setCurrentStage(ProcessingStage.FINAL_DECISION);
                    claim.setEligiblePayoutAmount(BigDecimal.ZERO);
                    claim.setFraudRiskScore(86 + rng.nextInt(10));

                    double totalTimeMin = 15.0;
                    claim.setProcessingTimeMinutes(totalTimeMin);
                    double totalCost = (1.5 / 60.0 * botHourlyRate) + (13.5 / 60.0 * humanHourlyWage);
                    claim.setOperationalCost(Math.round(totalCost * 100.0) / 100.0);
                    claim.setProcessedDate(arrivalPointer.plusMinutes(25));
                    claim.setAdjudicationNotes("[DEMO] Escalated exception confirmed fraudulent: Invoice modification detected by human adjuster.");

                    RPAExecutionLog log = new RPAExecutionLog();
                    log.setClaimNumber(claimNumber);
                    log.setBotId(assignedBot);
                    log.setExecutionStatus("EXCEPTION");
                    log.setExecutionDurationMs(90000.0);
                    log.setOperationalCost(0.11);
                    log.setExecutionDetails("Fraud score 91 triggered escalation; manual investigation confirmed invoice alteration.");
                    log.setTimestamp(arrivalPointer.plusMinutes(2));
                    rpaLogsToSave.add(log);
                }
            }

            claimsToSave.add(claim);
        }

        // Save claims in batch
        List<InsuranceClaim> savedClaims = claimRepository.saveAll(claimsToSave);
        LOGGER.info("Saved {} demo claims to database.", savedClaims.size());

        // Map claimId for RPA logs
        Map<String, Long> claimIdMap = new HashMap<>();
        for (InsuranceClaim sc : savedClaims) {
            claimIdMap.put(sc.getClaimNumber(), sc.getId());
        }
        for (RPAExecutionLog log : rpaLogsToSave) {
            Long cid = claimIdMap.get(log.getClaimNumber());
            if (cid != null) {
                log.setClaimId(cid);
            }
        }
        List<RPAExecutionLog> savedLogs = rpaLogRepository.saveAll(rpaLogsToSave);
        LOGGER.info("Saved {} linked RPA execution logs.", savedLogs.size());

        demoDataActive = true;

        response.put("status", "SUCCESS");
        response.put("seededClaims", savedClaims.size());
        response.put("seededRpaLogs", savedLogs.size());
        response.put("totalDatabaseClaims", claimRepository.count());
        response.put("message", "Successfully seeded " + savedClaims.size() + " realistic demo claims and " + savedLogs.size() + " RPA execution logs.");
        return response;
    }
}
