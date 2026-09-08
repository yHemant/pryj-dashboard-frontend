import React from 'react';
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    BarChart, 
    Bar, 
    Cell,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    LabelList 
} from 'recharts';
import { formatMonthYear, formatMonthFull, formatMetricLabel } from '../utils/dateUtils';

// Curated palette of 12 distinct, elegant, modern colors with smooth top-to-bottom gradients
export const BAR_PALETTES = [
    { id: 'blue', from: '#3b82f6', to: '#1d4ed8' },       // Royal Blue
    { id: 'emerald', from: '#10b981', to: '#047857' },    // Emerald Green
    { id: 'violet', from: '#8b5cf6', to: '#6d28d9' },     // Purple / Violet
    { id: 'amber', from: '#f59e0b', to: '#b45309' },      // Warm Amber
    { id: 'rose', from: '#f43f5e', to: '#be123c' },       // Rose / Coral
    { id: 'cyan', from: '#06b6d4', to: '#0e7490' },       // Deep Cyan
    { id: 'orange', from: '#f97316', to: '#c2410c' },     // Sunset Orange
    { id: 'indigo', from: '#6366f1', to: '#4338ca' },     // Rich Indigo
    { id: 'teal', from: '#14b8a6', to: '#0f766e' },       // Soft Teal
    { id: 'fuchsia', from: '#d946ef', to: '#a21caf' },    // Berry Fuchsia
    { id: 'sky', from: '#0ea5e9', to: '#0369a1' },        // Sky Cobalt
    { id: 'slate', from: '#64748b', to: '#334155' },      // Modern Slate Steel
];

