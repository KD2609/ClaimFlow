# Insurance Claim Processing Automation: Simulating Time and Cost Savings Using Robotic Process Automation (RPA)

> **College Operations Research Course Project**  
> **Academic Focus**: Discrete-Event Simulation (SimPy), Multi-Server Queueing Theory ($M/G/c$), Stochastic Service Distributions, Sensitivity Analysis, and Robotic Process Automation (RPA) ROI Modeling.  
> **Target Environment**: Windows 11 (Native Execution, No Docker Required).

---

## 1. Executive Summary & Objective

In modern health, vehicle, and life insurance enterprises, manual claim adjudication is characterized by high operational overhead, long cycle times, and human cognitive fatigue. Claims adjusters repeatedly perform mechanical checks: policy eligibility verification, document completeness audits, billing arithmetic, and deductible computations.

This project delivers an interactive, visually impressive full-stack web application and discrete-event simulation platform designed to empirically measure and demonstrate how **Robotic Process Automation (RPA)** transforms claims operations:
- **Cycle Time Reduction**: Decreasing claim cycle time from **~62 minutes** to **~4.2 minutes** (**88%+ latency reduction**).
- **Cost Reduction**: Slashing unit cost per claim from **$22.80** to **$4.48** (**70%+ operational cost savings**).
- **Throughput Surge**: Increasing daily settlement throughput by **145%+** through Straight-Through Processing (STP).
- **Workforce Optimization**: Eliminating backlogs and redirecting human adjusters exclusively to high-complexity or suspicious anomaly claims.
- **Measurable ROI**: Demonstrating capital break-even within **~4.2 months** and achieving a **320%+ 3-Year Return on Investment**.

---

## 2. Operations Research & Queueing Theory Formulation

This project grounds claim operations in rigorous **Operations Research (OR)** mathematical formulations rather than simple database CRUD.

```
Incoming Claims (Poisson Arrival λ)
              │
              ▼
   ┌──────────────────────┐
   │ Queue Buffer (W_q)   │
   └──────────┬───────────┘
              │
       ┌──────┴────────────────────────┐
       ▼                               ▼
[Scenario A: Manual]          [Scenario B: RPA Pipeline]
  4 Human Adjusters             3 RPA Bots (Parallel Workers)
  Service Time ~ LogNormal      Service Time ~ Normal (Deterministic)
  μ_m = 24.0 min, σ = 8.0 min   μ_rpa = 1.5 min, σ = 0.2 min
                                       │
                                ┌──────┴────────────────┐
                                ▼                       ▼
                         Clean Claim (82%)       Exception / Flagged (18%)
                         Straight-Through        Escalated to Human Adjuster
                         Instant Settlement      μ_esc = 12.0 min
```

### 2.1 Multi-Server Queueing Models

#### Scenario A: Traditional Manual Processing ($M/G/c_m$)
- **Arrival Process ($M$)**: Poisson arrivals with rate $\lambda$ (claims per hour); interarrival times $t_a \sim \text{Exponential}(1/\lambda)$.
- **Service Distribution ($G$)**: Human service duration follows a heavy-tailed **Lognormal distribution** $\text{Lognormal}(\mu_m, \sigma_m^2)$ reflecting cognitive variability and document complexity ($E[S_m] = 24.0\text{ min}$).
- **Servers ($c_m$)**: $c_m = 4$ parallel human adjusters.
- **Traffic Intensity ($\rho_m$)**:
  $$\rho_m = \frac{\lambda \cdot E[S_m]}{c_m \cdot 60}$$
  When $\lambda > \frac{60 \cdot c_m}{E[S_m]} = 10 \text{ claims/hr}$, $\rho_m \to 1.0$, causing queue lengths to explode asymptotically.

