import { useEffect, useState, useCallback } from 'react';
import type {
  TimelineDataPoint,
  TimelinePredictionPoint,
} from '@/lib/types/timeline';

const MOCK_CONFIG = {
  /** Generate 90 days of historical data */
  HISTORICAL_DAYS: 90,
  /** Generate 30 days of predictions */
  PREDICTION_DAYS: 30,
  /** Base value for realistic financial-style data */
  BASE_VALUE: 100,
  /** Volatility (percentage) */
  VOLATILITY: 3,
  /** Trend (percentage per day) */
  TREND: 0.1,
};

/**
 * Generates a realistic financial time series using Brownian motion
 * with drift (trend) and mean reversion
 */
function generateRealisticTimeSeries(
  startTime: number,
  daysCount: number,
  baseValue: number,
  volatility: number,
  trend: number,
  dataPointsPerDay: number = 96 // 15-minute intervals
): TimelineDataPoint[] {
  const data: TimelineDataPoint[] = [];
  let currentValue = baseValue;
  const intervalMs = (24 * 60 * 60 * 1000) / dataPointsPerDay;

  for (let i = 0; i < daysCount * dataPointsPerDay; i++) {
    // Brownian motion with drift
    const randomNormal = Math.random() + Math.random() - 1;
    const drift = (trend / 100) * (intervalMs / (24 * 60 * 60 * 1000));
    const diffusion =
      (volatility / 100) * randomNormal * Math.sqrt(intervalMs / (24 * 60 * 60 * 1000));

    currentValue = currentValue * (1 + drift + diffusion);

    // Mean reversion (pull back towards base value)
    const deviation = (currentValue - baseValue) / baseValue;
    if (Math.abs(deviation) > 0.3) {
      currentValue = currentValue * 0.99 + baseValue * 0.01;
    }

    // Ensure positive value
    currentValue = Math.max(currentValue, baseValue * 0.3);

    data.push({
      timestamp: startTime + i * intervalMs,
      value: parseFloat(currentValue.toFixed(2)),
      metadata: {
        dayOfWeek: new Date(startTime + i * intervalMs).getDay(),
        hour: new Date(startTime + i * intervalMs).getHours(),
      },
    });
  }

  return data;
}

/**
 * Generates prediction data with confidence intervals
 */
function generatePredictions(
  historicalData: TimelineDataPoint[],
  predictionDays: number,
  dataPointsPerDay: number = 96
): TimelinePredictionPoint[] {
  const predictions: TimelinePredictionPoint[] = [];

  if (historicalData.length === 0) return predictions;

  const lastPoint = historicalData[historicalData.length - 1];
  const lastValue = lastPoint.value;
  const intervalMs = (24 * 60 * 60 * 1000) / dataPointsPerDay;

  // Calculate recent volatility from last 7 days
  const sevenDaysAgoIndex = Math.max(0, historicalData.length - 7 * dataPointsPerDay);
  const recentData = historicalData.slice(sevenDaysAgoIndex);
  const values = recentData.map((p) => p.value);
  const mean = values.reduce((a, b) => a + b) / values.length;
  const variance =
    values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const volatility = Math.sqrt(variance);
  const volatilityPercent = (volatility / mean) * 100;

  let currentValue = lastValue;

  for (let i = 0; i < predictionDays * dataPointsPerDay; i++) {
    const randomNormal = Math.random() + Math.random() - 1;
    const drift = 0.05; // 5% weekly trend
    const diffusion =
      (volatilityPercent / 100) * randomNormal * Math.sqrt(intervalMs / (24 * 60 * 60 * 1000));

    currentValue = currentValue * (1 + (drift / 48 / 7) + diffusion);
    currentValue = Math.max(currentValue, mean * 0.5);

    // Confidence interval widens over time
    const timeStepsAhead = i + 1;
    const confidenceRadius = volatility * Math.sqrt(timeStepsAhead / 48);

    predictions.push({
      timestamp: lastPoint.timestamp + (i + 1) * intervalMs,
      predictedValue: parseFloat(currentValue.toFixed(2)),
      upperBound: parseFloat((currentValue + confidenceRadius).toFixed(2)),
      lowerBound: parseFloat((currentValue - confidenceRadius).toFixed(2)),
    });
  }

  return predictions;
}

interface UseMockDataReturn {
  historicalData: TimelineDataPoint[];
  predictions: TimelinePredictionPoint[];
  isLoading: boolean;
  refetch: () => void;
  addNewDataPoint: (value: number, timestamp?: number) => void;
}

/**
 * Hook that provides realistic mock data for Timeline component
 * Simulates real-time streaming with Brownian motion
 */
export function useMockData(autoStream: boolean = false): UseMockDataReturn {
  const [historicalData, setHistoricalData] = useState<TimelineDataPoint[]>([]);
  const [predictions, setPredictions] = useState<TimelinePredictionPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const generateData = useCallback(() => {
    const now = Date.now();
    const startTime = now - MOCK_CONFIG.HISTORICAL_DAYS * 24 * 60 * 60 * 1000;

    const historical = generateRealisticTimeSeries(
      startTime,
      MOCK_CONFIG.HISTORICAL_DAYS,
      MOCK_CONFIG.BASE_VALUE,
      MOCK_CONFIG.VOLATILITY,
      MOCK_CONFIG.TREND
    );

    const preds = generatePredictions(
      historical,
      MOCK_CONFIG.PREDICTION_DAYS
    );

    setHistoricalData(historical);
    setPredictions(preds);
    setIsLoading(false);
  }, []);

  const addNewDataPoint = useCallback(
    (value: number, timestamp: number = Date.now()) => {
      setHistoricalData((prev) => [
        ...prev,
        { timestamp, value, metadata: {} },
      ]);
    },
    []
  );

  const refetch = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      generateData();
    }, 500);
  }, [generateData]);

  // Generate initial data
  useEffect(() => {
    generateData();
  }, [generateData]);

  // Auto-stream mode: add new data points every interval
  useEffect(() => {
    if (!autoStream) return;

    const interval = setInterval(() => {
      setHistoricalData((prev) => {
        const lastValue = prev[prev.length - 1]?.value ?? MOCK_CONFIG.BASE_VALUE;
        const randomNormal = Math.random() + Math.random() - 1;
        const drift = 0.0005;
        const diffusion =
          (MOCK_CONFIG.VOLATILITY / 100) * randomNormal * 0.01;
        const newValue = Math.max(
          lastValue * (1 + drift + diffusion),
          MOCK_CONFIG.BASE_VALUE * 0.3
        );

        return [
          ...prev,
          {
            timestamp: Date.now(),
            value: parseFloat(newValue.toFixed(2)),
            metadata: { isStreaming: true },
          },
        ];
      });
    }, 15000); // Add new point every 15 seconds

    return () => clearInterval(interval);
  }, [autoStream]);

  return {
    historicalData,
    predictions,
    isLoading,
    refetch,
    addNewDataPoint,
  };
}
