import React, { useState, useEffect, useRef } from 'react';
import { getHQs, getCLIs, getPerformance } from './services/api';
import ChartViewer from './components/ChartViewer';
import AdminModal from './components/AdminModal';
import { Settings, Download, FileText, Activity } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import * as xlsx from 'xlsx';

export default function App() {
    const [hqs, setHqs] = useState([]);
    const [clis, setClis] = useState([]);
    const [data, setData] = useState([]);
    const [adminOpen, setAdminOpen] = useState(false);
    const reportRef = useRef();

    const [filters, setFilters] = useState({
        hq: '', cli: '', startMonth: '2023-01-01', endMonth: '2026-12-31', metric: 'ALL', chartType: 'line'
    });

    const fetchData = async () => {
        if (!filters.cli) return;
        try {
            const res = await getPerformance(filters.cli, filters.startMonth, filters.endMonth);
            
            // Force every metric column into a strict Javascript Number
            const parsedData = res.data.map(row => {
                const numericRow = { ...row };
                Object.keys(numericRow).forEach(key => {
                    // Ignore text/date columns
                    if (!['id', 'month', 'cli_id', 'cli_name', 'cli_hq'].includes(key)) {
                        // Force conversion and fallback to 0 if NaN
                        numericRow[key] = parseFloat(numericRow[key]) || 0;
                    }
                });
                return numericRow;
            });
            
            console.log("Chart Data Check:", parsedData); // Check your browser console!
            setData(parsedData);
        } catch (error) {
            console.error("Failed to fetch performance data:", error);
        }
    };

    useEffect(() => { getHQs().then(res => setHqs(res.data)); }, []);
    useEffect(() => { if (filters.hq) getCLIs(filters.hq).then(res => setClis(res.data)); }, [filters.hq]);
    useEffect(() => { fetchData(); }, [filters.cli, filters.startMonth, filters.endMonth]);

    const handleExportExcel = () => {
        const ws = xlsx.utils.json_to_sheet(data);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Performance");
        xlsx.writeFile(wb, `CLI_${filters.cli}_Report.xlsx`);
    };

    const handleExportPDF = () => {
        const opt = { margin: 0.5, filename: `CLI_${filters.cli}_Report.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' } };
        html2pdf().set(opt).from(reportRef.current).save();
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-cyan-900">
            {/* Navbar */}
            <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-3">
                    <Activity className="text-cyan-500" size={28} />
                    <h1 className="text-xl font-bold tracking-tight">PRYJ CLI Performance Dashboard</h1>
                </div>
                <button onClick={() => setAdminOpen(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-700 transition-colors">
                    <Settings size={18} /> <span className="hidden sm:inline">Admin</span>
                </button>
            </nav>

            <div className="p-6 max-w-[1600px] mx-auto">
                {/* Control Panel */}
                <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5 mb-8 flex flex-wrap gap-4 items-end backdrop-blur-sm">
                    <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                        <label className="text-xs font-semibold text-slate-400 uppercase">HQ</label>
                        <select className="bg-slate-900 border border-slate-600 rounded-lg p-2.5 outline-none focus:border-cyan-500" value={filters.hq} onChange={e => setFilters({...filters, hq: e.target.value})}>
                            <option value="">Select HQ...</option>
                            {hqs.map(hq => <option key={hq} value={hq}>{hq}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                        <label className="text-xs font-semibold text-slate-400 uppercase">Inspector</label>
                        <select className="bg-slate-900 border border-slate-600 rounded-lg p-2.5 outline-none focus:border-cyan-500" disabled={!filters.hq} value={filters.cli} onChange={e => setFilters({...filters, cli: e.target.value})}>
                            <option value="">Select CLI...</option>
                            {clis.map(c => <option key={c.cli_id} value={c.cli_id}>{c.cli_id} - {c.cli_name}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 min-w-[150px]">
                        <label className="text-xs font-semibold text-slate-400 uppercase">Metric</label>
                        <select className="bg-slate-900 border border-slate-600 rounded-lg p-2.5 outline-none focus:border-cyan-500" value={filters.metric} onChange={e => setFilters({...filters, metric: e.target.value})}>
                            <option value="ALL">ALL METRICS</option>
                            <option value="total_duty_hrs">Total Duty Hrs</option>
                            <option value="ambush_checks">Ambush Checks</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setFilters({...filters, chartType: 'line'})} className={`px-4 py-2.5 rounded-lg font-medium border ${filters.chartType === 'line' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>Line</button>
                        <button onClick={() => setFilters({...filters, chartType: 'bar'})} className={`px-4 py-2.5 rounded-lg font-medium border ${filters.chartType === 'bar' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>Bar</button>
                    </div>
                </div>

                {/* Dashboard Area */}
                {!filters.cli || data.length === 0 ? (
                    <div className="h-[60vh] flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
                        <Activity size={64} className="mb-4 opacity-20" />
                        <p className="text-xl font-medium">Please select an HQ and CLI ID to view performance data</p>
                    </div>
                ) : (
                    <div ref={reportRef} className="space-y-8">
                        {/* Header Banner */}
                        <div className="flex justify-between items-end bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700">
                            <div>
                                <span className="bg-cyan-900/50 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">HQ: {data[0]?.cli_hq}</span>
                                <h2 className="text-3xl font-bold">{data[0]?.cli_name}</h2>
                                <p className="text-slate-400 text-lg font-mono mt-1">ID: {data[0]?.cli_id}</p>
                            </div>
                            <div className="flex gap-3 print:hidden">
                                <button onClick={handleExportExcel} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 p-2.5 rounded-lg flex items-center gap-2"><Download size={18}/> CSV</button>
                                <button onClick={handleExportPDF} className="bg-cyan-600 hover:bg-cyan-500 p-2.5 rounded-lg flex items-center gap-2 font-medium"><FileText size={18}/> Export PDF</button>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <ChartViewer data={data} chartType={filters.chartType} selectedMetric={filters.metric} />
                    </div>
                )}
            </div>
            
            <AdminModal isOpen={adminOpen} onClose={() => setAdminOpen(false)} onRefresh={fetchData} />
        </div>
    );
}