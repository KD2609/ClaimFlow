import React, { useState, useEffect, useRef } from 'react';
import { rpaApi } from '../services/api';
import {
  Bot,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  Terminal,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

const AutomatedProcessing = () => {
  const [batchLimit, setBatchLimit] = useState(10);
  const [botId, setBotId] = useState('RPA-BOT-01');
  const [botHourlyCost, setBotHourlyCost] = useState(4.20);
  const [executing, setExecuting] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  // Single claim run state
  const [singleClaimId, setSingleClaimId] = useState('');
  const [singleResult, setSingleResult] = useState(null);

  // Auto-scroll ref for terminal console
  const logsEndRef = useRef(null);

  const loadRecentLogs = async () => {
    try {
      const res = await rpaApi.getRecentLogs();
      setRecentLogs(res.data || []);
    } catch (e) {
      console.error('Error fetching logs:', e);
    }
  };

  useEffect(() => {
    loadRecentLogs();
  }, []);

  useEffect(() => {
    if (terminalLogs.length > 0) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const addTerminalLog = (msg, level = 'INFO') => {
    const time = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [...prev, `[${time}] [${level}] ${msg}`]);
  };

  const handleRunBatch = async () => {
    setExecuting(true);
    setTerminalLogs([]);
    setBatchResult(null);

    addTerminalLog(`Worker '${botId}' initialized at operating rate $${botHourlyCost.toFixed(2)}/hr.`, 'INFO');
    addTerminalLog(`Scanning claim queue for status = 'SUBMITTED' (Batch Limit: ${batchLimit})...`, 'INFO');

    try {
      const res = await rpaApi.executeBatch({
        limit: batchLimit,
        botId,
        botHourlyCost,
      });

      const data = res.data;
      setBatchResult(data);

      addTerminalLog(`Retrieved ${data.totalProcessed} pending claim records from database.`, 'INFO');
      addTerminalLog(`Completed OCR document completeness and format scan.`, 'INFO');
      addTerminalLog(`Validated policy coverage ceilings and deductible limits.`, 'INFO');
      addTerminalLog(`Evaluated fraud and anomaly risk indicators against threshold.`, 'INFO');
      addTerminalLog(`Straight-Through: ${data.approvedCount} approved, ${data.manualReviewCount} escalated, ${data.rejectedCount} rejected.`, 'SUCCESS');
      addTerminalLog(`Execution completed in ${data.totalExecutionTimeMs.toFixed(1)} ms | Operational Labor Cost: $${data.totalCost.toFixed(4)}.`, 'SUCCESS');

      loadRecentLogs();
    } catch (err) {
      addTerminalLog(`Execution failed: ${err.response?.data?.message || err.message}`, 'ERROR');
    } finally {
      setExecuting(false);
    }
  };

  const handleRunSingle = async (e) => {
    e.preventDefault();
    if (!singleClaimId) return;
    setExecuting(true);
    setSingleResult(null);

    addTerminalLog(`Executing targeted single claim RPA run for Claim #${singleClaimId}...`, 'INFO');
    try {
      const res = await rpaApi.executeSingle(singleClaimId, { botId, botHourlyCost });
      setSingleResult(res.data);
      addTerminalLog(`Claim #${singleClaimId} resolved to ${res.data.claimStatus} in ${res.data.executionDurationMs?.toFixed(1)} ms.`, 'SUCCESS');
      loadRecentLogs();
    } catch (err) {
      addTerminalLog(`Failed to process Claim #${singleClaimId}: ${err.response?.data?.message || err.message}`, 'ERROR');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">RPA Bot Console</h1>
          <p className="text-sm text-slate-500 mt-1">
            Execute robotic process automation workflows for document verification, policy compliance and automated decisions.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-teal-50 text-teal-800 px-3 py-1.5 rounded-xl border border-teal-200/80 text-xs font-semibold self-start sm:self-auto">
          <Bot className="w-4 h-4 text-teal-700" />
          <span>Worker Status: Ready ({botId})</span>
        </div>
      </div>

      {/* TOP ROW: Batch Configuration (40%) & Live RPA Console (60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Batch Configuration Card (approx 40%) */}
        <div className="lg:col-span-5 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Batch Configuration</h2>
                  <p className="text-[11px] text-slate-400">Configure queue limits and worker cost</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Queue Dispatch
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Batch Queue Limit</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 20, 50].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBatchLimit(num)}
                      className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                        batchLimit === num
                          ? 'border-teal-700 bg-teal-50 text-teal-800 shadow-xs'
                          : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      {num} Claims
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bot Identifier</label>
                  <input
                    type="text"
                    value={botId}
                    onChange={(e) => setBotId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operating Rate ($/hr)</label>
                  <input
                    type="number"
                    step="0.10"
                    min="0.1"
                    value={botHourlyCost}
                    onChange={(e) => setBotHourlyCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Benchmark: $3.50 – $5.00/hr (vs. $28.50/hr for human adjusters).
              </p>
            </div>
          </div>

          <div className="pt-4 mt-2">
            <button
              onClick={handleRunBatch}
              disabled={executing}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {executing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Executing RPA Batch Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Execute Batch Pipeline ({batchLimit} Claims)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Live RPA Execution Console (approx 60%) - Light Grey #F1F5F4 */}
        <div className="lg:col-span-7 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Live RPA Execution Console</h2>
                  <p className="text-[11px] text-slate-400">Real-time automation telemetry & OCR audit stream</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {executing ? (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Running</span>
                  </span>
                ) : batchResult ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Completed</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                    Idle
                  </span>
                )}

                {terminalLogs.length > 0 && !executing && (
                  <button
                    onClick={() => {
                      setTerminalLogs([]);
                      setBatchResult(null);
                      setSingleResult(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded hover:bg-slate-100 text-[11px] font-medium transition-colors"
                    title="Clear console output"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Compact Batch Summary Strip (Displayed upon completion) */}
            {batchResult && (
              <div className="grid grid-cols-4 gap-2 mb-3 bg-slate-50 p-2 rounded-xl border border-slate-200 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Processed</span>
                  <span className="font-bold text-slate-800 text-sm">{batchResult.totalProcessed}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 uppercase font-semibold block">STP Approved</span>
                  <span className="font-bold text-emerald-600 text-sm">{batchResult.approvedCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-600 uppercase font-semibold block">Escalated</span>
                  <span className="font-bold text-amber-600 text-sm">{batchResult.manualReviewCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-600 uppercase font-semibold block">Rejected</span>
                  <span className="font-bold text-rose-600 text-sm">{batchResult.rejectedCount}</span>
                </div>
              </div>
            )}

            {/* Scrollable Fixed-Height Terminal Console in Preferred #F1F5F4 */}
            <div className="bg-[#F1F5F4] rounded-xl p-3.5 font-mono text-[11px] border border-slate-200/90 h-[290px] overflow-y-auto">
              {terminalLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2 p-4">
                  <Terminal className="w-8 h-8 text-slate-400" />
                  <p className="font-medium text-slate-700 text-xs">
                    Execution console is idle. Start a batch or targeted claim run to view execution logs.
                  </p>
                  <p className="text-[10px] text-slate-400 max-w-xs">
                    Logs will stream in real time with timestamped status checks.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {terminalLogs.map((log, idx) => {
                    const isError = log.includes('[ERROR]');
                    const isSuccess = log.includes('[SUCCESS]') || log.includes('Straight-Through') || log.includes('APPROVED');
                    const isWarning = log.includes('[WARN]') || log.includes('escalated');

                    return (
                      <div key={idx} className="leading-relaxed flex items-start space-x-1.5">
                        <span className="text-slate-400 select-none">{'>'}</span>
                        <span
                          className={
                            isError
                              ? 'text-rose-600 font-medium'
                              : isSuccess
                              ? 'text-teal-700 font-medium'
                              : isWarning
                              ? 'text-amber-700 font-medium'
                              : 'text-slate-700'
                          }
                        >
                          {log}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Targeted Single Claim (40%) & Recent Audit Records (60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Targeted Single Claim Run Card (approx 40%) */}
        <div className="lg:col-span-5 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Play className="w-4 h-4 fill-teal-700 text-teal-700" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Targeted Single Claim Run</h2>
                  <p className="text-[11px] text-slate-400">Directly test validation rules on an individual claim</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Direct Test
              </span>
            </div>

            <form onSubmit={handleRunSingle} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Claim Database Identifier</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Enter Claim ID (e.g. 1)"
                    value={singleClaimId}
                    onChange={(e) => setSingleClaimId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={executing || !singleClaimId}
                    className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-all disabled:opacity-50"
                  >
                    Run Bot
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Applies OCR integrity, policy limits, and fraud scoring.
                </span>
              </div>
            </form>

            {/* Single Run Result Feedback */}
            {singleResult && (
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-800">Claim #{singleResult.claimId}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      singleResult.claimStatus === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : singleResult.claimStatus === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {singleResult.claimStatus}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{singleResult.executionDetails}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                  <span>
                    Latency: <strong className="text-slate-700 font-mono">{singleResult.executionDurationMs?.toFixed(1)} ms</strong>
                  </span>
                  <span>
                    Cost: <strong className="text-emerald-600 font-mono">${singleResult.operationalCost?.toFixed(4)}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Recent Audit Records Table (approx 60%) */}
        <div className="lg:col-span-7 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Recent RPA Automation Audit Records</h2>
                  <p className="text-[11px] text-slate-400">Persisted audit trail with duration, cost, and decision</p>
                </div>
              </div>

              <button
                onClick={loadRecentLogs}
                className="inline-flex items-center space-x-1 text-slate-500 hover:text-slate-800 text-xs px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                title="Refresh audit records"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Bot ID</th>
                    <th className="py-2.5 px-3">Claim ID</th>
                    <th className="py-2.5 px-3">Latency</th>
                    <th className="py-2.5 px-3">Labor Cost</th>
                    <th className="py-2.5 px-3">Result Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentLogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                        No automation audit records logged yet. Run a batch to generate audit logs.
                      </td>
                    </tr>
                  ) : (
                    recentLogs.slice(0, 5).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{log.botId}</td>
                        <td className="py-2.5 px-3 font-mono text-teal-700 font-medium">#{log.claimId}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{log.executionDurationMs?.toFixed(1)} ms</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-600 font-medium">
                          ${log.operationalCost?.toFixed(4)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              log.executionStatus === 'SUCCESS'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : log.executionStatus === 'EXCEPTION'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {log.executionStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomatedProcessing;
