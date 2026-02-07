'use client';

import { useMultiLayerData } from '@/lib/hooks/useMultiLayerData';
import type {
    ActionEvent,
    EnergyReading,
    LayerConfig,
    ProductMetric,
    SensorReading,
    TimeGranularity,
} from '@/lib/types/timeline';
import {
    Activity,
    AlertTriangle,
    Bot,
    Camera,
    Clock,
    Maximize2,
    Minimize2,
    Package,
    User,
    Zap,
} from 'lucide-react';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
    Area,
    CartesianGrid,
    ComposedChart,
    Line,
    ReferenceArea,
    ReferenceLine,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const ACTION_CATEGORIES = [
    'Compliance',
    'Inspection',
    'Preventive',
    'Optimization',
    'Alert',
    'Corrective',
] as const;

const categoryToY: Record<string, number> = {
    Compliance: 0,
    Inspection: 1,
    Preventive: 2,
    Optimization: 3,
    Alert: 4,
    Corrective: 5,
};

// ─── FORMAT UTILS ───────────────────────────────────────────────────────────
function formatTimestamp(ts: number, granularity: TimeGranularity): string {
    const d = new Date(ts);
    switch (granularity) {
        case 'Minute':
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        case 'Hour':
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        case 'Day':
            return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        case 'Week':
            return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        case 'Year':
            return d.toLocaleDateString([], { month: 'short', year: '2-digit' });
    }
}

function formatNumber(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toFixed(1);
}

// ─── NORMALIZATION UTILITY ──────────────────────────────────────────────────
// Normalize sensor values to 0-100 for display while keeping raw values
function normalizeForDisplay(
    value: number,
    sensorType: 'vibration' | 'temperature' | 'pressure' | 'humidity'
): number {
    const ranges: Record<string, [number, number]> = {
        vibration: [2, 15],      // mm/s
        temperature: [20, 55],   // °C
        pressure: [4, 8],        // bar
        humidity: [40, 75],      // % RH
    };
    const [min, max] = ranges[sensorType];
    return ((value - min) / (max - min)) * 100;
}

// ─── PREDICTION ZONE PROPS ──────────────────────────────────────────────────
interface ForecastZoneProps {
    forecastBoundary: number | null;
    lastTimestamp: number | null;
    firstTimestamp: number | null; // For X-axis domain synchronization
}

// ─── CUSTOM TOOLTIPS ────────────────────────────────────────────────────────
const SensorTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload as SensorReading;
    if (!d) return null;

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-xs">
            <p className="text-slate-400 mb-1">
                {new Date(d.timestamp).toLocaleString()}
            </p>

            {/* Vibration */}
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                <span className="text-slate-300">Vibration:</span>
                <span className={`font-semibold ${d.vibration > 12 ? 'text-red-400' :
                    d.vibration > 8 ? 'text-amber-400' :
                        'text-white'
                    }`}>
                    {d.vibration.toFixed(1)} mm/s
                </span>
            </div>

            {/* Temperature */}
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span className="text-slate-300">Temperature:</span>
                <span className={`font-semibold ${d.temperature > 50 ? 'text-red-400' :
                    d.temperature > 45 ? 'text-amber-400' :
                        'text-white'
                    }`}>
                    {d.temperature.toFixed(1)}°C
                </span>
            </div>

            {/* Humidity */}
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                <span className="text-slate-300">Humidity:</span>
                <span className={`font-semibold ${d.humidity > 70 ? 'text-red-400' :
                    d.humidity > 65 ? 'text-amber-400' :
                        'text-white'
                    }`}>
                    {d.humidity.toFixed(1)}%
                </span>
            </div>

            {/* Pressure */}
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
                <span className="text-slate-300">Pressure:</span>
                <span className={`font-semibold ${d.pressure < 4 ? 'text-red-400' :
                    d.pressure < 5.5 ? 'text-amber-400' :
                        'text-white'
                    }`}>
                    {d.pressure.toFixed(1)} bar
                </span>
            </div>

            {d.videoFrame && (
                <div className="flex items-center gap-2 mt-1">
                    <Camera size={10} className="text-slate-400" />
                    <span className="text-slate-300">{d.videoFrame.zone}</span>
                    {d.videoFrame.hasMotion && (
                        <span className="text-emerald-400 text-[10px]">Motion</span>
                    )}
                </div>
            )}

            {d.anomaly && (
                <div className="flex items-center gap-1 mt-1 text-amber-400">
                    <AlertTriangle size={10} /> <span>Anomaly detected</span>
                </div>
            )}
        </div>
    );
};

const EnergyTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload as EnergyReading;
    if (!d) return null;
    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-xs z-50">
            <p className="text-slate-400 mb-1">
                {new Date(d.timestamp).toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                <span className="text-slate-300">Power:</span>
                <span className="text-white font-semibold">{d.powerDraw} kW</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                <span className="text-slate-300">Cooling:</span>
                <span className="text-white font-semibold">{d.coolingLoad.toFixed(0)} kW</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-300 inline-block" />
                <span className="text-slate-300">Efficiency:</span>
                <span className="text-white font-semibold">{d.efficiency.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2">
                <Zap size={8} className="text-yellow-400" />
                <span className="text-slate-300">Cost/Hour:</span>
                <span className="text-yellow-400 font-semibold">{d.costPerHour.toFixed(2)} AED</span>
            </div>
            {d.predicted && (
                <div className="text-blue-400 mt-1 text-[10px]">
                    ↗ Predicted: {d.predicted} kW
                </div>
            )}
        </div>
    );
};

const ActionTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d?.actions?.length) return null;

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-xs max-w-xs">
            <p className="text-slate-400 mb-1">
                {new Date(d.timestamp).toLocaleString()}
            </p>
            {d.actions.map((a: ActionEvent, i: number) => (
                <div key={i} className="mb-1 last:mb-0">
                    <div className="flex items-center gap-1.5">
                        {/* Single icon based on isAI, single color always indigo */}
                        {a.isAI ? (
                            <Bot size={12} className="text-indigo-400 shrink-0" />
                        ) : (
                            <User size={12} className="text-indigo-400 shrink-0" />
                        )}
                        <span className="text-white font-semibold truncate">{a.title}</span>
                    </div>
                    <span className="text-slate-500 ml-3">
                        {a.source} · {a.category}
                    </span>
                </div>
            ))}
        </div>
    );
};

const ProductTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload as ProductMetric;
    if (!d) return null;
    const diff = d.output - d.target;
    const isAbove = diff >= 0;
    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-xs z-50">
            <p className="text-slate-400 mb-1">
                {new Date(d.timestamp).toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
                <span className="text-slate-300">Output:</span>
                <span className="text-white font-semibold">{formatNumber(d.output)}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                <span className="text-slate-300">Target:</span>
                <span className="text-slate-400">{formatNumber(d.target)}</span>
            </div>
            <div className={`mt-1 ${isAbove ? 'text-emerald-400' : 'text-red-400'}`}>
                {isAbove ? '▲' : '▼'}{' '}
                {Math.abs((diff / d.target) * 100).toFixed(1)}% {isAbove ? 'above' : 'below'}{' '}
                target
            </div>
            <div className="text-slate-400">Uptime: {d.uptime.toFixed(1)}%</div>
        </div>
    );
};

