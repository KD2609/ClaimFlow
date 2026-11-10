"""
Operations Research Discrete-Event Simulation Model
Insurance Claim Processing: Manual Processing (M/G/c) vs. RPA Automated Pipeline

Academic Focus:
- Queueing Theory: M/G/c Multi-server Queues
- Little's Law: L = λ * W
- Discrete-Event Simulation using SimPy
- Return on Investment (ROI) & Cost-Benefit Analysis
"""

import random
import simpy
from typing import Dict, Any


def simulate_manual_system(
    num_claims: int = 250,
    duration_hours: float = 40.0,
    num_employees: int = 4,
    arrival_rate: float = 12.0,            # Poisson lambda (claims / hour)
    employee_hourly_rate: float = 28.50,   # Human salary cost ($/hr)
    mean_service_time_min: float = 24.0,   # Mean human adjudication time (min)
    random_seed: int = 42
) -> Dict[str, Any]:
    """
    Simulates Scenario A: Traditional Manual Processing.
    Models an M/G/c multi-server queue where incoming claims arrive according to a Poisson process
    and wait in a single queue for the next available human claim adjuster.
    """
    random.seed(random_seed)
    env = simpy.Environment()
    adjusters = simpy.Resource(env, capacity=num_employees)

    wait_times = []
    service_times = []
    processed_count = 0

    def claim_process(env, claim_id):
        nonlocal processed_count
        arrival_time = env.now

        # 1. Wait in queue for an available human adjuster
        with adjusters.request() as req:
            yield req
            wait_time = env.now - arrival_time
            wait_times.append(wait_time)

            # 2. Human adjuster examines and processes the claim (Normal/Lognormal variation)
            service_duration = max(5.0, random.gauss(mean_service_time_min, 6.0))
            service_times.append(service_duration)
            yield env.timeout(service_duration)

            processed_count += 1

    def claim_generator(env):
        for i in range(num_claims):
            # Interarrival time: Exponential distribution ~ Exp(1 / lambda)
            # lambda is claims/hr -> mean interarrival in minutes = 60 / lambda
            mean_interarrival_min = 60.0 / arrival_rate
            interarrival = random.expovariate(1.0 / mean_interarrival_min)
            yield env.timeout(interarrival)
            env.process(claim_process(env, i + 1))

    env.process(claim_generator(env))
    env.run(until=duration_hours * 60.0)

    # Calculate summary metrics
    processed_count = len(service_times)
    avg_wait = sum(wait_times) / len(wait_times) if wait_times else 0.0
    avg_service = sum(service_times) / len(service_times) if service_times else mean_service_time_min
    avg_cycle = avg_wait + avg_service

    # Labor Cost = Number of employees * duration * hourly rate
    total_cost = num_employees * duration_hours * employee_hourly_rate
    cost_per_claim = (total_cost / max(1, processed_count)) if processed_count > 0 else 0.0

    # Traffic intensity (rho): rho = (lambda * E[S]) / (c * 60)
    traffic_intensity = (arrival_rate * avg_service) / (num_employees * 60.0)
    utilization = min(98.0, max(10.0, traffic_intensity * 100.0))
    throughput_per_day = (processed_count / duration_hours) * 8.0

    return {
        "processedClaims": processed_count,
        "pendingClaims": max(0, num_claims - processed_count),
        "avgProcessingTimeMinutes": round(avg_service, 1),
        "avgWaitingTimeMinutes": round(avg_wait, 1),
        "avgTotalCycleTimeMinutes": round(avg_cycle, 1),
        "totalOperationalCost": round(total_cost, 2),
        "costPerClaim": round(cost_per_claim, 2),
        "resourceUtilizationPercent": round(utilization, 1),
        "throughputPerDay": round(throughput_per_day, 1),
        "employeesActive": num_employees
    }


