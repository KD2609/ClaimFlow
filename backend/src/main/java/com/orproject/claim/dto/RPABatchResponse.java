package com.orproject.claim.dto;

import java.util.ArrayList;
import java.util.List;

public class RPABatchResponse {
    private int totalProcessed;
    private int approvedCount;
    private int manualReviewCount;
    private int rejectedCount;
    private double totalExecutionTimeMs;
    private double totalCost;
    private List<RPARunResultDto> results = new ArrayList<>();

    public RPABatchResponse() {}

    public RPABatchResponse(int totalProcessed, int approvedCount, int manualReviewCount, int rejectedCount,
                            double totalExecutionTimeMs, double totalCost, List<RPARunResultDto> results) {
        this.totalProcessed = totalProcessed;
        this.approvedCount = approvedCount;
        this.manualReviewCount = manualReviewCount;
        this.rejectedCount = rejectedCount;
        this.totalExecutionTimeMs = totalExecutionTimeMs;
        this.totalCost = totalCost;
        this.results = results != null ? results : new ArrayList<>();
    }

    public int getTotalProcessed() { return totalProcessed; }
    public void setTotalProcessed(int totalProcessed) { this.totalProcessed = totalProcessed; }

    public int getApprovedCount() { return approvedCount; }
    public void setApprovedCount(int approvedCount) { this.approvedCount = approvedCount; }

    public int getManualReviewCount() { return manualReviewCount; }
    public void setManualReviewCount(int manualReviewCount) { this.manualReviewCount = manualReviewCount; }

    public int getRejectedCount() { return rejectedCount; }
    public void setRejectedCount(int rejectedCount) { this.rejectedCount = rejectedCount; }

    public double getTotalExecutionTimeMs() { return totalExecutionTimeMs; }
    public void setTotalExecutionTimeMs(double totalExecutionTimeMs) { this.totalExecutionTimeMs = totalExecutionTimeMs; }

    public double getTotalCost() { return totalCost; }
    public void setTotalCost(double totalCost) { this.totalCost = totalCost; }

    public List<RPARunResultDto> getResults() { return results; }
    public void setResults(List<RPARunResultDto> results) { this.results = results; }
}
