"""
Operations Research Sensitivity Analysis Experiments
Experiment 1: Increasing Claim Arrival Rate (lambda)
Experiment 2: Scaling Human Workforce (Employees)
Experiment 3: Scaling RPA Bot Capacity (Bots)
"""

from typing import Dict, Any, List
from simulation_model import run_full_simulation


def run_all_experiments() -> Dict[str, Any]:
    return {
        "experiment1_arrivalRate": run_experiment_arrival_rate(),
        "experiment2_employeeScaling": run_experiment_employee_scaling(),
        "experiment3_botScaling": run_experiment_bot_scaling()
    }


def run_experiment_arrival_rate() -> List[Dict[str, Any]]:
    """Experiment 1: Scaling Arrival Rate Lambda from 5 to 40 claims/hour."""
    lambdas = [5.0, 10.0, 15.0, 20.0, 25.0, 30.0, 35.0, 40.0]
    results = []

    for lam in lambdas:
        sim = run_full_simulation(
            arrival_rate=lam,
            num_claims=int(lam * 20),
            duration_hours=20.0,
            num_employees=4,
            num_bots=3,
            random_seed=int(lam * 10)
        )
        man = sim["scenarioA_manual"]
        aut = sim["scenarioB_automated"]

        results.append({
            "arrivalRate": lam,
            "manualWaitTime": man["avgWaitingTimeMinutes"],
            "automatedWaitTime": aut["avgWaitingTimeMinutes"],
            "manualUtilization": man["resourceUtilizationPercent"],
            "automatedUtilization": aut["rpaUtilizationPercent"],
            "manualCost": man["totalOperationalCost"],
            "automatedCost": aut["totalOperationalCost"]
        })

    return results


def run_experiment_employee_scaling() -> List[Dict[str, Any]]:
    """Experiment 2: Scaling Human Workforce from 1 to 12 employees."""
    employee_counts = [1, 2, 4, 6, 8, 10, 12]
    results = []

    for emp in employee_counts:
        sim = run_full_simulation(
            num_employees=emp,
            num_claims=200,
            arrival_rate=12.0,
            duration_hours=25.0,
            num_bots=3,
            random_seed=emp * 11
        )
        man = sim["scenarioA_manual"]

        results.append({
            "employeeCount": emp,
            "manualWaitTime": man["avgWaitingTimeMinutes"],
            "manualCycleTime": man["avgTotalCycleTimeMinutes"],
            "manualUtilization": man["resourceUtilizationPercent"],
            "manualTotalCost": man["totalOperationalCost"],
            "costPerClaim": man["costPerClaim"]
        })

    return results


def run_experiment_bot_scaling() -> List[Dict[str, Any]]:
    """Experiment 3: Scaling RPA Bot Capacity from 1 to 12 bots."""
    bot_counts = [1, 2, 3, 4, 6, 8, 12]
    results = []

    for b in bot_counts:
        sim = run_full_simulation(
            num_bots=b,
            num_claims=300,
            arrival_rate=16.0,
            duration_hours=25.0,
            num_employees=4,
            random_seed=b * 13
        )
        aut = sim["scenarioB_automated"]
        comp = sim["comparison"]

        results.append({
            "botCount": b,
            "botWaitTime": aut["avgWaitingTimeMinutes"],
            "botCycleTime": aut["avgTotalCycleTimeMinutes"],
            "botUtilization": aut["rpaUtilizationPercent"],
            "automatedTotalCost": aut["totalOperationalCost"],
            "costSavingsPercent": comp["costReductionPercent"]
        })

    return results


if __name__ == "__main__":
    exp = run_all_experiments()
    print("Sensitivity Experiments completed:")
    for k, v in exp.items():
        print(f"  {k}: {len(v)} evaluation points")
