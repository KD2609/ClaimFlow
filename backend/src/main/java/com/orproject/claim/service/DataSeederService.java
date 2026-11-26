package com.orproject.claim.service;

import com.orproject.claim.model.*;
import com.orproject.claim.repository.InsuranceClaimRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Random;

/**
 * Demo Data Seeder for ClaimFlow.
 * Only executes when the 'demo' profile is active or 'claimflow.seed-demo-data=true'.
 * Production profiles (e.g., Supabase PostgreSQL) will NEVER seed demo claims automatically.
 */
@Service
public class DataSeederService implements CommandLineRunner {
    private static final Logger LOGGER = LoggerFactory.getLogger(DataSeederService.class);

    private final InsuranceClaimRepository claimRepository;
    private final Environment environment;

    @Value("${claimflow.seed-demo-data:false}")
    private boolean seedDemoDataProperty;

    private boolean demoDataActive = false;

    public DataSeederService(InsuranceClaimRepository claimRepository, Environment environment) {
        this.claimRepository = claimRepository;
        this.environment = environment;
    }

    public boolean isDemoDataActive() {
        return demoDataActive;
    }

    @Override
    public void run(String... args) {
        boolean isDemoProfile = Arrays.asList(environment.getActiveProfiles()).contains("demo");
        if (seedDemoDataProperty || isDemoProfile) {
            seedDemoClaims();
            demoDataActive = true;
        } else {
            LOGGER.info("Startup demo data seeder skipped (production mode active: seed-demo-data is disabled)");
        }
    }

    private void seedDemoClaims() {
        if (claimRepository.count() > 0) {
            LOGGER.info("Claims table already contains records; skipping demo seed.");
            demoDataActive = true;
            return;
        }

        LOGGER.info("Seeding 60 realistic demonstration claims for academic evaluation...");

        String[] firstNames = {"James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph"};
        String[] lastNames = {"Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson"};
        InsuranceType[] types = {InsuranceType.HEALTH, InsuranceType.VEHICLE, InsuranceType.LIFE};

        Random random = new Random(101);

        for (int i = 1; i <= 60; i++) {
            String firstName = firstNames[random.nextInt(firstNames.length)];
            String lastName = lastNames[random.nextInt(lastNames.length)];
            String customerName = firstName + " " + lastName;
            String customerEmail = firstName.toLowerCase() + "." + lastName.toLowerCase() + "@example.com";

            InsuranceType type = types[random.nextInt(types.length)];
            String polPrefix = type == InsuranceType.HEALTH ? "POL-HLT" : type == InsuranceType.VEHICLE ? "POL-VEH" : "POL-LIF";
            String policyNumber = polPrefix + "-" + (1000 + i);

            BigDecimal claimAmount;
            if (type == InsuranceType.HEALTH) {
                claimAmount = new BigDecimal(1200 + random.nextInt(8500));
            } else if (type == InsuranceType.VEHICLE) {
                claimAmount = new BigDecimal(800 + random.nextInt(14000));
            } else {
                claimAmount = new BigDecimal(15000 + random.nextInt(45000));
            }

            String claimNumber = "CLM-2026-" + String.format("%04d", i);

            InsuranceClaim claim = new InsuranceClaim();
            claim.setClaimNumber(claimNumber);
            claim.setCustomerName(customerName);
            claim.setCustomerEmail(customerEmail);
            claim.setPolicyNumber(policyNumber);
            claim.setInsuranceType(type);
            claim.setClaimAmount(claimAmount);
            claim.setCoverageAmount(new BigDecimal("50000.00"));
            claim.setDescription("[DEMO] Claim filing for " + type.name().toLowerCase() + " event incident.");
            claim.setAttachedDocuments("Invoice_" + i + ".pdf, ID_Verification.pdf");
            claim.setSubmissionDate(LocalDateTime.now().minusDays(random.nextInt(30)).minusHours(random.nextInt(24)));

            int roll = random.nextInt(100);
            if (roll < 35) {
                claim.setClaimStatus(ClaimStatus.SUBMITTED);
                claim.setCurrentStage(ProcessingStage.DOCUMENT_VERIFICATION);
                claim.setProcessingMode(ProcessingMode.MANUAL);
                claim.setProcessingTimeMinutes(0.0);
                claim.setOperationalCost(0.0);
                claim.setFraudRiskScore(random.nextInt(40) + 5);
            } else if (roll < 55) {
                claim.setClaimStatus(ClaimStatus.IN_REVIEW);
                claim.setCurrentStage(ProcessingStage.AMOUNT_VERIFICATION);
                claim.setProcessingMode(ProcessingMode.MANUAL);
                claim.setProcessingTimeMinutes(12.5);
                claim.setOperationalCost(5.95);
                claim.setFraudRiskScore(random.nextInt(35) + 10);
            } else if (roll < 80) {
                claim.setClaimStatus(ClaimStatus.APPROVED);
                claim.setCurrentStage(ProcessingStage.FINAL_DECISION);
                claim.setProcessingMode(random.nextBoolean() ? ProcessingMode.AUTOMATED : ProcessingMode.MANUAL);
                claim.setEligiblePayoutAmount(claimAmount.multiply(new BigDecimal("0.90")));
                claim.setFraudRiskScore(random.nextInt(25) + 5);
                claim.setProcessingTimeMinutes(claim.getProcessingMode() == ProcessingMode.AUTOMATED ? 0.002 : 24.5);
                claim.setOperationalCost(claim.getProcessingMode() == ProcessingMode.AUTOMATED ? 0.08 : 11.60);
                claim.setProcessedDate(LocalDateTime.now().minusDays(1));
            } else if (roll < 90) {
                claim.setClaimStatus(ClaimStatus.REJECTED);
                claim.setCurrentStage(ProcessingStage.FINAL_DECISION);
                claim.setProcessingMode(ProcessingMode.MANUAL);
                claim.setEligiblePayoutAmount(BigDecimal.ZERO);
                claim.setFraudRiskScore(random.nextInt(30) + 70);
            } else {
                claim.setClaimStatus(ClaimStatus.REQUIRES_MANUAL_REVIEW);
                claim.setCurrentStage(ProcessingStage.FRAUD_DETECTION);
                claim.setProcessingMode(ProcessingMode.MANUAL);
                claim.setFraudRiskScore(random.nextInt(25) + 75);
                claim.setAdjudicationNotes("[DEMO] Escalated to human adjuster: anomalous claim invoice pattern.");
            }

            claimRepository.save(claim);
        }

        LOGGER.info("Successfully seeded 60 demo insurance claims.");
    }
}
