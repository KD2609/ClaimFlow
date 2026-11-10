"""
FastAPI Server for SimPy Operations Research Discrete-Event Simulation Engine
Listens on port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import uvicorn

from simulation_model import run_full_simulation
from experiments import run_all_experiments

app = FastAPI(
    title="Insurance Claim Operations Research Simulation Service",
    description="Discrete-Event Simulation (SimPy) Engine comparing Manual vs RPA Automated Claim Processing",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimulationInput(BaseModel):
    name: Optional[str] = "OR Simulation Request"
    numClaims: Optional[int] = Field(default=250, ge=10, le=5000)
    durationHours: Optional[float] = Field(default=40.0, ge=1.0, le=500.0)
    numEmployees: Optional[int] = Field(default=4, ge=1, le=50)
    numBots: Optional[int] = Field(default=3, ge=1, le=50)
    arrivalRate: Optional[float] = Field(default=12.0, ge=0.5, le=100.0)
    employeeHourlyRate: Optional[float] = Field(default=28.50, ge=5.0)
    botHourlyRate: Optional[float] = Field(default=4.20, ge=0.1)
    exceptionRate: Optional[float] = Field(default=0.18, ge=0.0, le=1.0)
    meanManualTimeMinutes: Optional[float] = Field(default=24.0, ge=1.0)
    meanBotTimeMinutes: Optional[float] = Field(default=1.5, ge=0.1)


@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "engine": "SimPy 4 Discrete-Event Simulation",
        "service": "Insurance Claim Automation OR Lab"
    }


@app.post("/simulate")
def run_simulation_endpoint(data: SimulationInput):
    """Executes discrete-event simulation model and returns comparative KPIs and ROI."""
    results = run_full_simulation(
        num_claims=data.numClaims,
        duration_hours=data.durationHours,
        num_employees=data.numEmployees,
        num_bots=data.numBots,
        arrival_rate=data.arrivalRate,
        employee_hourly_rate=data.employeeHourlyRate,
        bot_hourly_rate=data.botHourlyRate,
        exception_rate=data.exceptionRate,
        mean_manual_time_minutes=data.meanManualTimeMinutes,
        mean_bot_time_minutes=data.meanBotTimeMinutes
    )
    return results


@app.get("/experiments")
def get_experiments_endpoint():
    """Runs and returns all three Operations Research sensitivity experiments."""
    return run_all_experiments()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
