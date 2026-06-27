import React, { useMemo, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import AlertsToProcess from '../components/AlertsToProcess';
import { superAdminNav } from '../config/navigation';
import CountrySummaryTable from '../components/CountrySummaryTable';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const COUNTRIES = [
  { id: 'all', label: 'Tous' },
  { id: 'brazil', label: 'Brésil' },
  { id: 'ecuador', label: 'Équateur' },
  { id: 'colombia', label: 'Colombie' },
];

const DASHBOARD_DATA = {
  all: {
    title: 'Vue consolidée — tous les pays',
    subtitle:
      'État des stocks et des conditions de stockage au 22 juin 2026, 11:52.',
    kpis: [
      {
        label: 'Pays connectés',
        value: '3',
        suffix: '/3',
        sub: 'Tous les sites répondent',
        tone: 'success',
      },
      {
        label: 'Lots en stock',
        value: '312',
        sub: 'dont 7 proches de péremption',
        tone: 'default',
      },
      {
        label: 'Alertes actives',
        value: '4',
        sub: '2 conditions · 2 péremptions',
        tone: 'danger',
      },
      {
        label: 'Capteurs actifs',
        value: '17',
        suffix: '/18',
        sub: '1 capteur silencieux',
        tone: 'default',
      },
    ],
    chartTitle: 'Évolution des conditions — Entrepôt Sud (Brésil)',
    chartBadge: '7 derniers jours',
    temp: '29.4',
    hum: '55.2',
    chartStatus: 'Dans la plage idéale',
    lineData: [27.6, 28.2, 27.2, 29.1, 26.0, 28.7, 28.4, 29.4],
    lineLabels: [
      '16 juin',
      '17 juin',
      '18 juin',
      '19 juin',
      '20 juin',
      '21 juin',
      '22 juin',
      "Aujourd'hui",
    ],
    warehouses: [
      { name: 'Brésil', stock: 128, status: '2 alertes' },
      { name: 'Équateur', stock: 94, status: 'Conforme' },
      { name: 'Colombie', stock: 90, status: '2 alertes' },
    ],
  },

  brazil: {
    title: 'Vue consolidée — Brésil',
    subtitle:
      'État des stocks et des conditions de stockage au 22 juin 2026, 11:52.',
    kpis: [
      {
        label: 'Entrepôts actifs',
        value: '2',
        suffix: '/2',
        sub: 'Tous les sites répondent',
        tone: 'success',
      },
      {
        label: 'Lots en stock',
        value: '128',
        sub: 'dont 3 proches de péremption',
        tone: 'default',
      },
      {
        label: 'Alertes actives',
        value: '2',
        sub: '1 condition · 1 péremption',
        tone: 'danger',
      },
      {
        label: 'Capteurs actifs',
        value: '7',
        suffix: '/8',
        sub: '1 capteur silencieux',
        tone: 'default',
      },
    ],
    chartTitle: 'Évolution des conditions — Entrepôt Sud (Brésil)',
    chartBadge: '7 derniers jours',
    temp: '29.4',
    hum: '55.2',
    chartStatus: 'Dans la plage idéale',
    lineData: [27.6, 28.2, 27.2, 29.1, 26.0, 28.7, 28.4, 29.4],
    lineLabels: [
      '16 juin',
      '17 juin',
      '18 juin',
      '19 juin',
      '20 juin',
      '21 juin',
      '22 juin',
      "Aujourd'hui",
    ],
    warehouses: [
      { name: 'Entrepôt Sud', stock: 71, status: 'Conforme' },
      { name: 'Entrepôt 1', stock: 57, status: '2 alertes' },
    ],
  },

  ecuador: {
    title: 'Vue consolidée — Équateur',
    subtitle:
      'État des stocks et des conditions de stockage au 22 juin 2026, 11:52.',
    kpis: [
      {
        label: 'Entrepôts actifs',
        value: '3',
        suffix: '/3',
        sub: 'Tous les sites répondent',
        tone: 'success',
      },
      {
        label: 'Lots en stock',
        value: '94',
        sub: 'Aucune péremption proche',
        tone: 'default',
      },
      {
        label: 'Alertes actives',
        value: '0',
        sub: 'Aucune anomalie',
        tone: 'success',
      },
      {
        label: 'Capteurs actifs',
        value: '6',
        suffix: '/6',
        sub: 'Tous en ligne',
        tone: 'success',
      },
    ],
    chartTitle: 'Évolution des conditions — Finca El Oro',
    chartBadge: '7 derniers jours',
    temp: '31.0',
    hum: '59.8',
    chartStatus: 'Conforme',
    lineData: [30.2, 30.8, 31.2, 30.7, 31.0, 30.9, 31.1, 31.0],
    lineLabels: [
      '16 juin',
      '17 juin',
      '18 juin',
      '19 juin',
      '20 juin',
      '21 juin',
      '22 juin',
      "Aujourd'hui",
    ],
    warehouses: [
      { name: 'Finca El Oro — A', stock: 38, status: 'Conforme' },
      { name: 'Finca El Oro — B', stock: 21, status: 'Conforme' },
      { name: 'Finca Manabí', stock: 35, status: 'Conforme' },
    ],
  },

  colombia: {
    title: 'Vue consolidée — Colombie',
    subtitle:
      'État des stocks et des conditions de stockage au 22 juin 2026, 11:52.',
    kpis: [
      {
        label: 'Entrepôts actifs',
        value: '2',
        suffix: '/2',
        sub: 'Tous les sites répondent',
        tone: 'success',
      },
      {
        label: 'Lots en stock',
        value: '90',
        sub: 'dont 4 proches de péremption',
        tone: 'default',
      },
      {
        label: 'Alertes actives',
        value: '2',
        sub: '1 condition · 1 péremption',
        tone: 'danger',
      },
      {
        label: 'Capteurs actifs',
        value: '4',
        suffix: '/4',
        sub: 'Tous en ligne',
        tone: 'success',
      },
    ],
    chartTitle: 'Évolution des conditions — Entrepôt Bogotá',
    chartBadge: '7 derniers jours',
    temp: '24.8',
    hum: '63.1',
    chartStatus: 'Sous surveillance',
    lineData: [24.1, 24.6, 25.0, 24.7, 25.2, 24.8, 24.4, 24.8],
    lineLabels: [
      '16 juin',
      '17 juin',
      '18 juin',
      '19 juin',
      '20 juin',
      '21 juin',
      '22 juin',
      "Aujourd'hui",
    ],
    warehouses: [
      { name: 'Entrepôt Bogotá', stock: 46, status: '1 alerte' },
      { name: 'Entrepôt Cali', stock: 44, status: '1 alerte' },
    ],
  },
};

const ALERTS_DATA = {
  all: [
    {
      id: 1,
      type: 'danger',
      title: 'Lot LOT-BR-2025-014 périmé — 399 jours de stockage',
      meta: 'Brésil · Entrepôt Sud · depuis le 18 juin',
    },
    {
      id: 2,
      type: 'warning',
      title: 'Conditions hors plage — 36,0 °C / 42,6 % (attendu 26–32 °C)',
      meta: 'Brésil · Entrepôt 1 · déclenchée à 11:30 · 8 notifications',
    },
    {
      id: 3,
      type: 'warning',
      title: 'Humidité basse — 71 % (attendu 78–82 %)',
      meta: 'Colombie · Finca La Esperanza · déclenchée à 09:14',
    },
    {
      id: 4,
      type: 'danger',
      title: 'Lot LOT-CO-2025-021 proche péremption',
      meta: 'Colombie · Entrepôt Bogotá · 362 jours de stockage',
    },
  ],
  brazil: [
    {
      id: 1,
      type: 'danger',
      title: 'Lot LOT-BR-2025-014 périmé — 399 jours de stockage',
      meta: 'Brésil · Entrepôt Sud · depuis le 18 juin',
    },
    {
      id: 2,
      type: 'warning',
      title: 'Conditions hors plage — 36,0 °C / 42,6 % (attendu 26–32 °C)',
      meta: 'Brésil · Entrepôt 1 · déclenchée à 11:30 · 8 notifications',
    },
  ],
  ecuador: [],
  colombia: [
    {
      id: 3,
      type: 'warning',
      title: 'Humidité basse — 71 % (attendu 78–82 %)',
      meta: 'Colombie · Finca La Esperanza · déclenchée à 09:14',
    },
    {
      id: 4,
      type: 'danger',
      title: 'Lot LOT-CO-2025-021 proche péremption',
      meta: 'Colombie · Entrepôt Bogotá · 362 jours de stockage',
    },
  ],
};

function KpiCard({ item }) {
  const leftBorder =
    item.tone === 'danger'
      ? 'border-rose-500'
      : item.tone === 'success'
      ? 'border-emerald-500'
      : 'border-slate-200';

  const subColor =
    item.tone === 'danger'
      ? 'text-rose-600'
      : item.tone === 'success'
      ? 'text-emerald-600'
      : 'text-slate-500';

  return (
    <div
      className={`bg-white border-l-4 ${leftBorder} border-t border-r border-b border-slate-200 rounded-2xl p-5 shadow-sm`}
    >
      <p className="text-sm font-medium uppercase tracking-wider text-slate-500 mb-3">
        {item.label}
      </p>

      <div className="flex items-end gap-1">
        <span className="text-4xl font-bold text-slate-900">{item.value}</span>
        {item.suffix && (
          <span className="text-xl font-semibold text-slate-500 mb-1">
            {item.suffix}
          </span>
        )}
      </div>

      <p className={`mt-2 text-sm ${subColor}`}>{item.sub}</p>
    </div>
  );
}

function StatusBadge({ children, type = 'ok' }) {
  const styles =
    type === 'warn'
      ? 'bg-amber-50 text-amber-700 border border-amber-200'
      : type === 'danger'
      ? 'bg-rose-50 text-rose-700 border border-rose-200'
      : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${styles}`}
    >
      {children}
    </span>
  );
}

export default function Dashboard() {
  const [selectedCountry, setSelectedCountry] = useState('all');
  const current = DASHBOARD_DATA[selectedCountry];
  const alerts = ALERTS_DATA[selectedCountry] || [];

  const lineChartData = useMemo(
    () => ({
      labels: current.lineLabels,
      datasets: [
        {
          label: 'Température',
          data: current.lineData,
          borderColor: '#0f766e',
          backgroundColor: 'rgba(16, 185, 129, 0.10)',
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: current.lineData.map((_, i) =>
            i === 4 ? '#e11d48' : '#0f766e'
          ),
          pointBorderColor: current.lineData.map((_, i) =>
            i === 4 ? '#e11d48' : '#0f766e'
          ),
        },
      ],
    }),
    [current]
  );

  const lineChartOptions = useMemo(
    () => ({
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
            font: { size: 12 },
            maxRotation: 0,
            minRotation: 0,
          },
          border: { display: false },
        },
        y: {
          ticks: { display: false },
          grid: {
            color: 'rgba(148, 163, 184, 0.18)',
            borderDash: [5, 5],
            drawTicks: false,
          },
          border: { display: false },
        },
      },
    }),
    []
  );

  const doughnutData = {
    labels: ['Péremption', 'Conditions', 'Résolues (7 j)'],
    datasets: [
      {
        data: [2, 2, 11],
        backgroundColor: ['#e11d48', '#f59e0b', '#10b981'],
        borderWidth: 0,
        cutout: '62%',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  return (
    <DashboardLayout
      title="Vue consolidée"
      navItems={superAdminNav}
      topTabs={COUNTRIES}
      activeTab={selectedCountry}
      onTabChange={setSelectedCountry}
      user={{
        initials: 'SA',
        name: 'Super Admin',
        role: 'Siège · tous pays',
      }}
    >
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
          {current.title}
        </h1>
        <p className="text-slate-500 text-base sm:text-lg">{current.subtitle}</p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {current.kpis.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.55fr_1fr] gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {current.chartTitle}
            </h2>

            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
              {current.chartBadge}
            </span>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div>
                <p className="text-sm text-slate-500 mb-1">Température</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-slate-900">
                    {current.temp}
                  </span>
                  <span className="text-lg text-slate-500 mb-1">°C</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Humidité</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-slate-900">
                    {current.hum}
                  </span>
                  <span className="text-lg text-slate-500 mb-1">%HR</span>
                </div>
              </div>

              <StatusBadge>{current.chartStatus}</StatusBadge>
            </div>

            <div className="h-[320px]">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Répartition des alertes
            </h2>
          </div>

          <div className="p-6 flex flex-col lg:flex-row items-center justify-center gap-8 min-h-[380px]">
            <div className="w-[220px] h-[220px]">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>

            <div className="space-y-4 w-full max-w-[260px]">
              <div className="flex items-center justify-between text-base">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded bg-rose-500" />
                  <span className="text-slate-700">Péremption</span>
                </div>
                <span className="font-bold text-slate-900">2</span>
              </div>

              <div className="flex items-center justify-between text-base">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded bg-amber-500" />
                  <span className="text-slate-700">Conditions</span>
                </div>
                <span className="font-bold text-slate-900">2</span>
              </div>

              <div className="flex items-center justify-between text-base">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-500" />
                  <span className="text-slate-700">Résolues (7 j)</span>
                </div>
                <span className="font-bold text-slate-900">11</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Répartition des stocks
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">
                  Pays / Entrepôt
                </th>
                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">
                  Lots en stock
                </th>
                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {current.warehouses.map((row) => {
                const badgeType = row.status.toLowerCase().includes('alerte')
                  ? 'warn'
                  : 'ok';

                return (
                  <tr key={row.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{row.stock}</td>
                    <td className="px-6 py-4">
                      <StatusBadge type={badgeType}>{row.status}</StatusBadge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="space-y-8">
        <AlertsToProcess alerts={alerts} />

        {selectedCountry === 'all' && <CountrySummaryTable />}
      </div>
    </DashboardLayout>
  );
}
