import React from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const METRICS = [
    { key: 'total_duty_hrs', label: 'Total Duty Hrs' }, { key: 'total_fp_hrs', label: 'Total FP Hrs' },
    { key: 'ambush_checks', label: 'Ambush Checks' }, { key: 'abnormality_reported', label: 'Abnormalities' },
    { key: 'dfc_fp', label: 'DFC FP' }, { key: 'leave_days', label: 'Leave Days' },
    { key: 'grading_due', label: 'Grading Due' }, { key: 'counseling_due', label: 'Counseling Due' }
    // Add rest of metrics here for brevity
];

const decimalToHoursStr = (decimal) => {
    const hrs = Math.floor(decimal);
    const mins = Math.round((decimal - hrs) * 60);
    return `${hrs}h ${mins}m`;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const val = payload[0].value;
        const key = payload[0].dataKey;
        const isTime = key.includes('hrs');
        return (
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
                <p className="text-slate-300 mb-1">{label}</p>
                <p className="text-cyan-400 font-bold text-lg">
                    {isTime ? decimalToHoursStr(val) : val}
                </p>
            </div>
        );
    }
    return null;
};

export default function ChartViewer({ data, chartType, selectedMetric }) {
    const metricsToRender = selectedMetric === 'ALL' ? METRICS : METRICS.filter(m => m.key === selectedMetric);

    return (
        <div className={`grid gap-6 ${selectedMetric === 'ALL' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {metricsToRender.map(metric => (
                <div key={metric.key} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 h-80 flex flex-col">
                    <h3 className="text-slate-300 font-semibold mb-4">{metric.label}</h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'line' ? (
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id={`color${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="month" stroke="#94a3b8" tickFormatter={str => str.substring(0,7)} />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey={metric.key} stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill={`url(#color${metric.key})`} />
                                </AreaChart>
                            ) : (
                                <BarChart data={data}>
                                     <defs>
                                        <linearGradient id={`bar${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#34d399" />
                                            <stop offset="100%" stopColor="#059669" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="month" stroke="#94a3b8" tickFormatter={str => str.substring(0,7)} />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey={metric.key} fill={`url(#bar${metric.key})`} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            ))}
        </div>
    );
}