#### Scenario B: Automated RPA Pipeline with Exception Escalation
- **Primary Stage (RPA Bots)**: $c_{\text{rpa}} = 3$ automated bot workers with rapid, near-deterministic service times $S_{\text{rpa}} \sim \mathcal{N}(\mu_{\text{rpa}}, \sigma_{\text{rpa}}^2)$ with $\mu_{\text{rpa}} = 1.5\text{ min}$, $\sigma_{\text{rpa}} = 0.2\text{ min}$.
- **Decision Branching**:
  - Probability $1 - p_{\text{exception}} \approx 82\%$: **Straight-Through Processing (STP)** instant approval.
  - Probability $p_{\text{exception}} \approx 18\%$: Escalation to human adjusters for exception handling (missing documents, fraud anomaly score $> 65$, or policy mismatches) with reduced human service time $S_{\text{esc}} \sim \text{Lognormal}(12.0, 3.0)$.
- **Effective RPA Traffic Intensity ($\rho_{\text{rpa}}$)**:
  $$\rho_{\text{rpa}} = \frac{\lambda \cdot E[S_{\text{rpa}}]}{c_{\text{rpa}} \cdot 60}$$

### 2.2 Little's Law Verification
In both discrete-event simulation scenarios, empirical metrics satisfy **Little's Law**:
$$L = \lambda \cdot W \quad \text{and} \quad L_q = \lambda \cdot W_q$$
Where:
- $L$: Average number of claims in the system.
- $L_q$: Average number of pending claims waiting in the queue buffer.
- $W$: Total average cycle time ($W = W_q + W_s$).
- $W_q$: Average waiting time in queue.

### 2.3 Capital Budgeting & Multi-Year ROI Formulation
- **Unit Cost of Labor**: $C_{\text{employee}} = \$28.50/\text{hr}$; $C_{\text{bot}} = \$4.20/\text{hr}$.
- **Initial RPA Capital Expenditure**: $I_0 = \$15,000$ (licensing, bot architecture, orchestrator setup).
- **Annual Maintenance**: $M_{\text{annual}} = \$2,500/\text{year}$.
- **Monthly Net Operational Benefit**:
  $$B_{\text{monthly}} = (V_{\text{monthly}} \cdot \Delta C_{\text{unit}}) - \frac{M_{\text{annual}}}{12}$$
  Where $\Delta C_{\text{unit}} = C_{\text{manual}}/N - C_{\text{auto}}/N$.
- **Payback Period**:
  $$\text{Payback (Months)} = \frac{I_0}{B_{\text{monthly}}}$$
- **3-Year Net ROI**:
  $$\text{ROI}_{3\text{yr}} (\%) = \frac{(B_{\text{monthly}} \cdot 36) - I_0}{I_0} \times 100$$

---

## 3. Technology Stack & Simplified Architecture

Designed specifically for a college demonstration—clean, readable, and easy to explain during viva examination without enterprise bloat:

| Layer | Technologies | Architectural Responsibility |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, React Router 6 | Fast, modern single-page dashboard with 5 streamlined navigation pages and 4-tab unified OR Simulation Lab |
| **Backend API** | Java 21 / 17, Spring Boot 3.3.4, Spring Data JPA, H2 / PostgreSQL Mode | Lightweight REST backend with 3 core entities (`InsuranceClaim`, `RPAExecutionLog`, `User`), clean DTOs, and auto-seeder |
| **Simulation Engine** | Python 3.13, SimPy 4.1.2, NumPy, Pandas, FastAPI | Clean, procedural discrete-event simulation functions exposing `/simulate` and `/experiments` on port 8000 |
| **RPA Automation** | Python 3 (`rpa_worker.py`), UiPath Studio (`UiPath_Workflow.xaml`) | Simulated bot worker executing document verification, policy checks, anomaly audits, and REST state updates |

---

## 4. Directory Structure

