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
    private int healthClaims;
    private int vehicleClaims;
    private int lifeClaims;
    private String dataSource = "live-database";

    // Operations Research comparative metrics (Manual vs RPA Automated)
    private double manualServiceTimeMinutes = 24.0;
    private double automatedServiceTimeMinutes = 1.2;
    private double manualWaitTimeMinutes = 38.5;
    private double automatedWaitTimeMinutes = 0.3;
    private double manualTotalCycleTimeMinutes = 62.5;
    private double automatedTotalCycleTimeMinutes = 1.5;
    private double manualCostPerClaim = 22.80;
    private double automatedCostPerClaim = 3.67;
    private double manualThroughputPerDay = 48.0;
    private double automatedThroughputPerDay = 144.0;
    private double cycleTimeReductionPercent = 97.6;
    private double costReductionPercent = 83.9;
    private double throughputIncreasePercent = 200.0;

    public DashboardStatsDto() {}

    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }

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

    public int getHealthClaims() { return healthClaims; }
    public void setHealthClaims(int healthClaims) { this.healthClaims = healthClaims; }
    public int getVehicleClaims() { return vehicleClaims; }
    public void setVehicleClaims(int vehicleClaims) { this.vehicleClaims = vehicleClaims; }
    public int getLifeClaims() { return lifeClaims; }
    public void setLifeClaims(int lifeClaims) { this.lifeClaims = lifeClaims; }

    public double getManualServiceTimeMinutes() { return manualServiceTimeMinutes; }
    public void setManualServiceTimeMinutes(double manualServiceTimeMinutes) { this.manualServiceTimeMinutes = manualServiceTimeMinutes; }

    public double getAutomatedServiceTimeMinutes() { return automatedServiceTimeMinutes; }
    public void setAutomatedServiceTimeMinutes(double automatedServiceTimeMinutes) { this.automatedServiceTimeMinutes = automatedServiceTimeMinutes; }

    public double getManualWaitTimeMinutes() { return manualWaitTimeMinutes; }
    public void setManualWaitTimeMinutes(double manualWaitTimeMinutes) { this.manualWaitTimeMinutes = manualWaitTimeMinutes; }

    public double getAutomatedWaitTimeMinutes() { return automatedWaitTimeMinutes; }
    public void setAutomatedWaitTimeMinutes(double automatedWaitTimeMinutes) { this.automatedWaitTimeMinutes = automatedWaitTimeMinutes; }

    public double getManualTotalCycleTimeMinutes() { return manualTotalCycleTimeMinutes; }
    public void setManualTotalCycleTimeMinutes(double manualTotalCycleTimeMinutes) { this.manualTotalCycleTimeMinutes = manualTotalCycleTimeMinutes; }

    public double getAutomatedTotalCycleTimeMinutes() { return automatedTotalCycleTimeMinutes; }
    public void setAutomatedTotalCycleTimeMinutes(double automatedTotalCycleTimeMinutes) { this.automatedTotalCycleTimeMinutes = automatedTotalCycleTimeMinutes; }

    public double getManualCostPerClaim() { return manualCostPerClaim; }
    public void setManualCostPerClaim(double manualCostPerClaim) { this.manualCostPerClaim = manualCostPerClaim; }

    public double getAutomatedCostPerClaim() { return automatedCostPerClaim; }
    public void setAutomatedCostPerClaim(double automatedCostPerClaim) { this.automatedCostPerClaim = automatedCostPerClaim; }

    public double getManualThroughputPerDay() { return manualThroughputPerDay; }
    public void setManualThroughputPerDay(double manualThroughputPerDay) { this.manualThroughputPerDay = manualThroughputPerDay; }

    public double getAutomatedThroughputPerDay() { return automatedThroughputPerDay; }
    public void setAutomatedThroughputPerDay(double automatedThroughputPerDay) { this.automatedThroughputPerDay = automatedThroughputPerDay; }

    public double getCycleTimeReductionPercent() { return cycleTimeReductionPercent; }
    public void setCycleTimeReductionPercent(double cycleTimeReductionPercent) { this.cycleTimeReductionPercent = cycleTimeReductionPercent; }

    public double getCostReductionPercent() { return costReductionPercent; }
    public void setCostReductionPercent(double costReductionPercent) { this.costReductionPercent = costReductionPercent; }

    public double getThroughputIncreasePercent() { return throughputIncreasePercent; }
    public void setThroughputIncreasePercent(double throughputIncreasePercent) { this.throughputIncreasePercent = throughputIncreasePercent; }
}
