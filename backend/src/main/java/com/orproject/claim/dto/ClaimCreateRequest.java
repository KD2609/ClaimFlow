package com.orproject.claim.dto;

import com.orproject.claim.model.InsuranceType;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class ClaimCreateRequest {
    private String customerName;
    private String customerEmail;
    private String policyNumber;
    private InsuranceType insuranceType = InsuranceType.HEALTH;
    private BigDecimal claimAmount;
    private String description;
    private String attachedDocuments;

    // Backwards-compatible fields for nested requests
    private Long customerId;
    private Long policyId;
    private List<Map<String, Object>> documents;

    public ClaimCreateRequest() {}

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }

    public InsuranceType getInsuranceType() { return insuranceType; }
    public void setInsuranceType(InsuranceType insuranceType) { this.insuranceType = insuranceType; }

    public BigDecimal getClaimAmount() { return claimAmount; }
    public void setClaimAmount(BigDecimal claimAmount) { this.claimAmount = claimAmount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAttachedDocuments() { return attachedDocuments; }
    public void setAttachedDocuments(String attachedDocuments) { this.attachedDocuments = attachedDocuments; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getPolicyId() { return policyId; }
    public void setPolicyId(Long policyId) { this.policyId = policyId; }

    public List<Map<String, Object>> getDocuments() { return documents; }
    public void setDocuments(List<Map<String, Object>> documents) { this.documents = documents; }
}