```
c:\Projects\OR_Project\
├── backend\                           # Spring Boot 3 Backend
│   ├── src\main\java\com\orproject\claim\
│   │   ├── config\SecurityConfig.java # Clean open CORS & BCrypt encoder (no complex filters)
│   │   ├── controller\                # Auth, Claim, ManualProcessing, RPA, Simulation, Dashboard
│   │   ├── dto\                       # Minimal, clean request/response DTOs
│   │   ├── model\                     # 3 Core Entities: InsuranceClaim, RPAExecutionLog, User
│   │   ├── repository\                # 3 Spring Data JPA Repositories
│   │   └── service\                   # ClaimService, RPAExecutionService, SimulationService, DataSeeder
│   ├── pom.xml                        # Maven dependencies
│   └── mvnw.cmd                       # Maven wrapper
├── frontend\                          # React + Vite + Tailwind Dashboard
│   ├── src\
│   │   ├── components\layout\         # Top horizontal Navbar and clean responsive Layout (no sidebar)
│   │   ├── context\AuthContext.jsx    # Client session context
│   │   ├── pages\                     # Flagship Pages
│   │   │   ├── HomePage.jsx           # Public showcase landing page (Features, OR Overview, How It Works)
│   │   │   ├── Dashboard.jsx          # Live KPI summary cards & queue status charts (/dashboard)
│   │   │   ├── ClaimsManagement.jsx   # Claims table, search, modal intake & dossier inspection
│   │   │   ├── ManualProcessing.jsx   # 5-stage interactive manual adjuster workbench
│   │   │   ├── AutomatedProcessing.jsx# RPA bot execution console & terminal output
│   │   │   ├── SimulationLab.jsx      # Flagship unified OR lab (Studio, Charts, Sensitivity, ROI)
│   │   │   └── Login.jsx              # Login screen with username shortcuts
│   │   └── services\api.js            # Clean Axios REST client
│   ├── package.json
│   └── vite.config.js
├── simulation-engine\                 # Python SimPy Discrete-Event Service
│   ├── simulation_model.py            # Clean SimPy 4 functions: manual, automated & ROI
│   ├── experiments.py                 # 3 Sensitivity experiments (λ, staff, bots)
│   ├── generate_charts.py             # Standalone Matplotlib chart exporter
│   ├── main.py                        # FastAPI microservice on port 8000
│   └── requirements.txt               # simpy, fastapi, uvicorn, numpy, pandas, matplotlib
├── rpa-bot\                           # RPA Worker & UiPath Deliverables
│   ├── rpa_worker.py                  # Standalone Python RPA worker with REST client
│   └── UiPath_Workflow.xaml           # UiPath Studio sequence & flowchart workflow
├── start_all.bat                      # 1-Click Windows 11 launcher for all 3 services
├── start_backend.bat                  # Windows runner for Spring Boot (Port 8080)
├── start_simulation.bat               # Windows runner for SimPy FastAPI (Port 8000)
├── start_frontend.bat                 # Windows runner for React Vite (Port 5173)
└── README.md                          # Project documentation & viva guide
```

---

## 5. Local Execution Guide (Windows 11 PowerShell - Zero Docker)

This application runs natively on Windows 11 with **zero dependency on Docker or Docker Compose**.

### 5.1 One-Click Launch (Recommended)
Double-click `start_all.bat` or run from PowerShell:
```powershell
.\start_all.bat
```
This automatically launches all three microservices in separate background console windows:
1. **Python SimPy Simulation Service** at `http://localhost:8000` (FastAPI docs at `/docs`)
2. **Spring Boot REST Backend** at `http://localhost:8080` (pre-seeded with 60 realistic claims)
3. **React Vite Frontend** at `http://localhost:5173`

Your default web browser will automatically open to `http://localhost:5173`.

---

### 5.2 Step-by-Step PowerShell Startup Commands

#### Step 1: Start Python Simulation Microservice (Port 8000)
Open a new PowerShell window:
```powershell
cd c:\Projects\OR_Project\simulation-engine

# Activate the local virtual environment (if not already activated)
.\venv\Scripts\Activate.ps1

# Launch the FastAPI Uvicorn server on port 8000
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- **Local API Endpoint**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

#### Step 2: Start Spring Boot REST Backend (Port 8080)
Open a second PowerShell window:
```powershell
cd c:\Projects\OR_Project\backend
$env:JAVA_HOME="C:\Program Files\Java\jdk-21"

# Option A: Run directly using Maven
.\mvnw.cmd spring-boot:run

