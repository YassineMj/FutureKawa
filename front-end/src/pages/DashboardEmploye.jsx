import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { employeeNav } from '../config/navigation';

const kpis = [
  {
    label: 'Alertes à traiter',
    value: '2',
    sub: 'Entrepôt 1 & Sud',
    tone: 'danger',
  },
  {
    label: 'Lots enregistrés (7 j)',
    value: '14',
    sub: '2 aujourd’hui',
    tone: 'default',
  },
  {
    label: 'Mes entrepôts',
    value: '3',
    sub: 'Sud · 1 · 3',
    tone: 'success',
  },
  {
    label: 'Proches péremption',
    value: '1',
    sub: 'LOT-BR-2025-014',
    tone: 'warn',
  },
];

const alerts = [
  {
    title: 'LOT-BR-2025-014 périmé — 399 jours',
    meta: 'Entrepôt Sud · depuis le 18 juin',
    type: 'danger',
  },
  {
    title: 'Conditions hors plage — 36,0 °C / 42,6 %',
    meta: 'Entrepôt 1 · déclenchée à 11:30',
    type: 'warn',
  },
];

const lots = [
  {
    ref: 'LOT-BR-FRONT-01',
    warehouse: 'Entrepôt Sud',
    date: '22 juin',
    days: '0',
    status: 'Conforme',
    tone: 'ok',
  },
  {
    ref: 'LOT-BR-2026-088',
    warehouse: 'Entrepôt 1',
    date: '21 juin',
    days: '1',
    status: 'Conforme',
    tone: 'ok',
  },
  {
    ref: 'LOT-BR-2025-014',
    warehouse: 'Entrepôt Sud',
    date: '18 mai 2025',
    days: '399',
    status: 'Périmé',
    tone: 'danger',
  },
];

function KpiCard({ item }) {
  const toneStyles =
    item.tone === 'danger'
      ? 'border-rose-200 bg-rose-50/60'
      : item.tone === 'warn'
      ? 'border-amber-200 bg-amber-50/60'
      : item.tone === 'success'
      ? 'border-emerald-200 bg-emerald-50/60'
      : 'border-slate-200 bg-white';

  const subColor =
    item.tone === 'danger'
      ? 'text-rose-700'
      : item.tone === 'warn'
      ? 'text-amber-700'
      : item.tone === 'success'
      ? 'text-emerald-700'
      : 'text-slate-500';

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
    type === 'danger'
      ? 'bg-rose-50 text-rose-700 border border-rose-200'
      : type === 'warn'
      ? 'bg-amber-50 text-amber-700 border border-amber-200'
      : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {children}
    </span>
  );
}

export default function DashboardEmployee() {
  return (
    <DashboardLayout
      title="Périmètre"
      navItems={employeeNav}
      user={{
        initials: 'JS',
        name: 'João Silva',
        role: 'Opérateur · Brésil',
      }}
      topRightContent={
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            🟢 Brésil
          </span>

          <button className="rounded-xl bg-[#234b3f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d3f35] transition">
            + Enregistrer un lot
          </button>
        </div>
      }
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bonjour João</h1>
          <p className="mt-2 text-sm text-slate-500">
            Voici ce qui demande votre attention aujourd’hui.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((item) => (
            <KpiCard key={item.label} item={item} />
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-900">Alertes à traiter</h2>
          </div>

          <div className="p-4 space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 px-4 py-4 xl:flex-row xl:items-center xl:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                      alert.type === 'danger'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {alert.type === 'danger' ? '▲' : '∿'}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{alert.meta}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Acquitter
                  </button>
                  <button className="rounded-xl bg-[#234b3f] px-3 py-2 text-sm font-medium text-white hover:bg-[#1d3f35]">
                    Résoudre
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-900">Mes derniers lots</h2>
            <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Voir tous
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em]">Référence</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em]">Entrepôt</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em]">Stocké le</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em]">Jours</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em]">Statut</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {lots.map((lot) => (
                  <tr key={lot.ref} className="hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm font-medium text-slate-900">{lot.ref}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{lot.warehouse}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{lot.date}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{lot.days}</td>
                    <td className="px-5 py-4">
                      <StatusBadge type={lot.tone === 'danger' ? 'danger' : 'ok'}>
                        {lot.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}