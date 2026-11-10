"""
Operations Research Simulation Chart Generator
Produces presentation-ready comparison and sensitivity analysis charts using Matplotlib and Pandas.
"""

import os
# Configure writable cache before matplotlib import
os.environ['MPLCONFIGDIR'] = os.path.join(os.path.dirname(__file__), ".mplcache")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from simulation_model import ClaimSimulationEngine
from experiments import run_all_experiments

# Output directory for charts
CHARTS_DIR = os.path.join(os.path.dirname(__file__), "charts")
os.makedirs(CHARTS_DIR, exist_ok=True)

# Styling configuration
plt.style.use('ggplot')
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['font.size'] = 10
plt.rcParams['figure.dpi'] = 150


def generate_time_comparison(sim_result: dict):
    """Bar chart comparing processing time, wait time, and total cycle time."""
    manual = sim_result["scenarioA_manual"]
    auto = sim_result["scenarioB_automated"]

    categories = ['Service Time', 'Queue Wait Time', 'Total Cycle Time']
    manual_times = [
        manual['avgProcessingTimeMinutes'],
        manual['avgWaitingTimeMinutes'],
        manual['avgProcessingTimeMinutes'] + manual['avgWaitingTimeMinutes']
    ]
    auto_times = [
        auto['avgProcessingTimeMinutes'],
        auto['avgWaitingTimeMinutes'],
        auto['avgProcessingTimeMinutes'] + auto['avgWaitingTimeMinutes']
    ]

    x = np.arange(len(categories))
    width = 0.35

    fig, ax = plt.subplots(figsize=(9, 5))
    rects1 = ax.bar(x - width/2, manual_times, width, label='Scenario A: Manual Processing', color='#dc2626', alpha=0.85)
    rects2 = ax.bar(x + width/2, auto_times, width, label='Scenario B: RPA Automated', color='#2563eb', alpha=0.85)

    ax.set_ylabel('Duration (Minutes)', fontsize=11, fontweight='bold')
    ax.set_title('Claim Processing Time Comparison: Manual vs. RPA Pipeline', fontsize=13, fontweight='bold', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(categories, fontsize=10, fontweight='bold')
    ax.legend(loc='upper right', frameon=True)

    # Value labels on bars
    for rect in rects1:
        h = rect.get_height()
        ax.annotate(f'{h:.1f}m', xy=(rect.get_x() + rect.get_width() / 2, h),
                    xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=9)
    for rect in rects2:
        h = rect.get_height()
        ax.annotate(f'{h:.1f}m', xy=(rect.get_x() + rect.get_width() / 2, h),
                    xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=9)

    plt.tight_layout()
    output_path = os.path.join(CHARTS_DIR, "manual_vs_auto_time.png")
    plt.savefig(output_path)
    plt.close()
    print(f"[Chart Generated] {output_path}")


def generate_cost_comparison(sim_result: dict):
    """Comparison of total operational costs and cost per claim."""
    manual = sim_result["scenarioA_manual"]
    auto = sim_result["scenarioB_automated"]
    comp = sim_result["comparison"]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 5))

    # Subplot 1: Total Operational Cost
    scenarios = ['Manual', 'RPA Automated']
    total_costs = [manual['totalOperationalCost'], auto['totalOperationalCost']]
    colors = ['#ef4444', '#10b981']

    bars1 = ax1.bar(scenarios, total_costs, color=colors, width=0.5, alpha=0.85)
    ax1.set_ylabel('Total Operational Cost ($)', fontsize=11, fontweight='bold')
    ax1.set_title('Total Operational Cost per Simulation Run', fontsize=12, fontweight='bold')
    for b in bars1:
        h = b.get_height()
        ax1.annotate(f'${h:,.2f}', xy=(b.get_x() + b.get_width() / 2, h),
                     xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=10, fontweight='bold')

    # Subplot 2: Cost Per Claim
    unit_costs = [manual['costPerClaim'], auto['costPerClaim']]
    bars2 = ax2.bar(scenarios, unit_costs, color=['#f59e0b', '#06b6d4'], width=0.5, alpha=0.85)
    ax2.set_ylabel('Cost per Processed Claim ($)', fontsize=11, fontweight='bold')
    ax2.set_title(f'Unit Cost per Claim (-{comp["costReductionPercent"]:.1f}% reduction)', fontsize=12, fontweight='bold')
    for b in bars2:
        h = b.get_height()
        ax2.annotate(f'${h:.2f}', xy=(b.get_x() + b.get_width() / 2, h),
                     xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=10, fontweight='bold')

    plt.tight_layout()
    output_path = os.path.join(CHARTS_DIR, "cost_comparison.png")
    plt.savefig(output_path)
    plt.close()
    print(f"[Chart Generated] {output_path}")


