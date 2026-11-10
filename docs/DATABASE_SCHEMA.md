# Database Design and Schema Specification

## 1. Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ CLAIM_PROCESSING_HISTORY : "performs"
    CUSTOMERS ||--o{ INSURANCE_POLICIES : "holds"
    CUSTOMERS ||--o{ INSURANCE_CLAIMS : "submits"
    INSURANCE_POLICIES ||--o{ INSURANCE_CLAIMS : "covers"
    INSURANCE_CLAIMS ||--o{ CLAIM_DOCUMENTS : "contains"
    INSURANCE_CLAIMS ||--o{ CLAIM_PROCESSING_HISTORY : "has"
    INSURANCE_CLAIMS ||--o{ RPA_EXECUTION_LOGS : "processed_by"
    SIMULATION_CONFIGURATIONS ||--o{ SIMULATION_RESULTS : "generates"

    USERS {
        bigint id PK
        varchar username UK
        varchar password
        varchar full_name
        varchar role
        boolean active
        timestamp created_at
    }

    CUSTOMERS {
        bigint id PK
        varchar customer_number UK
        varchar first_name
        varchar last_name
        varchar email
        varchar phone
        varchar address
        varchar national_id
        timestamp created_at
    }

    INSURANCE_POLICIES {
        bigint id PK
        varchar policy_number UK
        bigint customer_id FK
        varchar policy_type
        decimal max_coverage
        decimal deductible
        varchar status
        date start_date
        date end_date
        timestamp created_at
    }

    INSURANCE_CLAIMS {
        bigint id PK
        varchar claim_number UK
        bigint customer_id FK
        bigint policy_id FK
        varchar insurance_type
        decimal claim_amount
        decimal eligible_amount
        varchar status
        varchar processing_mode
        decimal fraud_risk_score
        text fraud_risk_reason
        text description
        timestamp submission_date
        timestamp approved_or_rejected_at
        decimal total_processing_cost
        integer total_processing_time_seconds
        timestamp created_at
        timestamp updated_at
    }

    CLAIM_DOCUMENTS {
        bigint id PK
        bigint claim_id FK
        varchar document_type
        varchar file_name
        varchar file_url
        boolean is_verified
        text verification_notes
        timestamp uploaded_at
    }

    CLAIM_PROCESSING_HISTORY {
        bigint id PK
        bigint claim_id FK
        varchar stage
        varchar performer_type
        varchar performer_name
        timestamp started_at
        timestamp completed_at
        integer duration_seconds
        decimal cost_incurred
        varchar action_taken
        text notes
    }

    RPA_EXECUTION_LOGS {
        bigint id PK
        bigint claim_id FK
        varchar bot_id
        varchar stage
        varchar execution_status
        integer duration_ms
        text details
        timestamp executed_at
    }

    SIMULATION_CONFIGURATIONS {
        bigint id PK
        varchar name
        integer num_claims
        double_precision duration_hours
        integer num_employees
        integer num_bots
        double_precision arrival_rate
        double_precision employee_hourly_rate
        double_precision bot_hourly_rate
        double_precision exception_rate
        double_precision mean_manual_time_minutes
        double_precision mean_bot_time_minutes
        timestamp created_at
    }

    SIMULATION_RESULTS {
        bigint id PK
        bigint config_id FK
        text scenario_a_manual_json
        text scenario_b_automated_json
        text comparison_json
        text roi_json
        timestamp created_at
    }
```

## 2. Table Specifications & Indexes

1. **`users`**:
   - `id` (BIGSERIAL, PRIMARY KEY)
   - `username` (VARCHAR(50), NOT NULL, UNIQUE)
   - `password` (VARCHAR(255), NOT NULL) - BCrypt encrypted
   - `full_name` (VARCHAR(100), NOT NULL)
   - `role` (VARCHAR(30), NOT NULL) - `ROLE_ADMIN`, `ROLE_CLAIM_PROCESSOR`
   - `active` (BOOLEAN, DEFAULT TRUE)

2. **`insurance_claims`**:
   - Status values: `PENDING`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `FLAGGED_FOR_MANUAL`
   - Processing mode: `MANUAL`, `AUTOMATED`
   - Insurance types: `HEALTH`, `VEHICLE`, `LIFE`
   - Indexes on: `claim_number` (UNIQUE), `status`, `insurance_type`, `submission_date`

3. **`claim_processing_history`**:
   - Performer type: `HUMAN`, `RPA_BOT`
   - Stage values: `DOCUMENT_VERIFICATION`, `POLICY_VALIDATION`, `AMOUNT_VERIFICATION`, `FRAUD_DETECTION`, `DECISION`
   - Tracks duration in seconds and labor / execution cost incurred.
