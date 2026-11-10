# Database Schema

The current Spring Data JPA model defines exactly three application tables:
`users`, `insurance_claims`, and `rpa_execution_logs`. The names below use
Spring Boot's default physical naming strategy, which converts Java camelCase
property names to snake_case column names.

## `users`

| Column | PostgreSQL type | Constraints |
|---|---|---|
| `id` | `BIGSERIAL` | Primary key |
| `username` | `VARCHAR(50)` | Not null, unique |
| `password` | `VARCHAR(255)` | Not null; BCrypt hash |
| `full_name` | `VARCHAR(100)` | Not null |
| `role` | `VARCHAR(30)` | Not null; `ROLE_ADMIN` or `ROLE_CLAIM_PROCESSOR` |
| `active` | `BOOLEAN` | Not null |
| `created_at` | `TIMESTAMP WITHOUT TIME ZONE` | Not null |

`active` and `created_at` are initialized by Java; the entity does not declare
database defaults for them.

## `insurance_claims`

| Column | PostgreSQL type | Constraints |
|---|---|---|
| `id` | `BIGSERIAL` | Primary key |
| `claim_number` | `VARCHAR(50)` | Not null, unique |
| `customer_name` | `VARCHAR(100)` | Not null |
| `customer_email` | `VARCHAR(100)` | Nullable |
| `policy_number` | `VARCHAR(50)` | Not null |
| `coverage_amount` | `NUMERIC(12,2)` | Nullable |
| `insurance_type` | `VARCHAR(30)` | Not null; `HEALTH`, `VEHICLE`, `LIFE` |
| `claim_amount` | `NUMERIC(12,2)` | Not null |
| `eligible_payout_amount` | `NUMERIC(12,2)` | Nullable |
| `claim_status` | `VARCHAR(30)` | Not null; `SUBMITTED`, `IN_REVIEW`, `APPROVED`, `REJECTED`, `REQUIRES_MANUAL_REVIEW` |
| `processing_mode` | `VARCHAR(30)` | Not null; `MANUAL`, `AUTOMATED` |
| `current_stage` | `VARCHAR(50)` | Nullable; `DOCUMENT_VERIFICATION`, `POLICY_VALIDATION`, `AMOUNT_VERIFICATION`, `FRAUD_DETECTION`, `FINAL_DECISION` |
| `fraud_risk_score` | `INTEGER` | Nullable |
| `processing_time_minutes` | `DOUBLE PRECISION` | Nullable |
| `operational_cost` | `DOUBLE PRECISION` | Nullable |
| `description` | `TEXT` | Nullable |
| `attached_documents` | `TEXT` | Nullable |
| `adjudication_notes` | `TEXT` | Nullable |
| `submission_date` | `TIMESTAMP WITHOUT TIME ZONE` | Nullable |
| `processed_date` | `TIMESTAMP WITHOUT TIME ZONE` | Nullable |

## `rpa_execution_logs`

| Column | PostgreSQL type | Constraints |
|---|---|---|
| `id` | `BIGSERIAL` | Primary key |
| `claim_id` | `BIGINT` | Nullable |
| `claim_number` | `VARCHAR(50)` | Nullable |
| `bot_id` | `VARCHAR(50)` | Not null |
| `execution_status` | `VARCHAR(30)` | Not null |
| `execution_duration_ms` | `DOUBLE PRECISION` | Nullable |
| `operational_cost` | `DOUBLE PRECISION` | Nullable |
| `execution_details` | `TEXT` | Nullable |
| `timestamp` | `TIMESTAMP WITHOUT TIME ZONE` | Nullable |

There are no JPA relationships or foreign-key constraints between these
entities. In particular, `rpa_execution_logs.claim_id` is a plain nullable
`BIGINT`, not a foreign key.

## Schema changes

The PostgreSQL profile currently uses Hibernate `ddl-auto=update`; it can add
missing tables and columns but should not be relied on to safely rename or
remove columns. Inspect the existing Supabase schema before applying manual
migrations. Do not drop or recreate these tables to resolve a mismatch.