def generate_sensitivity_arrival_chart(exp_arrival: list):
    """Line chart showing queue wait time and costs as arrival rate lambda scales."""
    df = pd.DataFrame(exp_arrival)

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

    # Subplot 1: Wait Time vs Lambda
    ax1.plot(df['arrivalRate'], df['manualWaitTime'], 'o-', color='#dc2626', linewidth=2.5, label='Manual (4 Humans)')
    ax1.plot(df['arrivalRate'], df['automatedWaitTime'], 's-', color='#2563eb', linewidth=2.5, label='RPA (3 Bots + 4 Humans)')
    ax1.set_xlabel('Arrival Rate (λ Claims / Hour)', fontsize=11, fontweight='bold')
    ax1.set_ylabel('Average Wait Time (Minutes)', fontsize=11, fontweight='bold')
    ax1.set_title('Queue Congestion vs. Arrival Rate (M/G/c Model)', fontsize=12, fontweight='bold')
    ax1.legend(loc='upper left')
    ax1.grid(True, linestyle='--', alpha=0.6)

    # Subplot 2: Operational Cost vs Lambda
    ax2.plot(df['arrivalRate'], df['manualCost'], 'o-', color='#dc2626', linewidth=2.5, label='Manual Cost')
    ax2.plot(df['arrivalRate'], df['automatedCost'], 's-', color='#059669', linewidth=2.5, label='RPA Pipeline Cost')
    ax2.set_xlabel('Arrival Rate (λ Claims / Hour)', fontsize=11, fontweight='bold')
    ax2.set_ylabel('Total Operational Cost ($)', fontsize=11, fontweight='bold')
    ax2.set_title('Cost Scaling vs. Arrival Demand Volume', fontsize=12, fontweight='bold')
    ax2.legend(loc='upper left')
    ax2.grid(True, linestyle='--', alpha=0.6)

    plt.tight_layout()
    output_path = os.path.join(CHARTS_DIR, "sensitivity_arrival.png")
    plt.savefig(output_path)
    plt.close()
    print(f"[Chart Generated] {output_path}")


def generate_workforce_scaling_chart(exp_employees: list):
    """Line chart showing impact of scaling human staff."""
    df = pd.DataFrame(exp_employees)

    fig, ax1 = plt.subplots(figsize=(9, 5))
    ax2 = ax1.twinx()

    p1 = ax1.plot(df['employeeCount'], df['manualWaitTime'], 'o-', color='#dc2626', linewidth=2.5, label='Manual Wait Time (min)')
    p2 = ax2.plot(df['employeeCount'], df['manualUtilization'], 's--', color='#7c3aed', linewidth=2.0, label='Human Staff Utilization (%)')

    ax1.set_xlabel('Human Employee Count (Servers c)', fontsize=11, fontweight='bold')
    ax1.set_ylabel('Average Wait Time (Minutes)', color='#dc2626', fontsize=11, fontweight='bold')
    ax2.set_ylabel('Workforce Utilization (%)', color='#7c3aed', fontsize=11, fontweight='bold')
    ax1.set_title('Workforce Scaling Sensitivity: Diminishing Returns & Queue Decay', fontsize=12, fontweight='bold')

    plots = p1 + p2
    labels = [l.get_label() for l in plots]
    ax1.legend(plots, labels, loc='upper right')

    plt.tight_layout()
    output_path = os.path.join(CHARTS_DIR, "workforce_scaling.png")
    plt.savefig(output_path)
    plt.close()
    print(f"[Chart Generated] {output_path}")


