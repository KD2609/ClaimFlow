# Insurance Claim Processing Automation: System Architecture & Operations Research Design

## 1. System Overview

This system simulates, automates, and quantifies the operational and financial impact of integrating **Robotic Process Automation (RPA)** into traditional insurance claim processing. It leverages **Discrete-Event Simulation (DES)** built on **SimPy** to model multi-server queueing dynamics ($M/M/c$ and $M/G/c$ queueing systems), resource allocation, stochastic processing times, and bottleneck scenarios.

```
+----------------------------------------------------------------------------------------------------+
|                                    REACT FRONTEND (Vite, Tailwind, Recharts)                       |
|   - Authentication (ADMIN / CLAIM_PROCESSOR)                                                       |
|   - Claims Management & Interactive Claim Details                                                  |
|   - Manual Processing Workspace (5-Stage Human Evaluation)                                         |
|   - RPA Automated Processing Console & Live Bot Execution Logs                                     |
|   - Operations Research Simulation Lab & Sensitivity Experiments                                   |
|   - Comparative Analytics & Real-Time ROI / Cost-Benefit Calculations                              |
+----------------------------------------------------------------------------------------------------+
                                      |                             ^
                              HTTP / REST API              JSON Responses (CORS)
                                      v                             |
+----------------------------------------------------------------------------------------------------+
|                               SPRING BOOT BACKEND (Java 17, Spring Data JPA)                       |
|   - Security: JWT-based stateless authentication & role-based authorization                        |
|   - Core Business Services: ClaimService, PolicyService, CustomerService                           |
|   - RPA Orchestration & Audit Service: RPAExecutionService                                        |
|   - Simulation Proxy Service: SimulationProxyService (calls Python DES engine)                     |
|   - Data Seeder: Automatic population of 100+ realistic claims across Health, Vehicle, Life         |
+----------------------------------------------------------------------------------------------------+
           |                                                      |
    JPA / Hibernate (PostgreSQL / H2)                      HTTP / REST (Port 8000)
           v                                                      v
+-------------------------------+      +-------------------------------------------------------------+
|    POSTGRESQL DATABASE        |      |    PYTHON SIMULATION ENGINE (SimPy 4, NumPy, Pandas, FastAPI)|
| - Users & Roles               |      | - Discrete-Event Simulation (DES) Environment               |
| - Customers & Policies        |      | - M/M/c & M/G/c Stochastic Queueing Models                  |
| - Claims & Documents          |      | - Scenario A: Manual Multi-Server Processing Queue          |
| - Processing History & Audits |      | - Scenario B: RPA Automated Pipeline with Human Escalation   |
| - Simulation Configs & Runs   |      | - Operations Research Sensitivity Analysis (3 Experiments)  |
+-------------------------------+      +-------------------------------------------------------------+
                                                                  ^
                                                       HTTP REST / CLI Trigger
                                                                  |
                                       +-------------------------------------------------------------+
                                       |            RPA BOT WORKER (Python / UiPath Spec)            |
                                       | - Reads pending claims via REST API                         |
                                       | - Rule-based policy validation, doc check, fraud scoring    |
                                       | - Automated approval vs. manual escalation                  |
                                       | - Emits comprehensive execution telemetry                   |
                                       +-------------------------------------------------------------+
```

## 2. Operations Research Methodology

### 2.1 Discrete-Event Simulation & Queueing Theory
In traditional manual processing, claims arrive according to a non-homogeneous or homogeneous **Poisson process** with rate $\lambda$ (inter-arrival time $A \sim \text{Exp}(\lambda)$).
The manual processing unit consists of $c_m$ human employees ($c_m \ge 1$), forming an $M/G/c_m$ queue where processing time $S_m$ is stochastic and typically follows a **lognormal** or **triangular** distribution to account for human variability and case complexity:
$$S_m \sim \text{Lognormal}(\mu_m, \sigma_m^2)$$

In automated RPA processing:
1. Claims first enter the **RPA Bot Pool** of capacity $c_{\text{rpa}}$ ($c_{\text{rpa}} \ge 1$).
2. Bot processing time $S_{\text{rpa}}$ is significantly shorter and has low variance:
   $$S_{\text{rpa}} \sim \mathcal{N}(\mu_{\text{rpa}}, \sigma_{\text{rpa}}^2), \quad \text{where } \mu_{\text{rpa}} \ll \mu_m$$
3. A fraction $p_{\text{exception}}$ of claims (typically 10-25%) require human intervention due to missing documents, policy discrepancies, or suspicious fraud risk scores. These claims are diverted to the human exception queue with priority or FIFO discipline.

### 2.2 Key Performance Indicators (KPIs)
- **Waiting Time in Queue ($W_q$):** Average time a claim waits before processing starts.
- **Total System Time ($W$):** $W = W_q + S$ (Cycle time from submission to decision).
- **Queue Length ($L_q$):** Average number of pending claims waiting in line.
- **Server Utilization ($\rho$):** Fraction of time workers/bots are busy:
  $$\rho = \frac{\lambda}{c \cdot \mu}$$
- **Operational Cost ($C_{\text{total}}$):**
  $$C_{\text{manual}} = \sum (\text{Employee Working Hours} \times \text{Hourly Wage}) + \text{Overhead}$$
  $$C_{\text{automated}} = \sum (\text{Bot Active Hours} \times \text{Bot Rate}) + \sum (\text{Human Exception Hours} \times \text{Hourly Wage}) + C_{\text{infra}}$$
- **Return on Investment (ROI):**
  $$\text{ROI} (\%) = \frac{\text{Net Financial Benefits} - \text{Total Automation Investment}}{\text{Total Automation Investment}} \times 100$$
  $$\text{Payback Period (Months)} = \frac{\text{Total Automation Investment}}{\text{Monthly Operational Savings}}$$

## 3. Operations Research Experiments
1. **Experiment 1 (Arrival Rate Scaling):** Varying claim arrival rate $\lambda \in [5, 40]$ claims/hour to observe queue explosion under manual processing vs. RPA resilience.
2. **Experiment 2 (Human Workforce Sensitivity):** Varying human staff $c_m \in [1, 12]$ to quantify marginal utility and cost trade-offs.
3. **Experiment 3 (RPA Bot Capacity Optimization):** Varying bot capacity $c_{\text{rpa}} \in [1, 16]$ to identify optimal bot-to-claim ratio preventing over-provisioning.
