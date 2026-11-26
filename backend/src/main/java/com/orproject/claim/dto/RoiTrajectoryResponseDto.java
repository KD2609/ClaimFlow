package com.orproject.claim.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public class RoiTrajectoryResponseDto {
    private Double unitSavings;
    private Double monthlyGrossSavings;
    private Double monthlyNetBenefit;
    private Double paybackMonths;
    private Double threeYearNetProfit;
    private Double threeYearRoiPercent;
    private Double breakEvenMilestoneMonth;

    @JsonProperty("trajectory")
    @JsonAlias({"trajectoryData", "trajectory"})
    private List<Map<String, Object>> trajectoryData;
    private String statusMessage;

    public RoiTrajectoryResponseDto() {}

    public Double getUnitSavings() { return unitSavings; }
    public void setUnitSavings(Double unitSavings) { this.unitSavings = unitSavings; }

    public Double getMonthlyGrossSavings() { return monthlyGrossSavings; }
    public void setMonthlyGrossSavings(Double monthlyGrossSavings) { this.monthlyGrossSavings = monthlyGrossSavings; }

    public Double getMonthlyNetBenefit() { return monthlyNetBenefit; }
    public void setMonthlyNetBenefit(Double monthlyNetBenefit) { this.monthlyNetBenefit = monthlyNetBenefit; }

    public Double getPaybackMonths() { return paybackMonths; }
    public void setPaybackMonths(Double paybackMonths) { this.paybackMonths = paybackMonths; }

    public Double getThreeYearNetProfit() { return threeYearNetProfit; }
    public void setThreeYearNetProfit(Double threeYearNetProfit) { this.threeYearNetProfit = threeYearNetProfit; }

    public Double getThreeYearRoiPercent() { return threeYearRoiPercent; }
    public void setThreeYearRoiPercent(Double threeYearRoiPercent) { this.threeYearRoiPercent = threeYearRoiPercent; }

    public Double getBreakEvenMilestoneMonth() { return breakEvenMilestoneMonth; }
    public void setBreakEvenMilestoneMonth(Double breakEvenMilestoneMonth) { this.breakEvenMilestoneMonth = breakEvenMilestoneMonth; }

    public List<Map<String, Object>> getTrajectoryData() { return trajectoryData; }
    public void setTrajectoryData(List<Map<String, Object>> trajectoryData) { this.trajectoryData = trajectoryData; }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }
}

