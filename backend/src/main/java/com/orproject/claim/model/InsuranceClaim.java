package com.orproject.claim.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "insurance_claims")
public class InsuranceClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String claimNumber;

    @Column(nullable = false, length = 100)
    private String customerName;

    @Column(length = 100)
    private String customerEmail;

    @Column(nullable = false, length = 50)
    private String policyNumber;

    @Column(precision = 12, scale = 2)
    private BigDecimal coverageAmount = new BigDecimal("50000.00");

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InsuranceType insuranceType = InsuranceType.HEALTH;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal claimAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal eligiblePayoutAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ClaimStatus claimStatus = ClaimStatus.SUBMITTED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProcessingMode processingMode = ProcessingMode.MANUAL;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private ProcessingStage currentStage = ProcessingStage.DOCUMENT_VERIFICATION;

    private Integer fraudRiskScore = 15;

    private Double processingTimeMinutes = 0.0;

    private Double operationalCost = 0.0;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String attachedDocuments;

    @Column(columnDefinition = "TEXT")
    private String adjudicationNotes;

    private LocalDateTime submissionDate = LocalDateTime.now();

    private LocalDateTime processedDate;

    public InsuranceClaim() {}

    public InsuranceClaim(String claimNumber, String customerName, String customerEmail, String policyNumber,
                          InsuranceType insuranceType, BigDecimal claimAmount, String description, String attachedDocuments) {
        this.claimNumber = claimNumber;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.policyNumber = policyNumber;
        this.insuranceType = insuranceType;
        this.claimAmount = claimAmount;
        this.eligiblePayoutAmount = claimAmount;
        this.description = description;
        this.attachedDocuments = attachedDocuments;
        this.submissionDate = LocalDateTime.now();
        this.claimStatus = ClaimStatus.SUBMITTED;
        this.processingMode = ProcessingMode.MANUAL;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getClaimNumber() { return claimNumber; }
    public void setClaimNumber(String claimNumber) { this.claimNumber = claimNumber; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }

    public BigDecimal getCoverageAmount() { return coverageAmount; }
    public void setCoverageAmount(BigDecimal coverageAmount) { this.coverageAmount = coverageAmount; }

    public InsuranceType getInsuranceType() { return insuranceType; }
    public void setInsuranceType(InsuranceType insuranceType) { this.insuranceType = insuranceType; }

    public BigDecimal getClaimAmount() { return claimAmount; }
    public void setClaimAmount(BigDecimal claimAmount) { this.claimAmount = claimAmount; }

    public BigDecimal getEligiblePayoutAmount() { return eligiblePayoutAmount; }
    public void setEligiblePayoutAmount(BigDecimal eligiblePayoutAmount) { this.eligiblePayoutAmount = eligiblePayoutAmount; }

    public ClaimStatus getClaimStatus() { return claimStatus; }
    public void setClaimStatus(ClaimStatus claimStatus) { this.claimStatus = claimStatus; }

    public ProcessingMode getProcessingMode() { return processingMode; }
    public void setProcessingMode(ProcessingMode processingMode) { this.processingMode = processingMode; }

    public ProcessingStage getCurrentStage() { return currentStage; }
    public void setCurrentStage(ProcessingStage currentStage) { this.currentStage = currentStage; }

    public Integer getFraudRiskScore() { return fraudRiskScore; }
    public void setFraudRiskScore(Integer fraudRiskScore) { this.fraudRiskScore = fraudRiskScore; }

    public Double getProcessingTimeMinutes() { return processingTimeMinutes; }
    public void setProcessingTimeMinutes(Double processingTimeMinutes) { this.processingTimeMinutes = processingTimeMinutes; }

    public Double getOperationalCost() { return operationalCost; }
    public void setOperationalCost(Double operationalCost) { this.operationalCost = operationalCost; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAttachedDocuments() { return attachedDocuments; }
    public void setAttachedDocuments(String attachedDocuments) { this.attachedDocuments = attachedDocuments; }

    public String getAdjudicationNotes() { return adjudicationNotes; }
    public void setAdjudicationNotes(String adjudicationNotes) { this.adjudicationNotes = adjudicationNotes; }

    public LocalDateTime getSubmissionDate() { return submissionDate; }
    public void setSubmissionDate(LocalDateTime submissionDate) { this.submissionDate = submissionDate; }

    public LocalDateTime getProcessedDate() { return processedDate; }
    public void setProcessedDate(LocalDateTime processedDate) { this.processedDate = processedDate; }
}
