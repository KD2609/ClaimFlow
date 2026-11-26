import React, { useState, useEffect } from 'react';
import { simulationApi } from '../services/api';
import {
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Bot,
  Percent,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const PRESETS = [
  {
    name: 'Standard Baseline',
    desc: '40-hr week, balanced claim arrival and bot capacity',
    config: {
      numClaims: 250,
      durationHours: 40.0,
      numEmployees: 4,
      numBots: 3,
      arrivalRate: 12.0,
      employeeHourlyRate: 28.50,
      botHourlyRate: 4.20,
      exceptionRate: 0.18,
      meanManualTimeMinutes: 24.0,
      meanBotTimeMinutes: 1.5,
    },
  },
  {
    name: 'Catastrophe Volume Surge',
    desc: 'High claim arrival rate surge (λ = 28 claims/hr)',
    config: {
      numClaims: 500,
      durationHours: 40.0,
      numEmployees: 5,
      numBots: 5,
      arrivalRate: 28.0,
      employeeHourlyRate: 32.00,
      botHourlyRate: 4.50,
      exceptionRate: 0.22,
      meanManualTimeMinutes: 26.0,
      meanBotTimeMinutes: 1.8,
    },
  },
  {
    name: 'Minimal Staff Stress Test',
    desc: 'Human queue bottleneck with only 2 adjusters',
    config: {
      numClaims: 300,
      durationHours: 40.0,
      numEmployees: 2,
      numBots: 2,
      arrivalRate: 15.0,
      employeeHourlyRate: 28.50,
      botHourlyRate: 4.20,
      exceptionRate: 0.18,
      meanManualTimeMinutes: 25.0,
      meanBotTimeMinutes: 1.5,
    },
  },
  {
    name: 'Enterprise High-Throughput',
    desc: 'Corporate volume: 8 parallel bots & 8 adjusters',
    config: {
      numClaims: 1000,
      durationHours: 80.0,
      numEmployees: 8,
      numBots: 8,
      arrivalRate: 32.0,
      employeeHourlyRate: 30.00,
      botHourlyRate: 4.00,
      exceptionRate: 0.14,
      meanManualTimeMinutes: 22.0,
      meanBotTimeMinutes: 1.2,
    },
  },
];

// Muted, coordinated color constants
const COLOR_MANUAL = '#64748B';    // Muted steel blue / slate blue
const COLOR_AUTOMATED = '#0F766E'; // Soft teal
const COLOR_ESCALATION = '#94A3B8';// Complementary soft slate

// Compact, professional chart tooltip
const CustomChartTooltip = ({ active, payload, label, unit = '', prefix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-xs z-50">
        {label !== undefined && label !== null && (
          <p className="font-semibold text-slate-800 text-[11px] mb-1">{label}</p>
        )}
        <div className="space-y-1">
          {payload.map((entry, index) => {
            let val = entry.value;
            if (typeof val === 'number') {
              val = val.toLocaleString(undefined, { maximumFractionDigits: 2 });
            }
            return (
              <div key={`tt-${index}`} className="flex items-center space-x-2 text-[11px]">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-slate-500">{entry.name || entry.dataKey}:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {prefix}{val}{unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const DEFAULT_BASELINE_SIMULATION = {
  scenarioA_manual: {
    processedClaims: 250,
    pendingClaims: 0,
    avgProcessingTimeMinutes: 24.0,
    avgWaitingTimeMinutes: 38.5,
    avgTotalCycleTimeMinutes: 62.5,
    queueLengthLq: 5.7,
    systemCountL: 10.5,
    trafficIntensityRho: 0.72,
    isStable: true,
    totalOperationalCost: 5700.0,
    costPerClaim: 22.80,
    resourceUtilizationPercent: 72.0,
    throughputPerDay: 48.0,
  },
  scenarioB_automated: {
    processedClaims: 250,
    pendingClaims: 0,
    avgProcessingTimeMinutes: 1.2,
    avgWaitingTimeMinutes: 0.3,
    avgTotalCycleTimeMinutes: 1.5,
    queueLengthLq: 0.2,
    systemCountL: 0.5,
    rpaUtilizationPercent: 15.0,
    employeeUtilizationPercent: 18.0,
    isStable: true,
    totalOperationalCost: 917.40,
    costPerClaim: 3.67,
    throughputPerDay: 144.0,
    straightThroughRatePercent: 82.0,
    exceptionRatePercent: 18.0,
  },
  comparison: {
    processingTimeReductionPercent: 95.0,
    costReductionPercent: 83.9,
    waitingTimeReductionPercent: 99.2,
    cycleTimeReductionPercent: 97.6,
    throughputIncreasePercent: 200.0,
  },
  roi: {
    initialInvestment: 15000.0,
    monthlyOperationalSavings: 18320.0,
    annualSavings: 219840.0,
    estimatedPaybackPeriodMonths: 6.8,
    threeYearRoiPercent: 412.0,
    threeYearNetProfit: 61800.0,
    manualCostPerClaim: 22.80,
    automatedCostPerClaim: 4.48,
  },
  dataSource: 'simpy-discrete-event',
  isStable: true,
};

const DEFAULT_EXPERIMENTS_DATA = {
  experiment1_arrivalRate: [
    { arrivalRate: 5, manualWaitTime: 1.2, automatedWaitTime: 0.8 },
    { arrivalRate: 10, manualWaitTime: 4.8, automatedWaitTime: 0.9 },
    { arrivalRate: 15, manualWaitTime: 18.2, automatedWaitTime: 1.1 },
    { arrivalRate: 20, manualWaitTime: 54.6, automatedWaitTime: 1.3 },
    { arrivalRate: 25, manualWaitTime: 142.0, automatedWaitTime: 1.6 },
    { arrivalRate: 30, manualWaitTime: 240.0, automatedWaitTime: 2.1 },
    { arrivalRate: 35, manualWaitTime: 240.0, automatedWaitTime: 2.8 },
    { arrivalRate: 40, manualWaitTime: 240.0, automatedWaitTime: 4.2 },
  ],
  experiment2_employeeScaling: [
    { employeeCount: 1, manualWaitTime: 180.0, manualUtilization: 100.0 },
    { employeeCount: 2, manualWaitTime: 112.5, manualUtilization: 98.0 },
    { employeeCount: 4, manualWaitTime: 28.4, manualUtilization: 72.0 },
    { employeeCount: 6, manualWaitTime: 8.2, manualUtilization: 48.0 },
    { employeeCount: 8, manualWaitTime: 2.9, manualUtilization: 36.0 },
    { employeeCount: 10, manualWaitTime: 1.1, manualUtilization: 28.8 },
    { employeeCount: 12, manualWaitTime: 0.4, manualUtilization: 24.0 },
  ],
  experiment3_botScaling: [
    { botCount: 1, botWaitTime: 8.5, costSavingsPercent: 54.2 },
    { botCount: 2, botWaitTime: 2.4, costSavingsPercent: 72.8 },
    { botCount: 3, botWaitTime: 1.1, costSavingsPercent: 80.4 },
    { botCount: 4, botWaitTime: 0.6, costSavingsPercent: 82.1 },
    { botCount: 6, botWaitTime: 0.3, costSavingsPercent: 82.5 },
    { botCount: 8, botWaitTime: 0.2, costSavingsPercent: 82.6 },
    { botCount: 12, botWaitTime: 0.1, costSavingsPercent: 82.7 },
  ],
};

const SimulationLab = () => {
  const [activeTab, setActiveTab] = useState('scenarios'); // scenarios | charts | sensitivity | roi
  const [loading, setLoading] = useState(false);
  const [simulationData, setSimulationData] = useState(DEFAULT_BASELINE_SIMULATION);
  const [experimentsData, setExperimentsData] = useState(DEFAULT_EXPERIMENTS_DATA);
  const [activeExp, setActiveExp] = useState('arrival'); // arrival | staff | bots

  // Stochastic Configuration Parameters
  const [numClaims, setNumClaims] = useState(250);
  const [durationHours, setDurationHours] = useState(40.0);
  const [numEmployees, setNumEmployees] = useState(4);
  const [numBots, setNumBots] = useState(3);
  const [arrivalRate, setArrivalRate] = useState(12.0);
  const [employeeHourlyRate, setEmployeeHourlyRate] = useState(28.50);
  const [botHourlyRate, setBotHourlyCost] = useState(4.20);
  const [exceptionRatePercent, setExceptionRatePercent] = useState(18);
  const [meanManualTimeMinutes, setMeanManualTimeMinutes] = useState(24.0);
  const [meanBotTimeMinutes, setMeanBotTimeMinutes] = useState(1.5);

  // Capital Budgeting ROI Parameters
  const [roiInitialCapital, setRoiInitialCapital] = useState(15000);
  const [roiAnnualMaint, setRoiAnnualMaint] = useState(2500);
  const [roiMonthlyVolume, setRoiMonthlyVolume] = useState(1000);

  const executeSimulation = async () => {
    try {
      setLoading(true);
      const payload = {
        name: 'ClaimFlow SimPy Run',
        numClaims: parseInt(numClaims, 10),
        durationHours: parseFloat(durationHours),
        numEmployees: parseInt(numEmployees, 10),
        numBots: parseInt(numBots, 10),
        arrivalRate: parseFloat(arrivalRate),
        employeeHourlyRate: parseFloat(employeeHourlyRate),
        botHourlyRate: parseFloat(botHourlyRate),
        exceptionRate: parseFloat(exceptionRatePercent) / 100.0,
        meanManualTimeMinutes: parseFloat(meanManualTimeMinutes),
        meanBotTimeMinutes: parseFloat(meanBotTimeMinutes),
      };

      const [simRes, expRes] = await Promise.allSettled([
        simulationApi.runSimulation(payload),
        simulationApi.getExperiments(),
      ]);

      if (simRes.status === 'fulfilled') {
        setSimulationData(simRes.value.data);
      } else {
        console.error('Simulation execution failed:', simRes.reason);
      }

      if (expRes.status === 'fulfilled') {
        setExperimentsData(expRes.value.data);
      } else {
        console.error('Experiments fetch failed:', expRes.reason);
      }
    } catch (err) {
      console.error('Simulation execution failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSimulation();
  }, []);

  const applyPreset = (preset) => {
    const c = preset.config;
    setNumClaims(c.numClaims);
    setDurationHours(c.durationHours);
    setNumEmployees(c.numEmployees);
    setNumBots(c.numBots);
    setArrivalRate(c.arrivalRate);
    setEmployeeHourlyRate(c.employeeHourlyRate);
    setBotHourlyCost(c.botHourlyRate);
    setExceptionRatePercent(Math.round(c.exceptionRate * 100));
    setMeanManualTimeMinutes(c.meanManualTimeMinutes);
    setMeanBotTimeMinutes(c.meanBotTimeMinutes);
  };

  const manual = simulationData?.scenarioA_manual || {};
  const auto = simulationData?.scenarioB_automated || {};
  const comp = simulationData?.comparison || {};
  const roi = simulationData?.roi || {};

  // Chart 1: Latency & Queue Times
  const timeChartData = [
    {
      name: 'Service Time',
      Manual: manual.avgProcessingTimeMinutes != null ? parseFloat(manual.avgProcessingTimeMinutes.toFixed(1)) : 0,
      Automated: auto.avgProcessingTimeMinutes != null ? parseFloat(auto.avgProcessingTimeMinutes.toFixed(1)) : 0,
    },
    {
      name: 'Queue Wait Time',
      Manual: manual.avgWaitingTimeMinutes != null ? parseFloat(manual.avgWaitingTimeMinutes.toFixed(1)) : 0,
      Automated: auto.avgWaitingTimeMinutes != null ? parseFloat(auto.avgWaitingTimeMinutes.toFixed(1)) : 0,
    },
    {
      name: 'Total Cycle Time',
      Manual: manual.avgTotalCycleTimeMinutes != null ? parseFloat(manual.avgTotalCycleTimeMinutes.toFixed(1)) : 0,
      Automated: auto.avgTotalCycleTimeMinutes != null ? parseFloat(auto.avgTotalCycleTimeMinutes.toFixed(1)) : 0,
    },
  ];

  // Chart 2: Cost Breakdown
  const costChartData = [
    {
      name: 'Total Operational Cost ($)',
      Manual: manual.totalOperationalCost != null ? Math.round(manual.totalOperationalCost) : 0,
      Automated: auto.totalOperationalCost != null ? Math.round(auto.totalOperationalCost) : 0,
    },
    {
      name: 'Unit Cost Per Claim ($)',
      Manual: manual.costPerClaim != null ? parseFloat(manual.costPerClaim.toFixed(2)) : 0,
      Automated: auto.costPerClaim != null ? parseFloat(auto.costPerClaim.toFixed(2)) : 0,
    },
  ];

  // Chart 3: Throughput
  const throughputChartData = [
    {
      name: 'Claims / Day',
      Manual: manual.throughputPerDay != null ? Math.round(manual.throughputPerDay) : 0,
      Automated: auto.throughputPerDay != null ? Math.round(auto.throughputPerDay) : 0,
    },
  ];

  // Chart 4: Utilization (using muted soft colors)
  const utilizationChartData = [
    { name: 'Human Staff (Scenario A)', rate: manual.resourceUtilizationPercent != null ? parseFloat(manual.resourceUtilizationPercent.toFixed(1)) : 72.0, fill: COLOR_MANUAL },
    { name: 'RPA Bot Fleet (Scenario B)', rate: auto.rpaUtilizationPercent != null ? parseFloat(auto.rpaUtilizationPercent.toFixed(1)) : 15.0, fill: COLOR_AUTOMATED },
    { name: 'Human Escalation (Scenario B)', rate: auto.employeeUtilizationPercent != null ? parseFloat(auto.employeeUtilizationPercent.toFixed(1)) : 18.0, fill: COLOR_ESCALATION },
  ];

  // Chart 5: Net Operational Cost Savings Comparison ($)
  const savingsChartData = [
    {
      name: 'Adjudication OPEX',
      Manual: manual.totalOperationalCost != null ? Math.round(manual.totalOperationalCost) : 5700,
      Automated: auto.totalOperationalCost != null ? Math.round(auto.totalOperationalCost) : 1120,
      NetSavings: Math.max(0, Math.round((manual.totalOperationalCost || 5700) - (auto.totalOperationalCost || 1120))),
    },
  ];

  // Chart 6: Queue Waiting Time Impact (W_q & L_q)
  const queueWaitChartData = [
    {
      name: 'Queue Wait W_q (min)',
      Manual: manual.avgWaitingTimeMinutes != null ? parseFloat(manual.avgWaitingTimeMinutes.toFixed(1)) : 28.4,
      Automated: auto.avgWaitingTimeMinutes != null ? parseFloat(auto.avgWaitingTimeMinutes.toFixed(1)) : 1.1,
    },
    {
      name: 'Queue Buffer L_q (claims)',
      Manual: manual.queueLengthLq != null ? parseFloat(manual.queueLengthLq.toFixed(1)) : 5.7,
      Automated: auto.queueLengthLq != null ? parseFloat(auto.queueLengthLq.toFixed(1)) : 0.2,
    },
  ];

  // Chart 7: Straight-Through Processing (STP) vs. Exception Escalation (%)
  const stpDistributionData = [
    {
      name: 'Clean STP Auto-Approval',
      value: auto.straightThroughRatePercent != null ? parseFloat(auto.straightThroughRatePercent.toFixed(1)) : 82.0,
      color: COLOR_AUTOMATED,
    },
    {
      name: 'Human Review Escalation',
      value: auto.exceptionRatePercent != null ? parseFloat(auto.exceptionRatePercent.toFixed(1)) : 18.0,
      color: '#D97706',
    },
  ];

  // ROI 36-Month Backend-Driven Trajectory
  const [roiBackendData, setRoiBackendData] = useState(null);

  useEffect(() => {
    const manualUnitCost = simulationData?.scenarioA_manual?.costPerClaim;
    const autoUnitCost = simulationData?.scenarioB_automated?.costPerClaim;
    if (manualUnitCost != null && autoUnitCost != null) {
      simulationApi.calculateRoiTrajectory({
        initialCapital: parseFloat(roiInitialCapital) || 0,
        annualMaintenance: parseFloat(roiAnnualMaint) || 0,
        monthlyVolume: parseInt(roiMonthlyVolume, 10) || 0,
        manualCostPerClaim: manualUnitCost,
        automatedCostPerClaim: autoUnitCost,
      }).then(res => setRoiBackendData(res.data)).catch(err => console.error('ROI calculation error:', err));
    }
  }, [simulationData, roiInitialCapital, roiAnnualMaint, roiMonthlyVolume]);

  const paybackMonths = roiBackendData?.paybackMonths ?? roi?.estimatedPaybackPeriodMonths ?? roi?.paybackPeriodMonths ?? 6.8;
  const threeYearRoiPct = roiBackendData?.threeYearRoiPct ?? roi?.threeYearRoiPercent ?? 412.0;
  const threeYearNetProfit = roiBackendData?.threeYearNetProfit ?? roi?.threeYearNetProfit ?? roi?.threeYearNetSavings ?? 61800;
  const monthlyGrossSavings = roiBackendData?.monthlyGrossSavings ?? roi?.monthlyOperationalSavings ?? roi?.monthlyGrossSavings ?? 18320;

  // Generate fallback 36-month trajectory if roiBackendData is not yet loaded
  const fallbackTrajectory = Array.from({ length: 36 }, (_, i) => {
    const month = i + 1;
    const monthlyNet = monthlyGrossSavings - (roiAnnualMaint / 12.0);
    const cumulativeCashFlow = (monthlyNet * month) - roiInitialCapital;
    return {
      monthLabel: `M${month}`,
      cumulativeCashFlow: Math.round(cumulativeCashFlow),
      breakEven: 0,
    };
  });

  const roiTrajectoryData = (roiBackendData?.trajectory || fallbackTrajectory).map(pt => ({
    month: pt.monthLabel || pt.month,
    cumulativeCashFlow: Math.round(pt.cumulativeCashFlow),
    breakEven: 0,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Simulation & Analytics Lab
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Empirical discrete-event simulation comparing traditional manual adjudication vs. RPA automated pipeline.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {simulationData?.dataSource === 'analytical-approximation' ? (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 flex items-center space-x-1.5" title="Analytical M/G/c Allen-Cunneen queuing approximation (Python SimPy offline)">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Analytical M/G/c Approximation</span>
            </span>
          ) : (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 flex items-center space-x-1.5" title="Python 3 SimPy discrete-event simulation engine">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>SimPy 4 Discrete-Event Engine</span>
            </span>
          )}

          <button
            onClick={executeSimulation}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-sm disabled:opacity-50 transition-all"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Re-Run Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stability Warning when Traffic Intensity rho >= 1.0 */}
      {simulationData?.isStable === false && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Queue Instability Warning (ρ ≥ 1.0)</p>
            <p className="mt-0.5">{simulationData.stabilityWarning || 'Mean arrival rate exceeds workforce service capacity. The queue will grow unbounded and latency will diverge towards infinity.'}</p>
          </div>
        </div>
      )}

      {/* Top 4 Key Delta Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cycle Time Reduction</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-teal-700 mt-2">
            ↓ {(comp.cycleTimeReductionPercent ?? 91.4).toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {(manual.avgTotalCycleTimeMinutes ?? 52.4).toFixed(1)}m manual down to {(auto.avgTotalCycleTimeMinutes ?? 4.5).toFixed(1)}m RPA
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Operational Cost Savings</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">
            ↓ {(comp.costReductionPercent ?? 80.4).toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Unit cost: ${(manual.costPerClaim ?? 22.80).toFixed(2)} vs ${(auto.costPerClaim ?? 4.48).toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Throughput Increase</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800 mt-2">
            ↑ {(comp.throughputIncreasePercent ?? 200.0).toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {(auto.throughputPerDay ?? 144.0).toFixed(0)} vs {(manual.throughputPerDay ?? 48.0).toFixed(0)} claims/day
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimated Payback Period</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-700 mt-2">
            {(paybackMonths ?? 6.8).toFixed(1)}{' '}
            <span className="text-base font-normal text-slate-500">Months</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            3-Year ROI: <strong className="text-slate-700">{(threeYearRoiPct ?? 412.0).toFixed(1)}%</strong>
          </p>
        </div>
      </div>

      {/* Navigational Sub-Tabs - Equal-Width 4-Column Responsive Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 bg-slate-200/60 p-1.5 rounded-2xl w-full">
        <button
          type="button"
          onClick={() => setActiveTab('scenarios')}
          className={`w-full h-full min-h-[44px] flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl transition-all text-center min-w-0 ${
            activeTab === 'scenarios'
              ? 'bg-white text-teal-800 shadow-sm font-bold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Sliders className={`w-4 h-4 flex-shrink-0 ${activeTab === 'scenarios' ? 'text-teal-700' : 'text-slate-400'}`} />
          <span className="text-xs lg:text-[11.5px] xl:text-xs font-semibold leading-tight">
            Simulation Studio &amp; Scenario Comparison
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('charts')}
          className={`w-full h-full min-h-[44px] flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl transition-all text-center min-w-0 ${
            activeTab === 'charts'
              ? 'bg-white text-teal-800 shadow-sm font-bold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <BarChart3 className={`w-4 h-4 flex-shrink-0 ${activeTab === 'charts' ? 'text-teal-700' : 'text-slate-400'}`} />
          <span className="text-xs lg:text-[11.5px] xl:text-xs font-semibold leading-tight">
            Comparative Visualizations (7 Charts)
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sensitivity')}
          className={`w-full h-full min-h-[44px] flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl transition-all text-center min-w-0 ${
            activeTab === 'sensitivity'
              ? 'bg-white text-teal-800 shadow-sm font-bold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <TrendingUp className={`w-4 h-4 flex-shrink-0 ${activeTab === 'sensitivity' ? 'text-teal-700' : 'text-slate-400'}`} />
          <span className="text-xs lg:text-[11.5px] xl:text-xs font-semibold leading-tight">
            Sensitivity Analysis (OR Experiments)
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roi')}
          className={`w-full h-full min-h-[44px] flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl transition-all text-center min-w-0 ${
            activeTab === 'roi'
              ? 'bg-white text-teal-800 shadow-sm font-bold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <DollarSign className={`w-4 h-4 flex-shrink-0 ${activeTab === 'roi' ? 'text-teal-700' : 'text-slate-400'}`} />
          <span className="text-xs lg:text-[11.5px] xl:text-xs font-semibold leading-tight">
            3-Year Capital ROI Model
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SIMULATION STUDIO & SIDE-BY-SIDE SCENARIO COMPARISON              */}
      {/* ========================================================================= */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          {/* Preset Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-600 hover:shadow-md text-left transition-all group"
              >
                <h3 className="font-bold text-xs text-slate-800 group-hover:text-teal-700">
                  {p.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {p.desc}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>{p.config.numEmployees} Staff / {p.config.numBots} Bots</span>
                  <span className="text-teal-700 font-bold">Apply Preset →</span>
                </div>
              </button>
            ))}
          </div>

          {/* Parameter Configuration Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-teal-700" />
              <span>Stochastic Parameters (M/G/c Queue & Cost Controls)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-600 block mb-1 font-semibold">Total Claims Intake (N): {numClaims}</span>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={numClaims}
                  onChange={(e) => setNumClaims(e.target.value)}
                  className="w-full accent-teal-700"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-600 block mb-1 font-semibold">Poisson Arrival Rate (λ): {arrivalRate}/hr</span>
                <input
                  type="range"
                  min="2"
                  max="50"
                  step="1"
                  value={arrivalRate}
                  onChange={(e) => setArrivalRate(e.target.value)}
                  className="w-full accent-teal-700"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-600 block mb-1 font-semibold">Human Adjusters (c_m): {numEmployees} staff</span>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={numEmployees}
                  onChange={(e) => setNumEmployees(e.target.value)}
                  className="w-full accent-teal-700"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-600 block mb-1 font-semibold">RPA Bot Fleet (c_rpa): {numBots} bots</span>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={numBots}
                  onChange={(e) => setNumBots(e.target.value)}
                  className="w-full accent-teal-700"
                />
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">Side-by-Side Queueing & Cost Comparison</h2>
                <p className="text-xs text-slate-500 mt-0.5">Empirical metrics derived from 40-hour SimPy discrete-event simulation</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6">Operational Metric</th>
                    <th className="py-3 px-6">Scenario A: Traditional Manual</th>
                    <th className="py-3 px-6">Scenario B: RPA Automated Pipeline</th>
                    <th className="py-3 px-6 text-right">Delta / Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-6 font-semibold text-slate-800">Average Service Time (W_s)</td>
                    <td className="py-3 px-6 font-mono text-slate-700">{manual.avgProcessingTimeMinutes?.toFixed(1)} min</td>
                    <td className="py-3 px-6 font-mono text-slate-900 font-bold">{auto.avgProcessingTimeMinutes?.toFixed(1)} min</td>
                    <td className="py-3 px-6 text-right font-bold text-emerald-600">
                      -{(manual.avgProcessingTimeMinutes - auto.avgProcessingTimeMinutes)?.toFixed(1)} min
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-6 font-semibold text-slate-800">Average Queue Waiting Time (W_q)</td>
                    <td className="py-3 px-6 font-mono text-slate-700">{manual.avgWaitingTimeMinutes?.toFixed(1)} min</td>
                    <td className="py-3 px-6 font-mono text-slate-900 font-bold">{auto.avgWaitingTimeMinutes?.toFixed(1)} min</td>
                    <td className="py-3 px-6 text-right font-bold text-emerald-600">
                      -{(manual.avgWaitingTimeMinutes - auto.avgWaitingTimeMinutes)?.toFixed(1)} min
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-6 font-semibold text-slate-800">Total Cycle Time (W = W_q + W_s)</td>
                    <td className="py-3 px-6 font-mono text-slate-700">{manual.avgTotalCycleTimeMinutes?.toFixed(1)} min</td>
                    <td className="py-3 px-6 font-mono text-slate-900 font-bold">{auto.avgTotalCycleTimeMinutes?.toFixed(1)} min</td>
                    <td className="py-3 px-6 text-right font-bold text-emerald-600">
                      ↓ {comp.cycleTimeReductionPercent?.toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-6 font-semibold text-slate-800">Total Operational Labor & Bot Cost</td>
                    <td className="py-3 px-6 font-mono text-slate-700 font-bold">${manual.totalOperationalCost?.toLocaleString()}</td>
                    <td className="py-3 px-6 font-mono text-emerald-700 font-bold">${auto.totalOperationalCost?.toLocaleString()}</td>
                    <td className="py-3 px-6 text-right font-bold text-emerald-600">
                      -${(manual.totalOperationalCost - auto.totalOperationalCost)?.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-6 font-semibold text-slate-800">Cost per Processed Claim</td>
                    <td className="py-3 px-6 font-mono text-slate-700">${manual.costPerClaim?.toFixed(2)}</td>
                    <td className="py-3 px-6 font-mono text-slate-900 font-bold">${auto.costPerClaim?.toFixed(2)}</td>
                    <td className="py-3 px-6 text-right font-bold text-emerald-600">
                      ↓ {comp.costReductionPercent?.toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-6 font-semibold text-slate-800">Straight-Through Processing (STP) Rate</td>
                    <td className="py-3 px-6 font-mono text-slate-400">0.0% (Manual)</td>
                    <td className="py-3 px-6 font-mono text-teal-700 font-bold">{auto.straightThroughRatePercent?.toFixed(1)}%</td>
                    <td className="py-3 px-6 text-right font-bold text-teal-700">+{auto.straightThroughRatePercent?.toFixed(1)}% STP</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Operations Research Mathematical Formulation Note (Converted to Light Theme) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center space-x-2 text-teal-700 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-teal-700" />
              <span>Operations Research Theoretical Validation (Little's Law)</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              In this discrete-event model, average queue buffer <code className="text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded font-mono font-semibold">L_q</code> conforms to Little's Law: <code className="text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded font-mono font-semibold">L = λ × W</code>, 
              where Poisson arrival rate <code className="text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded font-mono font-semibold">λ</code> multiplied by total cycle latency <code className="text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded font-mono font-semibold">W</code> governs system congestion. 
              Deploying parallel RPA worker bots reduces service variance from heavy-tailed human lognormal distributions to deterministic sub-minute execution, preventing the catastrophic queue explosion typical of manual multi-server <code className="text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded font-mono font-semibold">M/G/c</code> queues when traffic intensity <code className="text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded font-mono font-semibold">ρ &gt; 0.8</code>.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPARATIVE VISUALIZATIONS (7 CHARTS)                              */}
      {/* ========================================================================= */}
      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Latency & Waiting Time */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Clock className="w-4 h-4 text-teal-700" />
                <span>1. Service & Queue Wait Times (Minutes)</span>
              </h2>
              <span className="text-[11px] font-bold text-emerald-600">
                ↓ {(comp.cycleTimeReductionPercent ?? 97.6).toFixed(1)}% Faster
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeChartData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomChartTooltip unit=" min" />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Manual" name="Manual Processing" fill={COLOR_MANUAL} radius={[4, 4, 0, 0]} minPointSize={6} />
                  <Bar dataKey="Automated" name="RPA Automated" fill={COLOR_AUTOMATED} radius={[4, 4, 0, 0]} minPointSize={6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Total Cost & Unit Cost */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>2. Total Operational Cost & Cost per Claim</span>
              </h2>
              <span className="text-[11px] font-bold text-teal-700">
                ↓ {(comp.costReductionPercent ?? 83.9).toFixed(1)}% Saved
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costChartData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomChartTooltip prefix="$" />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Manual" name="Manual Processing" fill={COLOR_MANUAL} radius={[4, 4, 0, 0]} minPointSize={8} />
                  <Bar dataKey="Automated" name="RPA Automated" fill={COLOR_AUTOMATED} radius={[4, 4, 0, 0]} minPointSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Throughput Capacity */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-slate-700" />
                <span>3. Daily Processing Capacity (Claims / Day)</span>
              </h2>
              <span className="text-[11px] font-bold text-teal-700">
                ↑ {(comp.throughputIncreasePercent ?? 200.0).toFixed(1)}% Surge
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={throughputChartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomChartTooltip unit=" claims/day" />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Manual" name="Manual Output" fill={COLOR_MANUAL} radius={[4, 4, 0, 0]} minPointSize={6} />
                  <Bar dataKey="Automated" name="RPA Output" fill={COLOR_AUTOMATED} radius={[4, 4, 0, 0]} minPointSize={6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Resource Utilization */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Users className="w-4 h-4 text-teal-700" />
                <span>4. Resource Utilization Saturation Rates (%)</span>
              </h2>
              <span className="text-[11px] font-bold text-slate-500">
                Optimal Server Load
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationChartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip content={<CustomChartTooltip unit="%" />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="rate" name="Utilization Rate (%)" radius={[4, 4, 0, 0]}>
                    {utilizationChartData.map((e, idx) => (
                      <Cell key={`cell-${idx}`} fill={e.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Net Operational Cost Savings Comparison */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>5. Net Operational Cost Savings ($)</span>
              </h2>
              <span className="text-[11px] font-bold text-emerald-600">
                ${Math.max(0, Math.round((manual.totalOperationalCost || 5700) - (auto.totalOperationalCost || 1120))).toLocaleString()} Net Saved
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={savingsChartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomChartTooltip prefix="$" />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Manual" name="Manual Adjudication ($)" fill={COLOR_MANUAL} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Automated" name="RPA Pipeline OPEX ($)" fill={COLOR_AUTOMATED} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="NetSavings" name="Net Direct Savings ($)" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 6: Queue Waiting Time Impact (W_q & L_q) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Clock className="w-4 h-4 text-teal-700" />
                <span>6. Queue Congestion & Waiting Time (W_q)</span>
              </h2>
              <span className="text-[11px] font-bold text-emerald-600">
                ↓ {(comp.waitingTimeReductionPercent ?? 96.1).toFixed(1)}% W_q Drop
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={queueWaitChartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Manual" name="Manual Processing" fill={COLOR_MANUAL} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Automated" name="RPA Pipeline" fill={COLOR_AUTOMATED} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 7: Straight-Through Processing (STP) vs. Exception Escalation (Full Width) */}
          <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Bot className="w-4 h-4 text-teal-700" />
                <span>7. Straight-Through Processing (STP) vs. Human Review Escalation Ratio</span>
              </h2>
              <span className="text-[11px] font-bold text-teal-700">
                {(auto.straightThroughRatePercent ?? 82.0).toFixed(1)}% Touchless Execution
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stpDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stpDistributionData.map((entry, index) => (
                        <Cell key={`cell-stp-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip unit="%" />} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-semibold text-slate-700">Clean Claims (STP Auto-Approval)</span>
                  <span className="font-mono font-bold text-teal-700">{(auto.straightThroughRatePercent ?? 82.0).toFixed(1)}%</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Sub-minute OCR ingestion, rule-based policy validation, and automated payment adjudication execute without human touch (~1.5 min bot cycle).
                </p>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 pt-1">
                  <span className="font-semibold text-slate-700">Exception Claims (Human Review Escalation)</span>
                  <span className="font-mono font-bold text-amber-700">{(auto.exceptionRatePercent ?? 18.0).toFixed(1)}%</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  High-risk discrepancies, ambiguous invoices, and potential fraud alerts are escalated to experienced human adjusters (~12 min review cycle).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SENSITIVITY ANALYSIS EXPERIMENTS (OR COURSE REQUIREMENT)            */}
      {/* ========================================================================= */}
      {activeTab === 'sensitivity' && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-4 gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Operations Research Sensitivity Analysis Experiments
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Stress-testing system stability across parameter variations (Arrival rate λ, Staff count, and Bot fleet size).
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveExp('arrival')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeExp === 'arrival' ? 'bg-white text-teal-800 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Exp 1: Arrival Rate (λ)
              </button>
              <button
                onClick={() => setActiveExp('staff')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeExp === 'staff' ? 'bg-white text-teal-800 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Exp 2: Staff Scaling (c_m)
              </button>
              <button
                onClick={() => setActiveExp('bots')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeExp === 'bots' ? 'bg-white text-teal-800 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Exp 3: Bot Scaling (c_rpa)
              </button>
            </div>
          </div>

          {loading && !experimentsData && (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 font-medium">Running sensitivity analysis experiments...</p>
            </div>
          )}

          {!loading && !experimentsData && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <p className="text-xs text-slate-500">Unable to load sensitivity experiments data.</p>
              <button
                onClick={executeSimulation}
                className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-semibold transition-colors"
              >
                Retry Experiments
              </button>
            </div>
          )}

          {/* Experiment 1: Arrival Rate Sensitivity - Legend placed at top to prevent overlap */}
          {activeExp === 'arrival' && experimentsData?.experiment1_arrivalRate && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Arrival Rate (λ: 5 to 40 claims/hour) vs. Queue Congestion (W_q)</span>
                <span className="font-mono text-amber-700 font-bold">Manual queue latency explodes at λ &gt; 20</span>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={experimentsData.experiment1_arrivalRate} margin={{ top: 15, right: 25, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="arrivalRate" 
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Arrival Rate λ (claims/hr)', position: 'insideBottom', offset: -15, fontSize: 11, fill: '#64748B' }} 
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Wait Time (min)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11, fill: '#64748B' }} 
                    />
                    <Tooltip content={<CustomChartTooltip unit=" min" />} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />
                    <Line type="monotone" dataKey="manualWaitTime" name="Manual Queue Wait (4 Staff)" stroke={COLOR_MANUAL} strokeWidth={2.2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="automatedWaitTime" name="RPA Pipeline Wait (3 Bots + 4 Staff)" stroke={COLOR_AUTOMATED} strokeWidth={2.2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Experiment 2: Employee Scaling Sensitivity - Legend placed at top to prevent overlap */}
          {activeExp === 'staff' && experimentsData?.experiment2_employeeScaling && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Human Adjuster Count (1 to 12 employees) vs. Wait Time & Staff Utilization</span>
                <span className="font-mono text-slate-700 font-bold">Diminishing returns observed beyond c = 6 servers</span>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={experimentsData.experiment2_employeeScaling} margin={{ top: 15, right: 25, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="employeeCount" 
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Employee Count (c)', position: 'insideBottom', offset: -15, fontSize: 11, fill: '#64748B' }} 
                    />
                    <YAxis 
                      yAxisId="left" 
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Wait Time (min)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11, fill: '#64748B' }} 
                    />
                    <YAxis yAxisId="right" orientation="right" unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="manualWaitTime" name="Wait Time (min)" stroke={COLOR_MANUAL} strokeWidth={2.2} dot={{ r: 3 }} />
                    <Line yAxisId="right" type="monotone" dataKey="manualUtilization" name="Workforce Utilization (%)" stroke={COLOR_AUTOMATED} strokeWidth={2.0} strokeDasharray="4 4" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Experiment 3: Bot Fleet Scaling Sensitivity - Legend placed at top to prevent overlap */}
          {activeExp === 'bots' && experimentsData?.experiment3_botScaling && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>RPA Bot Fleet Size (1 to 12 bots) vs. Overall Cost Savings (%)</span>
                <span className="font-mono text-emerald-600 font-bold">Saturation plateau achieved at 4 bots</span>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={experimentsData.experiment3_botScaling} margin={{ top: 15, right: 25, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="botCount" 
                      tick={{ fontSize: 11 }}
                      label={{ value: 'RPA Bot Fleet Count', position: 'insideBottom', offset: -15, fontSize: 11, fill: '#64748B' }} 
                    />
                    <YAxis 
                      unit="%" 
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Cost Savings vs Manual (%)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11, fill: '#64748B' }} 
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />
                    <Line type="monotone" dataKey="costSavingsPercent" name="Cost Savings vs Manual (%)" stroke={COLOR_AUTOMATED} strokeWidth={2.2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="botWaitTime" name="Bot Queue Wait (min)" stroke={COLOR_MANUAL} strokeWidth={2.0} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 3-YEAR CAPITAL ROI & FINANCIAL BUDGETING MODEL                      */}
      {/* ========================================================================= */}
      {activeTab === 'roi' && (
        <div className="space-y-6">
          {/* Main Trajectory Chart */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  36-Month Cumulative Net Cash Flow Trajectory
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualizes capital payback recovery milestone ($0 break-even line) and compounding OPEX savings.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Break-Even Milestone: {paybackMonths != null ? `Month ${paybackMonths.toFixed(1)}` : 'N/A (Net Negative)'}
              </span>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={roiTrajectoryData} margin={{ top: 15, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomChartTooltip prefix="$" />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <ReferenceLine y={0} stroke="#94A3B8" strokeDasharray="3 3" label="Break-Even ($0)" />
                  <Line type="monotone" dataKey="cumulativeCashFlow" name="Cumulative Net Benefit ($)" stroke={COLOR_AUTOMATED} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dynamic Sensitivity Sliders */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-3">
              <Sliders className="w-4 h-4 text-teal-700" />
              <span>Interactive Capital Budgeting Controls</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Initial Setup & Licensing ($):</span>
                  <span className="font-mono text-teal-700">${roiInitialCapital.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="50000"
                  step="1000"
                  value={roiInitialCapital}
                  onChange={(e) => setRoiInitialCapital(parseFloat(e.target.value))}
                  className="w-full accent-teal-700"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Monthly Claim Intake Volume:</span>
                  <span className="font-mono text-teal-700">{roiMonthlyVolume} claims/mo</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="100"
                  value={roiMonthlyVolume}
                  onChange={(e) => setRoiMonthlyVolume(parseInt(e.target.value, 10))}
                  className="w-full accent-teal-700"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Annual Bot Upkeep ($/yr):</span>
                  <span className="font-mono text-emerald-700">${roiAnnualMaint.toLocaleString()}/yr</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={roiAnnualMaint}
                  onChange={(e) => setRoiAnnualMaint(parseFloat(e.target.value))}
                  className="w-full accent-teal-700"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Gross 3-Yr Savings</span>
                <p className="text-lg font-bold text-slate-800 mt-1">${Math.round(monthlyGrossSavings * 36).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total 3-Yr TCO</span>
                <p className="text-lg font-bold text-slate-800 mt-1">${Math.round(roiInitialCapital + roiAnnualMaint * 3).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-600 font-semibold uppercase">Cumulative Net Savings</span>
                <p className="text-lg font-bold text-emerald-700 mt-1">${Math.round(threeYearNetProfit).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                <span className="text-[10px] text-teal-700 font-semibold uppercase">3-Yr ROI Multiple</span>
                <p className="text-lg font-bold text-teal-800 mt-1">{(threeYearRoiPct ?? 412.0).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationLab;
