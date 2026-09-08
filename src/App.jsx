import React, { useState, useEffect, useRef } from 'react';
import { getHQs, getCLIs, getPerformance } from './services/api';
import ChartViewer, { METRICS } from './components/ChartViewer';
import KPICards from './components/KPICards';
import DataTable from './components/DataTable';
import AdminModal from './components/AdminModal';
import {
  Train,
  MapPin,
  User,
  BarChart3,
  Settings,
  Download,
  FileText,
  LineChart,
  BarChart2,
  Table2,
  Calendar,
  CheckCircle2,
  Database,
  ArrowRight
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import * as xlsx from 'xlsx';
import { formatMonthYear } from './utils/dateUtils';
import RailwayBackground3D from './components/RailwayBackground3D';
import RailwaySideLeft from './components/RailwaySideLeft';
import RailwaySideRight from './components/RailwaySideRight';

export default function App() {
  const [hqs, setHqs] = useState([]);
  const [clis, setClis] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' | 'table'
  const reportRef = useRef();

  const [filters, setFilters] = useState({
    hq: '',
    cli: '',
    startMonth: '2023-01-01',
    endMonth: '2026-12-31',
    datePreset: 'all', // 'all' | '12m' | '6m'
    metric: '',
    chartType: 'bar'
  });

  const fetchData = async () => {
    if (!filters.cli) {
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getPerformance(filters.cli, filters.startMonth, filters.endMonth);

      // Convert metric columns into strict numbers
      const parsedData = (res.data || []).map(row => {
        const numericRow = { ...row };
        Object.keys(numericRow).forEach(key => {
          if (!['id', 'month', 'cli_id', 'cli_name', 'cli_hq'].includes(key)) {
            numericRow[key] = parseFloat(numericRow[key]) || 0;
          }
        });
        return numericRow;
      });

      setData(parsedData);
    } catch (error) {
      console.error("Failed to fetch performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHQs()
      .then(res => {
        setHqs(res.data || []);
      })
      .catch(err => console.error("Failed to fetch HQs:", err));
  }, []);

  useEffect(() => {
    if (filters.hq) {
      getCLIs(filters.hq)
        .then(res => {
          setClis(res.data || []);
          setFilters(prev => ({ ...prev, cli: '' }));
        })
        .catch(err => console.error("Failed to fetch CLIs:", err));
    } else {
      setClis([]);
      setFilters(prev => ({ ...prev, cli: '' }));
    }
  }, [filters.hq]);

  useEffect(() => {
    fetchData();
  }, [filters.cli, filters.startMonth, filters.endMonth]);

  const handleDatePresetChange = (preset) => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
    let start = '2023-01-01';

    if (preset === '12m') {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 1);
      start = d.toISOString().split('T')[0];
    } else if (preset === '6m') {
      const d = new Date();
      d.setMonth(d.getMonth() - 6);
      start = d.toISOString().split('T')[0];
    }

    setFilters(prev => ({
      ...prev,
      datePreset: preset,
      startMonth: start,
      endMonth: end
    }));
  };

  const handleExportExcel = () => {
    if (!data.length) return;
    const exportData = data.map(row => ({
      ...row,
      month: formatMonthYear(row.month)
    }));
    const ws = xlsx.utils.json_to_sheet(exportData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Performance");
    xlsx.writeFile(wb, `CLI_${filters.cli}_Report.xlsx`);
  };

  const handleExportPDF = () => {
    if (!reportRef.current) return;
    const opt = {
      margin: 0.4,
      filename: `CLI_${filters.cli}_Performance_Report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(reportRef.current).save();
  };

  const selectedCliObj = clis.find(c => c.cli_id === filters.cli);
  const cliDisplayName = data[0]?.cli_name || selectedCliObj?.cli_name || 'Loco Inspector';

  return (
    <div className="min-h-screen relative text-slate-800 font-sans flex flex-col overflow-x-hidden">
      {/* Ambient Light Diffusion for Glassmorphism */}
      <RailwayBackground3D />

      {/* Flanking Context-Specific Railway Animations (Left & Right Margins) */}
      <RailwaySideLeft />
      <RailwaySideRight />

      {/* Top Navigation Bar with Frosted Glass */}
      <header className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Train size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">PRYJ CLI Performance</h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-emerald-200/80 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live DB Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Prayagraj Division • North Central Railway</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {data.length > 0 && (
              <>
                <button
                  onClick={handleExportExcel}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white/80 hover:bg-white border border-slate-300/80 rounded-lg transition-all shadow-2xs hover:shadow-xs"
                  title="Export to Excel"
                >
                  <Download size={14} />
                  <span>EXCEL</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-md shadow-blue-600/20"
                  title="Export PDF Report"
                >
                  <FileText size={14} />
                  <span>Export PDF</span>
                </button>
              </>
            )}

            <button
              onClick={() => setAdminOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100/80 hover:bg-white border border-slate-200/70 rounded-lg transition-all"
            >
              <Settings size={15} />
              <span className="hidden sm:inline">Admin Upload</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 relative z-10">
        {/* Glassmorphic Filter Ribbon Control Panel */}
        <div className="glass-panel rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* HQ Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin size={13} className="text-blue-600" /> Headquarters (HQ)
              </label>
              <select
                value={filters.hq}
                onChange={(e) => setFilters({ ...filters, hq: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all cursor-pointer"
              >
                <option value="">Select HQ...</option>
                {hqs.map(hq => (
                  <option key={hq} value={hq}>{hq}</option>
                ))}
              </select>
            </div>

            {/* Inspector Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User size={13} className="text-blue-600" /> Loco Inspector (CLI)
              </label>
              <select
                disabled={!filters.hq || clis.length === 0}
                value={filters.cli}
                onChange={(e) => setFilters({ ...filters, cli: e.target.value })}
                className="w-full glass-input disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all cursor-pointer"
              >
                <option value="">Select CLI...</option>
                {clis.map(c => (
                  <option key={c.cli_id} value={c.cli_id}>
                    {c.cli_id} — {c.cli_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Metric Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <BarChart3 size={13} className="text-blue-600" /> Metric
              </label>
              <select
                value={filters.metric}
                onChange={(e) => setFilters({ ...filters, metric: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all cursor-pointer"
              >
                <option value="">Select Metric...</option>
                {METRICS.map(m => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
                <option value="ALL">ALL METRICS (Multi-Chart)</option>
              </select>
            </div>

            {/* View & Chart Mode Controls */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Display View
              </label>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setViewMode('chart'); setFilters({ ...filters, chartType: 'line' }); }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${viewMode === 'chart' && filters.chartType === 'line'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                  title="Line Trend Chart"
                >
                  <LineChart size={14} /> Line
                </button>
                <button
                  type="button"
                  onClick={() => { setViewMode('chart'); setFilters({ ...filters, chartType: 'bar' }); }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${viewMode === 'chart' && filters.chartType === 'bar'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                  title="Bar Comparison Chart"
                >
                  <BarChart2 size={14} /> Bar
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${viewMode === 'table'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                  title="Detailed Data Table"
                >
                  <Table2 size={14} /> Ledger
                </button>
              </div>
            </div>
          </div>

          {/* Quick Date Presets */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar size={13} />
              <span className="font-semibold">Quick Timeframes:</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  onClick={() => handleDatePresetChange('all')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${filters.datePreset === 'all'
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  All Available
                </button>
                <button
                  onClick={() => handleDatePresetChange('12m')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${filters.datePreset === '12m'
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  Last 1 Year
                </button>
                <button
                  onClick={() => handleDatePresetChange('6m')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${filters.datePreset === '6m'
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  Last 6 Months
                </button>
              </div>
            </div>

            {data.length > 0 && (
              <span className="text-slate-500 text-xs">
                Loaded <strong className="text-slate-800">{data.length} months</strong> of performance records
              </span>
            )}
          </div>
        </div>

        {/* Dashboard Display Area */}
        {!filters.cli || data.length === 0 ? (
          <div className="glass-panel border-2 border-dashed border-slate-300/80 rounded-3xl p-12 text-center my-8 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-400/30 text-blue-600 mx-auto flex items-center justify-center mb-4 shadow-sm">
              <Train size={32} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Select an HQ and Inspector</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              Choose a Headquarters and Chief Loco Inspector (CLI) from the controls above to load analytical charts, compliance metrics, and safety audits.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50/90 border border-blue-200/80 px-4 py-2 rounded-full shadow-2xs">
              <span>Step 1: Choose HQ</span>
              <ArrowRight size={13} />
              <span>Step 2: Choose CLI ID</span>
              <ArrowRight size={13} />
              <span>Step 3: Analyze Trends</span>
            </div>
          </div>
        ) : (
          <div ref={reportRef} className="space-y-6">
            {/* Glassmorphic Inspector Profile Header Card */}
            <div className="glass-panel rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-600/30">
                  {cliDisplayName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">{cliDisplayName}</h2>
                    <span className="bg-blue-50/90 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200 shadow-2xs">
                      HQ: {data[0]?.cli_hq || filters.hq}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    Inspector ID: <strong className="text-slate-700">{filters.cli}</strong> • {data.length} Monthly Evaluations Recorded
                  </p>
                </div>
              </div>

              {/* Quick Summary Badges */}
              <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200/60">
                <button
                  onClick={handleExportExcel}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white/80 hover:bg-white border border-slate-200/90 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs"
                >
                  <Download size={14} /> Export CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
                >
                  <FileText size={14} /> PDF Report
                </button>
              </div>
            </div>

            {/* Executive KPI Summary Cards */}
            <KPICards data={data} />

            {/* Content View: Charts or Table */}
            {viewMode === 'table' ? (
              <DataTable
                data={data}
                cliInfo={{ cli_id: filters.cli, cli_name: cliDisplayName }}
              />
            ) : !filters.metric ? (
              <div className="glass-panel border-2 border-dashed border-slate-300/80 rounded-3xl p-10 text-center my-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 mx-auto flex items-center justify-center mb-3 shadow-xs">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Select a Performance Metric</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Choose a metric from the dropdown above to view the graphical trend, or select &quot;ALL METRICS&quot; to display all charts at once.
                </p>
              </div>
            ) : (
              <ChartViewer
                data={data}
                chartType={filters.chartType}
                selectedMetric={filters.metric}
              />
            )}
          </div>
        )}
      </main>

      {/* Admin Upload Modal */}
      <AdminModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onRefresh={fetchData}
      />
    </div>
  );
}