def generate_bot_scaling_chart(exp_bots: list):
    """Line chart showing scaling RPA bots."""
    df = pd.DataFrame(exp_bots)

    fig, ax = plt.subplots(figsize=(9, 5))
    ax.plot(df['botCount'], df['botWaitTime'], 'o-', color='#2563eb', linewidth=2.5, label='RPA Queue Wait Time (min)')
    ax.plot(df['botCount'], df['costSavingsPercent'], '^-', color='#059669', linewidth=2.0, label='Cost Savings vs Manual (%)')

    ax.set_xlabel('RPA Bot Fleet Size (Parallel Worker Threads)', fontsize=11, fontweight='bold')
    ax.set_ylabel('Metrics (Time in Min / Savings %)', fontsize=11, fontweight='bold')
    ax.set_title('RPA Bot Scaling: Pipeline Saturation and Latency Minimization', fontsize=12, fontweight='bold')
    ax.legend(loc='center right')
    ax.grid(True, linestyle='--', alpha=0.6)

    plt.tight_layout()
    output_path = os.path.join(CHARTS_DIR, "bot_scaling.png")
    plt.savefig(output_path)
    plt.close()
    print(f"[Chart Generated] {output_path}")


def generate_roi_projection_chart(sim_result: dict):
    """Multi-year cumulative net savings projection and payback period."""
    roi = sim_result["roi"]
    annual_savings = roi["annualSavings"]
    initial_investment = roi["initialInvestment"]
    annual_maintenance = initial_investment * 0.15

    months = np.arange(0, 37)
    monthly_savings = annual_savings / 12.0
    monthly_maint = annual_maintenance / 12.0

    cumulative_cash_flow = [-initial_investment + (monthly_savings - monthly_maint) * m for m in months]

    fig, ax = plt.subplots(figsize=(9, 5))
    ax.plot(months, cumulative_cash_flow, linewidth=2.5, color='#16a34a', label='Net Cumulative Cash Flow ($)')
    ax.axhline(0, color='black', linestyle='--', linewidth=1.2, label='Break-Even Point ($0)')

    payback_months = roi["estimatedPaybackPeriodMonths"]
    ax.axvline(payback_months, color='#dc2626', linestyle=':', linewidth=1.5,
               label=f'Payback Milestone ({payback_months:.1f} Months)')
    ax.scatter([payback_months], [0], color='#dc2626', s=80, zorder=5)

    ax.set_xlabel('Months Post-RPA Deployment', fontsize=11, fontweight='bold')
    ax.set_ylabel('Cumulative Net Financial Benefit ($)', fontsize=11, fontweight='bold')
    ax.set_title(f'36-Month Capital Budgeting & ROI Trajectory (3-Year ROI: {roi["threeYearRoiPercent"]:.1f}%)',
                 fontsize=12, fontweight='bold')
    ax.legend(loc='lower right')
    ax.grid(True, linestyle='--', alpha=0.6)

    plt.tight_layout()
    output_path = os.path.join(CHARTS_DIR, "roi_curve.png")
    plt.savefig(output_path)
    plt.close()
    print(f"[Chart Generated] {output_path}")


def main():
    print("================================================================================")
    print("   OPERATIONS RESEARCH SIMULATION: GENERATING CHARTS & SENSITIVITY PLOTS")
    print("================================================================================")

    # 1. Run baseline simulation
    print("-> Running baseline discrete-event simulation model...")
    engine = ClaimSimulationEngine(num_claims=250, duration_hours=40.0, num_employees=4, num_bots=3)
    sim_result = engine.run()

    # 2. Run sensitivity experiments
    print("-> Running sensitivity analysis experiments (Arrival Rate, Staff, Bots)...")
    experiments = run_all_experiments()

    # 3. Generate charts
    print("-> Rendering presentation charts...")
    generate_time_comparison(sim_result)
    generate_cost_comparison(sim_result)
    generate_sensitivity_arrival_chart(experiments["experiment1_arrivalRate"])
    generate_workforce_scaling_chart(experiments["experiment2_employeeScaling"])
    generate_bot_scaling_chart(experiments["experiment3_botScaling"])
    generate_roi_projection_chart(sim_result)

    print("\n================================================================================")
    print("   ALL 6 OPERATIONS RESEARCH SIMULATION CHARTS GENERATED IN:")
    print(f"   {CHARTS_DIR}")
    print("================================================================================")


if __name__ == "__main__":
    main()
