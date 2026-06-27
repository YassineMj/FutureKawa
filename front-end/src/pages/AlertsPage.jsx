import React, { useMemo, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const COUNTRY_TABS = [
  { id: 'all', label: 'Tous' },
  { id: 'brazil', label: 'Brésil' },
  { id: 'ecuador', label: 'Équateur' },
  { id: 'colombia', label: 'Colombie' },
];

const ALERT_TABS = [
  { id: 'active', label: 'Actives' },
  { id: 'acknowledged', label: 'Acquittées' },
  { id: 'resolved', label: 'Résolues' },
];

const ACTIVE_ALERTS = [
  {
    id: 1,
    country: 'brazil',
    type: 'Péremption',
    typeTone: 'danger',
    description: 'Lot LOT-BR-2025-014 — 399 jours',
    location: 'Brésil · Entrepôt Sud',
    triggeredAt: '18 juin',
    notifications: 0,
  },
  {
    id: 2,
    country: 'brazil',
    type: 'Conditions',
    typeTone: 'warn',
    description: '36,0 °C / 42,6 % (attendu 26–32 °C)',
    location: 'Brésil · Entrepôt 1',
    triggeredAt: '11:30',
    notifications: 8,
  },
  {
    id: 3,
    country: 'colombia',
    type: 'Conditions',
    typeTone: 'warn',
    description: 'Humidité 71 % (attendu 78–82 %)',
    location: 'Colombie · Finca La Esperanza',
    triggeredAt: '09:14',
    notifications: 3,
  },
  {
    id: 4,
    country: 'colombia',
    type: 'Péremption',
    typeTone: 'danger',
    description: 'Lot LOT-CO-2025-007 — 372 jours',
    location: 'Colombie · Finca El Paraíso',
    triggeredAt: '20 juin',
    notifications: 0,
  },
];

const ACKNOWLEDGED_ALERTS = [
  {
    id: 101,
    country: 'brazil',
    type: 'Conditions',
    typeTone: 'warn',
    description: '33,4 °C / 61,2 % (surveillance en cours)',
    location: 'Brésil · Entrepôt 3',
    triggeredAt: '22 juin · 08:20',
    acknowledgedAt: '22 juin · 08:24',
    notifications: 2,
    acknowledgedBy: 'João Silva',
  },
];

const RESOLVED_ALERTS = [
  {
    id: 201,
    country: 'brazil',
    type: 'Conditions',
    description: '21,3 °C / 45,6 %',
    location: 'Brésil · Entrepôt 1',
    triggeredAt: '21 juin 15:32',
    resolvedAt: '21 juin 15:38',
    duration: '6 min',
    mode: 'Auto',
    modeTone: 'ok',
  },
  {
    id: 202,
    country: 'brazil',
    type: 'Conditions',
    description: '36,5 °C / 65,2 %',
    location: 'Brésil · Entrepôt 1',
    triggeredAt: '21 juin 09:25',
    resolvedAt: '21 juin 09:30',
    duration: '5 min',
    mode: 'Manuel',
    modeTone: 'info',
  },
  {
    id: 203,
    country: 'brazil',
    type: 'Conditions',
    description: '20,9 °C / 69,2 %',
    location: 'Brésil · Entrepôt 3',
    triggeredAt: '19 juin 15:13',
    resolvedAt: '19 juin 15:16',
    duration: '3 min',
    mode: 'Auto',
    modeTone: 'ok',
  },
  {
    id: 204,
    country: 'ecuador',
    type: 'Conditions',
    description: '22,8 °C / 68,7 %',
    location: 'Équateur · Finca El Oro',
    triggeredAt: '18 juin 20:36',
    resolvedAt: '18 juin 20:37',
    duration: '1 min',
    mode: 'Auto',
    modeTone: 'ok',
  },
];

function Badge({ children, tone = 'default' }) {
  const styles =
    tone === 'danger'
      ? 'bg-rose-50 text-rose-700 border border-rose-200'
      : tone === 'warn'
      ? 'bg-amber-50 text-amber-700 border border-amber-200'
      : tone === 'ok'
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : tone === 'info'
      ? 'bg-sky-50 text-sky-700 border border-sky-200'
      : 'bg-slate-100 text-slate-700 border border-slate-200';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}
    >
      {children}
    </span>
  );
}

