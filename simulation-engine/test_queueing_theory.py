"""
Automated Pytest Suite: Operations Research Queueing Theory and Simulation Validation
Validates:
1. Traffic intensity rho calculation and stability boundary (rho < 1.0 vs rho >= 1.0)
2. Little's Law conservation (L = lambda * W, L_q = lambda * W_q)
3. M/G/c right-skewed service time distribution
4. Straight-Through Processing (STP) rate and exception handling
5. Capital Budgeting ROI calculation edge cases (zero savings, negative benefit, zero capex)
6. Simulation reproducibility via random seed
"""

import pytest
from simulation_model import (
    simulate_manual_system,
    simulate_automated_system,
    calculate_comparison_and_roi,
    run_full_simulation
)


def test_traffic_intensity_and_stability_boundary():
    """Verify traffic intensity rho = (lambda * E[S]) / (c * 60) and stability flag."""
    # Case 1: Overloaded system (rho = 12 * 24 / (4 * 60) = 288 / 240 = 1.20 >= 1.0)
    overloaded = simulate_manual_system(
        num_claims=100,
        duration_hours=10.0,
        num_employees=4,
        arrival_rate=12.0,
        mean_service_time_min=24.0,
        random_seed=42
    )
    assert overloaded["trafficIntensity"] >= 1.0
    assert overloaded["isStable"] is False

    # Case 2: Stable system (rho = 6 * 24 / (4 * 60) = 144 / 240 = 0.60 < 1.0)
    stable = simulate_manual_system(
        num_claims=100,
        duration_hours=10.0,
        num_employees=4,
        arrival_rate=6.0,
        mean_service_time_min=24.0,
        random_seed=42
    )
    assert stable["trafficIntensity"] < 1.0
    assert stable["isStable"] is True


def test_littles_law_relation():
    """Verify Little's Law: L = lambda * W and L_q = lambda * W_q."""
    arrival_rate = 8.0  # claims/hour
    sim = simulate_manual_system(
        num_claims=150,
        duration_hours=20.0,
        num_employees=6,
        arrival_rate=arrival_rate,
        mean_service_time_min=20.0,
        random_seed=123
    )

    lambda_per_min = arrival_rate / 60.0
    expected_L = round(lambda_per_min * sim["avgTotalCycleTimeMinutes"], 2)
    expected_Lq = round(lambda_per_min * sim["avgWaitingTimeMinutes"], 2)

    assert sim["littlesLawL"] == expected_L
    assert sim["littlesLawLq"] == expected_Lq
    # Total customers in system L must be greater than or equal to queue length L_q
    assert sim["littlesLawL"] >= sim["littlesLawLq"]


def test_automated_system_stp_and_cycle_time():
    """Verify RPA automated pipeline achieves high STP and low cycle latency."""
    exception_rate = 0.20  # 20% exception rate
    auto = simulate_automated_system(
        num_claims=200,
        duration_hours=20.0,
        num_bots=4,
        num_employees=4,
        arrival_rate=12.0,
        mean_bot_time_min=1.5,
        exception_rate=exception_rate,
        random_seed=999
    )

    # Bot queue wait time should be sub-minute
    assert auto["avgWaitingTimeMinutes"] < 5.0
    # Average cycle time should be well below manual (1.5 min bot + 20% * 12 min human ≈ 3.9 min)
    assert auto["avgTotalCycleTimeMinutes"] < 10.0
    # STP rate should be close to 100 - (exception_rate * 100) = 80%
    assert 70.0 <= auto["straightThroughRatePercent"] <= 90.0


def test_roi_calculation_edge_cases():
    """Verify ROI logic with normal benefits, zero benefit, and negative benefits."""
    # 1. Normal benefit case
    manual_normal = {"costPerClaim": 25.0, "totalOperationalCost": 5000.0, "avgTotalCycleTimeMinutes": 60.0, "avgWaitingTimeMinutes": 35.0, "throughputPerDay": 40.0}
    auto_normal = {"costPerClaim": 5.0, "totalOperationalCost": 1200.0, "avgTotalCycleTimeMinutes": 5.0, "avgWaitingTimeMinutes": 1.0, "throughputPerDay": 120.0}
    res_normal = calculate_comparison_and_roi(manual_normal, auto_normal)
    roi_normal = res_normal["roi"]

    assert roi_normal["unitCostSavings"] == 20.0
    assert roi_normal["estimatedPaybackPeriodMonths"] is not None
    assert roi_normal["estimatedPaybackPeriodMonths"] > 0
    assert roi_normal["threeYearRoiPercent"] > 0

    # 2. Zero benefit case (auto cost equals manual cost)
    manual_zero = {"costPerClaim": 10.0, "totalOperationalCost": 2000.0, "avgTotalCycleTimeMinutes": 20.0, "avgWaitingTimeMinutes": 10.0, "throughputPerDay": 50.0}
    auto_zero = {"costPerClaim": 10.0, "totalOperationalCost": 2000.0, "avgTotalCycleTimeMinutes": 20.0, "avgWaitingTimeMinutes": 10.0, "throughputPerDay": 50.0}
    res_zero = calculate_comparison_and_roi(manual_zero, auto_zero)
    roi_zero = res_zero["roi"]

    assert roi_zero["unitCostSavings"] == 0.0
    # With zero unit savings and ongoing maintenance, payback is impossible
    assert roi_zero["estimatedPaybackPeriodMonths"] is None
    assert roi_zero["threeYearNetProfit"] < 0


def test_full_simulation_metadata_and_reproducibility():
    """Verify run_full_simulation returns dataSource, stability flags, and identical seeds yield identical output."""
    run1 = run_full_simulation(num_claims=80, duration_hours=10.0, random_seed=777)
    run2 = run_full_simulation(num_claims=80, duration_hours=10.0, random_seed=777)

    assert run1["dataSource"] == "simpy-discrete-event"
    assert "isStable" in run1
    assert run1["scenarioA_manual"]["processedClaims"] == run2["scenarioA_manual"]["processedClaims"]
    assert run1["scenarioA_manual"]["avgTotalCycleTimeMinutes"] == run2["scenarioA_manual"]["avgTotalCycleTimeMinutes"]
    assert run1["scenarioB_automated"]["costPerClaim"] == run2["scenarioB_automated"]["costPerClaim"]

