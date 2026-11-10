package com.orproject.claim.dto;

import com.orproject.claim.model.ProcessingStage;

public class ManualStageProgressRequest {
    private Long claimId;
    private ProcessingStage stage;
    private Double durationMinutes;
    private Double hourlyCost;
    private String notes;
    private boolean verified = true;

    public ManualStageProgressRequest() {}

    public Long getClaimId() { return claimId; }
    public void setClaimId(Long claimId) { this.claimId = claimId; }

    public ProcessingStage getStage() { return stage; }
    public void setStage(ProcessingStage stage) { this.stage = stage; }

    public Double getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Double durationMinutes) { this.durationMinutes = durationMinutes; }

    public Double getHourlyCost() { return hourlyCost; }
    public void setHourlyCost(Double hourlyCost) { this.hourlyCost = hourlyCost; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
}
