import React, { useState } from 'react';
import { Database, HardDrive, CheckCircle2, XCircle, ArrowUpRight, Filter, Download, Terminal, RefreshCw } from 'lucide-react';
import { TelemetryRecord } from '../types';

interface TelemetryViewProps {
  records: TelemetryRecord[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const TelemetryView: React.FC<TelemetryViewProps> = ({
  records,
  onRefresh,
  isLoading,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredRecords = records.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const total = records.length;
  const approvedCount = records.filter((r) => r.status === 'APPROVED' || r.status === 'DISPATCHED').length;
  const rejectedCount = records.filter((r) => r.status === 'REJECTED').length;
  const avgRetention =
    total > 0
      ? Math.round(records.reduce((acc, r) => acc + (r.predictedRetention || 0), 0) / total)
      : 0;

  const downloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'bigquery_telemetry_export.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Dataset Info */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Google BigQuery Telemetry Engine</h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40 font-mono">
                social_growth_engine.content_lifecycle
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live streaming ingestion for human curation signals, Veo rendering jobs, and Blotato multi-platform metrics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={downloadJson}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Evaluated</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Multi-signal batches</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Approved & Queued</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{approvedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Veo rendering triggered</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Rejected Feedback</div>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">{rejectedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">RL fine-tuning logged</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Avg Projected Retention</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">{avgRetention}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Short-form engagement index</div>
        </div>
      </div>

      {/* BigQuery SQL Console Simulator */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-2 border-b border-slate-800 pb-2">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            BigQuery Standard SQL Query
          </span>
          <span className="text-[11px] text-emerald-400 font-mono">2.4 MB scanned • 12ms</span>
        </div>
        <code className="text-indigo-300 block overflow-x-auto whitespace-pre">
          {`SELECT id, signal, title, predictedRetention, status, timestamp, gcsBucketUri 
FROM \`apexgrowth-ai-builders-cup.social_growth_engine.content_lifecycle\`
ORDER BY timestamp DESC LIMIT 50;`}
        </code>
      </div>

      {/* Telemetry Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Logged Content Records</span>
            <span className="text-xs font-mono text-slate-400">({filteredRecords.length})</span>
          </h3>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Record ID</th>
                <th className="p-3.5">Signal Origin</th>
                <th className="p-3.5">Content Title & Hook</th>
                <th className="p-3.5">Retention</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Cloud Storage URI</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-indigo-400">{r.id}</td>
                  <td className="p-3.5 text-slate-300 whitespace-nowrap">
                    <span className="text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {r.signal}
                    </span>
                  </td>
                  <td className="p-3.5 max-w-xs">
                    <div className="font-semibold text-slate-200 truncate">{r.title}</div>
                    <div className="text-[11px] text-slate-400 truncate italic">"{r.hook}"</div>
                  </td>
                  <td className="p-3.5 font-mono">
                    <span className="font-bold text-emerald-400">{r.predictedRetention}%</span>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    {r.status === 'APPROVED' || r.status === 'DISPATCHED' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-[10px] flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        {r.status}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-[10px] flex items-center gap-1 w-fit">
                        <XCircle className="w-3 h-3" />
                        REJECTED
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-sky-400">
                    <div className="flex items-center gap-1 max-w-[200px] truncate" title={r.gcsBucketUri}>
                      <HardDrive className="w-3 h-3 text-sky-400 shrink-0" />
                      <span className="truncate">{r.gcsBucketUri || 'gs://apexgrowth-assets-prod/...'}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400 text-[10px] whitespace-nowrap">
                    {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