// ─── VIDEO FRAME STRIP ──────────────────────────────────────────────────────
function VideoFrameStrip({ data, granularity }: { data: SensorReading[]; granularity: TimeGranularity }) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // For large time spans (Week, Year), cluster frames into groups for visibility
    const shouldCluster = granularity === 'Week' || granularity === 'Year';

    let displayData = data;
    if (shouldCluster) {
        // Reduce data points: every 2nd point for Week, every 4th for Year
        const step = granularity === 'Year' ? 4 : 2;
        displayData = data.filter((_, i) => i % step === 0);
    }

    return (
        <div className="flex items-stretch" style={{ marginLeft: 40, marginRight: 20, gap: 2 }}>
            {/* CAM label */}
            <div className="flex items-center justify-center shrink-0 pr-2">
                <Camera size={12} className="text-slate-400 mr-1" />
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                    CAM
                </span>
            </div>

            {/* Frame strip */}
            <div className="flex flex-1 overflow-hidden relative gap-0.5">
                {displayData.map((reading, idx) => {
                    const frame = reading.videoFrame;
                    const bgColor = frame?.thumbnailColor ?? '#1e293b';
                    const hasMotion = frame?.hasMotion ?? false;
                    const isAnomaly = reading.anomaly;
                    const isHovered = hoveredIndex === idx;

                    return (
                        <div
                            key={idx}
                            className="relative shrink-0"
                            style={{
                                width: `${100 / displayData.length}%`,
                                minWidth: 12,      // ← Increased from 2 to 12px minimum
                                maxWidth: 32,      // ← Increased from 16 to 32px max
                                height: 48,        // ← Increased from 32 to 48px (taller)
                            }}
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div
                                className="w-full h-full transition-opacity rounded-sm"
                                style={{
                                    backgroundColor: bgColor,
                                    borderLeft: isAnomaly ? '2px solid #ef4444' : undefined,
                                    borderRight: isAnomaly ? '2px solid #ef4444' : undefined,
                                    opacity: frame ? 1 : 0.3,
                                }}
                            />

                            {/* Motion indicator */}
                            {hasMotion && (
                                <div
                                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400"
                                    style={{ boxShadow: '0 0 4px #34d399' }}
                                />
                            )}

                            {/* Hover tooltip */}
                            {isHovered && frame && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[9px] text-slate-300 whitespace-nowrap z-50 shadow-xl pointer-events-none">
                                    <div className="font-semibold text-white">{frame.zone}</div>
                                    <div>Frame #{frame.frameNumber}</div>
                                    {frame.hasMotion && <span className="text-emerald-400">Motion</span>}
                                    {isAnomaly && <span className="text-red-400 block">Anomaly</span>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── LAYER COMPONENTS ───────────────────────────────────────────────────────
function SensorLayer({
    data,
    granularity,
    expanded,
    predictionStart,
    visibleSensors,
}: {
    data: SensorReading[];
    granularity: TimeGranularity;
    expanded: boolean;
    predictionStart: number;
    visibleSensors: Record<string, boolean>;
}) {
    const height = expanded ? 300 : 100;

    // Split data into historical and forecast at predictionStart
    const historicalData = useMemo(() => {
        return data.slice(0, predictionStart).map(sensor => ({
            ...sensor,
            vibration_norm: normalizeForDisplay(sensor.vibration, 'vibration'),
            temperature_norm: normalizeForDisplay(sensor.temperature, 'temperature'),
            pressure_norm: normalizeForDisplay(sensor.pressure, 'pressure'),
            humidity_norm: normalizeForDisplay(sensor.humidity, 'humidity'),
        }));
    }, [data, predictionStart]);

    const forecastData = useMemo(() => {
        return data.slice(predictionStart).map(sensor => ({
            ...sensor,
            vibration_norm: normalizeForDisplay(sensor.vibration, 'vibration'),
            temperature_norm: normalizeForDisplay(sensor.temperature, 'temperature'),
            pressure_norm: normalizeForDisplay(sensor.pressure, 'pressure'),
            humidity_norm: normalizeForDisplay(sensor.humidity, 'humidity'),
        }));
    }, [data, predictionStart]);

    // Anomaly points for historical data
    const anomalyPoints = useMemo(() => historicalData.filter((d) => d.anomaly), [historicalData]);
    const forecastAnomalyPoints = useMemo(() => forecastData.filter((d) => d.anomaly), [forecastData]);

    // Shared Y-axis domain
    const yDomain: [number, number] = [0, 100];

    return (
        <div>
            <div className="flex w-full">
                {/* Historical Chart - 80% */}
                <div className="w-[80%]">
                    <ResponsiveContainer width="100%" height={height}>
                        <ComposedChart
                            data={historicalData}
                            margin={{ top: 5, right: 0, bottom: 0, left: 0 }}
                            syncId="sensor-layer"
                        >
                            <CartesianGrid strokeDasharray="2 4" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={(v) => formatTimestamp(v, granularity)}
                                tick={{ fontSize: 9, fill: '#71717a' }}
                                axisLine={{ stroke: '#d1d5db' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 9, fill: '#71717a' }}
                                axisLine={false}
                                tickLine={false}
                                domain={yDomain}
                                width={40}
                                label={{ value: 'Norm', angle: -90, position: 'insideLeft', offset: -5, fontSize: 8 }}
                            />
                            <Tooltip content={<SensorTooltip />} wrapperStyle={{ zIndex: 50 }} />

                            {/* Vibration threshold reference lines (expanded only) */}
                            {expanded && (
                                <ReferenceLine
                                    y={normalizeForDisplay(8, 'vibration')}
                                    stroke="#f59e0b"
                                    strokeDasharray="6 3"
                                    strokeWidth={1}
                                    label={{ value: 'Vib Warning', position: 'right', fontSize: 8, fill: '#f59e0b' }}
                                />
                            )}
                            {expanded && (
                                <ReferenceLine
                                    y={normalizeForDisplay(15, 'vibration')}
                                    stroke="#ef4444"
                                    strokeDasharray="6 3"
                                    strokeWidth={1}
                                    label={{ value: 'Vib Critical', position: 'right', fontSize: 8, fill: '#ef4444' }}
                                />
                            )}

                            {/* Pressure Area */}
                            {visibleSensors.pressure && (
                                <Area type="monotone" dataKey="pressure_norm" fill="#06b6d422" stroke="none" />
                            )}
                            {/* Temperature line - solid */}
                            {visibleSensors.temperature && (
                                <Line type="monotone" dataKey="temperature_norm" stroke="#34d399" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: '#34d399' }} />
                            )}
                            {/* Vibration line - solid */}
                            {visibleSensors.vibration && (
                                <Line type="monotone" dataKey="vibration_norm" stroke="#f97316" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: '#f97316' }} />
                            )}
                            {/* Humidity line - solid */}
                            {visibleSensors.humidity && (
                                <Line type="monotone" dataKey="humidity_norm" stroke="#60a5fa" strokeWidth={1} dot={false} />
                            )}
                            {/* Pressure line */}
                            {visibleSensors.pressure && (
                                <Line type="monotone" dataKey="pressure_norm" stroke="#8b5cf6" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: '#8b5cf6' }} />
                            )}
                            {/* Anomaly scatter */}
                            {anomalyPoints.length > 0 && (
                                <Scatter
                                    data={anomalyPoints}
                                    dataKey="vibration_norm"
                                    fill="#f59e0b"
                                    shape={(props: any) => (
                                        <circle
                                            cx={props.cx}
                                            cy={props.cy}
                                            r={6}
                                            fill={props.payload.alertLevel === 'critical' ? '#ef4444' : '#f59e0b'}
                                            stroke="#18181b"
                                            strokeWidth={2}
                                        />
                                    )}
                                />
                            )}
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Dashed separator */}
                <div className="w-[2px] bg-indigo-400 relative">
                    <div className="absolute inset-0 border-l-2 border-dashed border-indigo-500" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[8px] px-1 py-0.5 rounded font-bold whitespace-nowrap">
                        NOW
                    </div>
                </div>

                {/* Forecast Chart - 20% */}
                <div className="w-[20%]">
                    <ResponsiveContainer width="100%" height={height}>
                        <ComposedChart
                            data={forecastData}
                            margin={{ top: 5, right: 20, bottom: 0, left: 0 }}
                            syncId="sensor-layer"
                        >
                            <CartesianGrid strokeDasharray="2 4" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={(v) => formatTimestamp(v, granularity)}
                                tick={{ fontSize: 9, fill: '#71717a' }}
                                axisLine={{ stroke: '#d1d5db' }}
                                tickLine={false}
                            />
                            {/* Hidden Y-axis but with same domain for alignment */}
                            <YAxis
                                tick={false}
                                axisLine={false}
                                tickLine={false}
                                domain={yDomain}
                                width={0}
                            />
                            <Tooltip content={<SensorTooltip />} wrapperStyle={{ zIndex: 50 }} />

                            {/* FORECAST label */}
                            <ReferenceArea
                                x1={forecastData[0]?.timestamp}
                                x2={forecastData[forecastData.length - 1]?.timestamp}
                                fill="#6366f115"
                                label={{ value: 'FORECAST', position: 'insideTopRight', fontSize: 10, fill: '#6366f1', fontWeight: 'bold' }}
                            />

                            {/* Pressure Area - forecast */}
                            {visibleSensors.pressure && (
                                <Area type="monotone" dataKey="pressure_norm" fill="#06b6d415" stroke="none" />
                            )}
                            {/* Temperature line - dashed for forecast */}
                            {visibleSensors.temperature && (
                                <Line type="monotone" dataKey="temperature_norm" stroke="#34d399" strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
                            )}
                            {/* Vibration line - dashed for forecast */}
                            {visibleSensors.vibration && (
                                <Line type="monotone" dataKey="vibration_norm" stroke="#f97316" strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
                            )}
                            {/* Humidity line - dashed for forecast */}
                            {visibleSensors.humidity && (
                                <Line type="monotone" dataKey="humidity_norm" stroke="#60a5fa" strokeWidth={1} dot={false} strokeDasharray="4 2" />
                            )}
                            {/* Pressure line - dashed */}
                            {visibleSensors.pressure && (
                                <Line type="monotone" dataKey="pressure_norm" stroke="#8b5cf6" strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
                            )}
                            {/* Anomaly scatter - forecast */}
                            {forecastAnomalyPoints.length > 0 && (
                                <Scatter
                                    data={forecastAnomalyPoints}
                                    dataKey="vibration_norm"
                                    fill="#f59e0b"
                                    shape={(props: any) => (
                                        <circle
                                            cx={props.cx}
                                            cy={props.cy}
                                            r={5}
                                            fill={props.payload.alertLevel === 'critical' ? '#ef4444' : '#f59e0b'}
                                            stroke="#18181b"
                                            strokeWidth={1}
                                            opacity={0.7}
                                        />
                                    )}
                                />
                            )}
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
            {/* Video Frame Strip — below the chart, controlled by filter */}
            {visibleSensors.camera && <VideoFrameStrip data={data} granularity={granularity} />}
        </div>
    );
}