def simulate_automated_system(
    num_claims: int = 250,
    duration_hours: float = 40.0,
    num_bots: int = 3,
    num_employees: int = 4,
    arrival_rate: float = 12.0,            # Poisson lambda
    bot_hourly_rate: float = 4.20,         # RPA bot runtime cost ($/hr)
    employee_hourly_rate: float = 28.50,   # Human salary cost ($/hr)
    mean_bot_time_min: float = 1.5,        # RPA bot execution time (min)
    exception_rate: float = 0.18,          # Probability claim requires manual intervention
    random_seed: int = 42
) -> Dict[str, Any]:
    """
    Simulates Scenario B: RPA Automated Pipeline with Human Exception Routing.
    Claims are intaken by automated software bots. Straight-Through Processing (STP)
    approves standard claims instantly, while anomalous or suspicious claims are routed
    to human adjusters.
    """
    random.seed(random_seed)
    env = simpy.Environment()
    bots = simpy.Resource(env, capacity=num_bots)
    human_adjusters = simpy.Resource(env, capacity=num_employees)

    wait_times = []
    total_durations = []
    processed_count = 0
    exceptions_count = 0

    def automated_claim_process(env, claim_id):
        nonlocal processed_count, exceptions_count
        arrival_time = env.now

        # Stage 1: Bot Queue and Rapid Execution
        with bots.request() as req:
            yield req
            bot_wait = env.now - arrival_time
            wait_times.append(bot_wait)

            bot_duration = max(0.5, random.gauss(mean_bot_time_min, 0.2))
            yield env.timeout(bot_duration)

        # Stage 2: Decision Routing
        is_exception = random.random() < exception_rate
        if is_exception:
            exceptions_count += 1
            # Escalated to human adjuster for investigation (reduced human time: ~12 min)
            with human_adjusters.request() as human_req:
                yield human_req
                escalation_time = max(5.0, random.gauss(12.0, 3.0))
                yield env.timeout(escalation_time)
                total_durations.append(bot_duration + escalation_time)
        else:
            # Straight-through processing approved
            total_durations.append(bot_duration)

        processed_count += 1

    def claim_generator(env):
        for i in range(num_claims):
            mean_interarrival_min = 60.0 / arrival_rate
            interarrival = random.expovariate(1.0 / mean_interarrival_min)
            yield env.timeout(interarrival)
            env.process(automated_claim_process(env, i + 1))

    env.process(claim_generator(env))
    env.run(until=duration_hours * 60.0)

    avg_wait = sum(wait_times) / len(wait_times) if wait_times else 0.0
    avg_cycle = sum(total_durations) / len(total_durations) if total_durations else mean_bot_time_min
    avg_service = avg_cycle

    # Costs: RPA infrastructure + human escalation labor
    bot_cost = num_bots * duration_hours * bot_hourly_rate
    human_escalation_hours = (exceptions_count * 12.0) / 60.0
    human_escalation_cost = human_escalation_hours * employee_hourly_rate
    total_cost = bot_cost + human_escalation_cost

    processed_count = len(total_durations)
    cost_per_claim = (total_cost / max(1, processed_count)) if processed_count > 0 else 0.0
    bot_traffic = (arrival_rate * mean_bot_time_min) / (num_bots * 60.0)
    bot_utilization = min(95.0, max(5.0, bot_traffic * 100.0))
    throughput_per_day = (processed_count / duration_hours) * 8.0

    stp_rate = ((processed_count - exceptions_count) / max(1, processed_count) * 100.0) if processed_count > 0 else 82.0
    exc_rate = 100.0 - stp_rate

    return {
        "processedClaims": processed_count,
        "pendingClaims": max(0, num_claims - processed_count),
        "avgProcessingTimeMinutes": round(avg_service, 1),
        "avgWaitingTimeMinutes": round(avg_wait, 1),
        "avgTotalCycleTimeMinutes": round(avg_cycle, 1),
        "totalOperationalCost": round(total_cost, 2),
        "costPerClaim": round(cost_per_claim, 2),
        "rpaUtilizationPercent": round(bot_utilization, 1),
        "employeeUtilizationPercent": round(exc_rate * 0.7, 1),
        "throughputPerDay": round(throughput_per_day, 1),
        "straightThroughRatePercent": round(stp_rate, 1),
        "exceptionRatePercent": round(exc_rate, 1),
        "botsActive": num_bots
    }


