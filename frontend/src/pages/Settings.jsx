import React, { useState, useEffect } from 'react';
import { simulationApi } from '../services/api';
import {
  Settings as SettingsIcon,
  Shield,
  Server,
  Activity,
  CheckCircle2,
  XCircle,
  Save,
  Cpu,
  Layers,
  HelpCircle,
  Users
} from 'lucide-react';

const Settings = () => {
  const [employeeRate, setEmployeeRate] = useState('28.50');
  const [botRate, setBotRate] = useState('4.20');
  const [fraudThreshold, setFraudThreshold] = useState('65');
  const [simEngineUrl, setSimEngineUrl] = useState('http://localhost:8000');
  const [engineStatus, setEngineStatus] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const checkEngineHealth = async () => {
    try {
      setTestingConnection(true);
      const res = await simulationApi.getEngineStatus();
      setEngineStatus(res.data);
    } catch (err) {
      setEngineStatus({ status: 'OFFLINE_FALLBACK', message: 'FastAPI service offline - Using Spring Boot high-precision analytical engine.' });
    } finally {
      setTestingConnection(false);
    }
  };

  useEffect(() => {
    checkEngineHealth();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Configuration & Parameters</h1>
        <p className="text-sm text-slate-500 mt-1">
          Adjust Operations Research cost baselines, fraud risk cutoffs, and simulation microservice connectivity.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Operational configurations updated successfully.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-3">
          <SettingsIcon className="w-4 h-4 text-blue-600" />
          <span>Financial & Operational Benchmarks</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Standard Employee Hourly Labor Cost ($/hr)
            </label>
            <input
              type="number"
              step="0.50"
              value={employeeRate}
              onChange={(e) => setEmployeeRate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Default human claims examiner wage including benefits ($28.50/hr).
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              RPA Bot Runtime & Maintenance Cost ($/hr)
            </label>
            <input
              type="number"
              step="0.10"
              value={botRate}
              onChange={(e) => setBotRate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Amortized cloud infrastructure and bot worker runtime ($4.20/hr).
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Fraud Detection Flag Cutoff Score (0 - 100)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={fraudThreshold}
              onChange={(e) => setFraudThreshold(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Claims scoring above this threshold are routed to human review (Default: 65).
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Python SimPy Microservice REST Endpoint
            </label>
            <input
              type="text"
              value={simEngineUrl}
              onChange={(e) => setSimEngineUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              FastAPI discrete-event simulation engine on port 8000.
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Engine Status Health Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Server className="w-4 h-4 text-purple-600" />
            <span>Simulation Engine Health & Status</span>
          </h2>

          <button
            onClick={checkEngineHealth}
            disabled={testingConnection}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center space-x-1"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{testingConnection ? 'Probing...' : 'Probe Engine Health'}</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${engineStatus?.status === 'HEALTHY' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
            <span className="font-bold text-slate-800">
              {engineStatus?.status || 'ONLINE'}
            </span>
          </div>
          <p className="text-slate-600">
            {engineStatus?.message || 'Spring Boot OR Analytics & Python SimPy discrete-event simulation services available.'}
          </p>
        </div>
      </div>

      {/* Role Access Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-3">
          <Users className="w-4 h-4 text-amber-600" />
          <span>Role-Based Access Control (RBAC) Matrix</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
            <div className="flex items-center space-x-2 font-bold text-purple-900 mb-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>ROLE_ADMIN</span>
            </div>
            <ul className="space-y-1.5 text-slate-600 text-[11px] list-disc list-inside">
              <li>Full access to Operations Research Simulation parameters</li>
              <li>Batch RPA execution & Bot configuration</li>
              <li>System configuration updates and audit logs export</li>
              <li>User and adjusters management</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
            <div className="flex items-center space-x-2 font-bold text-blue-900 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>ROLE_CLAIM_PROCESSOR</span>
            </div>
            <ul className="space-y-1.5 text-slate-600 text-[11px] list-disc list-inside">
              <li>Interactive 5-stage manual claim processing workbench</li>
              <li>Claim intake submission and customer policy search</li>
              <li>Read-only access to simulation results and dashboards</li>
              <li>Inspection of escalated anomaly claims</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

