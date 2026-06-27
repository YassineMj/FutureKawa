import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const auditLogs = [
  {
    time: '22 juin · 11:57',
    author: 'Super Admin',
    action: 'USER_CREATE',
    resource: 'operateur-br@futurekawa.example',
    country: 'Brésil',
    result: 'OK',
    type: 'info',
  },
  {
    time: '22 juin · 12:12',
    author: 'Super Admin',
    action: 'USER_DESACTIVER',
    resource: 'operateur-br@futurekawa.example',
    country: 'Brésil',
    result: 'OK',
    type: 'warn',
  },
  {
    time: '22 juin · 12:12',
    author: 'Super Admin',
    action: 'USER_CHANGER_ROLE',
    resource: 'operateur-br → LECTEUR',
    country: 'Brésil',
    result: 'OK',
    type: 'info',
  },
  {
    time: '22 juin · 15:22',
    author: 'Super Admin',
    action: 'USER_DELETE',
    resource: 'audit-test@futurekawa.example',
    country: 'Colombie',
    result: 'OK',
    type: 'danger',
  },
  {
    time: '22 juin · 11:57',
    author: 'Admin Équateur',
    action: 'USER_CREATE',
    resource: 'operateur-ec@futurekawa.example',
    country: 'Équateur',
    result: 'OK',
    type: 'info',
  },
];

function Badge({ children, tone = 'info' }) {
  const styles =
    tone === 'warn'
      ? 'bg-amber-50 text-amber-700 border border-amber-200'
      : tone === 'danger'
      ? 'bg-rose-50 text-rose-700 border border-rose-200'
      : tone === 'ok'
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : 'bg-slate-100 text-slate-600 border border-slate-200';

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles}`}>
      {children}
    </span>
  );
}

export default function Audit() {
  const [filter, setFilter] = useState('all');

  return (
    <DashboardLayout
      title="Audit"
      user={{
        initials: 'SA',
        name: 'Super Admin',
        role: 'Siège · tous pays',
      }}
    >
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Audit & traçabilité
        </h1>
        <p className="text-slate-500 text-sm sm:text-base">
          Journal des actions sensibles : qui a fait quoi, quand et où.
        </p>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 w-full md:w-[320px]">
          <span>🔍</span>
          <input
            placeholder="Rechercher..."
            className="w-full outline-none text-sm"
          />
        </div>

        <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
          <option>Toutes les actions</option>
          <option>Création</option>
          <option>Désactivation</option>
          <option>Changement de rôle</option>
          <option>Suppression</option>
        </select>

        <div className="md:ml-auto">
          <button className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
            Exporter CSV
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left p-4">Horodatage</th>
              <th className="text-left p-4">Auteur</th>
              <th className="text-left p-4">Action</th>
              <th className="text-left p-4">Ressource</th>
              <th className="text-left p-4">Pays</th>
              <th className="text-left p-4">Résultat</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {auditLogs.map((log, i) => (
              <tr key={i} className="hover:bg-slate-50 transition">
                <td className="p-4 text-xs text-slate-600 font-mono">
                  {log.time}
                </td>

                <td className="p-4">{log.author}</td>

                <td className="p-4">
                  <Badge
                    tone={
                      log.type === 'danger'
                        ? 'danger'
                        : log.type === 'warn'
                        ? 'warn'
                        : 'info'
                    }
                  >
                    {log.action}
                  </Badge>
                </td>

                <td className="p-4 text-slate-700">{log.resource}</td>

                <td className="p-4">{log.country}</td>

                <td className="p-4">
                  <Badge tone="ok">{log.result}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 mt-6">
        <button className="px-3 py-1 border rounded-lg">‹</button>
        <button className="px-3 py-1 border rounded-lg bg-slate-100">
          1
        </button>
        <button className="px-3 py-1 border rounded-lg">2</button>
        <button className="px-3 py-1 border rounded-lg">›</button>
      </div>
    </DashboardLayout>
  );
}