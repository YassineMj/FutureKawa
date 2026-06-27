import React, { useMemo, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const COUNTRY_TABS = [
  { id: 'all', label: 'Tous' },
  { id: 'brazil', label: 'Brésil' },
  { id: 'ecuador', label: 'Équateur' },
  { id: 'colombia', label: 'Colombie' },
];

const MEASURES_DATA = {
  all: {
    title: 'Mesures — vue consolidée',
    subtitle: 'Historique des conditions relevées par les capteurs sur l’ensemble des pays.',
    warehouseOptions: ['Tous les entrepôts', 'Brésil · Entrepôt Sud', 'Équateur · Finca El Oro', 'Colombie · Entrepôt Bogotá'],
    selectedWarehouse: 'Tous les entrepôts',

    temperature: {
      target: '26–32 °C',
      max: '36.0',
      unit: '°C max',
      status: 'warn',
      labels: ['16 juin', '17 juin', '18 juin', '19 juin', '20 juin', '21 juin', '22 juin', "Aujourd'hui"],
      values: [28.5, 29.1, 28.7, 30.2, 33.8, 36.0, 31.8, 30.4],
      minZone: 26,
      maxZone: 32,
      yMin: 22,
      yMax: 40,
    },

    humidity: {
      target: '53–60 %',
      value: '56.4',
      unit: '%HR',
      status: 'ok',
      labels: ['16 juin', '17 juin', '18 juin', '19 juin', '20 juin', '21 juin', '22 juin', "Aujourd'hui"],
      values: [55.2, 54.8, 56.1, 55.5, 52.7, 53.4, 57.0, 56.4],
      minZone: 53,
      maxZone: 60,
      yMin: 45,
      yMax: 65,
    },
  },

  brazil: {
    title: 'Mesures — Brésil',
    subtitle: 'Historique des conditions relevées par les capteurs du Brésil.',
    warehouseOptions: ['Entrepôt Sud', 'Entrepôt 1', 'Entrepôt 3'],
    selectedWarehouse: 'Entrepôt 1',

    temperature: {
      target: '26–32 °C',
      max: '36.0',
      unit: '°C max',
      status: 'warn',
      labels: ['16 juin', '17 juin', '18 juin', '19 juin', '20 juin', '21 juin', '22 juin', "Aujourd'hui"],
      values: [28.0, 28.6, 29.2, 30.1, 33.6, 36.0, 31.7, 30.2],
      minZone: 26,
      maxZone: 32,
      yMin: 22,
      yMax: 40,
    },

    humidity: {
      target: '53–57 %',
      value: '55.2',
      unit: '%HR',
      status: 'ok',
      labels: ['16 juin', '17 juin', '18 juin', '19 juin', '20 juin', '21 juin', '22 juin', "Aujourd'hui"],
      values: [54.6, 55.0, 55.7, 54.8, 52.9, 53.4, 54.9, 55.2],
      minZone: 53,
      maxZone: 57,
      yMin: 48,
      yMax: 62,
    },
  },

  ecuador: {
    title: 'Mesures — Équateur',
    subtitle: 'Historique des conditions relevées par les capteurs de l’Équateur.',
    warehouseOptions: ['Finca El Oro', 'Finca El Oro — A', 'Finca Manabí'],
    selectedWarehouse: 'Finca El Oro',

    temperature: {
      target: '29–33 °C',
      max: '31.1',
      unit: '°C moy.',
      status: 'ok',
      labels: ['16 juin', '17 juin', '18 juin', '19 juin', '20 juin', '21 juin', '22 juin', "Aujourd'hui"],
      values: [30.2, 30.8, 31.2, 30.7, 31.0, 30.9, 31.1, 31.0],
      minZone: 29,
      maxZone: 33,
      yMin: 26,
      yMax: 36,
    },

    humidity: {
      target: '58–62 %',
      value: '59.8',
      unit: '%HR',
      status: 'ok',
      labels: ['16 juin', '17 juin', '18 juin', '19 juin', '20 juin', '21 juin', '22 juin', "Aujourd'hui"],
      values: [58.7, 59.1, 60.0, 59.4, 60.3, 59.6, 59.9, 59.8],
      minZone: 58,
      maxZone: 62,
      yMin: 52,
      yMax: 66,
    },
  },

  colombia: {
    title: 'Mesures — Colombie',
    subtitle: 'Historique des conditions relevées par les capteurs de la Colombie.',
    warehouseOptions: ['Entrepôt Bogotá', 'Entrepôt Cali'],
    selectedWarehouse: 'Entrepôt Bogotá',

    temperature: {
      target: '24–28 °C',
      max: '28.9',
      unit: '°C max',
      status: 'warn',
      labels: ['16 juin', '17 juin', '18 juin', '19 juin', '20 juin', '21 juin', '22 juin', "Aujourd'hui"],
      values: [24.4, 24.9, 25.2, 25.8, 26.7, 28.9, 27.2, 26.4],
      minZone: 24,
      maxZone: 28,
      yMin: 20,
      yMax: 32,
    },

    humidity: {
      target: '60–65 %',
      value: '63.1',
      unit: '%HR',
      status: 'ok',
      labels: ['16 juin', '17 juin', '18 juin', '19 juin', '20 juin', '21 juin', '22 juin', "Aujourd'hui"],
      values: [61.4, 62.1, 63.5, 62.8, 61.9, 64.0, 63.4, 63.1],
      minZone: 60,
      maxZone: 65,
      yMin: 54,
      yMax: 70,
    },
  },
};

function StatusBadge({ children, tone = 'ok' }) {
  const styles =
    tone === 'warn'
      ? 'bg-amber-50 text-amber-700 border border-amber-200'
      : tone === 'danger'
      ? 'bg-rose-50 text-rose-700 border border-rose-200'
      : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {children}
    </span>
  );
}

