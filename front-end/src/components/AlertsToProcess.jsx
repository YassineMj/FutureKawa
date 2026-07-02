import React from 'react';
import { AlertTriangle, Waves, CheckCircle2, Eye } from 'lucide-react';

function getAlertStyle(type) {
  switch (type) {
    case 'PEREMPTION':
    case 'expiration':
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        iconWrap: 'bg-rose-100 text-rose-600',
      };
    case 'CONDITIONS':
    case 'conditions':
    case 'humidity':
      return {
        icon: <Waves className="w-5 h-5" />,
        iconWrap: 'bg-amber-100 text-amber-600',
      };
    default:
      return {
        icon: <CheckCircle2 className="w-5 h-5" />,
        iconWrap: 'bg-emerald-100 text-emerald-600',
      };
  }
}

export default function AlertsToProcess({
  alerts = [],
  title = 'Alertes à traiter',
  onSeeAll,
  onAcquitter,
  onResoudre,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>

        <button
          type="button"
          onClick={onSeeAll}
          className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 px-4 py-2 text-sm font-semibold hover:bg-sky-100 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Voir tout
        </button>
      </div>

      <div className="divide-y divide-slate-200">
        {alerts.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            Aucune alerte à traiter.
          </div>
        )}

        {alerts.map((alert) => {
          const style = getAlertStyle(alert.type);

          return (
            <div key={alert.id} className="px-6 py-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${style.iconWrap}`}>
                  {style.icon}
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-900 leading-snug">
                    {alert.title}
                  </h3>
                  <p className="mt-2 text-slate-500 text-lg">{alert.meta}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 lg:shrink-0">
                <button
                  type="button"
                  onClick={() => onAcquitter?.(alert)}
                  className="px-5 py-3 rounded-xl border border-slate-300 text-slate-800 font-semibold text-lg hover:bg-slate-50 transition-colors"
                >
                  Acquitter
                </button>
                <button
                  type="button"
                  onClick={() => onResoudre?.(alert)}
                  className="px-5 py-3 rounded-xl bg-emerald-800 text-white font-semibold text-lg hover:bg-emerald-900 transition-colors"
                >
                  Résoudre
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}