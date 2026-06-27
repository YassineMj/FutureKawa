import React, { useMemo, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const FARM_OPTIONS = [
  'Toutes les exploitations',
  'Fazenda Santa Clara',
  'Fazenda Boa Vista',
];

const WAREHOUSES = [
  {
    id: 1,
    name: 'Entrepôt Sud',
    farm: 'Fazenda Santa Clara',
    lots: 52,
    temperature: 29.4,
    humidity: 55.2,
    sensors: '2/2',
    status: 'Conforme',
  },
  {
    id: 2,
    name: 'Entrepôt 1',
    farm: 'Fazenda Santa Clara',
    lots: 41,
    temperature: 36.0,
    humidity: 42.6,
    sensors: '2/2',
    status: 'Hors plage',
  },
  {
    id: 3,
    name: 'Entrepôt 3',
    farm: 'Fazenda Boa Vista',
    lots: 35,
    temperature: 28.7,
    humidity: 56.0,
    sensors: '2/2',
    status: 'Conforme',
  },
];

function StatusBadge({ children, tone = 'ok' }) {
  const styles =
    tone === 'danger'
      ? 'bg-rose-50 text-rose-700 border border-rose-200'
      : tone === 'warn'
      ? 'bg-amber-50 text-amber-700 border border-amber-200'
      : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {children}
    </span>
  );
}

function Readout({ value, unit, out = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 ${
        out ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-700'
      }`}
    >
      <span className="text-sm font-bold">{value}</span>
      <span className="text-xs">{unit}</span>
    </span>
  );
}

export default function Warehouses() {
  const [selectedFarm, setSelectedFarm] = useState('Toutes les exploitations');

  const filteredWarehouses = useMemo(() => {
    if (selectedFarm === 'Toutes les exploitations') return WAREHOUSES;
    return WAREHOUSES.filter((item) => item.farm === selectedFarm);
  }, [selectedFarm]);

  return (
    <DashboardLayout
      title="Périmètre"
      user={{
        initials: 'AB',
        name: 'Admin Brésil',
        role: 'Administrateur · Brésil',
      }}
      countryBadge="🟢 Brésil"
      menuVariant="admin-country"
    >
      <div className="space-y-6">
        {/* Header page */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Entrepôts</h1>
          <p className="mt-1 text-sm text-slate-500">
            Conditions actuelles par lieu de stockage. Les seuils suivent la cible du Brésil
            (29 °C / 55 %).
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedFarm}
            onChange={(e) => setSelectedFarm(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none focus:border-emerald-500"
          >
            {FARM_OPTIONS.map((farm) => (
              <option key={farm} value={farm}>
                {farm}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Entrepôt</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Exploitation</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Lots</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Température</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Humidité</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Capteurs</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">État</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredWarehouses.map((warehouse) => {
                  const isOut = warehouse.status === 'Hors plage';

                  return (
                    <tr key={warehouse.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">{warehouse.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{warehouse.farm}</td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-700">{warehouse.lots}</td>
                      <td className="px-6 py-4">
                        <Readout value={warehouse.temperature} unit="°C" out={isOut} />
                      </td>
                      <td className="px-6 py-4">
                        <Readout value={warehouse.humidity} unit="%" out={isOut} />
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-700">{warehouse.sensors}</td>
                      <td className="px-6 py-4">
                        <StatusBadge tone={isOut ? 'danger' : 'ok'}>
                          {warehouse.status}
                        </StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}