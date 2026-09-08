import React from 'react';
import { Clock, ShieldCheck, AlertCircle, Train, Moon, Sun, Award, CheckCircle2 } from 'lucide-react';
import { formatMonthYear } from '../utils/dateUtils';

const formatHours = (decimal) => {
  if (!decimal || isNaN(decimal)) return "0h 0m";
  const hrs = Math.floor(decimal);
  const mins = Math.round((decimal - hrs) * 60);
  return `${hrs}h ${mins}m`;
};

export default function KPICards({ data }) {
  if (!data || data.length === 0) return null;

  // Aggregations
  const totalDuty = data.reduce((acc, r) => acc + (r.total_duty_hrs || 0), 0);
  const totalFP = data.reduce((acc, r) => acc + (r.total_fp_hrs || 0), 0);
  const nightFP = data.reduce((acc, r) => acc + (r.night_fp_hrs || 0), 0);
  const dayFP = Math.max(0, totalFP - nightFP);
  const fpRatio = totalDuty > 0 ? Math.round((totalFP / totalDuty) * 100) : 0;

  const totalDFC = data.reduce((acc, r) => acc + (r.dfc_fp || 0), 0);
  const avgPctDFC = data.length > 0
    ? Math.round(data.reduce((acc, r) => acc + (r.pct_dfc_fp || 0), 0) / data.length)
    : 0;

  const totalAmbush = data.reduce((acc, r) => acc + (r.ambush_checks || 0), 0);
  const totalIPAMS = data.reduce((acc, r) => acc + (r.ipams_ambush_check || 0), 0);
  const totalAbnormalities = data.reduce((acc, r) => acc + (r.abnormality_reported || 0), 0);

  // Latest dues (from the most recent month recorded)
  const latestRecord = data[data.length - 1] || {};
  const gradingDue = latestRecord.grading_due || 0;
  const counselingDue = latestRecord.counseling_due || 0;
  const fpDue = latestRecord.fp_due || 0;
  const dueLP = latestRecord.due_lp || 0;
  const dueALP = latestRecord.due_alp || 0;
  const totalDues = gradingDue + counselingDue + fpDue + dueLP + dueALP;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Footplate & Duty Hours */}
      <div className="glass-card rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Footplate Hours</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Clock size={18} />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{formatHours(totalFP)}</span>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            {fpRatio}% of Duty
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3">Total Duty: <span className="font-semibold text-slate-700">{formatHours(totalDuty)}</span></p>

        {/* Day vs Night micro breakdown */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <Sun size={13} className="text-amber-500" /> Day: {formatHours(dayFP)}
          </span>
          <span className="flex items-center gap-1">
            <Moon size={13} className="text-indigo-500" /> Night: {formatHours(nightFP)}
          </span>
        </div>
      </div>

      {/* Card 2: DFC Footplate Performance */}
      <div className="glass-card rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">DFC Performance</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Train size={18} />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{formatHours(totalDFC)}</span>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            ~{avgPctDFC}% avg
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3">Dedicated Freight Corridor Footplate</p>

        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>Target Adherence</span>
          <span className="font-medium text-emerald-600">{avgPctDFC >= 25 ? 'Optimal' : 'Standard'}</span>
        </div>
      </div>

      {/* Card 3: Safety & Ambush Checks */}
      <div className="glass-card rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Safety & Ambush</span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
            <ShieldCheck size={18} />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalAmbush}</span>
          <span className="text-xs font-medium text-slate-500">Checks</span>
        </div>
        <p className="text-xs text-slate-500 mb-3">IPAMS Ambush: <span className="font-semibold text-slate-700">{totalIPAMS}</span></p>

        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Abnormalities</span>
          <span className={`font-semibold ${totalAbnormalities > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
            {totalAbnormalities} logged
          </span>
        </div>
      </div>

      {/* Card 4: Compliance & Dues */}
      <div className="glass-card rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Dues</span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${totalDues > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {totalDues > 0 ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`text-2xl font-bold tracking-tight ${totalDues > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {totalDues}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${totalDues > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {totalDues > 0 ? 'Full Beat Due(LP+ALP)' : 'All Clear'}
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Latest status ({formatMonthYear(latestRecord.month)})
        </p>

        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>Grading: <strong className="text-slate-800">{gradingDue}</strong></span>
          <span>Counseling: <strong className="text-slate-800">{counselingDue}</strong></span>
          <span>FP: <strong className="text-slate-800">{fpDue}</strong></span>
        </div>
      </div>
    </div>
  );
}
