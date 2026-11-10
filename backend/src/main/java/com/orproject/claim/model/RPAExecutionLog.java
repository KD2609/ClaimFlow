package com.orproject.claim.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rpa_execution_logs")
public class RPAExecutionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long claimId;

    @Column(length = 50)
    private String claimNumber;

    @Column(nullable = false, length = 50)
    private String botId;

    @Column(nullable = false, length = 30)
    private String executionStatus = "SUCCESS"; // SUCCESS, EXCEPTION, FAILED

    private Double executionDurationMs = 0.0;

    private Double operationalCost = 0.0;

    @Column(columnDefinition = "TEXT")
    private String executionDetails;

    private LocalDateTime timestamp = LocalDateTime.now();

    public RPAExecutionLog() {}

    public RPAExecutionLog(Long claimId, String claimNumber, String botId, String executionStatus,
                           Double executionDurationMs, Double operationalCost, String executionDetails) {
        this.claimId = claimId;
        this.claimNumber = claimNumber;
        this.botId = botId;
        this.executionStatus = executionStatus;
        this.executionDurationMs = executionDurationMs;
        this.operationalCost = operationalCost;
        this.executionDetails = executionDetails;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getClaimId() { return claimId; }
    public void setClaimId(Long claimId) { this.claimId = claimId; }

    public String getClaimNumber() { return claimNumber; }
    public void setClaimNumber(String claimNumber) { this.claimNumber = claimNumber; }

    public String getBotId() { return botId; }
    public void setBotId(String botId) { this.botId = botId; }

    public String getExecutionStatus() { return executionStatus; }
    public void setExecutionStatus(String executionStatus) { this.executionStatus = executionStatus; }

    public Double getExecutionDurationMs() { return executionDurationMs; }
    public void setExecutionDurationMs(Double executionDurationMs) { this.executionDurationMs = executionDurationMs; }

    public Double getOperationalCost() { return operationalCost; }
    public void setOperationalCost(Double operationalCost) { this.operationalCost = operationalCost; }

    public String getExecutionDetails() { return executionDetails; }
    public void setExecutionDetails(String executionDetails) { this.executionDetails = executionDetails; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