export const METRICS = [
    { key: 'total_duty_hrs', label: 'Total Duty Hrs', category: 'Hours' },
    { key: 'total_fp_hrs', label: 'Total FP Hrs', category: 'Hours' },
    { key: 'night_duty_hrs', label: 'Night Duty Hrs', category: 'Hours' },
    { key: 'night_fp_hrs', label: 'Night FP Hrs', category: 'Hours' },
    { key: 'day_fp_freight', label: 'Day FP - Freight', category: 'Hours' },
    { key: 'day_fp_coaching', label: 'Day FP - Coaching', category: 'Hours' },
    { key: 'day_fp_other', label: 'Day FP - Other', category: 'Hours' },
    { key: 'night_fp_freight', label: 'Night FP - Freight', category: 'Hours' },
    { key: 'night_fp_coaching', label: 'Night FP - Coaching', category: 'Hours' },
    { key: 'night_fp_other', label: 'Night FP - Other', category: 'Hours' },
    { key: 'dfc_fp', label: 'DFC FP', category: 'Hours' },
    { key: 'pct_dfc_fp', label: '% of DFC FP', category: 'Percent' },
    { key: 'ambush_checks', label: 'Ambush Checks', category: 'Safety' },
    { key: 'ipams_ambush_check', label: 'IPAMS Ambush Check', category: 'Safety' },
    { key: 'leave_days', label: 'Leave Days', category: 'Count' },
    { key: 'abnormality_reported', label: 'Abnormality Reported', category: 'Safety' },
    { key: 'grading_due', label: 'Grading Due', category: 'Compliance' },
    { key: 'counseling_due', label: 'Counseling Due', category: 'Compliance' },
    { key: 'fp_due', label: 'FP Due', category: 'Compliance' },
    { key: 'full_beat_fp_due', label: 'Full Beat FP Due', category: 'Compliance' },
    { key: 'lp_fp', label: 'LP Foot Plate (FP)', category: 'Compliance' },
    { key: 'fp_detail_filled', label: 'FP Detail Filled', category: 'Compliance' },
    { key: 'lp_attribute', label: 'LP Attribute', category: 'Compliance' },
    { key: 'alp_attribute', label: 'ALP Attribute', category: 'Compliance' },
    { key: 'due_lp', label: 'Due LP', category: 'Compliance' },
    { key: 'due_alp', label: 'Due ALP', category: 'Compliance' }
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
        const isTime = key.includes('hrs') || key === 'dfc_fp';
        const isPct = key.includes('pct');
        
        let displayVal = val;
        if (isTime) displayVal = decimalToHoursStr(val);
        else if (isPct) displayVal = `${val}%`;

        return (
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-xl shadow-xl z-50 min-w-[150px]">
                <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                        {formatMonthYear(label)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                        {formatMonthFull(label)}
                    </span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-extrabold text-slate-900 tracking-tight font-mono">
                        {displayVal}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

/**
 * Custom X-Axis Tick:
 * Automatically renders horizontally if space allows, or vertically (-90deg) if data points are crowded.
 */
const CustomXAxisTick = ({ x, y, payload, shouldRotate }) => {
    if (!payload || payload.value === undefined) return null;
    const text = formatMonthYear(payload.value);

    if (shouldRotate) {
        return (
            <g transform={`translate(${x},${y + 4})`}>
                <text
                    x={0}
                    y={0}
                    dx={-6}
                    dy={3}
                    textAnchor="end"
                    transform="rotate(-90)"
                    fill="#475569"
                    fontSize={11}
                    fontWeight={600}
                >
                    {text}
                </text>
            </g>
        );
    }

    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={14}
                textAnchor="middle"
                fill="#475569"
                fontSize={11}
                fontWeight={600}
            >
                {text}
            </text>
        </g>
    );
};

/**
 * Modern UI Floating Data Point Value Label
 */
const ModernDataLabel = ({ x, y, value, metricKey, isBar = false }) => {
    if (value === undefined || value === null) return null;
    const formatted = formatMetricLabel(value, metricKey);
    if (!formatted) return null;

    // Approximate width based on character count
    const badgeWidth = Math.max(26, formatted.length * 7 + 10);
    const offsetY = isBar ? y - 10 : y - 12;

    return (
        <g transform={`translate(${x},${offsetY})`}>
            {/* Pill background badge */}
            <rect
                x={-badgeWidth / 2}
                y={-8}
                width={badgeWidth}
                height={16}
                rx={4}
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth={1}
                className="filter drop-shadow-xs"
            />
            {/* Label text */}
            <text
                x={0}
                y={3}
                textAnchor="middle"
                fill="#1e3a8a"
                fontSize={10}
                fontWeight={700}
            >
                {formatted}
            </text>
        </g>
    );
};

export default function ChartViewer({ data, chartType = 'bar', selectedMetric }) {
    const metricsToRender = selectedMetric === 'ALL' ? METRICS : METRICS.filter(m => m.key === selectedMetric);
    if (!metricsToRender.length) return null;
    
    // Space condition: If points > 7 (or > 5 in multi-chart grid), switch tick alignment from horizontal to vertical
    const shouldRotateTicks = data.length > (selectedMetric === 'ALL' ? 5 : 7);
    const xAxisHeight = shouldRotateTicks ? 56 : 30;

    return (
        <div className={`grid gap-5 ${selectedMetric === 'ALL' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {metricsToRender.map(metric => {
                const isTime = metric.key.includes('hrs') || metric.key === 'dfc_fp';
                const isPct = metric.key.includes('pct');

                return (
                    <div 
                        key={metric.key} 
                        className="glass-card rounded-3xl p-5 shadow-sm hover:shadow-xl"
                    >
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 tracking-tight">{metric.label}</h3>
                                <p className="text-xs text-slate-400">Monthly Performance Trend</p>
                            </div>
                            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                                {isTime ? 'Hours' : isPct ? 'Percentage' : 'Count'}
                            </span>
                        </div>
                        
                        {/* Chart Area */}
                        <div style={{ width: '100%', height: selectedMetric === 'ALL' ? '270px' : '360px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === 'line' ? (
                                    <AreaChart 
                                        data={data} 
                                        margin={{ top: 28, right: 20, left: -20, bottom: shouldRotateTicks ? 10 : 0 }}
                                    >
                                        <defs>
                                            <linearGradient id={`gradient-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis 
                                            dataKey="month" 
                                            interval={0}
                                            height={xAxisHeight}
                                            tick={<CustomXAxisTick shouldRotate={shouldRotateTicks} />}
                                            tickLine={false}
                                            axisLine={{ stroke: '#e2e8f0' }}
                                        />
                                        <YAxis 
                                            stroke="#94a3b8" 
                                            tick={{ fill: '#64748b', fontSize: 11 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip 
                                            content={<CustomTooltip />} 
                                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} 
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey={metric.key} 
                                            stroke="#2563eb" 
                                            strokeWidth={2.5} 
                                            fill={`url(#gradient-${metric.key})`} 
                                            dot={{ r: 4, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                                            activeDot={{ r: 6, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
                                            isAnimationActive={true}
                                            animationDuration={500}
                                        >
                                            <LabelList 
                                                dataKey={metric.key} 
                                                content={<ModernDataLabel metricKey={metric.key} isBar={false} />} 
                                            />
                                        </Area>
                                    </AreaChart>
                                ) : (
                                    <BarChart 
                                        data={data} 
                                        margin={{ top: 28, right: 20, left: -20, bottom: shouldRotateTicks ? 10 : 0 }}
                                    >
                                        <defs>
                                            {BAR_PALETTES.map((p, idx) => (
                                                <linearGradient key={p.id} id={`barGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={p.from} />
                                                    <stop offset="100%" stopColor={p.to} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis 
                                            dataKey="month" 
                                            interval={0}
                                            height={xAxisHeight}
                                            tick={<CustomXAxisTick shouldRotate={shouldRotateTicks} />}
                                            tickLine={false}
                                            axisLine={{ stroke: '#e2e8f0' }}
                                        />
                                        <YAxis 
                                            stroke="#94a3b8" 
                                            tick={{ fill: '#64748b', fontSize: 11 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip 
                                            content={<CustomTooltip />} 
                                            cursor={{ fill: '#f8fafc', opacity: 0.8 }} 
                                        />
                                        <Bar 
                                            dataKey={metric.key} 
                                            radius={[6, 6, 0, 0]}
                                            isAnimationActive={true}
                                            animationDuration={500}
                                        >
                                            {data.map((entry, index) => {
                                                const paletteIndex = index % BAR_PALETTES.length;
                                                return (
                                                    <Cell 
                                                        key={`cell-${metric.key}-${index}`} 
                                                        fill={`url(#barGrad-${paletteIndex})`} 
                                                    />
                                                );
                                            })}
                                            <LabelList 
                                                dataKey={metric.key} 
                                                content={<ModernDataLabel metricKey={metric.key} isBar={true} />} 
                                            />
                                        </Bar>
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}