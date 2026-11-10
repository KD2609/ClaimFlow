package com.orproject.claim.dto;

import java.util.List;

public class RPABatchRequest {
    private List<Long> claimIds;
    private Integer limit = 10;
    private String botId = "RPA-BOT-01";
    private Double botHourlyCost = 4.20;

    public RPABatchRequest() {}

    public List<Long> getClaimIds() { return claimIds; }
    public void setClaimIds(List<Long> claimIds) { this.claimIds = claimIds; }

    public Integer getLimit() { return limit; }
    public void setLimit(Integer limit) { this.limit = limit; }

    public String getBotId() { return botId; }
    public void setBotId(String botId) { this.botId = botId; }

    public Double getBotHourlyCost() { return botHourlyCost; }
    public void setBotHourlyCost(Double botHourlyCost) { this.botHourlyCost = botHourlyCost; }
}
