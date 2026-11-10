package com.orproject.claim.dto;

import com.orproject.claim.model.ClaimStatus;

public class RPARunResultDto {
    private Long claimId;
    private String claimNumber;
    private ClaimStatus claimStatus;
    private Double executionDurationMs;
    private Double operationalCost;
    private String executionDetails;

    public RPARunResultDto() {}

    public RPARunResultDto(Long claimId, String claimNumber, ClaimStatus claimStatus,
                           Double executionDurationMs, Double operationalCost, String executionDetails) {
        this.claimId = claimId;
        this.claimNumber = claimNumber;
        this.claimStatus = claimStatus;
        this.executionDurationMs = executionDurationMs;
        this.operationalCost = operationalCost;
        this.executionDetails = executionDetails;
    }

    public Long getClaimId() { return claimId; }
    public void setClaimId(Long claimId) { this.claimId = claimId; }

    public String getClaimNumber() { return claimNumber; }
    public void setClaimNumber(String claimNumber) { this.claimNumber = claimNumber; }

    public ClaimStatus getClaimStatus() { return claimStatus; }
    public void setClaimStatus(ClaimStatus claimStatus) { this.claimStatus = claimStatus; }

    public Double getExecutionDurationMs() { return executionDurationMs; }
    public void setExecutionDurationMs(Double executionDurationMs) { this.executionDurationMs = executionDurationMs; }

    public Double getOperationalCost() { return operationalCost; }
    public void setOperationalCost(Double operationalCost) { this.operationalCost = operationalCost; }

    public String getExecutionDetails() { return executionDetails; }
    public void setExecutionDetails(String executionDetails) { this.executionDetails = executionDetails; }
}
