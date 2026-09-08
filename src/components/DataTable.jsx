import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Search, Download } from 'lucide-react';
import { formatMonthYear, formatMonthFull } from '../utils/dateUtils';
import * as xlsx from 'xlsx';

const formatHours = (val) => {
  const num = parseFloat(val);
  if (isNaN(num)) return '-';
  const hrs = Math.floor(num);
  const mins = Math.round((num - hrs) * 60);
  return `${hrs}h ${mins}m`;
};

export default function DataTable({ data, cliInfo }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('month');
  const [sortDirection, setSortDirection] = useState('desc');

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const formatted = formatMonthYear(row.month).toLowerCase();
      const full = formatMonthFull(row.month).toLowerCase();
      const raw = String(row.month || '').toLowerCase();
      const term = searchTerm.toLowerCase().trim();
      return formatted.includes(term) || full.includes(term) || raw.includes(term);
    });
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      aVal = parseFloat(aVal) || 0;
      bVal = parseFloat(bVal) || 0;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredData, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const exportTableToExcel = () => {
    const exportRows = sortedData.map(r => ({
      ...r,
      month_formatted: formatMonthYear(r.month)
    }));
    const ws = xlsx.utils.json_to_sheet(exportRows);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "MonthlyLedger");
    xlsx.writeFile(wb, `${cliInfo?.cli_id || 'CLI'}_Monthly_Ledger.xlsx`);
  };

  return (
    <div className="glass-panel rounded-3xl shadow-lg overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/40 backdrop-blur-md">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search month (e.g. Mar-26, 2026)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm glass-input rounded-lg outline-none transition-all text-slate-800"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs font-medium text-slate-500">
            Showing <strong className="text-slate-800">{sortedData.length}</strong> of {data.length} months
          </span>
          <button
            onClick={exportTableToExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white/80 hover:bg-white border border-slate-200/90 rounded-lg transition-all shadow-2xs hover:shadow-xs"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100/60 backdrop-blur-xs border-b border-slate-200/70 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th 
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/60 select-none transition-colors"
                onClick={() => handleSort('month')}
              >
                <div className="flex items-center gap-1">
                  Month <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/60 select-none transition-colors"
                onClick={() => handleSort('total_duty_hrs')}
              >
                <div className="flex items-center gap-1">
                  Duty Hrs <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/60 select-none transition-colors"
                onClick={() => handleSort('total_fp_hrs')}
              >
                <div className="flex items-center gap-1">
                  Total FP <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/60 select-none transition-colors"
                onClick={() => handleSort('night_fp_hrs')}
              >
                <div className="flex items-center gap-1">
                  Night FP <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/60 select-none transition-colors"
                onClick={() => handleSort('dfc_fp')}
              >
                <div className="flex items-center gap-1">
                  DFC FP <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/60 select-none transition-colors"
                onClick={() => handleSort('ambush_checks')}
              >
                <div className="flex items-center gap-1">
                  Ambush <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/60 select-none transition-colors"
                onClick={() => handleSort('abnormality_reported')}
              >
                <div className="flex items-center gap-1">
                  Abnormality <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4">Dues Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No records found matching the search criteria.
                </td>
              </tr>
            ) : (
              sortedData.map((row, idx) => {
                const totalDues = (row.grading_due || 0) + (row.counseling_due || 0) + (row.fp_due || 0);
                const monthDisplay = formatMonthYear(row.month);

                return (
                  <tr 
                    key={row.id || `${row.month}-${idx}`}
                    className="hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono tracking-tight">
                      <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md text-xs border border-slate-200">
                        {monthDisplay}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono text-xs">
                      {formatHours(row.total_duty_hrs)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-700 font-mono text-xs">
                      {formatHours(row.total_fp_hrs)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                      {formatHours(row.night_fp_hrs)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-emerald-700">
                      {formatHours(row.dfc_fp)} ({row.pct_dfc_fp || 0}%)
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {row.ambush_checks || 0}
                    </td>
                    <td className="py-3.5 px-4">
                      {row.abnormality_reported > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                          {row.abnormality_reported}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {totalDues > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800">
                          {totalDues} Due
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                          Cleared
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
