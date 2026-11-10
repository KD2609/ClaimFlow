package com.orproject.claim.dto;

import java.util.Map;

public class SimulationRequestDto {
    private String name = "Operations Research Comparative Run";
    private Integer numClaims = 250;
    private Double durationHours = 40.0;
    private Integer numEmployees = 4;
    private Integer numBots = 3;
    private Double arrivalRate = 12.0; // claims/hour
    private Double employeeHourlyRate = 28.50; // $/hr
    private Double botHourlyRate = 4.20; // $/hr
    private Double exceptionRate = 0.18; // 18% require human intervention
    private Double meanManualTimeMinutes = 24.0;
    private Double meanBotTimeMinutes = 1.5;

    public SimulationRequestDto() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getNumClaims() { return numClaims; }
    public void setNumClaims(Integer numClaims) { this.numClaims = numClaims; }

    public Double getDurationHours() { return durationHours; }
    public void setDurationHours(Double durationHours) { this.durationHours = durationHours; }

    public Integer getNumEmployees() { return numEmployees; }
    public void setNumEmployees(Integer numEmployees) { this.numEmployees = numEmployees; }

    public Integer getNumBots() { return numBots; }
    public void setNumBots(Integer numBots) { this.numBots = numBots; }

    public Double getArrivalRate() { return arrivalRate; }
    public void setArrivalRate(Double arrivalRate) { this.arrivalRate = arrivalRate; }

    public Double getEmployeeHourlyRate() { return employeeHourlyRate; }
    public void setEmployeeHourlyRate(Double employeeHourlyRate) { this.employeeHourlyRate = employeeHourlyRate; }

    public Double getBotHourlyRate() { return botHourlyRate; }
    public void setBotHourlyRate(Double botHourlyRate) { this.botHourlyRate = botHourlyRate; }

    public Double getExceptionRate() { return exceptionRate; }
    public void setExceptionRate(Double exceptionRate) { this.exceptionRate = exceptionRate; }

    public Double getMeanManualTimeMinutes() { return meanManualTimeMinutes; }
    public void setMeanManualTimeMinutes(Double meanManualTimeMinutes) { this.meanManualTimeMinutes = meanManualTimeMinutes; }

    public Double getMeanBotTimeMinutes() { return meanBotTimeMinutes; }
    public void setMeanBotTimeMinutes(Double meanBotTimeMinutes) { this.meanBotTimeMinutes = meanBotTimeMinutes; }
}