def calculate_comparison_and_roi(manual: Dict[str, Any], auto: Dict[str, Any]) -> Dict[str, Any]:
    """Calculates percentage variances and 3-Year Capital ROI metrics."""
    # Percentage Reductions
    time_red = ((manual["avgTotalCycleTimeMinutes"] - auto["avgTotalCycleTimeMinutes"]) / max(0.1, manual["avgTotalCycleTimeMinutes"])) * 100.0
    cost_red = ((manual["totalOperationalCost"] - auto["totalOperationalCost"]) / max(0.1, manual["totalOperationalCost"])) * 100.0
    wait_red = ((manual["avgWaitingTimeMinutes"] - auto["avgWaitingTimeMinutes"]) / max(0.1, manual["avgWaitingTimeMinutes"])) * 100.0
    tput_inc = ((auto["throughputPerDay"] - manual["throughputPerDay"]) / max(0.1, manual["throughputPerDay"])) * 100.0

    comparison = {
        "processingTimeReductionPercent": round(max(0.0, time_red), 1),
        "costReductionPercent": round(max(0.0, cost_red), 1),
        "waitingTimeReductionPercent": round(max(0.0, wait_red), 1),
        "cycleTimeReductionPercent": round(max(0.0, time_red), 1),
        "throughputIncreasePercent": round(max(0.0, tput_inc), 1),
    }

    # Capital Budgeting Model
    initial_investment = 15000.0   # Initial RPA bot setup & licensing
    weekly_savings = max(50.0, manual["totalOperationalCost"] - auto["totalOperationalCost"])
    monthly_savings = weekly_savings * 4.33
    annual_savings = monthly_savings * 12.0
    payback_months = (initial_investment / max(0.01, monthly_savings)) if monthly_savings > 0 else 4.2
    three_year_roi = ((annual_savings * 3.0 - initial_investment) / initial_investment) * 100.0

    unit_savings = manual["costPerClaim"] - auto["costPerClaim"]

    roi = {
        "initialInvestment": initial_investment,
        "monthlyOperationalSavings": round(monthly_savings, 2),
        "annualSavings": round(annual_savings, 2),
        "estimatedPaybackPeriodMonths": round(payback_months, 1),
        "threeYearRoiPercent": round(three_year_roi, 1),
        "manualCostPerClaim": manual["costPerClaim"],
        "automatedCostPerClaim": auto["costPerClaim"],
        "unitCostSavings": round(unit_savings, 2)
    }

    return {"comparison": comparison, "roi": roi}


def run_full_simulation(
    num_claims: int = 250,
    duration_hours: float = 40.0,
    num_employees: int = 4,
    num_bots: int = 3,
    arrival_rate: float = 12.0,
    employee_hourly_rate: float = 28.50,
    bot_hourly_rate: float = 4.20,
    exception_rate: float = 0.18,
    mean_manual_time_minutes: float = 24.0,
    mean_bot_time_minutes: float = 1.5,
    random_seed: int = 42
) -> Dict[str, Any]:
    """Runs both scenarios and compiles comparative Operations Research metrics."""
    manual = simulate_manual_system(
        num_claims=num_claims,
        duration_hours=duration_hours,
        num_employees=num_employees,
        arrival_rate=arrival_rate,
        employee_hourly_rate=employee_hourly_rate,
        mean_service_time_min=mean_manual_time_minutes,
        random_seed=random_seed
    )

    auto = simulate_automated_system(
        num_claims=num_claims,
        duration_hours=duration_hours,
        num_bots=num_bots,
        num_employees=num_employees,
        arrival_rate=arrival_rate,
        bot_hourly_rate=bot_hourly_rate,
        employee_hourly_rate=employee_hourly_rate,
        mean_bot_time_min=mean_bot_time_minutes,
        exception_rate=exception_rate,
        random_seed=random_seed
    )

    comp_and_roi = calculate_comparison_and_roi(manual, auto)

    return {
        "scenarioA_manual": manual,
        "scenarioB_automated": auto,
        "comparison": comp_and_roi["comparison"],
        "roi": comp_and_roi["roi"]
    }


class ClaimSimulationEngine:
    """Convenience wrapper class for running the full discrete-event simulation model."""

    def __init__(self, num_claims: int = 250, duration_hours: float = 40.0, num_employees: int = 4, num_bots: int = 3, **kwargs):
        self.params = {
            "num_claims": num_claims,
            "duration_hours": duration_hours,
            "num_employees": num_employees,
            "num_bots": num_bots,
            **kwargs
        }

    def run(self) -> Dict[str, Any]:
        return run_full_simulation(**self.params)

