import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { paysApi } from '../services/api';

const TARGETS = {
  BRESIL: { target: '29 °C · 55 %HR', tolerance: '± 3 °C · ± 2 %' },
  EQUATEUR: { target: '31 °C · 60 %HR', tolerance: '± 3 °C · ± 2 %' },
  COLOMBIE: { target: '26 °C · 80 %HR', tolerance: '± 3 °C · ± 2 %' },
};

const PAYS_LABEL = { BRESIL: 'Brésil', EQUATEUR: 'Équateur', COLOMBIE: 'Colombie' };

function StatusBadge({ children, tone = 'ok' }) {
  const styles =
    tone === 'danger'
      ? 'bg-rose-50 text-rose-700 border border-rose-200'
      : tone === 'warn'
      ? 'bg-amber-50 text-amber-700 border border-amber-200'
      : tone === 'neutral'
      ? 'bg-slate-100 text-slate-600 border border-slate-200'
      : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles}`}
    >
      {children}
    </span>
  );
}

function CountryCard({ country }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">
            {country.name}
          </h3>
          <StatusBadge tone={country.statusTone || 'ok'}>{country.status}</StatusBadge>
        </div>

        <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-3 text-sm">
          <dt className="text-slate-500">Cible</dt>
          <dd className="font-mono text-slate-800">{country.target}</dd>

          <dt className="text-slate-500">Tolérance</dt>
          <dd className="font-mono text-slate-800">{country.tolerance}</dd>

          <dt className="text-slate-500">Lots</dt>
          <dd className="font-mono text-slate-800">{country.lots}</dd>

          <dt className="text-slate-500">Capteurs</dt>
          <dd className="font-mono text-slate-800">{country.sensors}</dd>

          <dt className="text-slate-500">Alertes</dt>
          <dd>
            <StatusBadge tone={country.alertTone}>{country.alerts}</StatusBadge>
          </dd>
        </dl>
      </div>
    </div>
  );
}

export default function CountriesManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [countries, lots, alerts] = await Promise.all([
        paysApi.liste(),
        paysApi.lots(),
        paysApi.alertes(),
      ]);

      if (cancelled) return;

      const nextRows = (countries || []).map((country) => {
        const code = country.code;
        const config = TARGETS[code] || {};
        const activeAlerts = (alerts || []).filter((a) => a.pays === code && a.statut === 'ACTIVE');
        const countryLots = (lots || []).filter((l) => l.pays === code);

        return {
          id: code,
          name: PAYS_LABEL[code] || code,
          status: country.disponible ? 'Disponible' : 'Indisponible',
          statusTone: country.disponible ? 'ok' : 'danger',
          target: config.target || '—',
          tolerance: config.tolerance || '—',
          lots: countryLots.length,
          sensors: 'En suivi',
          alerts: `${activeAlerts.length} actives`,
          alertTone: activeAlerts.length > 0 ? 'danger' : 'neutral',
        };
      });

      setRows(nextRows);
    };

    load()
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    const interval = setInterval(() => {
      load().catch(() => null);
    }, 30000);

    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const countryCards = useMemo(() => rows, [rows]);

  return (
    <DashboardLayout
      title="Pays"
    >
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Pays du réseau
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          Chaque pays est un site déployé indépendamment. Les seuils sont propres
          à chaque terroir.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">Chargement des pays…</div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">Erreur : {error}</div>
      ) : (
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {countryCards.map((country) => (
          <CountryCard key={country.id} country={country} />
        ))}
        </section>
      )}

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
        <span className="font-semibold">ℹ️ Information :</span>{' '}
        Les pays ne se créent pas depuis l’interface. Ajouter un pays revient à
        déployer une nouvelle instance du back-end dans l’architecture
        multi-instances.
      </div>
    </DashboardLayout>
  );
}