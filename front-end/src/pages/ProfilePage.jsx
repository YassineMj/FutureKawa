import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { authApi, usersApi, formatDate } from '../services/api';

function Field({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <div className="mt-2 text-base font-medium text-slate-900 break-words">{value ?? '—'}</div>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
      {active ? 'Actif' : 'Désactivé'}
    </span>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const me = await authApi.me();
      const details = await usersApi.detail(me.id);
      if (!cancelled) setProfile({ ...me, ...details });
    };

    load()
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const roles = profile?.roles || [];
  const paysLabel = profile?.pays === 'BRESIL'
    ? 'Brésil'
    : profile?.pays === 'EQUATEUR'
    ? 'Équateur'
    : profile?.pays === 'COLOMBIE'
    ? 'Colombie'
    : 'Tous les pays';

  return (
    <DashboardLayout title="Mon profil">
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">Chargement du profil…</div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">Erreur : {error}</div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{profile?.prenom} {profile?.nom}</h1>
                <p className="mt-2 text-slate-500">{profile?.email}</p>
              </div>
              <StatusBadge active={profile?.actif} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Prénom" value={profile?.prenom} />
            <Field label="Nom" value={profile?.nom} />
            <Field label="Adresse e-mail" value={profile?.email} />
            <Field label="Rôle principal" value={roles[0] || '—'} />
            <Field label="Pays / périmètre" value={paysLabel} />
            <Field label="Statut du compte" value={<StatusBadge active={profile?.actif} />} />
            <Field label="Date de création" value={profile?.dateCreation ? formatDate(profile.dateCreation) : 'Non exposée par l’API actuelle'} />
            <Field label="Dernière connexion" value={profile?.derniereConnexion ? formatDate(profile.derniereConnexion) : '—'} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Disponibilité des données</p>
            <p className="mt-2 text-sm text-slate-600">
              L’API actuelle fournit l’identité, les rôles, le pays, le statut actif et la dernière connexion. La date de création n’est pas renvoyée par l’endpoint `GET /auth/me` ni par le DTO utilisateur actuel.
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}