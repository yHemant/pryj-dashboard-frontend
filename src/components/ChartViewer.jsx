import React from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const METRICS = [
    { key: 'total_duty_hrs', label: 'Total Duty Hrs' },
    { key: 'total_fp_hrs', label: 'Total FP Hrs' },
    { key: 'night_duty_hrs', label: 'Night Duty Hrs' },
    { key: 'night_fp_hrs', label: 'Night FP Hrs' },
    { key: 'day_fp_freight', label: 'Day FP - Freight' },
    { key: 'day_fp_coaching', label: 'Day FP - Coaching' },
    { key: 'day_fp_other', label: 'Day FP - Other' },
    { key: 'night_fp_freight', label: 'Night FP - Freight' },
    { key: 'night_fp_coaching', label: 'Night FP - Coaching' },
    { key: 'night_fp_other', label: 'Night FP - Other' },
    { key: 'dfc_fp', label: 'DFC FP' },
    { key: 'pct_dfc_fp', label: '% of DFC FP' },
    { key: 'ambush_checks', label: 'Ambush Checks' },
    { key: 'ipams_ambush_check', label: 'IPAMS Ambush Check' },
    { key: 'leave_days', label: 'Leave Days' },
    { key: 'abnormality_reported', label: 'Abnormality Reported' },
    { key: 'grading_due', label: 'Grading Due' },
    { key: 'counseling_due', label: 'Counseling Due' },
    { key: 'fp_due', label: 'FP Due' },
    { key: 'full_beat_fp_due', label: 'Full Beat FP Due' },
    { key: 'lp_fp', label: 'LP Foot Plate (FP)' },
    { key: 'fp_detail_filled', label: 'FP Detail Filled' },
    { key: 'lp_attribute', label: 'LP Attribute' },
    { key: 'alp_attribute', label: 'ALP Attribute' },
    { key: 'due_lp', label: 'Due LP' },
    { key: 'due_alp', label: 'Due ALP' }
];

const decimalToHoursStr = (decimal) => {
    if (isNaN(decimal)) return "0h 0m";
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
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl z-50">
                <p className="text-slate-300 mb-1">{String(label).substring(0,7)}</p>
                <p className="text-cyan-400 font-bold text-lg">
                    {isTime ? decimalToHoursStr(val) : val}
                </p>
            </div>
        );
    }
    return null;
};

// Custom SVG component to render 3D bars
const Custom3DBar = (props) => {
    const { fill, x, y, width, height } = props;    
    const depth = 10; // Slightly deeper for more 3D feel

    // Prevent rendering artifacts for 0 values
    if (!height || height <= 0) return null;

    // Derive shades from the base fill
    // If fill is a hex like "#3b82f6", we can lighten/darken it.
    // For simplicity, we’ll use fixed overlays; you can replace with dynamic colors if needed.
    const topColor = "white";
    const sideColor = "rgba(0,0,0,0.25)";
    const frontHighlight = "rgba(255,255,255,0.15)";

    return (
        <g>
            {/* Top Face - lighter to simulate light from above */}
            <path
                d={`M${x},${y} 
                   L${x + depth},${y - depth} 
                   L${x + width + depth},${y - depth} 
                   L${x + width},${y} Z`}
                fill={fill}
                opacity={0.9}
            />
            <path
                d={`M${x},${y} 
                   L${x + depth},${y - depth} 
                   L${x + width + depth},${y - depth} 
                   L${x + width},${y} Z`}
                fill={topColor}
                opacity={0.35}
            />

            {/* Right Side Face - darker for depth */}
            <path
                d={`M${x + width},${y} 
                   L${x + width + depth},${y - depth} 
                   L${x + width + depth},${y + height - depth} 
                   L${x + width},${y + height} Z`}
                fill={fill}
                opacity={0.85}
            />
            <path
                d={`M${x + width},${y} 
                   L${x + width + depth},${y - depth} 
                   L${x + width + depth},${y + height - depth} 
                   L${x + width},${y + height} Z`}
                fill={sideColor}
                opacity={0.6}
            />

            {/* Front Face */}
            <rect x={x} y={y} width={width} height={height} fill={fill} />

            {/* Subtle front highlight (top edge) */}
            <rect
                x={x}
                y={y}
                width={width}
                height={Math.max(4, height * 0.08)}
                fill={frontHighlight}
            />

            {/* Optional thin border for crispness */}
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill="none"
                stroke="rgba(0,0,0,0.25)"
                strokeWidth={1}
            />
        </g>
    );
};

export default function ChartViewer({ data, chartType, selectedMetric }) {
    const metricsToRender = selectedMetric === 'ALL' ? METRICS : METRICS.filter(m => m.key === selectedMetric);
    const formatXAxis = (str) => str ? String(str).substring(0, 7) : '';

    return (
        <div className={`grid gap-6 ${selectedMetric === 'ALL' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {metricsToRender.map(metric => (
                <div key={metric.key} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
                    <h3 className="text-slate-300 font-semibold mb-6">{metric.label}</h3>
                    
                    <div style={{ width: '100%', height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'line' ? (
                                <AreaChart data={data} margin={{ top: 15, right: 20, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id={`color${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="month" stroke="#94a3b8" tickFormatter={formatXAxis} minTickGap={20} />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                    
                                    {/* Changed type from "monotone" to "linear" for straight lines */}
                                    <Area type="linear" dataKey={metric.key} stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill={`url(#color${metric.key})`} isAnimationActive={false} />
                                </AreaChart>
                            ) : (
                                <BarChart data={data} margin={{ top: 15, right: 30, left: -20, bottom: 0 }}>
                                     <defs>
                                        <linearGradient id={`bar${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#34d399" />
                                            <stop offset="100%" stopColor="#059669" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="month" stroke="#94a3b8" tickFormatter={formatXAxis} minTickGap={20} />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.4 }} />
                                    
                                    {/* Applied the custom 3D shape */}
                                    <Bar dataKey={metric.key} shape={<Custom3DBar />} fill={`url(#bar${metric.key})`} isAnimationActive={false} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            ))}
        </div>
    );
}