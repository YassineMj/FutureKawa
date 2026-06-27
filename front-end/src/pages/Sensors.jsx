import React, { useMemo, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const FILTERS = ['Tous', 'Actifs', 'Silencieux'];

const SENSORS = [
  {
    id: 1,
    name: 'capteur-br-sud-01',
    warehouse: 'Entrepôt Sud',
    lastMeasure: 'il y a 12 s',
    temperature: 29.4,
    humidity: 55.2,
    status: 'Actif',
    outOfRange: false,
  },
  {
    id: 2,
    name: 'capteur-br-sud-02',
    warehouse: 'Entrepôt Sud',
    lastMeasure: 'il y a 9 s',
    temperature: 29.1,
    humidity: 54.8,
    status: 'Actif',
    outOfRange: false,
  },
  {
    id: 3,
    name: 'capteur-br-e1-01',
    warehouse: 'Entrepôt 1',
    lastMeasure: 'il y a 7 s',
    temperature: 36.0,
    humidity: 42.6,
    status: 'Actif',
    outOfRange: true,
  },
  {
    id: 4,
    name: 'capteur-br-e3-02',
    warehouse: 'Entrepôt 3',
    lastMeasure: 'il y a 47 min',
    temperature: null,
    humidity: null,
    status: 'Silencieux',
    outOfRange: false,
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

export default function Sensors() {
  const [activeFilter, setActiveFilter] = useState('Tous');

  const filteredSensors = useMemo(() => {
    if (activeFilter === 'Tous') return SENSORS;
    return SENSORS.filter((sensor) => sensor.status === activeFilter.slice(0, -1) + 'f' ? sensor.status === 'Actif' : sensor.status === activeFilter);
  }, [activeFilter]);

  // version plus sûre
  const displayedSensors = useMemo(() => {
    if (activeFilter === 'Tous') return SENSORS;
    if (activeFilter === 'Actifs') return SENSORS.filter((sensor) => sensor.status === 'Actif');
    if (activeFilter === 'Silencieux') return SENSORS.filter((sensor) => sensor.status === 'Silencieux');
    return SENSORS;
  }, [activeFilter]);

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
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Capteurs</h1>
          <p className="mt-1 text-sm text-slate-500">
            Un capteur est « actif » s&apos;il a transmis une mesure dans les 10 dernières minutes.
          </p>
        </div>

        {/* Toolbar filtres */}
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Capteur</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Entrepôt</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Dernière mesure</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Valeurs</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">État</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {displayedSensors.map((sensor) => (
                  <tr key={sensor.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-slate-800">{sensor.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{sensor.warehouse}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{sensor.lastMeasure}</td>

                    <td className="px-6 py-4">
                      {sensor.status === 'Silencieux' ? (
                        <span className="text-sm text-slate-400">—</span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <Readout
                            value={sensor.temperature}
                            unit="°C"
                            out={sensor.outOfRange}
                          />
                          <span className="text-slate-300">·</span>
                          <Readout
                            value={sensor.humidity}
                            unit="%"
                            out={sensor.outOfRange}
                          />
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge tone={sensor.status === 'Silencieux' ? 'danger' : 'ok'}>
                        {sensor.status}
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