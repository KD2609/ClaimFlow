import React, { useState, useEffect } from 'react';
import { rpaApi } from '../services/api';
import {
  ScrollText,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

const RpaExecutionLogs = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchBot, setSearchBot] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await rpaApi.getLogs({
        page,
        size: pageSize,
      });
      let content = res.data.content || [];
      if (statusFilter !== 'ALL') {
        content = content.filter((l) => l.executionStatus === statusFilter);
      }
      if (searchBot.trim()) {
        content = content.filter((l) =>
          (l.botId || '').toLowerCase().includes(searchBot.trim().toLowerCase()) ||
          (l.claimId?.toString() === searchBot.trim())
        );
      }

      setLogs(content);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || content.length);
    } catch (err) {
      console.error('Error fetching RPA audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, pageSize, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const exportCsv = () => {
    if (logs.length === 0) return;
    const headers = ['Log ID', 'Timestamp', 'Bot ID', 'Claim ID', 'Execution MS', 'Hourly Cost', 'Status', 'Details'];
    const rows = logs.map((l) => [
      l.id,
      l.timestamp,
      l.botId,
      l.claimId,
      l.executionDurationMs,
      l.operationalCost,
      l.executionStatus,
      `"${(l.executionDetails || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RPA_Execution_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">RPA Execution Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable compliance telemetry capturing automated decision paths, OCR validations, and bot latency.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Bot ID (e.g. RPA-BOT-01) or Claim ID..."
            value={searchBot}
            onChange={(e) => setSearchBot(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold">Result Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="py-1.5 px-3 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Outcomes</option>
            <option value="SUCCESS">SUCCESS (Straight-Through)</option>
            <option value="EXCEPTION">EXCEPTION (Escalated)</option>
            <option value="FAILED">FAILED (Rejected/Error)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Log ID</th>
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6">Bot ID</th>
                <th className="py-3 px-6">Claim ID</th>
                <th className="py-3 px-6">Execution Latency</th>
                <th className="py-3 px-6">Labor Cost</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Audit Details & Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading audit telemetry...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-medium">
                    No RPA execution logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-slate-500">#{log.id}</td>
                    <td className="py-3.5 px-6 text-slate-600 whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}
                    </td>
                    <td className="py-3.5 px-6 font-mono font-bold text-purple-700">
                      {log.botId}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-blue-600 font-semibold">
                      Claim #{log.claimId}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-700">
                      {(log.executionDurationMs || 0).toFixed(1)} ms
                    </td>
                    <td className="py-3.5 px-6 font-mono text-emerald-700 font-semibold">
                      ${(log.operationalCost || 0).toFixed(4)}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          log.executionStatus === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.executionStatus === 'EXCEPTION'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.executionStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 max-w-md truncate" title={log.executionDetails}>
                      {log.executionDetails || 'Straight-through validation completed successfully.'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{logs.length}</span> records
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">Page {page + 1} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RpaExecutionLogs;

