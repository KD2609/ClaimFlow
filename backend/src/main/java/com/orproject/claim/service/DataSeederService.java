package com.orproject.claim.service;

import com.orproject.claim.model.*;
import com.orproject.claim.repository.InsuranceClaimRepository;
import com.orproject.claim.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Random;

@Service
public class DataSeederService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final InsuranceClaimRepository claimRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeederService(UserRepository userRepository,
                             InsuranceClaimRepository claimRepository,
                             PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.claimRepository = claimRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedClaims();
    }

    private void seedUsers() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", passwordEncoder.encode("123"), "System Administrator", Role.ROLE_ADMIN);
            userRepository.save(admin);
        }
        if (!userRepository.existsByUsername("processor")) {
            User processor = new User("processor", passwordEncoder.encode("processor123"), "Senior Claim Adjuster", Role.ROLE_CLAIM_PROCESSOR);
            userRepository.save(processor);
        }
    }

    private void seedClaims() {
        if (claimRepository.count() > 0) {
            return;
        }

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
            claim.setDescription("Claim filing for " + type.name().toLowerCase() + " event incident.");
            claim.setAttachedDocuments("Invoice_" + i + ".pdf, ID_Verification.pdf");
            claim.setSubmissionDate(LocalDateTime.now().minusDays(random.nextInt(30)).minusHours(random.nextInt(24)));

            // Distribute claim statuses realistically
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
                claim.setProcessingTimeMinutes(18.0);
                claim.setOperationalCost(8.55);
                claim.setProcessedDate(LocalDateTime.now().minusDays(2));
            } else {
                claim.setClaimStatus(ClaimStatus.REQUIRES_MANUAL_REVIEW);
                claim.setCurrentStage(ProcessingStage.FRAUD_DETECTION);
                claim.setProcessingMode(ProcessingMode.AUTOMATED);
                claim.setFraudRiskScore(random.nextInt(25) + 68);
                claim.setProcessingTimeMinutes(0.003);
                claim.setOperationalCost(0.12);
                claim.setAdjudicationNotes("[RPA BOT] Anomaly detected: Fraud risk score flagged for human review.");
            }

            claimRepository.save(claim);
        }
    }
}
