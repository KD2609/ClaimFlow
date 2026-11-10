import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { simulationApi } from '../services/api';
import {
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Clock,
  Users,
  Bot,
  TrendingUp,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

const PRESETS = [
  {
    name: 'Standard Baseline',
    desc: '40-hr work week, balanced claim arrival and bot capacity',
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
    name: 'Peak Catastrophe Surge',
    desc: 'Post-hurricane or severe storm volume surge (High λ)',
    config: {
      numClaims: 600,
      durationHours: 40.0,
      numEmployees: 5,
      numBots: 6,
      arrivalRate: 30.0,
      employeeHourlyRate: 32.00,
      botHourlyRate: 4.50,
      exceptionRate: 0.22,
      meanManualTimeMinutes: 26.0,
      meanBotTimeMinutes: 1.8,
    },
  },
  {
    name: 'Constrained Staff Stress Test',
    desc: 'High queue congestion with only 2 human processors',
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
    desc: 'Large corporate carrier with 8 RPA bots and 8 staff',
    config: {
      numClaims: 1200,
      durationHours: 80.0,
      numEmployees: 8,
      numBots: 8,
      arrivalRate: 35.0,
      employeeHourlyRate: 30.00,
      botHourlyRate: 4.00,
      exceptionRate: 0.14,
      meanManualTimeMinutes: 22.0,
      meanBotTimeMinutes: 1.2,
    },
  },
];

const SimulationConfiguration = () => {
  const navigate = useNavigate();

  // Simulation Parameters state
  const [numClaims, setNumClaims] = useState(250);
  const [durationHours, setDurationHours] = useState(40.0);
  const [numEmployees, setNumEmployees] = useState(4);
  const [numBots, setNumBots] = useState(3);
  const [arrivalRate, setArrivalRate] = useState(12.0); // Poisson lambda
  const [employeeHourlyRate, setEmployeeHourlyRate] = useState(28.50);
  const [botHourlyRate, setBotHourlyRate] = useState(4.20);
  const [exceptionRatePercent, setExceptionRatePercent] = useState(18); // 18%
  const [meanManualTimeMinutes, setMeanManualTimeMinutes] = useState(24.0);
  const [meanBotTimeMinutes, setMeanBotTimeMinutes] = useState(1.5);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const applyPreset = (preset) => {
    const c = preset.config;
    setNumClaims(c.numClaims);
    setDurationHours(c.durationHours);
    setNumEmployees(c.numEmployees);
    setNumBots(c.numBots);
    setArrivalRate(c.arrivalRate);
    setEmployeeHourlyRate(c.employeeHourlyRate);
    setBotHourlyRate(c.botHourlyRate);
    setExceptionRatePercent(Math.round(c.exceptionRate * 100));
    setMeanManualTimeMinutes(c.meanManualTimeMinutes);
    setMeanBotTimeMinutes(c.meanBotTimeMinutes);
  };

  const handleRunSimulation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const payload = {
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
      randomSeed: 42,
    };

    try {
      const res = await simulationApi.runSimulation(payload);
      // Store result in sessionStorage for instant retrieval on Results and Comparison pages
      sessionStorage.setItem('latestSimulationResult', JSON.stringify(res.data));
      navigate('/simulation-results');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to execute SimPy simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Operations Research Simulation Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure stochastic discrete-event simulation parameters to evaluate manual vs. RPA queueing dynamics.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
          <Sparkles className="w-4 h-4" />
          <span>SimPy 4 Discrete-Event Engine</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Preset Scenarios Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Curated Industry Presets
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-500 hover:shadow-md text-left transition-all group"
            >
              <h3 className="font-bold text-xs text-slate-800 group-hover:text-blue-600">
                {preset.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {preset.desc}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>{preset.config.numEmployees} Staff / {preset.config.numBots} Bots</span>
                <span className="text-blue-600 font-bold">Apply →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Configuration Form */}
      <form onSubmit={handleRunSimulation} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Stochastic Queue & Cost Parameters</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Kendall Notation: M/G/c Model</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          {/* Group 1: Volume & Horizon */}
          <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Volume & Horizon</span>
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Total Claims Intake (N): {numClaims}
              </label>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={numClaims}
                onChange={(e) => setNumClaims(e.target.value)}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>50</span>
                <span>500</span>
                <span>1000 claims</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Simulation Horizon (Hours): {durationHours}h
              </label>
              <input
                type="range"
                min="8"
                max="160"
                step="8"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 Day (8h)</span>
                <span>1 Week (40h)</span>
                <span>1 Month (160h)</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Poisson Arrival Rate (λ claims/hr): {arrivalRate}
              </label>
              <input
                type="range"
                min="2"
                max="50"
                step="1"
                value={arrivalRate}
                onChange={(e) => setArrivalRate(e.target.value)}
                className="w-full accent-blue-600"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Interarrival time ~ Exponential(1/λ)
              </span>
            </div>
          </div>

          {/* Group 2: Workforce & Bot Capacity */}
          <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Servers & Parallel Resources</span>
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Human Claim Adjusters (c_m): {numEmployees} staff
              </label>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={numEmployees}
                onChange={(e) => setNumEmployees(e.target.value)}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 staff</span>
                <span>8 staff</span>
                <span>15 staff</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                RPA Bot Fleet Size (c_rpa): {numBots} bots
              </label>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={numBots}
                onChange={(e) => setNumBots(e.target.value)}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 bot</span>
                <span>5 bots</span>
                <span>15 bots</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Exception Escalation Rate (%): {exceptionRatePercent}%
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={exceptionRatePercent}
                onChange={(e) => setExceptionRatePercent(e.target.value)}
                className="w-full accent-purple-600"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Claims requiring human manual review
              </span>
            </div>
          </div>

          {/* Group 3: Service Times & Cost Structure */}
          <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Service Latencies & Costs</span>
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mean Manual Duration (μ_m): {meanManualTimeMinutes} min
              </label>
              <input
                type="number"
                step="0.5"
                value={meanManualTimeMinutes}
                onChange={(e) => setMeanManualTimeMinutes(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mean RPA Bot Duration (μ_rpa): {meanBotTimeMinutes} min
              </label>
              <input
                type="number"
                step="0.1"
                value={meanBotTimeMinutes}
                onChange={(e) => setMeanBotTimeMinutes(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Staff $/hr</label>
                <input
                  type="number"
                  step="0.5"
                  value={employeeHourlyRate}
                  onChange={(e) => setEmployeeHourlyRate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bot $/hr</label>
                <input
                  type="number"
                  step="0.1"
                  value={botHourlyRate}
                  onChange={(e) => setBotHourlyRate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Powered by Python SimPy 4 discrete-event queueing model
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Execute SimPy Discrete-Event Simulation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimulationConfiguration;

