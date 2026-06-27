import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { adminPaysNav } from '../config/navigation';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend
);

const kpis = [
  {
    label: 'Lots en stock',
    value: '94',
    sub: '3 fincas actives',
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
    value: '6/6',
    sub: 'Tous en ligne',
    tone: 'success',
  },
  {
    label: 'Condition moyenne',
    value: '31.1°C',
    sub: 'cible 31 °C / 60 %',
    tone: 'default',
  },
];

const warehouses = [
  { name: 'Finca El Oro — A', stock: 38, status: 'Conforme' },
  { name: 'Finca El Oro — B', stock: 21, status: 'Conforme' },
  { name: 'Finca Manabí', stock: 35, status: 'Conforme' },
];

const recentActivity = [
  {
    title: 'Lot LOT-EC-2026-031 enregistré',
    meta: 'Finca Manabí · il y a 2 h',
    type: 'success',
  },
  {
    title: 'Alerte conditions résolue automatiquement (durée 4 min)',
    meta: 'Finca El Oro — A · hier 15:38',
    type: 'success',
  },
];

function KpiCard({ item }) {
  const toneStyles =
    item.tone === 'success'
      ? 'border-emerald-200 bg-emerald-50/60'
      : 'border-slate-200 bg-white';

  const subColor =
    item.tone === 'success' ? 'text-emerald-700' : 'text-slate-500';

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneStyles}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {item.label}
      </p>
      <div className="mt-3 text-3xl font-bold text-slate-900">{item.value}</div>
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
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {children}
    </span>
  );
}

export default function DashboardAdminPays() {
  const chartData = {
    labels: ['16 juin', '17 juin', '18 juin', '19 juin', '20 juin', '21 juin', '22 juin', "Aujourd'hui"],
    datasets: [
      {
        label: 'Température',
        data: [30.2, 30.8, 31.2, 30.7, 31.0, 30.9, 31.1, 31.0],
        borderColor: '#0f766e',
        backgroundColor: 'rgba(15,118,110,0.10)',
        fill: true,
        tension: 0.35,
        borderWidth: 3,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#64748b', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(148,163,184,0.18)', drawTicks: false },
        border: { display: false },
        ticks: { display: false },
      },
    },
  };

  return (
    <DashboardLayout
      title="Périmètre"
      navItems={adminPaysNav}
      user={{
        initials: 'AE',
        name: 'Admin Équateur',
        role: 'Administrateur · Équateur',
      }}
      topRightContent={
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
          🟢 Équateur
        </span>
      }
    >
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Équateur — supervision</h1>
          <p className="mt-2 text-sm text-slate-500">
            Vos exploitations, entrepôts et conditions de stockage en temps réel.
          </p>
        </div>

        {/* KPI */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((item) => (
            <KpiCard key={item.label} item={item} />
          ))}
        </section>

        {/* Charts + stock */}
        <section className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">Conditions — Finca El Oro</h2>
              <StatusBadge>Conforme</StatusBadge>
            </div>

            <div className="p-5">
              <div className="mb-5 flex items-center gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Température</p>
                  <div className="mt-1 flex items-end gap-1">
                    <span className="text-3xl font-bold text-slate-900">31.0</span>
                    <span className="text-sm text-slate-500">°C</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Humidité</p>
                  <div className="mt-1 flex items-end gap-1">
                    <span className="text-3xl font-bold text-slate-900">59.8</span>
                    <span className="text-sm text-slate-500">%HR</span>
                  </div>
                </div>
              </div>

              <div className="h-[250px]">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">Stock par entrepôt</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-200">
                  {warehouses.map((row) => (
                    <tr key={row.name}>
                      <td className="px-5 py-4 text-sm font-medium text-slate-800">{row.name}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{row.stock}</td>
                      <td className="px-5 py-4">
                        <StatusBadge>{row.status}</StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Activité récente */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-900">Activité récente</h2>
          </div>

          <div className="p-4 space-y-3">
            {recentActivity.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-xl border border-slate-200 px-4 py-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 font-bold">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}