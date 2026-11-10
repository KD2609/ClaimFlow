package com.orproject.claim.dto;

public class ManualDecisionRequest {
    private Long claimId;
    private String decision; // "APPROVED" or "REJECTED"
    private String notes;
    private Double approvedAmount;
    private Double additionalDurationMinutes;
    private Double hourlyCost;

    public ManualDecisionRequest() {}

    public Long getClaimId() { return claimId; }
    public void setClaimId(Long claimId) { this.claimId = claimId; }

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Double getApprovedAmount() { return approvedAmount; }
    public void setApprovedAmount(Double approvedAmount) { this.approvedAmount = approvedAmount; }

    public Double getAdditionalDurationMinutes() { return additionalDurationMinutes; }
    public void setAdditionalDurationMinutes(Double additionalDurationMinutes) { this.additionalDurationMinutes = additionalDurationMinutes; }

    public Double getHourlyCost() { return hourlyCost; }
    public void setHourlyCost(Double hourlyCost) { this.hourlyCost = hourlyCost; }
}
