import React, { useState, useEffect } from 'react';
import { simulationApi } from '../services/api';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Calendar,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  ArrowUpRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const RoiAnalysis = () => {
  // Configurable Financial Assumptions
  const [initialInvestment, setInitialInvestment] = useState(15000); // $15,000 setup
  const [annualMaintenance, setAnnualMaintenance] = useState(2500); // $2,500/yr license & upkeep
  const [employeeHourlyCost, setEmployeeHourlyCost] = useState(28.50);
  const [monthlyClaimVolume, setMonthlyClaimVolume] = useState(1000);
  const [manualCostPerClaim, setManualCostPerClaim] = useState(22.80);
  const [automatedCostPerClaim, setAutomatedCostPerClaim] = useState(4.50);

  const [loading, setLoading] = useState(false);

  // Derived financial metrics
  const unitSavings = Math.max(0, manualCostPerClaim - automatedCostPerClaim);
  const grossMonthlySavings = monthlyClaimVolume * unitSavings;
  const netMonthlyCashFlow = grossMonthlySavings - (annualMaintenance / 12.0);
  const annualNetSavings = netMonthlyCashFlow * 12.0;

  const paybackPeriodMonths = netMonthlyCashFlow > 0 ? initialInvestment / netMonthlyCashFlow : 0;
  const threeYearGross = grossMonthlySavings * 36.0;
  const threeYearCost = initialInvestment + (annualMaintenance * 3.0);
  const threeYearNet = threeYearGross - threeYearCost;
  const threeYearRoiPercent = threeYearCost > 0 ? (threeYearNet / initialInvestment) * 100.0 : 0;

  // Generate 36-month cash flow trajectory data for Recharts
  const trajectoryData = [];
  for (let m = 0; m <= 36; m++) {
    const cumulative = -initialInvestment + (netMonthlyCashFlow * m);
    trajectoryData.push({
      month: `M${m}`,
      netCashFlow: Math.round(cumulative),
      breakEven: 0,
    });
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Robotic Process Automation ROI & Financial Valuation Model
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Capital budgeting, discounted payback period analysis, and multi-year operational expenditure savings forecasting.
        </p>
      </div>

      {/* Top 4 Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimated Payback Period</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">
            {paybackPeriodMonths.toFixed(1)} <span className="text-base font-normal text-slate-500">Months</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Capital break-even milestone achieved in Q{Math.ceil(paybackPeriodMonths / 3)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">3-Year Projected ROI</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">
            {threeYearRoiPercent.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            36-month net profit ratio over capital outlay
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Annual Cash Flow</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-purple-600 mt-2">
            ${annualNetSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Recurring annual OPEX reduction
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unit Cost Savings / Claim</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">
            ${unitSavings.toFixed(2)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            ${manualCostPerClaim.toFixed(2)} manual vs ${automatedCostPerClaim.toFixed(2)} RPA
          </p>
        </div>
      </div>

      {/* Main Trajectory Chart */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              36-Month Cumulative Net Cash Flow Trajectory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks negative initial capital outlay through rapid break-even recovery and compounding savings.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Break-Even Milestone: Month {paybackPeriodMonths.toFixed(1)}
          </span>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectoryData} margin={{ top: 15, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" label="Break-Even ($0)" />
              <Line
                type="monotone"
                dataKey="netCashFlow"
                name="Cumulative Net Benefit ($)"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Capital Budgeting Assumptions Slider Studio */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Interactive Financial Sensitivity Sliders</span>
          </h2>
          <span className="text-xs text-slate-400">Real-time dynamic recalculation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Initial Setup & Licensing ($):</span>
              <span className="font-mono text-blue-600">${initialInvestment.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="50000"
              step="1000"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>$5,000</span>
              <span>$25,000</span>
              <span>$50,000</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Monthly Claim Volume:</span>
              <span className="font-mono text-purple-600">{monthlyClaimVolume} claims/mo</span>
            </div>
            <input
              type="range"
              min="200"
              max="5000"
              step="100"
              value={monthlyClaimVolume}
              onChange={(e) => setMonthlyClaimVolume(parseInt(e.target.value, 10))}
              className="w-full accent-purple-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>200 claims</span>
              <span>2,500</span>
              <span>5,000 claims</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Annual Software Maintenance:</span>
              <span className="font-mono text-emerald-600">${annualMaintenance.toLocaleString()}/yr</span>
            </div>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={annualMaintenance}
              onChange={(e) => setAnnualMaintenance(parseFloat(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>$1,000</span>
              <span>$5,000</span>
              <span>$10,000</span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown Summary Table */}
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Financial Summary Table (3-Year Horizon)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Gross 3-Yr Savings</span>
              <p className="text-lg font-bold text-slate-900 mt-1">${threeYearGross.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Total 3-Yr RPA TCO</span>
              <p className="text-lg font-bold text-slate-900 mt-1">${threeYearCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] text-emerald-600 font-semibold uppercase">Cumulative Net Savings</span>
              <p className="text-lg font-bold text-emerald-700 mt-1">${threeYearNet.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-[10px] text-blue-600 font-semibold uppercase">Net ROI Multiple</span>
              <p className="text-lg font-bold text-blue-700 mt-1">{(threeYearGross / Math.max(1, threeYearCost)).toFixed(2)}x</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoiAnalysis;

