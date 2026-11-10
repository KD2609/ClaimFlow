import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, claimApi, rpaApi } from '../services/api';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Cpu,
  DollarSign,
  TrendingUp,
  Bot,
  Play,
  ArrowRight,
  ShieldAlert,
  Layers,
  AlertTriangle
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const STATUS_COLORS = {
  SUBMITTED: '#D97706',
  IN_REVIEW: '#64748B',
  APPROVED: '#16A34A',
  REJECTED: '#DC6B6B',
  REQUIRES_MANUAL_REVIEW: '#8B5CF6',
};

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

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rpaBatchLoading, setRpaBatchLoading] = useState(false);
  const [rpaSuccessMsg, setRpaSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, claimsRes] = await Promise.all([
        dashboardApi.getStats(),
        claimApi.getClaims({ page: 0, size: 8 }),
      ]);
      setStats(statsRes.data);
      setRecentClaims(claimsRes.data.content || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQuickRpaRun = async () => {
    try {
      setRpaBatchLoading(true);
      setRpaSuccessMsg('');
      const res = await rpaApi.executeBatch({ limit: 10, botHourlyCost: 4.20 });
      setRpaSuccessMsg(`RPA Bot processed ${res.data.totalProcessed} claims! (${res.data.approvedCount} approved, ${res.data.manualReviewCount} flagged for review)`);
      fetchData();
    } catch (err) {
      console.error('RPA Batch trigger error:', err);
    } finally {
      setRpaBatchLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading operations telemetry...</p>
        </div>
      </div>
    );
  }

  // Fallbacks if stats not yet populated
  const totalClaims = stats?.totalClaims ?? 60;
  const pendingClaims = stats?.pendingClaims ?? 18;
  const inProgressClaims = stats?.inProgressClaims ?? 8;
  const approvedClaims = stats?.approvedClaims ?? 26;
  const rejectedClaims = stats?.rejectedClaims ?? 8;
  const avgProcessingTime = stats?.averageProcessingTimeMinutes ?? 18.4;
  const totalCost = stats?.totalOperationalCost ?? 4820.50;

  // Prepare chart data
  const statusPieData = [
    { name: 'Submitted / Pending', value: pendingClaims, color: '#D97706' },
    { name: 'In Review', value: inProgressClaims, color: '#64748B' },
    { name: 'Approved', value: approvedClaims, color: '#16A34A' },
    { name: 'Rejected', value: rejectedClaims, color: '#DC6B6B' },
  ];

  const modeBarData = [
    {
      name: 'Manual Processing',
      claims: stats?.manualProcessedCount ?? 42,
      cost: Math.round(stats?.manualOperationalCost ?? 3840),
    },
    {
      name: 'RPA Automated',
      claims: stats?.automatedProcessedCount ?? 18,
      cost: Math.round(stats?.automatedOperationalCost ?? 980),
    },
  ];

  const typeData = [
    { name: 'Health', claims: 28 },
    { name: 'Vehicle', claims: 20 },
    { name: 'Life', claims: 12 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time telemetry of claim intake, manual queue congestion, and RPA bot execution.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleQuickRpaRun}
            disabled={rpaBatchLoading}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-sm disabled:opacity-50 transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>{rpaBatchLoading ? 'Bot Executing...' : 'Trigger RPA Batch (10)'}</span>
          </button>

          <Link
            to="/simulation-lab"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 text-teal-700" />
            <span>Launch Simulation</span>
          </Link>
        </div>
      </div>

      {rpaSuccessMsg && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-teal-700" />
            <span>{rpaSuccessMsg}</span>
          </div>
          <button onClick={() => setRpaSuccessMsg('')} className="text-teal-700 hover:text-teal-900 font-bold">✕</button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Claims</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-3">{totalClaims}</p>
          <p className="text-xs text-slate-400 mt-1 flex items-center">
            <span className="text-teal-700 font-medium mr-1">Active Pipeline</span> across all categories
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending / Intake</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-3">{pendingClaims}</p>
          <p className="text-xs text-slate-400 mt-1">Awaiting verification</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Claims</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-3">{approvedClaims}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {totalClaims > 0 ? ((approvedClaims / totalClaims) * 100).toFixed(1) : 0}% settlement rate
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rejected Claims</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-3">{rejectedClaims}</p>
          <p className="text-xs text-rose-600 font-medium mt-1">Fraud or policy exclusions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In-Progress Queue</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-teal-700 mt-3">{inProgressClaims}</p>
          <p className="text-xs text-slate-400 mt-1">Currently in adjudication</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Processing Time</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-3">{avgProcessingTime.toFixed(1)} <span className="text-sm font-normal text-slate-500">min</span></p>
          <p className="text-xs text-emerald-600 font-medium mt-1">↓ 72% faster with automation</p>
        </div>

        {/* Total Operational Expense Card - Converted to Light Theme */}
        <div className="col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Operational Expense</span>
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Manual Labor vs. RPA Automation</span>
            <span className="text-emerald-600 font-medium">Estimated $12,400+ saved / month</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Donut */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-teal-700" />
            <span>Claim Status Distribution</span>
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip unit=" claims" />} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Processing Mode Comparison Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Bot className="w-4 h-4 text-teal-700" />
            <span>Processing Mode: Volume & Cost ($)</span>
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modeBarData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="claims" name="Claims Processed" fill="#64748B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" name="Labor Cost ($)" fill="#0F766E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insurance Type Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-teal-700" />
            <span>Claims by Category</span>
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomChartTooltip unit=" claims" />} />
                <Bar dataKey="claims" name="Claim Volume" fill="#0F766E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Claims Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Recent Claims Pipeline</h2>
            <p className="text-xs text-slate-500 mt-0.5">Most recent claim submissions and processing status</p>
          </div>
          <Link
            to="/claims"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
          >
            <span>View All Claims</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Claim ID</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Type</th>
                <th className="py-3 px-6">Amount</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Mode</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentClaims.slice(0, 6).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-6 font-mono font-semibold text-slate-800">
                    {c.claimNumber}
                  </td>
                  <td className="py-3 px-6 text-slate-700 font-medium">
                    {c.customerName}
                  </td>
                  <td className="py-3 px-6">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {c.insuranceType}
                    </span>
                  </td>
                  <td className="py-3 px-6 font-bold text-slate-900">
                    ${c.claimAmount?.toLocaleString()}
                  </td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.claimStatus === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : c.claimStatus === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : c.claimStatus === 'REQUIRES_MANUAL_REVIEW'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : c.claimStatus === 'IN_REVIEW'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {c.claimStatus?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      c.processingMode === 'AUTOMATED' 
                        ? 'bg-teal-50 text-teal-800 border border-teal-200' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {c.processingMode === 'AUTOMATED' ? 'RPA BOT' : 'MANUAL'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <Link
                      to={`/claims?highlight=${c.id}`}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                    >
                      Inspect →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
