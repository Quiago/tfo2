import type {
    ActionCategory,
    ActionEvent,
    EnergyReading,
    ProductMetric,
    SensorReading,
    TimeGranularity,
} from '@/lib/types/timeline';
import { useCallback, useEffect, useRef, useState } from 'react';

// =============================================================================
// UTILITIES
// =============================================================================

/** Deterministic PRNG (Lehmer/Park-Miller) for reproducible initial data */
function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function round(value: number, decimals: number = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const POINT_COUNTS: Record<TimeGranularity, number> = {
    Minute: 120,
    Hour: 96,
    Day: 90,
    Week: 52,
    Year: 60,
};

const INTERVALS_MS: Record<TimeGranularity, number> = {
    Minute: 60 * 1000,
    Hour: 3600 * 1000,
    Day: 86400 * 1000,
    Week: 7 * 86400 * 1000,
    Year: 30 * 86400 * 1000,
};

const STREAMING_INTERVAL_MS = 2000;

const CAMERA_ZONES = [
    'Line-1 Filler',
    'Line-2 Packager',
    'QC Station',
    'Warehouse Bay-A',
] as const;

// =============================================================================
// FIXED EVENT POOLS (per-granularity deterministic event counts)
// =============================================================================

const EVENT_POOLS: Record<TimeGranularity, { ai: number; human: number }> = {
    Minute: { ai: 1, human: 1 },      // 2 events total over 120 points
    Hour: { ai: 2, human: 2 },        // 4 events total over 96 points
    Day: { ai: 3, human: 7 },         // 10 events total over 90 points
    Week: { ai: 3, human: 6 },        // 9 events total over 52 points
    Year: { ai: 5, human: 9 },        // 14 events total over 60 points
};

// Realistic production targets for Nestle Dubai factory
// Line-1 baseline: 850 units/min (Nescafé bottles)
const BASE_TARGETS: Record<TimeGranularity, number> = {
    Minute: 850,              // 850 units/min
    Hour: 51000,              // 850 * 60
    Day: 1224000,             // 850 * 60 * 24
    Week: 8568000,            // 850 * 60 * 24 * 7
    Year: 312840000,          // 850 * 60 * 24 * 365
};

// =============================================================================
// PER-GRANULARITY EVENT RATES
// =============================================================================
// Realistic rates per data point. A real factory on Day granularity (90 pts)
// yields ~3 AI alerts and ~7 human events total.

interface EventRates {
    ai: number;
    human: number;
}

const EVENT_RATES: Record<TimeGranularity, EventRates> = {
    Minute: { ai: 0.01, human: 0.015 },   // ~1-2 AI, ~1-2 human over 120 pts
    Hour: { ai: 0.015, human: 0.02 },    // ~1-2 AI, ~2-3 human over 96 pts
    Day: { ai: 0.03, human: 0.08 },     // ~3 AI,   ~7 human over 90 pts
    Week: { ai: 0.05, human: 0.12 },     // ~3 AI,   ~6 human over 52 pts
    Year: { ai: 0.08, human: 0.15 },     // ~5 AI,   ~9 human over 60 pts
};

// Streaming tick rates: very rare -- most ticks produce zero events
const STREAMING_EVENT_RATES: EventRates = { ai: 0.01, human: 0.02 };

// =============================================================================
// NESTLE FACTORY ACTION EVENT TEMPLATES
// =============================================================================

interface EventTemplate {
    type: ActionEvent['type'];
    source: string;
    title: string;
    description: string;
    severity: ActionEvent['severity'];
    category: ActionCategory;
}

const AI_EVENT_TEMPLATES: EventTemplate[] = [
    {
        type: 'agent',
        source: 'AI Agent',
        title: 'AI: Vibration anomaly on Line-1 Filler -- bearing wear pattern',
        description:
            'Accelerometer RMS exceeded 8 mm/s threshold. Pattern consistent with inner race bearing defect. Recommend inspection within 24h.',
        severity: 'warning',
        category: 'Alert',
    },
    {
        type: 'agent',
        source: 'AI Agent',
        title: 'AI: Predicted chiller failure in 24h -- cooling efficiency trending down',
        description:
            'Chiller coefficient of performance trending downward. Current efficiency 3.2, predicted drop to 2.8. Refrigerant charge or condenser fouling suspected.',
        severity: 'warning',
        category: 'Preventive',
    },
    {
        type: 'agent',
        source: 'AI Agent',
        title: 'AI: Humidity alert -- warehouse RH trending toward 68% (mold risk threshold)',
        description:
            'Relative humidity in Warehouse Bay-A trending upward. Current 66%, threshold 65%. Risk of cocoa powder moisture absorption and mold growth.',
        severity: 'warning',
        category: 'Alert',
    },
    {
        type: 'agent',
        source: 'AI Agent',
        title: 'AI: Pressure drop detected -- compressed air system leak estimated 0.3 kW loss',
        description:
            'Compressed air pressure declining by 0.15 bar/hour. Ultrasonic analysis suggests valve seal leakage. Recommend inspection.',
        severity: 'warning',
        category: 'Optimization',
    },
    {
        type: 'agent',
        source: 'AI Agent',
        title: 'AI: Line-2 throughput optimization -- packaging line can safely run at 950 units/min',
        description:
            'Current demand forecast allows Line-2 speed increase from 850 to 950 units/min without seal quality impact. Estimated +11.8% throughput gain.',
        severity: 'info',
        category: 'Optimization',
    },
    {
        type: 'agent',
        source: 'AI Agent',
        title: 'AI: Predictive maintenance -- scheduled palletizer component replacement recommended',
        description:
            'Gripper pad wear trending toward replacement threshold. Current wear 82%, OEM limit 90%. Recommend parts staging for next maintenance window.',
        severity: 'info',
        category: 'Preventive',
    },
];

const HUMAN_EVENT_TEMPLATES: EventTemplate[] = [
    {
        type: 'maintenance',
        source: 'CMMS',
        title: 'Work Order #WO-4521: Line-1 sealer blade replacement scheduled',
        description:
            'Preventive maintenance: Replace thermal sealer blade on Line-1. Estimated downtime: 30 min. Parts pre-staged.',
        severity: 'info',
        category: 'Preventive',
    },
    {
        type: 'compliance',
        source: 'ERP',
        title: 'SOP Check: Line-1 CIP (Clean-in-Place) cycle completed successfully',
        description:
            'Clean-in-Place cycle completed successfully. All rinse conductivity readings within spec. Duration: 28 min.',
        severity: 'info',
        category: 'Compliance',
    },
    {
        type: 'user',
        source: 'Shift Lead',
        title: 'Shift Handover: Night→Day, Line-1 status nominal, 99.2% uptime',
        description:
            'Night shift summary: 99.2% uptime, 0 quality holds, 1 minor conveyor jam cleared at 03:15. All lines running nominal.',
        severity: 'info',
        category: 'Inspection',
    },
    {
        type: 'maintenance',
        source: 'CMMS',
        title: 'Maintenance: Conveyor belt tension adjustment on Line-2',
        description:
            'Belt tracking correction performed. Tension set to 12.5 N/mm per OEM spec. Visual inspection: no fraying or edge wear.',
        severity: 'info',
        category: 'Preventive',
    },
    {
        type: 'user',
        source: 'Warehouse',
        title: 'Inventory: Raw material restock -- cocoa powder received (Lot #NES-CP-20260205)',
        description:
            'Received 4 pallets (2400 kg) cocoa powder. Lot #NES-CP-20260205. QC sample submitted. Storage temp verified at 22C, RH 52%.',
        severity: 'info',
        category: 'Compliance',
    },
    {
        type: 'compliance',
        source: 'QA',
        title: 'Manual Inspection: Packaging seal integrity test -- 50-unit batch passed',
        description:
            'Burst test on 50-sample batch: all seals exceeded 2.1 bar threshold. Min observed: 2.4 bar. Log ID: QA-SI-8847.',
        severity: 'info',
        category: 'Inspection',
    },
    {
        type: 'compliance',
        source: 'QA',
        title: 'Compliance: HACCP checkpoint #3 logged -- metal detection sensitivity verified',
        description:
            'Critical Control Point #3 (metal detection) verified. Sensitivity: Fe 1.5mm, Non-Fe 2.0mm, SS 2.5mm. Zero rejects this shift.',
        severity: 'info',
        category: 'Compliance',
    },
    {
        type: 'maintenance',
        source: 'CMMS',
        title: 'Work Order #WO-4533: Palletizer vacuum gripper pad replacement',
        description:
            'Scheduled replacement of vacuum gripper pads on Palletizer-2. Current pads at 85% wear. Parts in stock.',
        severity: 'info',
        category: 'Preventive',
    },
    {
        type: 'user',
        source: 'Shift Lead',
        title: 'Manual Inspection: Compressed air system leak detection completed -- zero leaks found',
        description:
            'Ultrasonic leak detection completed on all piping zones. Zero leaks detected. System pressure stable at 6.8 bar.',
        severity: 'info',
        category: 'Inspection',
    },
];

// =============================================================================
// TIMESTAMP GENERATION
// =============================================================================

/**
 * Generate timestamps with the last 20% in the future (prediction zone).
 * Historical points count backward from now; prediction points go forward.
 */
function generateTimestamps(
    granularity: TimeGranularity,
    count: number,
): number[] {
    const now = Date.now();
    const step = INTERVALS_MS[granularity];
    const historyCount = Math.floor(count * 0.8);

    return Array.from({ length: count }, (_, i) => {
        if (i < historyCount) {
            return now - (historyCount - 1 - i) * step;
        }
        return now + (i - historyCount + 1) * step;
    });
}

// =============================================================================
// VIDEO FRAME GENERATION
// =============================================================================

/**
 * Determine thumbnail color based on worst condition across sensors.
 * - Green (#22c55e): Normal operation
 * - Orange (#f97316): Anomaly detected
 * - Red (#ef4444): Critical alert
 */
function determineThumbnailColor(
    temperature: number,
    vibration: number,
    pressure: number,
): string {
    const isCritical =
        vibration > 12 || temperature > 50 || pressure < 4;
    const isAnomaly =
        vibration > 8 || temperature > 45 || pressure < 5.5;

    if (isCritical) {
        return '#ef4444'; // red
    } else if (isAnomaly) {
        return '#f97316'; // orange
    } else {
        return '#22c55e'; // green
    }
}

function generateVideoFrame(
    frameNumber: number,
    temperature: number,
    vibration: number,
    pressure: number,
    zone: string,
): SensorReading['videoFrame'] {
    const thumbnailColor = determineThumbnailColor(temperature, vibration, pressure);

    return {
        frameNumber,
        thumbnailColor,
        hasMotion: vibration > 3, // motion detected when vibration above baseline
        zone,
    };
}

// =============================================================================
// VIBRATION GENERATION (realistic industrial patterns)
// =============================================================================

/**
 * Vibration model:
 * - Normal: 2-4 mm/s (healthy conveyor motors)
 * - Moderate: 4-8 mm/s (bearing wear developing)
 * - High: 8-15 mm/s (anomaly, attention needed)
 * - Critical: >15 mm/s (emergency stop)
 *
 * Patterns: gradual increase segments, random spikes, mean reversion after maintenance.
 */
function generateVibrationValue(
    rand: () => number,
    index: number,
    count: number,
    prevVibration: number,
): number {
    const progress = index / count;
    let vibration = prevVibration;

    // Mean reversion toward 3.0 mm/s (normal operating point)
    vibration += (3.0 - vibration) * 0.05;

    // Random walk
    vibration += (rand() - 0.48) * 0.6;

    // Gradual degradation segment: 40-55% of timeline
    if (progress > 0.4 && progress < 0.55) {
        vibration += 0.15;
    }

    // Spike zone: 65-72% of timeline (bearing wear event)
    if (progress > 0.65 && progress < 0.72) {
        vibration += 1.5 + rand() * 3.0;
    }

    // Post-maintenance recovery: 72-80%
    if (progress > 0.72 && progress < 0.8) {
        vibration = 2.5 + rand() * 1.0;
    }

    // Random spikes (0.8% chance -- reduced from 2%)
    if (rand() < 0.008) {
        vibration += 5 + rand() * 8;
    }

    return clamp(round(vibration, 2), 0.5, 22);
}

// =============================================================================
// DATA GENERATORS (Initial / Historical + Prediction)
// =============================================================================

function generateSensorData(
    timestamps: number[],
    rand: () => number,
    predictionStart: number,
    granularity: TimeGranularity,
): SensorReading[] {
    let temp = 28; // Nestle Dubai factory initial ambient
    let vibration = 3.0;
    let frameCounter = 0;

    // Variance multiplier based on time scope
    const varianceMultiplier: Record<TimeGranularity, number> = {
        Minute: 0.8,   // Low variance, steady state
        Hour: 0.9,
        Day: 1.0,      // Normal
        Week: 1.1,     // More variation
        Year: 1.2,     // Maximum variation
    };
    const multiplier = varianceMultiplier[granularity];

    return timestamps.map((ts, i) => {
        const inPrediction = i >= predictionStart;

        // Temperature: Dubai ambient 20-45°C (winter 20-30°C, summer 35-50°C)
        // Machine zones: 28-55°C (fillers/sealers generate heat)
        const tempDrift = (rand() - 0.48) * 1.0 * multiplier;
        temp = clamp(temp + tempDrift, 20, 55);

        // Temperature spike zone (70-75%) simulating machine thermal event
        if (i > timestamps.length * 0.7 && i < timestamps.length * 0.75) {
            temp += 0.6;
            temp = Math.min(55, temp);
        }

        // Predictions: wider variance
        if (inPrediction) {
            temp += (rand() - 0.5) * 2.5;
            temp = clamp(temp, 18, 58);
        }

        // Vibration: bearing condition indicator
        vibration = generateVibrationValue(rand, i, timestamps.length, vibration);
        if (inPrediction) {
            vibration += (rand() - 0.5) * 2.0;
            vibration = clamp(vibration, 0.5, 22);
        }

        // Humidity: 45-65% RH typical for food production facility
        // Critical for cocoa powder storage (mold risk >65%)
        const humidity = round(
            50 + rand() * 15 + (inPrediction ? (rand() - 0.5) * 8 : 0),
            1,
        );

        // Pressure: Compressed air system (6-8 bar nominal)
        // Critical for pneumatic fillers and actuators
        const pressureBase = 6.5 + rand() * 1.0;
        const pressure = round(
            clamp(pressureBase + (inPrediction ? (rand() - 0.5) * 0.5 : 0), 4.0, 8.5),
            2,
        );

        // Anomaly: high temp OR high vibration OR pressure issue OR humidity issue OR random (0.5%)
        const anomaly =
            temp > 48 ||
            vibration > 8 ||
            pressure < 5.5 ||
            humidity > 65 ||
            rand() < 0.005;

        const alertLevel: SensorReading['alertLevel'] =
            temp > 52 || vibration > 12 || pressure < 4.0 || humidity > 70
                ? 'critical'
                : temp > 48 || vibration > 8 || pressure < 5.5 || humidity > 65
                    ? 'warning'
                    : 'none';

        const zone = CAMERA_ZONES[frameCounter % CAMERA_ZONES.length];

        // 80% of points have video frame data
        const videoFrame =
            rand() < 0.8
                ? generateVideoFrame(frameCounter++, temp, vibration, pressure, zone)
                : undefined;

        return {
            timestamp: ts,
            temperature: round(temp, 2),
            humidity,
            pressure,
            vibration: round(vibration, 2),
            videoFrame,
            anomaly,
            alertLevel,
        };
    });
}

function generateEnergyData(
    timestamps: number[],
    sensors: SensorReading[],
    rand: () => number,
    predictionStart: number,
): EnergyReading[] {
    // Dubai industrial electricity rate: ~0.40 AED/kWh
    const COST_PER_KWH = 0.40;

    return timestamps.map((ts, i) => {
        const sensor = sensors[i];
        const inPrediction = i >= predictionStart;

        // Factory power consumption model:
        // Line-1 Filler: 35-45 kW
        // Line-2 Packager: 25-35 kW
        // QC Station: 5-8 kW
        // Chiller (product cooling): 15-25 kW
        // Compressed air: 10-15 kW
        // Total: 90-130 kW typical
        const baseLoad = 110 + rand() * 20;

        // Uptime-based efficiency: 85-99% normal, 78-100% in prediction
        const uptimeBase = 92 + rand() * 7;
        const uptimeVariance = inPrediction ? (rand() - 0.5) * 12 : 0;
        const efficiency = clamp(round(uptimeBase + uptimeVariance, 1), 78, 100);

        // Power draw scales with efficiency (uptime)
        const powerDraw = round(baseLoad * (efficiency / 100) + rand() * 5, 1);

        // Chiller load: correlated with ambient temperature
        // Increases significantly in Dubai summer heat (>35°C)
        const ambientTemp = sensor?.temperature ?? 28;
        const baseChiller = 18 + (ambientTemp - 22) * 0.8;
        const coolingLoad = round(
            clamp(baseChiller + rand() * 8, 10, 35),
            1,
        );

        // Total power (fillers + compressor + chiller)
        const totalPower = powerDraw + coolingLoad;

        // Cost per hour calculation: AED/hour
        const costPerHour = round(totalPower * COST_PER_KWH, 2);

        // Prediction zone: projected values with uncertainty bands
        const predictionOffset = i - predictionStart;
        const predicted = inPrediction
            ? round(powerDraw + predictionOffset * 0.5 + rand() * 8, 1)
            : undefined;
        const upperBound = inPrediction
            ? round(powerDraw + predictionOffset * 1.2 + 15, 1)
            : undefined;
        const lowerBound = inPrediction
            ? round(Math.max(0, powerDraw + predictionOffset * 0.2 - 10), 1)
            : undefined;

        return {
            timestamp: ts,
            powerDraw,
            coolingLoad,
            efficiency,
            costPerHour,
            predicted,
            upperBound,
            lowerBound,
        };
    });
}

function generateProductData(
    timestamps: number[],
    granularity: TimeGranularity,
    rand: () => number,
    predictionStart: number,
): ProductMetric[] {
    const target = BASE_TARGETS[granularity];

    return timestamps.map((ts, i) => {
        const inPrediction = i >= predictionStart;

        // Uptime percentage: 85-99% normal; prediction zone: wider variance 78-100%
        const uptimeBase = 92 + rand() * 7;
        const uptimeVariance = inPrediction ? (rand() - 0.5) * 14 : 0;
        const uptime = clamp(round(uptimeBase + uptimeVariance, 1), 70, 100);

        // Output: units/min based on uptime and line speed variance
        const outputVariance = 0.9 + rand() * 0.2;
        const predictionNoise = inPrediction ? (rand() - 0.5) * 0.15 : 0;
        const output = Math.round(
            target * (uptime / 100) * (outputVariance + predictionNoise),
        );

        return {
            timestamp: ts,
            output: Math.max(0, output),
            target,
            uptime,
        };
    });
}

/**
 * Generate causally consistent action events driven by sensor + product data.
 *
 * Causal rules (factory-specific):
 * - vibration > 8 mm/s => alert (warning or critical)
 * - temperature > 48°C => warning, > 52°C => critical
 * - pressure < 5.5 bar => warning, < 4.0 bar => critical
 * - humidity > 65% => warning (mold risk), > 70% => critical
 * - vibration + temperature spike together => AI correlated anomaly event
 * - uptime < 85% => throughput warning
 * - Fixed pool of random human and AI events per-granularity (deterministic scatter)
 * - NO events in the prediction zone (events are discrete, not predicted)
 */
function generateActionData(
    timestamps: number[],
    sensors: SensorReading[],
    products: ProductMetric[],
    rand: () => number,
    predictionStart: number,
    granularity: TimeGranularity,
): ActionEvent[] {
    const actions: ActionEvent[] = [];
    const pools = EVENT_POOLS[granularity];

    // --- Phase 1: Generate all causal events ---
    timestamps.forEach((ts, i) => {
        // No discrete events in prediction zone
        if (i >= predictionStart) return;

        const sensor = sensors[i];
        const product = products[i];
        const tsLabel = new Date(ts).toLocaleString();
        const zone = sensor?.videoFrame?.zone ?? 'Line-1 Filler';

        // --- Causal: High vibration ---
        if (sensor && sensor.vibration > 8) {
            const isCritical = sensor.vibration > 12;
            actions.push({
                timestamp: ts,
                type: 'alert',
                source: 'Vibration Monitor',
                title: isCritical
                    ? `CRITICAL: Vibration ${sensor.vibration} mm/s on ${zone}`
                    : `WARNING: Elevated vibration ${sensor.vibration} mm/s detected`,
                description: `Accelerometer RMS at ${sensor.vibration} mm/s at ${tsLabel}. Threshold: 8 mm/s warning, 12 mm/s critical. Bearing wear suspected.`,
                severity: isCritical ? 'critical' : 'warning',
                isAI: true,
                category: 'Alert',
            });
        }

        // --- Causal: High temperature ---
        if (sensor && sensor.temperature > 48) {
            const isCritical = sensor.temperature > 52;
            actions.push({
                timestamp: ts,
                type: 'alert',
                source: 'Thermal Monitor',
                title: `${isCritical ? 'CRITICAL' : 'WARNING'}: Temperature ${sensor.temperature}°C on ${zone}`,
                description: `Machine zone temperature at ${sensor.temperature}°C at ${tsLabel}. ${isCritical ? 'Immediate' : 'Urgent'} cooling assessment required.`,
                severity: isCritical ? 'critical' : 'warning',
                isAI: true,
                category: 'Alert',
            });
        }

        // --- Causal: Low pressure (compressed air leak) ---
        if (sensor && sensor.pressure < 5.5) {
            const isCritical = sensor.pressure < 4.0;
            actions.push({
                timestamp: ts,
                type: 'alert',
                source: 'Pressure Monitor',
                title: `${isCritical ? 'CRITICAL' : 'WARNING'}: Compressed air pressure ${sensor.pressure} bar`,
                description: `System pressure at ${sensor.pressure} bar at ${tsLabel}. Possible leak in pneumatic circuit. ${isCritical ? 'System shutdown risk.' : 'Recommend inspection.'}`,
                severity: isCritical ? 'critical' : 'warning',
                isAI: true,
                category: 'Alert',
            });
        }

        // --- Causal: High humidity (mold risk) ---
        if (sensor && sensor.humidity > 65) {
            const isCritical = sensor.humidity > 70;
            actions.push({
                timestamp: ts,
                type: 'alert',
                source: 'Humidity Monitor',
                title: `${isCritical ? 'CRITICAL' : 'WARNING'}: Warehouse humidity ${sensor.humidity}% RH`,
                description: `Relative humidity in storage at ${sensor.humidity}% RH at ${tsLabel}. ${isCritical ? 'Critical mold risk for cocoa powder.' : 'Monitor closely, trending toward mold threshold.'}`,
                severity: isCritical ? 'critical' : 'warning',
                isAI: true,
                category: 'Alert',
            });
        }

        // --- Causal: Correlated vibration + thermal event ---
        if (sensor && sensor.vibration > 8 && sensor.temperature > 46) {
            actions.push({
                timestamp: ts,
                type: 'agent',
                source: 'AI Agent',
                title:
                    'AI: Multi-sensor anomaly -- vibration + thermal event detected',
                description: `Simultaneous vibration spike (${sensor.vibration} mm/s) and elevated temperature (${sensor.temperature}°C) on ${zone}. Correlation analysis indicates potential bearing degradation or lubrication failure.`,
                severity: 'critical',
                isAI: true,
                category: 'Alert',
            });
        }

        // --- Causal: Low uptime ---
        if (product && product.uptime < 85) {
            actions.push({
                timestamp: ts,
                type: 'alert',
                source: 'Production Monitor',
                title: `Production efficiency low: ${round(product.uptime, 1)}% uptime`,
                description: `Production line uptime dropped below 85% target at ${tsLabel}. Output: ${product.output} vs target: ${product.target}. Investigate downtime cause.`,
                severity: 'warning',
                isAI: true,
                category: 'Optimization',
            });
        }
    });

    // --- Phase 2: Generate fixed-pool random events (deterministically scattered) ---
    const totalAI = pools.ai;
    const totalHuman = pools.human;

    // Build list of available indices in historical zone (0 to predictionStart-1)
    const availableIndices = Array.from(
        { length: predictionStart },
        (_, i) => i
    );

    // Fisher-Yates shuffle using seeded RNG for reproducibility
    for (let i = availableIndices.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [availableIndices[i], availableIndices[j]] = [
            availableIndices[j],
            availableIndices[i],
        ];
    }

    // Pick N random indices for AI events
    const aiIndices = new Set(availableIndices.slice(0, totalAI));

    // Pick N random indices for Human events (from remaining)
    const humanIndices = new Set(
        availableIndices.slice(totalAI, totalAI + totalHuman)
    );

    // Inject AI events at selected indices
    aiIndices.forEach((idx) => {
        const template =
            AI_EVENT_TEMPLATES[Math.floor(rand() * AI_EVENT_TEMPLATES.length)];
        actions.push({
            ...template,
            timestamp: timestamps[idx],
            isAI: true,
        });
    });

    // Inject Human events at selected indices
    humanIndices.forEach((idx) => {
        const template =
            HUMAN_EVENT_TEMPLATES[
            Math.floor(rand() * HUMAN_EVENT_TEMPLATES.length)
            ];
        actions.push({
            ...template,
            timestamp: timestamps[idx],
            isAI: false,
        });
    });

    // Sort by timestamp to maintain chronological order
    return actions.sort((a, b) => a.timestamp - b.timestamp);
}

// =============================================================================
// STREAMING: SINGLE-POINT GENERATORS (use Math.random for live data)
// =============================================================================

function generateStreamingSensorPoint(
    timestamp: number,
    prevSensor: SensorReading | undefined,
    frameCounter: number,
): SensorReading {
    const prevTemp = prevSensor?.temperature ?? 28;
    const prevVib = prevSensor?.vibration ?? 3.0;
    const prevPressure = prevSensor?.pressure ?? 6.5;

    // Temperature: small random walk from previous
    const temp = clamp(
        round(prevTemp + (Math.random() - 0.48) * 0.8, 2),
        20,
        55,
    );

    // Vibration: mean-reverting walk with occasional spikes
    let vibration =
        prevVib + (3.0 - prevVib) * 0.05 + (Math.random() - 0.48) * 0.5;
    if (Math.random() < 0.01) {
        vibration += 4 + Math.random() * 6;
    }
    vibration = clamp(round(vibration, 2), 0.5, 22);

    // Humidity: storage area RH
    const humidity = round(50 + Math.random() * 15, 1);

    // Pressure: compressed air system, slight drift
    const pressure = round(
        clamp(prevPressure + (Math.random() - 0.48) * 0.2, 4.0, 8.5),
        2,
    );

    // Anomaly: temperature, vibration, pressure, or humidity issues
    const anomaly =
        temp > 48 ||
        vibration > 8 ||
        pressure < 5.5 ||
        humidity > 65 ||
        Math.random() < 0.005;

    const alertLevel: SensorReading['alertLevel'] =
        temp > 52 || vibration > 12 || pressure < 4.0 || humidity > 70
            ? 'critical'
            : temp > 48 || vibration > 8 || pressure < 5.5 || humidity > 65
                ? 'warning'
                : 'none';

    const zone = CAMERA_ZONES[frameCounter % CAMERA_ZONES.length];

    return {
        timestamp,
        temperature: temp,
        humidity,
        pressure,
        vibration,
        videoFrame:
            Math.random() < 0.8
                ? generateVideoFrame(frameCounter, temp, vibration, pressure, zone)
                : undefined,
        anomaly,
        alertLevel,
    };
}

function generateStreamingEnergyPoint(
    timestamp: number,
    sensor: SensorReading,
): EnergyReading {
    const COST_PER_KWH = 0.40;

    const baseLoad = 110 + Math.random() * 20;
    const uptimeBase = 92 + Math.random() * 7;
    const efficiency = clamp(round(uptimeBase, 1), 78, 100);
    const powerDraw = round(baseLoad * (efficiency / 100) + Math.random() * 5, 1);

    const ambientTemp = sensor.temperature;
    const baseChiller = 18 + (ambientTemp - 22) * 0.8;
    const coolingLoad = round(
        clamp(baseChiller + Math.random() * 8, 10, 35),
        1,
    );

    const totalPower = powerDraw + coolingLoad;
    const costPerHour = round(totalPower * COST_PER_KWH, 2);

    return {
        timestamp,
        powerDraw,
        coolingLoad,
        efficiency,
        costPerHour,
    };
}

function generateStreamingProductPoint(
    timestamp: number,
    granularity: TimeGranularity,
): ProductMetric {
    const target = BASE_TARGETS[granularity];
    const uptime = clamp(round(92 + Math.random() * 7, 1), 78, 100);
    const output = Math.round(
        target * (uptime / 100) * (0.9 + Math.random() * 0.2),
    );

    return {
        timestamp,
        output: Math.max(0, output),
        target,
        uptime,
    };
}

/**
 * Generate causally-consistent action events from a new streaming data point.
 */
function generateStreamingActions(
    timestamp: number,
    sensor: SensorReading,
    product: ProductMetric,
): ActionEvent[] {
    const actions: ActionEvent[] = [];
    const tsLabel = new Date(timestamp).toLocaleString();
    const zone = sensor.videoFrame?.zone ?? 'Line-1 Filler';

    // Causal: high vibration
    if (sensor.vibration > 8) {
        const isCritical = sensor.vibration > 12;
        actions.push({
            timestamp,
            type: 'alert',
            source: 'Vibration Monitor',
            title: isCritical
                ? `CRITICAL: Vibration ${sensor.vibration} mm/s on ${zone}`
                : `WARNING: Elevated vibration ${sensor.vibration} mm/s detected`,
            description: `Accelerometer RMS at ${sensor.vibration} mm/s at ${tsLabel}. Bearing wear suspected.`,
            severity: isCritical ? 'critical' : 'warning',
            isAI: true,
            category: 'Alert',
        });
    }

    // Causal: high temperature
    if (sensor.temperature > 48) {
        const isCritical = sensor.temperature > 52;
        actions.push({
            timestamp,
            type: 'alert',
            source: 'Thermal Monitor',
            title: `${isCritical ? 'CRITICAL' : 'WARNING'}: Temperature ${sensor.temperature}°C on ${zone}`,
            description: `Machine temperature at ${sensor.temperature}°C at ${tsLabel}.`,
            severity: isCritical ? 'critical' : 'warning',
            isAI: true,
            category: 'Alert',
        });
    }

    // Causal: low pressure
    if (sensor.pressure < 5.5) {
        const isCritical = sensor.pressure < 4.0;
        actions.push({
            timestamp,
            type: 'alert',
            source: 'Pressure Monitor',
            title: `${isCritical ? 'CRITICAL' : 'WARNING'}: Compressed air pressure ${sensor.pressure} bar`,
            description: `System pressure at ${sensor.pressure} bar at ${tsLabel}. Possible leak.`,
            severity: isCritical ? 'critical' : 'warning',
            isAI: true,
            category: 'Alert',
        });
    }

    // Causal: high humidity
    if (sensor.humidity > 65) {
        const isCritical = sensor.humidity > 70;
        actions.push({
            timestamp,
            type: 'alert',
            source: 'Humidity Monitor',
            title: `${isCritical ? 'CRITICAL' : 'WARNING'}: Warehouse humidity ${sensor.humidity}% RH`,
            description: `Relative humidity at ${sensor.humidity}% RH at ${tsLabel}.`,
            severity: isCritical ? 'critical' : 'warning',
            isAI: true,
            category: 'Alert',
        });
    }

    // Causal: correlated vibration + thermal
    if (sensor.vibration > 8 && sensor.temperature > 46) {
        actions.push({
            timestamp,
            type: 'agent',
            source: 'AI Agent',
            title:
                'AI: Multi-sensor anomaly -- vibration + thermal event detected',
            description: `Simultaneous vibration spike (${sensor.vibration} mm/s) and elevated temperature (${sensor.temperature}°C).`,
            severity: 'critical',
            isAI: true,
            category: 'Alert',
        });
    }

    // Causal: low uptime
    if (product.uptime < 85) {
        actions.push({
            timestamp,
            type: 'alert',
            source: 'Production Monitor',
            title: `Production efficiency low: ${product.uptime}% uptime`,
            description: `Uptime dropped below 85% target at ${tsLabel}. Output: ${product.output} vs target: ${product.target}.`,
            severity: 'warning',
            isAI: true,
            category: 'Optimization',
        });
    }

    // Random AI event (1% per streaming tick)
    if (Math.random() < STREAMING_EVENT_RATES.ai) {
        const template =
            AI_EVENT_TEMPLATES[
            Math.floor(Math.random() * AI_EVENT_TEMPLATES.length)
            ];
        actions.push({ ...template, timestamp, isAI: true });
    }

    // Random human event (2% per streaming tick)
    if (Math.random() < STREAMING_EVENT_RATES.human) {
        const template =
            HUMAN_EVENT_TEMPLATES[
            Math.floor(Math.random() * HUMAN_EVENT_TEMPLATES.length)
            ];
        actions.push({ ...template, timestamp, isAI: false });
    }

    return actions;
}

// =============================================================================
// HOOK
// =============================================================================

export function useMultiLayerData(granularity: TimeGranularity) {
    const pointCount = POINT_COUNTS[granularity];
    const predictionStart = Math.floor(pointCount * 0.8);
    const frameCounterRef = useRef(0);

    // --- Build initial data set (deterministic via seeded random) ---
    const buildInitialData = useCallback(() => {
        const rand = seededRandom(42);
        const ts = generateTimestamps(granularity, pointCount);
        const sensors = generateSensorData(ts, rand, predictionStart, granularity);
        const products = generateProductData(ts, granularity, rand, predictionStart);
        const energy = generateEnergyData(ts, sensors, rand, predictionStart);
        const actionEvents = generateActionData(
            ts,
            sensors,
            products,
            rand,
            predictionStart,
            granularity,
        );

        // Track frame counter for streaming continuity
        frameCounterRef.current = sensors.reduce(
            (max, s) =>
                s.videoFrame ? Math.max(max, s.videoFrame.frameNumber + 1) : max,
            0,
        );

        return {
            timestamps: ts,
            sensorData: sensors,
            energyData: energy,
            actionData: actionEvents,
            productData: products,
        };
    }, [granularity, pointCount, predictionStart]);

    const initial = buildInitialData();

    const [timestamps, setTimestamps] = useState<number[]>(initial.timestamps);
    const [sensorData, setSensorData] = useState<SensorReading[]>(
        initial.sensorData,
    );
    const [energyData, setEnergyData] = useState<EnergyReading[]>(
        initial.energyData,
    );
    const [actionData, setActionData] = useState<ActionEvent[]>(
        initial.actionData,
    );
    const [productData, setProductData] = useState<ProductMetric[]>(
        initial.productData,
    );
    const [isStreaming, setIsStreaming] = useState(true);

    // Ref to track latest sensor data for streaming continuity - must be declared before effects that use it
    const sensorDataRef = useRef<SensorReading[]>(initial.sensorData);

    // Re-initialize when granularity changes
    useEffect(() => {
        const fresh = buildInitialData();
        setTimestamps(fresh.timestamps);
        setSensorData(fresh.sensorData);
        setEnergyData(fresh.energyData);
        setActionData(fresh.actionData);
        setProductData(fresh.productData);
        // CRITICAL: Immediately update ref to prevent stale data in streaming
        sensorDataRef.current = fresh.sensorData;
    }, [buildInitialData]);

    // Keep ref in sync with state updates (e.g., from streaming)
    useEffect(() => {
        sensorDataRef.current = sensorData;
    }, [sensorData]);

    // --- Streaming: append one new data point every 2 seconds ---
    // FIXED: Use refs to avoid stale closures and update all state atomically
    useEffect(() => {
        setIsStreaming(true);

        const interval = setInterval(() => {
            const now = Date.now();

            // Get latest sensor from ref (avoids stale closure)
            const lastSensor = sensorDataRef.current[sensorDataRef.current.length - 1];

            // Generate all new data points OUTSIDE of setState callbacks
            const newSensor = generateStreamingSensorPoint(
                now,
                lastSensor,
                frameCounterRef.current,
            );
            frameCounterRef.current += 1;

            // Generate causally-dependent points from the new sensor data
            const newEnergy = generateStreamingEnergyPoint(now, newSensor);
            const newProduct = generateStreamingProductPoint(now, granularity);
            const newActions = generateStreamingActions(now, newSensor, newProduct);

            // Calculate window start for action filtering
            const windowStart = now - (pointCount - 1) * INTERVALS_MS[granularity];

            // ATOMIC BATCH: Update all states together (React 18+ batches these)
            setTimestamps((prev) => [...prev.slice(1), now]);
            setSensorData((prev) => [...prev.slice(1), newSensor]);
            setEnergyData((prev) => [...prev.slice(1), newEnergy]);
            setProductData((prev) => [...prev.slice(1), newProduct]);

            if (newActions.length > 0) {
                setActionData((prevActions) => {
                    const filtered = prevActions.filter((a) => a.timestamp >= windowStart);
                    return [...filtered, ...newActions];
                });
            }
        }, STREAMING_INTERVAL_MS);

        return () => {
            clearInterval(interval);
            setIsStreaming(false);
        };
    }, [granularity, pointCount]);

    return {
        timestamps,
        sensorData,
        energyData,
        actionData,
        productData,
        pointCount,
        predictionStart,
        isStreaming,
    };
}
