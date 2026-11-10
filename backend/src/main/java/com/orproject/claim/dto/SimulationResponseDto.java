package com.orproject.claim.dto;

import java.util.Map;

public class SimulationResponseDto {
    private Long id;
    private Long configId;
    private String name;
    private String status = "COMPLETED";
    private Map<String, Object> scenarioAManual;
    private Map<String, Object> scenarioBAutomated;
    private Map<String, Object> comparison;
    private Map<String, Object> roi;
    private String createdAt;

    public SimulationResponseDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getConfigId() { return configId; }
    public void setConfigId(Long configId) { this.configId = configId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Map<String, Object> getScenarioAManual() { return scenarioAManual; }
    public void setScenarioAManual(Map<String, Object> scenarioAManual) { this.scenarioAManual = scenarioAManual; }

    public Map<String, Object> getScenarioBAutomated() { return scenarioBAutomated; }
    public void setScenarioBAutomated(Map<String, Object> scenarioBAutomated) { this.scenarioBAutomated = scenarioBAutomated; }

    public Map<String, Object> getComparison() { return comparison; }
    public void setComparison(Map<String, Object> comparison) { this.comparison = comparison; }

    public Map<String, Object> getRoi() { return roi; }
    public void setRoi(Map<String, Object> roi) { this.roi = roi; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
