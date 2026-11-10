package com.orproject.claim.dto;

public class DashboardStatsDto {
    private int totalClaims;
    private int pendingClaims;
    private int inProgressClaims;
    private int approvedClaims;
    private int rejectedClaims;
    private double averageProcessingTimeMinutes;
    private double totalOperationalCost;

    private int manualProcessedCount;
    private int automatedProcessedCount;
    private double manualOperationalCost;
    private double automatedOperationalCost;

    public DashboardStatsDto() {}

    public int getTotalClaims() { return totalClaims; }
    public void setTotalClaims(int totalClaims) { this.totalClaims = totalClaims; }

    public int getPendingClaims() { return pendingClaims; }
    public void setPendingClaims(int pendingClaims) { this.pendingClaims = pendingClaims; }

    public int getInProgressClaims() { return inProgressClaims; }
    public void setInProgressClaims(int inProgressClaims) { this.inProgressClaims = inProgressClaims; }

    public int getApprovedClaims() { return approvedClaims; }
    public void setApprovedClaims(int approvedClaims) { this.approvedClaims = approvedClaims; }

    public int getRejectedClaims() { return rejectedClaims; }
    public void setRejectedClaims(int rejectedClaims) { this.rejectedClaims = rejectedClaims; }

    public double getAverageProcessingTimeMinutes() { return averageProcessingTimeMinutes; }
    public void setAverageProcessingTimeMinutes(double averageProcessingTimeMinutes) { this.averageProcessingTimeMinutes = averageProcessingTimeMinutes; }

    public double getTotalOperationalCost() { return totalOperationalCost; }
    public void setTotalOperationalCost(double totalOperationalCost) { this.totalOperationalCost = totalOperationalCost; }

    public int getManualProcessedCount() { return manualProcessedCount; }
    public void setManualProcessedCount(int manualProcessedCount) { this.manualProcessedCount = manualProcessedCount; }

    public int getAutomatedProcessedCount() { return automatedProcessedCount; }
    public void setAutomatedProcessedCount(int automatedProcessedCount) { this.automatedProcessedCount = automatedProcessedCount; }

    public double getManualOperationalCost() { return manualOperationalCost; }
    public void setManualOperationalCost(double manualOperationalCost) { this.manualOperationalCost = manualOperationalCost; }

    public double getAutomatedOperationalCost() { return automatedOperationalCost; }
    public void setAutomatedOperationalCost(double automatedOperationalCost) { this.automatedOperationalCost = automatedOperationalCost; }
}