function buildLineOptions({ yMin, yMax }) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          maxRotation: 0,
          minRotation: 0,
        },
        border: { display: false },
      },
      y: {
        min: yMin,
        max: yMax,
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.18)',
          borderDash: [5, 5],
          drawTicks: false,
        },
        border: { display: false },
      },
    },
  };
}

function buildDataset({ labels, values, minZone, maxZone, lineColor, zoneColor, pointColor }) {
  return {
    labels,
    datasets: [
      {
        label: 'Mesure',
        data: values,
        borderColor: lineColor,
        backgroundColor: zoneColor,
        fill: false,
        tension: 0.35,
        borderWidth: 3,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: values.map((v) =>
          v < minZone || v > maxZone ? pointColor : lineColor
        ),
        pointBorderColor: values.map((v) =>
          v < minZone || v > maxZone ? pointColor : lineColor
        ),
      },
    ],
  };
}

function RangeArea({ min, max, chartMin, chartMax, color }) {
  const top = ((chartMax - max) / (chartMax - chartMin)) * 100;
  const height = ((max - min) / (chartMax - chartMin)) * 100;

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 rounded-xl"
      style={{
        top: `${top}%`,
        height: `${height}%`,
        background: color,
      }}
    />
  );
}

function MeasureCard({
  title,
  badge,
  readout,
  readoutUnit,
  readoutTone = 'ok',
  chartData,
  chartOptions,
  minZone,
  maxZone,
  yMin,
  yMax,
  zoneColor,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <div className="md:ml-auto flex flex-wrap items-center gap-3">
          <StatusBadge tone="ok">{badge}</StatusBadge>

          <div
            className={`inline-flex items-end gap-1 rounded-2xl px-3 py-2 ${
              readoutTone === 'warn'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-slate-100 text-slate-800'
            }`}
          >
            <span className="text-2xl font-bold">{readout}</span>
            <span className="text-sm mb-0.5">{readoutUnit}</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="relative h-[280px]">
          <RangeArea
            min={minZone}
            max={maxZone}
            chartMin={yMin}
            chartMax={yMax}
            color={zoneColor}
          />
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

export default function MeasuresPage() {
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('7 jours');

  const current = MEASURES_DATA[selectedCountry];

  const temperatureData = useMemo(
    () =>
      buildDataset({
        labels: current.temperature.labels,
        values: current.temperature.values,
        minZone: current.temperature.minZone,
        maxZone: current.temperature.maxZone,
        lineColor: '#0f766e',
        zoneColor: 'rgba(16, 185, 129, 0.08)',
        pointColor: '#b45309',
      }),
    [current]
  );

  const humidityData = useMemo(
    () =>
      buildDataset({
        labels: current.humidity.labels,
        values: current.humidity.values,
        minZone: current.humidity.minZone,
        maxZone: current.humidity.maxZone,
        lineColor: '#2563eb',
        zoneColor: 'rgba(59, 130, 246, 0.08)',
        pointColor: '#b45309',
      }),
    [current]
  );

  const temperatureOptions = useMemo(
    () =>
      buildLineOptions({
        yMin: current.temperature.yMin,
        yMax: current.temperature.yMax,
      }),
    [current]
  );

  const humidityOptions = useMemo(
    () =>
      buildLineOptions({
        yMin: current.humidity.yMin,
        yMax: current.humidity.yMax,
      }),
    [current]
  );

  return (
    <DashboardLayout
      title="Mesures"
      topTabs={COUNTRY_TABS}
      activeTab={selectedCountry}
      onTabChange={setSelectedCountry}
      user={{
        initials: 'SA',
        name: 'Super Admin',
        role: 'Siège · tous pays',
      }}
    >
      <div className="mb-8">
        <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-slate-900">
          {current.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-500">{current.subtitle}</p>
      </div>

      {/* toolbar */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <select
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
          defaultValue={current.selectedWarehouse}
        >
          {current.warehouseOptions.map((warehouse) => (
            <option key={warehouse}>{warehouse}</option>
          ))}
        </select>

        <div className="flex flex-wrap gap-2">
          {['24 h', '7 jours', '30 jours'].map((period) => {
            const active = selectedPeriod === period;
            return (
              <button
                key={period}
                type="button"
                onClick={() => setSelectedPeriod(period)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {period}
              </button>
            );
          })}
        </div>

        <div className="lg:ml-auto">
          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Exporter CSV
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <MeasureCard
          title="Température"
          badge={`Cible ${current.temperature.target}`}
          readout={current.temperature.max}
          readoutUnit={current.temperature.unit}
          readoutTone={current.temperature.status}
          chartData={temperatureData}
          chartOptions={temperatureOptions}
          minZone={current.temperature.minZone}
          maxZone={current.temperature.maxZone}
          yMin={current.temperature.yMin}
          yMax={current.temperature.yMax}
          zoneColor="rgba(16, 185, 129, 0.12)"
        />

        <MeasureCard
          title="Humidité"
          badge={`Cible ${current.humidity.target}`}
          readout={current.humidity.value}
          readoutUnit={current.humidity.unit}
          readoutTone={current.humidity.status}
          chartData={humidityData}
          chartOptions={humidityOptions}
          minZone={current.humidity.minZone}
          maxZone={current.humidity.maxZone}
          yMin={current.humidity.yMin}
          yMax={current.humidity.yMax}
          zoneColor="rgba(59, 130, 246, 0.12)"
        />
      </div>
    </DashboardLayout>
  );
}