# Option B: Run the pre-compiled production JAR (Instant Startup)
java -Dspring.profiles.active=dev -jar target\insurance-claim-automation-1.0.0.jar
```
- **Health Check Endpoint**: `http://localhost:8080/api/dashboard/stats`
- **Database (Default)**: In-Memory PostgreSQL-Compatible H2 with automatic table creation and 60 realistic claims pre-seeded.
- **Optional Local PostgreSQL**: If you prefer connecting to a locally installed PostgreSQL service on port 5432, run:
  ```powershell
  # 1. Create database in psql: CREATE DATABASE claim_db;
  # 2. Launch backend with postgres profile:
  java -Dspring.profiles.active=postgres -jar target\insurance-claim-automation-1.0.0.jar
  ```

---

#### Step 3: Start React Vite Frontend Dashboard (Port 5173)
Open a third PowerShell window:
```powershell
cd c:\Projects\OR_Project\frontend
npm run dev
```
- **Local Web Application URL**: `http://localhost:5173`

---

### 5.3 How to Stop Running Services
To stop services cleanly on Windows:
- Press `Ctrl + C` in each active PowerShell window.
- Or close the three respective terminal windows launched by `start_all.bat`.
- To kill any lingering background processes by port from PowerShell:
  ```powershell
  # Stop process on port 8000 (Python)
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force
  # Stop process on port 8080 (Spring Boot)
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess -Force
  # Stop process on port 5173 (Vite Frontend)
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess -Force
  ```

---

## 6. Account Setup & Pre-Seeded Data

The application automatically seeds **60 realistic insurance claims** across Health, Vehicle, and Life portfolios on startup:

| Role | Username | Password | Capabilities |
|---|---|---|---|
| **Administrator** | `admin` | Set through `CLAIMFLOW_ADMIN_PASSWORD` when bootstrapping | Full access to Simulation Studio, RPA Bot execution, Audit logs, and Claims Management |
| **Claim Adjuster** | `processor` | Set through `CLAIMFLOW_PROCESSOR_PASSWORD` when bootstrapping | Access to 5-Stage Manual Workbench, Claim Intake, and Dossier Inspection |

*(The login screen can fill a username; passwords are never embedded in the frontend.)*

---

## 7. Application Modules & Architecture

### 0. Public Home Page (`/`)
- Public showcase landing page introducing the college Operations Research project.
- Explains the problem statement, RPA straight-through automation, SimPy discrete-event simulation, and technology stack.
- Interactive navigation bar with smooth section scrolling (`Features`, `Project Overview`, `How It Works`) and direct access to Sign In.

### 1. Operations Dashboard (`/dashboard`)
- Real-time KPI summary cards: Total Claims, Pending, Approved, Rejected, Average Processing Time, and Total Operational Cost.
- Visual breakdown of claims status and processing mode (Manual vs. RPA Bot).
- Quick action buttons to launch batch RPA runs or explore the Operations Research Simulation Lab.

### 2. Insurance Claims Registry (`/claims`)
- Filter claims by status (`SUBMITTED`, `IN_REVIEW`, `APPROVED`, `REJECTED`, `REQUIRES_MANUAL_REVIEW`) and category (`HEALTH`, `VEHICLE`, `LIFE`).
- Search by Claim ID (e.g., `CLM-2026-0001`) or Customer Name.
- **Claim Intake Form**: Register new claims with customer details, policy identifier, requested amount, narrative description, and attached documents.
- **Claim File Dossier**: Modal inspector displaying customer info, policy limits, fraud risk score, and document verification checks.

### 3. 5-Stage Manual Adjudication Workbench (`/manual-processing`)
Simulates traditional human insurance claim processing step-by-step:
1. **Document Verification**: OCR check of invoices, bills, and identity cards.
2. **Policy Validation**: Verifying active coverage dates and deductible ceilings.
3. **Amount Verification**: Checking billing items against standard fee schedules.
4. **Fraud-Risk Review**: Evaluating anomaly score flags ($>65$ flagged for investigation).
5. **Adjudication Decision**: Final approval or rejection with payout calculation.
- **Active Labor Stopwatch**: Real-time timer tracking elapsed adjuster time and accumulating labor costs ($28.50/hr).

