package com.orproject.claim.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public class RoiTrajectoryRequestDto {
    private Double initialCapital = 15000.0;
    private Double annualMaintenance = 2500.0;
    private Integer monthlyVolume = 1000;

    @JsonAlias({"manualCostPerClaim", "manualUnitCost"})
    private Double manualUnitCost = 22.80;

    @JsonAlias({"automatedCostPerClaim", "automatedUnitCost"})
    private Double automatedUnitCost = 4.48;

    public RoiTrajectoryRequestDto() {}

    public Double getInitialCapital() { return initialCapital; }
    public void setInitialCapital(Double initialCapital) { this.initialCapital = initialCapital; }

    public Double getAnnualMaintenance() { return annualMaintenance; }
    public void setAnnualMaintenance(Double annualMaintenance) { this.annualMaintenance = annualMaintenance; }

    public Integer getMonthlyVolume() { return monthlyVolume; }
    public void setMonthlyVolume(Integer monthlyVolume) { this.monthlyVolume = monthlyVolume; }

    public Double getManualUnitCost() { return manualUnitCost; }
    public void setManualUnitCost(Double manualUnitCost) { this.manualUnitCost = manualUnitCost; }
    public void setManualCostPerClaim(Double manualCostPerClaim) { this.manualUnitCost = manualCostPerClaim; }

    public Double getAutomatedUnitCost() { return automatedUnitCost; }
    public void setAutomatedUnitCost(Double automatedUnitCost) { this.automatedUnitCost = automatedUnitCost; }
    public void setAutomatedCostPerClaim(Double automatedCostPerClaim) { this.automatedUnitCost = automatedCostPerClaim; }
}