function EnergyLayer({
    data,
    granularity,
    expanded,
    predictionStart,
}: {
    data: EnergyReading[];
    granularity: TimeGranularity;
    expanded: boolean;
    predictionStart: number;
}) {
    const height = expanded ? 300 : 100;

    // Split data into historical and forecast
    const historicalData = useMemo(() => data.slice(0, predictionStart), [data, predictionStart]);
    const forecastData = useMemo(() => data.slice(predictionStart), [data, predictionStart]);

    // Calculate shared Y-axis domain
    const yDomain = useMemo(() => {
        const allPower = data.map(d => d.powerDraw);
        const maxVal = Math.max(...allPower);
        return [0, Math.ceil(maxVal * 1.2)];
    }, [data]);

    return (
        <div className="flex w-full">
            {/* Historical Chart - 80% */}
            <div className="w-[80%]">
                <ResponsiveContainer width="100%" height={height}>
                    <ComposedChart
                        data={historicalData}
                        margin={{ top: 5, right: 0, bottom: 0, left: 0 }}
                        syncId="energy-layer"
                    >
                        <CartesianGrid strokeDasharray="2 4" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={(v) => formatTimestamp(v, granularity)}
                            tick={{ fontSize: 9, fill: '#71717a' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 9, fill: '#71717a' }}
                            axisLine={false}
                            tickLine={false}
                            width={40}
                            domain={yDomain}
                        />
                        <Tooltip content={<EnergyTooltip />} wrapperStyle={{ zIndex: 50 }} />
                        {/* Power draw line - solid */}
                        <Line type="monotone" dataKey="powerDraw" stroke="#fbbf24" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: '#fbbf24' }} />
                        {/* Cooling load (expanded only) */}
                        {expanded && (
                            <Line type="monotone" dataKey="coolingLoad" stroke="#fb923c" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Dashed separator */}
            <div className="w-[2px] bg-indigo-400 relative">
                <div className="absolute inset-0 border-l-2 border-dashed border-indigo-500" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[8px] px-1 py-0.5 rounded font-bold whitespace-nowrap">
                    NOW
                </div>
            </div>

            {/* Forecast Chart - 20% */}
            <div className="w-[20%]">
                <ResponsiveContainer width="100%" height={height}>
                    <ComposedChart
                        data={forecastData}
                        margin={{ top: 5, right: 20, bottom: 0, left: 0 }}
                        syncId="energy-layer"
                    >
                        <CartesianGrid strokeDasharray="2 4" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={(v) => formatTimestamp(v, granularity)}
                            tick={{ fontSize: 9, fill: '#71717a' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickLine={false}
                        />
                        {/* Hidden Y-axis with same domain */}
                        <YAxis tick={false} axisLine={false} tickLine={false} width={0} domain={yDomain} />
                        <Tooltip content={<EnergyTooltip />} wrapperStyle={{ zIndex: 50 }} />

                        {/* FORECAST label */}
                        <ReferenceArea
                            x1={forecastData[0]?.timestamp}
                            x2={forecastData[forecastData.length - 1]?.timestamp}
                            fill="#6366f115"
                            label={{ value: 'FORECAST', position: 'insideTopRight', fontSize: 10, fill: '#6366f1', fontWeight: 'bold' }}
                        />

                        {/* Confidence bands */}
                        <Area type="monotone" dataKey="upperBound" stroke="none" fill="#3b82f620" />
                        <Area type="monotone" dataKey="lowerBound" stroke="none" fill="#f3f4f6" />
                        {/* Predicted line - dashed */}
                        <Line type="monotone" dataKey="predicted" stroke="#818cf8" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
                        {/* Cooling load - dashed (expanded only) */}
                        {expanded && (
                            <Line type="monotone" dataKey="coolingLoad" stroke="#fb923c" strokeWidth={1} dot={false} strokeDasharray="4 2" />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function ActionsLayer({
    data,
    granularity,
    expanded,
    predictionStart,
}: {
    data: ActionEvent[];
    granularity: TimeGranularity;
    expanded: boolean;
    predictionStart: number;
}) {
    const height = expanded ? 250 : 120;

    // Split data by predictionStart index - get the timestamp at that boundary
    const boundaryTimestamp = useMemo(() => {
        if (data.length === 0) return Date.now();
        // Find the first action after predictionStart's corresponding timestamp
        // We'll use predictionStart as approximate - 80% of the data
        const idx = Math.floor(data.length * 0.8);
        return data[idx]?.timestamp ?? Date.now();
    }, [data]);

    const historicalData = useMemo(() =>
        data.filter(a => a.timestamp < boundaryTimestamp).map((a) => ({
            ...a,
            categoryY: categoryToY[a.category] ?? 0,
        })),
        [data, boundaryTimestamp]
    );

    const forecastData = useMemo(() =>
        data.filter(a => a.timestamp >= boundaryTimestamp).map((a) => ({
            ...a,
            categoryY: categoryToY[a.category] ?? 0,
        })),
        [data, boundaryTimestamp]
    );

    return (
        <div className="flex w-full">
            {/* Historical Scatter - 80% */}
            <div className="w-[80%]">
                <ResponsiveContainer width="100%" height={height}>
                    <ScatterChart
                        margin={{ top: 5, right: 0, bottom: 0, left: 0 }}
                        syncId="actions-layer"
                    >
                        <CartesianGrid strokeDasharray="2 4" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="timestamp"
                            type="number"
                            tickFormatter={(v) => formatTimestamp(v, granularity)}
                            tick={{ fontSize: 9, fill: '#71717a' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickLine={false}
                        />
                        <YAxis
                            type="number"
                            dataKey="categoryY"
                            domain={[-0.5, 5.5]}
                            ticks={[0, 1, 2, 3, 4, 5]}
                            tickFormatter={(v: number) => ACTION_CATEGORIES[v] ?? ''}
                            tick={{ fontSize: 8, fill: '#71717a' }}
                            axisLine={false}
                            tickLine={false}
                            width={75}
                        />
                        <Tooltip content={<ActionTooltip />} wrapperStyle={{ zIndex: 50 }} />
                        <Scatter
                            data={historicalData}
                            dataKey="categoryY"
                            shape={(props: any) => {
                                const event = props.payload as ActionEvent & { categoryY: number };
                                const color = '#6366f1';
                                if (event.isAI) {
                                    return (
                                        <polygon
                                            points={`${props.cx},${props.cy - 5} ${props.cx + 5},${props.cy} ${props.cx},${props.cy + 5} ${props.cx - 5},${props.cy}`}
                                            fill={color}
                                            stroke="#1e293b"
                                            strokeWidth={1}
                                        />
                                    );
                                }
                                return <circle cx={props.cx} cy={props.cy} r={5} fill={color} stroke="#1e293b" strokeWidth={1} />;
                            }}
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            {/* Dashed separator */}
            <div className="w-[2px] bg-indigo-400 relative">
                <div className="absolute inset-0 border-l-2 border-dashed border-indigo-500" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[8px] px-1 py-0.5 rounded font-bold whitespace-nowrap">
                    NOW
                </div>
            </div>

            {/* Forecast Scatter - 20% */}
            <div className="w-[20%]">
                <ResponsiveContainer width="100%" height={height}>
                    <ScatterChart
                        margin={{ top: 5, right: 20, bottom: 0, left: 0 }}
                        syncId="actions-layer"
                    >
                        <CartesianGrid strokeDasharray="2 4" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="timestamp"
                            type="number"
                            tickFormatter={(v) => formatTimestamp(v, granularity)}
                            tick={{ fontSize: 9, fill: '#71717a' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickLine={false}
                        />
                        {/* Hidden Y-axis */}
                        <YAxis
                            type="number"
                            dataKey="categoryY"
                            domain={[-0.5, 5.5]}
                            tick={false}
                            axisLine={false}
                            tickLine={false}
                            width={0}
                        />
                        <Tooltip content={<ActionTooltip />} wrapperStyle={{ zIndex: 50 }} />

                        {/* FORECAST label */}
                        {forecastData.length > 0 && (
                            <ReferenceArea
                                x1={forecastData[0]?.timestamp}
                                x2={forecastData[forecastData.length - 1]?.timestamp}
                                fill="#6366f115"
                            />
                        )}

                        <Scatter
                            data={forecastData}
                            dataKey="categoryY"
                            shape={(props: any) => {
                                const event = props.payload as ActionEvent & { categoryY: number };
                                const color = '#6366f1';
                                if (event.isAI) {
                                    return (
                                        <polygon
                                            points={`${props.cx},${props.cy - 4} ${props.cx + 4},${props.cy} ${props.cx},${props.cy + 4} ${props.cx - 4},${props.cy}`}
                                            fill={color}
                                            stroke="#1e293b"
                                            strokeWidth={1}
                                            opacity={0.6}
                                        />
                                    );
                                }
                                return <circle cx={props.cx} cy={props.cy} r={4} fill={color} stroke="#1e293b" strokeWidth={1} opacity={0.6} />;
                            }}
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function ProductLayer({
    data,
    granularity,
    expanded,
    predictionStart,
}: {
    data: ProductMetric[];
    granularity: TimeGranularity;
    expanded: boolean;
    predictionStart: number;
}) {
    const height = expanded ? 300 : 100;

    // Split data into historical and forecast
    const historicalData = useMemo(() => data.slice(0, predictionStart), [data, predictionStart]);
    const forecastData = useMemo(() => data.slice(predictionStart), [data, predictionStart]);

    // Calculate shared Y-axis domain from full dataset
    const yDomain = useMemo(() => {
        const allOutputs = data.map(d => d.output);
        const allTargets = data.map(d => d.target);
        const maxVal = Math.max(...allOutputs, ...allTargets);
        return [0, Math.ceil(maxVal * 1.1)];
    }, [data]);

    return (
        <div className="flex w-full">
            {/* Historical Chart - 80% */}
            <div className="w-[80%]">
                <ResponsiveContainer width="100%" height={height}>
                    <ComposedChart
                        data={historicalData}
                        margin={{ top: 5, right: 0, bottom: 0, left: 0 }}
                        syncId="product-layer"
                    >
                        <CartesianGrid strokeDasharray="2 4" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={(v) => formatTimestamp(v, granularity)}
                            tick={{ fontSize: 9, fill: '#71717a' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 9, fill: '#71717a' }}
                            axisLine={false}
                            tickLine={false}
                            width={50}
                            domain={yDomain}
                            tickFormatter={formatNumber}
                        />
                        <Tooltip content={<ProductTooltip />} wrapperStyle={{ zIndex: 50 }} />
                        {/* Target area - solid */}
                        <Area type="monotone" dataKey="target" fill="#a78bfa15" stroke="#a78bfa" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                        {/* Output line - solid */}
                        <Line type="monotone" dataKey="output" stroke="#a78bfa" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: '#a78bfa' }} />
                        {/* Uptime (expanded only) */}
                        {expanded && (
                            <YAxis yAxisId={1} orientation="right" tick={{ fontSize: 9, fill: '#71717a' }} axisLine={false} tickLine={false} width={35} tickFormatter={(v: number) => v + '%'} />
                        )}
                        {expanded && (
                            <Line type="monotone" dataKey="uptime" stroke="#4ade80" strokeWidth={1} dot={false} strokeDasharray="2 2" yAxisId={1} />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Dashed separator */}
            <div className="w-[2px] bg-indigo-400 relative">
                <div className="absolute inset-0 border-l-2 border-dashed border-indigo-500" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[8px] px-1 py-0.5 rounded font-bold whitespace-nowrap">
                    NOW
                </div>
            </div>

            {/* Forecast Chart - 20% */}
            <div className="w-[20%]">
                <ResponsiveContainer width="100%" height={height}>
                    <ComposedChart
                        data={forecastData}
                        margin={{ top: 5, right: 20, bottom: 0, left: 0 }}
                        syncId="product-layer"
                    >
                        <CartesianGrid strokeDasharray="2 4" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={(v) => formatTimestamp(v, granularity)}
                            tick={{ fontSize: 9, fill: '#71717a' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickLine={false}
                        />
                        {/* Hidden Y-axis with same domain */}
                        <YAxis tick={false} axisLine={false} tickLine={false} width={0} domain={yDomain} />
                        <Tooltip content={<ProductTooltip />} wrapperStyle={{ zIndex: 50 }} />

                        {/* FORECAST label */}
                        <ReferenceArea
                            x1={forecastData[0]?.timestamp}
                            x2={forecastData[forecastData.length - 1]?.timestamp}
                            fill="#6366f115"
                            label={{ value: 'FORECAST', position: 'insideTopRight', fontSize: 10, fill: '#6366f1', fontWeight: 'bold' }}
                        />

                        {/* Target area - forecast (lighter) */}
                        <Area type="monotone" dataKey="target" fill="#a78bfa10" stroke="#a78bfa" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                        {/* Output line - dashed for forecast */}
                        <Line type="monotone" dataKey="output" stroke="#a78bfa" strokeWidth={2} dot={false} strokeDasharray="6 3" />
                        {/* Uptime - dashed (expanded only) */}
                        {expanded && (
                            <YAxis yAxisId={1} orientation="right" tick={false} axisLine={false} tickLine={false} width={0} />
                        )}
                        {expanded && (
                            <Line type="monotone" dataKey="uptime" stroke="#4ade80" strokeWidth={1} dot={false} strokeDasharray="4 2" yAxisId={1} />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── LAYER HEADER ───────────────────────────────────────────────────────────
function LayerHeader({
    config,
    expanded,
    onToggleExpand,
    stats,
}: {
    config: LayerConfig;
    expanded: boolean;
    onToggleExpand: () => void;
    stats?: ReactNode;
}) {
    return (
        <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer select-none group border-l-4"
            style={{ borderLeftColor: config.color }}
            onClick={onToggleExpand}
        >
            <div className="flex items-center gap-3">
                <span style={{ color: config.color }}>{config.icon}</span>
                <span
                    className="text-sm font-bold uppercase tracking-wide"
                    style={{ color: config.color }}
                >
                    {config.name}
                </span>
                <span className="text-xs text-slate-600 hidden sm:inline">
                    {config.description}
                </span>
            </div>
            <div className="flex items-center gap-3">
                {stats}
                <button className="p-1 rounded hover:bg-slate-200 text-slate-600 group-hover:text-slate-900 transition-colors">
                    {expanded ? (
                        <Minimize2 size={14} />
                    ) : (
                        <Maximize2 size={14} />
                    )}
                </button>
            </div>
        </div>
    );
}

// ─── LIVE INDICATOR ─────────────────────────────────────────────────────────
function LiveIndicator({ isStreaming }: { isStreaming: boolean }) {
    if (!isStreaming) return null;
    return (
        <div className="flex items-center gap-1.5 ml-3">
            <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
                LIVE
            </span>
        </div>
    );
}

// ─── SENSOR FILTER BAR ──────────────────────────────────────────────────────
function SensorFilterBar({
    visibleSensors,
    setVisibleSensors,
}: {
    visibleSensors: Record<string, boolean>;
    setVisibleSensors: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
    return (
        <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 border-b border-slate-100">
            {[
                { key: 'vibration', label: 'Vibration', color: '#f97316' },
                { key: 'camera', label: 'Camera', color: '#64748b' },
                { key: 'temperature', label: 'Temperature', color: '#34d399' },
                { key: 'humidity', label: 'Humidity', color: '#60a5fa' },
                { key: 'pressure', label: 'Pressure', color: '#8b5cf6' },
            ].map(({ key, label, color }) => (
                <label
                    key={key}
                    className="flex items-center gap-1.5 cursor-pointer text-xs select-none"
                    onClick={(e) => e.stopPropagation()}
                >
                    <input
                        type="checkbox"
                        checked={visibleSensors[key]}
                        onChange={() =>
                            setVisibleSensors((prev) => ({ ...prev, [key]: !prev[key] }))
                        }
                        className="w-3 h-3 rounded accent-current"
                        style={{ accentColor: color }}
                    />
                    <span className="w-2 h-0.5 inline-block" style={{ backgroundColor: color }} />
                    <span className={visibleSensors[key] ? 'text-slate-700' : 'text-slate-400'}>
                        {label}
                    </span>
                </label>
            ))}
        </div>
    );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export function MultiLayerTimeline() {
    const [granularity, setGranularity] = useState<TimeGranularity>('Day');
    const [expandedLayer, setExpandedLayer] = useState<string | null>(null);
    const [visibleSensors, setVisibleSensors] = useState<Record<string, boolean>>({
        vibration: true,
        camera: true,
        temperature: false,
        humidity: false,
        pressure: false,
    });

    const granularities: TimeGranularity[] = [
        'Minute',
        'Hour',
        'Day',
        'Week',
        'Year',
    ];

    const {
        timestamps,
        sensorData,
        energyData,
        actionData,
        productData,
        pointCount,
        predictionStart,
        isStreaming,
    } = useMultiLayerData(granularity);

    // Forecast zone boundaries — data-driven, not time-frozen
    // The boundary is the timestamp of the first energy point with prediction data
    const forecastBoundary = useMemo(() => {
        const firstPredicted = energyData.find(d => d.predicted !== undefined);
        return firstPredicted?.timestamp ?? null;
    }, [energyData]);
    const lastTimestamp = useMemo(
        () => (timestamps.length > 0 ? timestamps[timestamps.length - 1] : null),
        [timestamps]
    );
    const firstTimestamp = useMemo(
        () => (timestamps.length > 0 ? timestamps[0] : null),
        [timestamps]
    );

    const layers: LayerConfig[] = [
        {
            id: 'product',
            name: 'Product Output',
            icon: <Package size={14} />,
            color: '#a78bfa',
            accentColor: '#8b5cf6',
            bgGradient: 'from-violet-950/20',
            description: 'Primary output metric',
            visible: true,
        },
        {
            id: 'sensors',
            name: 'Sensors',
            icon: <Activity size={14} />,
            color: '#34d399',
            accentColor: '#10b981',
            bgGradient: 'from-emerald-950/20',
            description: 'Vibration · Camera',
            visible: true,
        },
        {
            id: 'energy',
            name: 'Energy',
            icon: <Zap size={14} />,
            color: '#fbbf24',
            accentColor: '#f59e0b',
            bgGradient: 'from-amber-950/20',
            description: 'Power · Cooling · Efficiency',
            visible: true,
        },
        {
            id: 'actions',
            name: 'Actions & Events',
            icon: <Clock size={14} />,
            color: '#38bdf8',
            accentColor: '#0ea5e9',
            bgGradient: 'from-sky-950/20',
            description: 'Maintenance · Compliance · AI',
            visible: true,
        },
    ];

    const handleToggleExpand = useCallback((layerId: string) => {
        setExpandedLayer((prev) => (prev === layerId ? null : layerId));
    }, []);

    // Live stats
    const latestSensor = sensorData[sensorData.length - 1];
    const latestEnergy = energyData[energyData.length - 1];
    const anomalyCount = sensorData.filter((s) => s.anomaly).length;
    const latestProduct = productData[productData.length - 1];

    // AI vs Human counts for action stats
    const aiCount = useMemo(
        () => actionData.filter((a) => a.isAI).length,
        [actionData]
    );
    const humanCount = useMemo(
        () => actionData.filter((a) => !a.isAI).length,
        [actionData]
    );

    return (
        <div className="w-full min-h-screen bg-white text-slate-900">
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <div
                                className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400' : 'bg-slate-400'
                                    }`}
                                style={
                                    isStreaming
                                        ? {
                                            animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                            boxShadow: '0 0 8px #34d399',
                                        }
                                        : undefined
                                }
                            />
                            Multi-Layer Timeline
                            <LiveIndicator isStreaming={isStreaming} />
                        </h1>
                        <p className="text-xs text-slate-600 mt-1 uppercase tracking-wide">
                            Zoom: {granularity} · {pointCount} data points · syncId: tripolar-timeline
                        </p>
                    </div>

                    {/* Granularity Selector */}
                    <div className="flex gap-2">
                        {granularities.map((g) => (
                            <button
                                key={g}
                                onClick={() => {
                                    setGranularity(g);
                                    setExpandedLayer(null);
                                }}
                                className={`px-3 py-2 text-sm font-medium rounded transition-all ${g === granularity
                                    ? 'bg-violet-600 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                                    }`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Layers */}
            <div className="divide-y divide-slate-200">
                {/* Product Layer */}
                <div
                    className={`transition-all duration-300 ${expandedLayer && expandedLayer !== 'product'
                        ? 'opacity-50 max-h-14 overflow-hidden'
                        : ''
                        }`}
                >
                    <LayerHeader
                        config={layers[0]}
                        expanded={expandedLayer === 'product'}
                        onToggleExpand={() => handleToggleExpand('product')}
                        stats={
                            <div className="flex items-center gap-4 text-xs">
                                <span className="text-violet-600 font-mono">
                                    {formatNumber(latestProduct.output)} units/min
                                </span>
                                <span
                                    className={`font-mono ${latestProduct.uptime >= 95
                                        ? 'text-emerald-600'
                                        : 'text-slate-500'
                                        }`}
                                >
                                    {latestProduct.uptime.toFixed(1)}% uptime
                                </span>
                            </div>
                        }
                    />
                    {(!expandedLayer || expandedLayer === 'product') && (
                        <div className="px-2">
                            <ProductLayer
                                data={productData}
                                granularity={granularity}
                                expanded={expandedLayer === 'product'}
                                predictionStart={predictionStart}
                            />
                        </div>
                    )}
                </div>

                {/* Sensor Layer */}
                <div
                    className={`transition-all duration-300 ${expandedLayer && expandedLayer !== 'sensors'
                        ? 'opacity-50 max-h-14 overflow-hidden'
                        : ''
                        }`}
                >
                    <LayerHeader
                        config={layers[1]}
                        expanded={expandedLayer === 'sensors'}
                        onToggleExpand={() => handleToggleExpand('sensors')}
                        stats={
                            <div className="flex items-center gap-4 text-xs">
                                <span className="text-emerald-600 font-mono">
                                    {latestSensor.temperature}°C
                                </span>
                                <span className={`font-mono ${latestSensor.pressure < 4 ? 'text-red-600' :
                                    latestSensor.pressure < 5.5 ? 'text-amber-600' :
                                        'text-slate-600'
                                    }`}>
                                    Press {latestSensor.pressure.toFixed(1)} bar
                                </span>
                                <span className="text-orange-600 font-mono">
                                    Vib {latestSensor.vibration.toFixed(1)} mm/s
                                </span>
                                {anomalyCount > 0 && (
                                    <span className="text-amber-600 flex items-center gap-1">
                                        <AlertTriangle size={12} /> {anomalyCount}
                                    </span>
                                )}
                            </div>
                        }
                    />
                    {(!expandedLayer || expandedLayer === 'sensors') && (
                        <>
                            {/* Sensor filter bar between header and chart */}
                            <SensorFilterBar
                                visibleSensors={visibleSensors}
                                setVisibleSensors={setVisibleSensors}
                            />
                            <div className="px-2">
                                <SensorLayer
                                    data={sensorData}
                                    granularity={granularity}
                                    expanded={expandedLayer === 'sensors'}
                                    predictionStart={predictionStart}
                                    visibleSensors={visibleSensors}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Energy Layer */}
                <div
                    className={`transition-all duration-300 ${expandedLayer && expandedLayer !== 'energy'
                        ? 'opacity-50 max-h-14 overflow-hidden'
                        : ''
                        }`}
                >
                    <LayerHeader
                        config={layers[2]}
                        expanded={expandedLayer === 'energy'}
                        onToggleExpand={() => handleToggleExpand('energy')}
                        stats={
                            <div className="flex items-center gap-4 text-xs">
                                <span className="text-amber-600 font-mono">
                                    {latestEnergy.powerDraw} kW
                                </span>
                                <span className="text-yellow-600 font-mono">
                                    {latestEnergy.efficiency.toFixed(1)}% eff
                                </span>
                                <span className="text-yellow-700 flex items-center gap-1">
                                    <Zap size={12} /> {latestEnergy.costPerHour.toFixed(2)} AED/h
                                </span>
                            </div>
                        }
                    />
                    {(!expandedLayer || expandedLayer === 'energy') && (
                        <div className="px-2">
                            <EnergyLayer
                                data={energyData}
                                granularity={granularity}
                                expanded={expandedLayer === 'energy'}
                                predictionStart={predictionStart}
                            />
                        </div>
                    )}
                </div>

                {/* Actions Layer */}
                <div
                    className={`transition-all duration-300 ${expandedLayer && expandedLayer !== 'actions'
                        ? 'opacity-50 max-h-14 overflow-hidden'
                        : ''
                        }`}
                >
                    <LayerHeader
                        config={layers[3]}
                        expanded={expandedLayer === 'actions'}
                        onToggleExpand={() => handleToggleExpand('actions')}
                        stats={
                            <div className="flex items-center gap-4 text-xs">
                                <span className="text-indigo-600 font-mono">
                                    {actionData.length} events
                                </span>
                                <span className="text-indigo-500 flex items-center gap-1 font-mono">
                                    <Bot size={10} /> {aiCount} AI
                                </span>
                                <span className="text-indigo-500 flex items-center gap-1 font-mono">
                                    <User size={10} /> {humanCount} Human
                                </span>
                            </div>
                        }
                    />
                    {(!expandedLayer || expandedLayer === 'actions') && (
                        <div className="px-2">
                            <ActionsLayer
                                data={actionData}
                                granularity={granularity}
                                expanded={expandedLayer === 'actions'}
                                predictionStart={predictionStart}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Legend */}
            <div className="border-t border-slate-200 px-6 py-3 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-6 text-xs text-slate-600 flex-wrap">
                    <span className="flex items-center gap-2">
                        <span className="w-6 h-px bg-orange-400 inline-block" /> Vibration
                    </span>
                    <span className="flex items-center gap-2">
                        <Camera size={10} className="text-slate-500" /> Camera
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-6 h-px bg-amber-400 inline-block" /> Power
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-6 h-px bg-violet-400 inline-block" /> Output
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-6 h-px bg-violet-500 inline-block" /> Pressure
                    </span>
                    <span className="flex items-center gap-2">
                        <span
                            className="w-6 h-px bg-indigo-400 inline-block"
                            style={{ borderTop: '1px dashed #818cf8' }}
                        />{' '}
                        Predicted
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{' '}
                        Anomaly
                    </span>
                    <span className="flex items-center gap-2">
                        <span
                            className="w-6 h-3 inline-block rounded-sm"
                            style={{ backgroundColor: '#6366f120', border: '2px dashed #6366f1' }}
                        />{' '}
                        Forecast Zone
                    </span>
                </div>
                <div className="text-xs text-slate-500">
                    Click layer name to expand · Hover for details
                </div>
            </div>
        </div>
    );
}