function FilterChip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-slate-900 text-white'
          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 px-1 pb-3 pt-1 text-sm font-semibold transition ${
        active
          ? 'border-emerald-600 text-emerald-700'
          : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

export default function AlertsPage() {
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedTab, setSelectedTab] = useState('active');
  const [alertTypeFilter, setAlertTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('2026-06-15');
  const [dateTo, setDateTo] = useState('2026-06-22');

  const filteredActiveAlerts = useMemo(() => {
    return ACTIVE_ALERTS.filter((alert) => {
      const countryMatch =
        selectedCountry === 'all' || alert.country === selectedCountry;

      const typeMatch =
        alertTypeFilter === 'all' ||
        (alertTypeFilter === 'conditions' && alert.type === 'Conditions') ||
        (alertTypeFilter === 'expiration' && alert.type === 'Péremption');

      return countryMatch && typeMatch;
    });
  }, [selectedCountry, alertTypeFilter]);

  const filteredAcknowledgedAlerts = useMemo(() => {
    return ACKNOWLEDGED_ALERTS.filter((alert) => {
      return selectedCountry === 'all' || alert.country === selectedCountry;
    });
  }, [selectedCountry]);

  const filteredResolvedAlerts = useMemo(() => {
    return RESOLVED_ALERTS.filter((alert) => {
      return selectedCountry === 'all' || alert.country === selectedCountry;
    });
  }, [selectedCountry]);

  const activeCount = filteredActiveAlerts.length;
  const acknowledgedCount = filteredAcknowledgedAlerts.length;
  const resolvedCount = filteredResolvedAlerts.length;

  return (
    <DashboardLayout
      title="Vue consolidée"
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
          {selectedTab === 'resolved' ? 'Historique des alertes' : 'Alertes'}
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          {selectedTab === 'resolved'
            ? 'Incidents clôturés, avec durée et mode de résolution.'
            : 'Incidents en cours sur l’ensemble du réseau.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap items-center gap-6 border-b border-slate-200">
        <TabButton
          active={selectedTab === 'active'}
          onClick={() => setSelectedTab('active')}
        >
          Actives ({activeCount})
        </TabButton>

        <TabButton
          active={selectedTab === 'acknowledged'}
          onClick={() => setSelectedTab('acknowledged')}
        >
          Acquittées ({acknowledgedCount})
        </TabButton>

        <TabButton
          active={selectedTab === 'resolved'}
          onClick={() => setSelectedTab('resolved')}
        >
          Résolues ({resolvedCount})
        </TabButton>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        {selectedTab !== 'resolved' ? (
          <>
            <div className="flex flex-wrap gap-3">
              <FilterChip
                active={alertTypeFilter === 'all'}
                onClick={() => setAlertTypeFilter('all')}
              >
                Tous types
              </FilterChip>

              <FilterChip
                active={alertTypeFilter === 'conditions'}
                onClick={() => setAlertTypeFilter('conditions')}
              >
                Conditions
              </FilterChip>

              <FilterChip
                active={alertTypeFilter === 'expiration'}
                onClick={() => setAlertTypeFilter('expiration')}
              >
                Péremption
              </FilterChip>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
              />
              <span className="text-slate-400">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="lg:ml-auto">
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Exporter CSV
              </button>
            </div>
          </>
        )}
      </div>

      {/* CONTENT */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {selectedTab === 'active' && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Pays · lieu
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Déclenchée
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Notifs
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredActiveAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <Badge tone={alert.typeTone}>{alert.type}</Badge>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-800">
                      {alert.description}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {alert.location}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {alert.triggeredAt}
                    </td>

                    <td className="px-6 py-4 text-sm font-mono text-slate-700">
                      {alert.notifications}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                          Acquitter
                        </button>
                        <button className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800">
                          Résoudre
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredActiveAlerts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                      Aucune alerte active pour ce filtre.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {selectedTab === 'acknowledged' && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Pays · lieu
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Déclenchée
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Acquittée par
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Notifs
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredAcknowledgedAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <Badge tone={alert.typeTone}>{alert.type}</Badge>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-800">
                      {alert.description}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {alert.location}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {alert.triggeredAt}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {alert.acknowledgedBy}
                    </td>

                    <td className="px-6 py-4 text-sm font-mono text-slate-700">
                      {alert.notifications}
                    </td>

                    <td className="px-6 py-4">
                      <button className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800">
                        Résoudre
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredAcknowledgedAlerts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                      Aucune alerte acquittée pour ce filtre.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {selectedTab === 'resolved' && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                      Pays · lieu
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                      Déclenchée
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                      Résolue
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                      Durée
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                      Mode
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {filteredResolvedAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <Badge>{alert.type}</Badge>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-800">
                        {alert.description}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {alert.location}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {alert.triggeredAt}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {alert.resolvedAt}
                      </td>

                      <td className="px-6 py-4 text-sm font-mono text-slate-700">
                        {alert.duration}
                      </td>

                      <td className="px-6 py-4">
                        <Badge tone={alert.modeTone}>{alert.mode}</Badge>
                      </td>
                    </tr>
                  ))}

                  {filteredResolvedAlerts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                        Aucune alerte résolue pour ce filtre.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-slate-200 px-6 py-4">
              <button className="h-9 min-w-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50">
                ‹
              </button>
              <button className="h-9 min-w-9 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white">
                1
              </button>
              <button className="h-9 min-w-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50">
                2
              </button>
              <button className="h-9 min-w-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50">
                3
              </button>
              <button className="h-9 min-w-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50">
                ›
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}