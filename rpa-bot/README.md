# Robotic Process Automation (RPA) Module

## Overview
This module demonstrates Robotic Process Automation (RPA) applied to insurance claim processing. It models the automation of repetitive, rule-based tasks traditionally executed by claims adjusters:
1. Retrieval of newly submitted claims from the queue.
2. OCR document completeness checking (identifying whether medical invoices, police reports, or death certificates are attached).
3. Automated policy verification against the core insurance system (validating active status, effective coverage dates, and available coverage limit).
4. Anomaly and fraud detection scoring (evaluating claimed amounts against normal distributions and risk indicators).
5. Calculation of eligible payout post-deductible.
6. Straight-Through Processing (STP) approval for standard claims or automatic routing to human claim processors for exception cases.
7. Persistence of immutable execution audit logs for compliance.

---

## 1. Local Python RPA Worker (`rpa_worker.py`)

The Python worker provides an out-of-the-box, cross-platform demonstration of an external RPA bot client interacting with the Spring Boot backend via authenticated REST APIs.

### Prerequisites
- Python 3.10+
- `requests` library (`pip install requests`)
- Spring Boot backend running on `http://localhost:8080`

### Execution Modes

#### 1. Batch Execution (Default)
Processes up to 15 pending claims in one automated run:
```bash
python rpa_worker.py --mode batch --batch-size 15
```

#### 2. Individual Step-by-Step Execution
Fetches pending claims and processes them one-by-one with realistic pacing and detailed per-claim console output:
```bash
python rpa_worker.py --mode individual --batch-size 5
```

#### 3. Continuous Polling Daemon
Runs as an active background worker that polls the claim intake queue every 10 seconds:
```bash
python rpa_worker.py --mode continuous --interval 10
```

#### Command-Line Arguments
- `--url`: Backend API URL (default: `http://localhost:8080`)
- `--user`: Username (default: `admin`)
- `--password`: Password (or set `CLAIMFLOW_ADMIN_PASSWORD` in the environment)
- `--bot-id`: Custom identifier (e.g. `RPA-BOT-ALPHA`)
- `--batch-size`: Number of claims to intake per batch

---

## 2. UiPath Compatibility (`UiPath_Workflow.xaml`)

For enterprise deployments utilizing UiPath Studio:
1. Open **UiPath Studio** (v2022.10 or later).
2. Choose **Open Project** and select `UiPath_Workflow.xaml`.
3. Ensure the `UiPath.WebAPI.Activities` and `UiPath.System.Activities` packages are installed in the Manage Packages console.
4. Configure Orchestrator Assets or Workflow Arguments:
   - `in_BaseUrl`: Backend REST API URL (e.g., `http://localhost:8080`)
   - `in_BotId`: Bot Name
5. The workflow automatically triggers the REST endpoints (`/api/auth/login`, `/api/rpa/batch`, `/api/rpa/logs`) and handles exception branches.

---

## 3. Actual Automation vs. Operations Research Simulation Assumptions

It is critical to distinguish between the **Actual RPA Automation Engine** and the **Operations Research Simulation Engine**:

| Aspect | Actual RPA Automation (Module 4) | OR Simulation Engine (Module 5) |
|---|---|---|
| **Mechanism** | Real code execution over database records via REST APIs | Discrete-event mathematical simulation in SimPy |
| **Data Source** | Concrete database entities (`InsuranceClaim`, `ClaimDocument`) | Stochastic Poisson arrival generator ($\lambda$ claims/hr) |
| **Service Time** | Real measured CPU/network latency (e.g. 50ms - 200ms) | Lognormal and Normal random variables ($\mu, \sigma$) |
| **Decision Rule** | Strict deterministic logic: Policy Active $\land$ Score $\le$ 65 | Statistical branching probability ($p_{\text{exception}} = 18\%$) |
| **Purpose** | Operational execution, data integrity, audit logging | Capacity planning, queue length prediction, sensitivity analysis, 3-year ROI forecasting |