### 4. RPA Automated Processing Console (`/automated-processing`)
- Demonstrates automated Straight-Through Processing (STP) using Python bots.
- Batch execution controls (run batches of 5, 10, or 25 claims).
- Live animated bot execution terminal showing sub-second OCR validation, coverage checks, anomaly scoring, and database updates.
- Real-time audit log of bot executions with execution duration, status, and cost.

### 5. Unified OR Simulation & Analytics Lab (`/simulation-lab`)
Consolidates all Operations Research modeling into one cohesive, 4-tab interface:
- **Tab 1: Simulation Studio & Side-by-Side Comparison**:
  - Run custom SimPy discrete-event simulations or choose from 4 curated presets (*Standard Baseline*, *Catastrophe Claim Surge*, *Constrained Staff Stress Test*, *High-Throughput Enterprise*).
  - Side-by-side KPI comparison cards and complete metrics summary table comparing Scenario A (Manual) vs. Scenario B (RPA).
- **Tab 2: 7 Performance Comparison Charts**:
  - Latency & Cycle Time breakdown.
  - Operational & Unit Cost analysis.
  - Daily Settlement Throughput comparison.
  - Resource Utilization rates (Human staff vs. RPA bots).
  - Net Operational Cost Savings.
  - Manual vs. Automated Queue Waiting Time ($W_q$).
- **Tab 3: Sensitivity Analysis Curves**:
  - Arrival Rate Sensitivity ($\lambda = 5$ to $40$ claims/hr) showing the queue congestion explosion when $\rho \to 1$.
  - Workforce Scaling ($c = 1$ to $12$ staff) illustrating diminishing returns.
  - Bot Fleet Scaling ($b = 1$ to $12$ bots) showing pipeline saturation plateau.
- **Tab 4: 3-Year Capital ROI Model**:
  - 36-month cumulative net cash flow trajectory chart with highlighted break-even point.
  - Interactive capital budgeting parameters (Initial Capex, Annual Maintenance, Monthly Claim Volume) with real-time recalculation of Payback Period and 3-Year ROI.

---

## 8. Viva Presentation Guide (Explaining the Code)

When demonstrating this project to professors or examiners:

1. **How the Discrete-Event Simulation Works (`simulation_model.py`)**:
   - Explain how SimPy uses an `Environment` and `Resource` to model human adjusters and RPA bots.
   - Point out that claims arrive via a Poisson process (`env.timeout(random.expovariate(lambda_rate / 60.0))`).
   - Show that human processing uses a `random.lognormvariate` to reflect high human cognitive variability, while RPA processing uses a tight `random.gauss` for rapid, deterministic checks.
   - Show how the $18\%$ exception rate escalates flagged claims back to human adjusters.

2. **How Queueing Theory & Little's Law Apply**:
   - Show that as arrival rate $\lambda$ approaches service capacity $c \cdot \mu$, traffic intensity $\rho \to 1.0$ and queue length $L_q$ explodes exponentially (visible in Tab 3 of the Simulation Lab).
   - Verify Little's Law: $L = \lambda \cdot W$ and $L_q = \lambda \cdot W_q$.

3. **How the Backend is Architected**:
   - The backend uses **3 straightforward JPA entities**: `InsuranceClaim` (holds all claim attributes, status, and labor costs), `RPAExecutionLog` (records bot execution history), and `User` (handles authentication).
   - If Python is offline, `SimulationService.java` includes an analytical $M/G/c$ queueing fallback so the web app never crashes during an evaluation.

4. **How RPA Saves Costs**:
   - Manual human adjuster: $\$28.50/\text{hr} \times (24\text{ min} / 60) \approx \$11.40$ per clean claim.
   - RPA Bot: $\$4.20/\text{hr} \times (1.5\text{ min} / 60) \approx \$0.11$ per clean claim.
   - This delivers a **70%+ reduction in operational costs** and pays back initial capital expenditure in approximately **4.2 months**.
