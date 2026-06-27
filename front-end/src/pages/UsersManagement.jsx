import React, { useMemo, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const COUNTRY_TABS = [
  { id: 'all', label: 'Tous' },
  { id: 'brazil', label: 'Brésil' },
  { id: 'ecuador', label: 'Équateur' },
  { id: 'colombia', label: 'Colombie' },
];

const ROLE_FILTERS = [
  { id: 'all', label: 'Tous les rôles' },
  { id: 'admin-country', label: 'Admin pays' },
  { id: 'operator', label: 'Opérateur' },
  { id: 'reader', label: 'Lecteur' },
];

const USERS = [
  {
    id: 1,
    initials: 'SA',
    name: 'Super Admin',
    email: 'superadmin@futurekawa.example',
    role: 'Super Admin',
    roleKey: 'super-admin',
    country: 'Tous',
    countryKey: 'all',
    lastLogin: '22 juin · 11:48',
    active: true,
  },
  {
    id: 2,
    initials: 'AB',
    name: 'Admin Brésil',
    email: 'admin-bresil@futurekawa.example',
    role: 'Admin Pays',
    roleKey: 'admin-country',
    country: 'Brésil',
    countryKey: 'brazil',
    lastLogin: '—',
    active: true,
  },
  {
    id: 3,
    initials: 'AE',
    name: 'Admin Équateur',
    email: 'admin-equateur@futurekawa.example',
    role: 'Admin Pays',
    roleKey: 'admin-country',
    country: 'Équateur',
    countryKey: 'ecuador',
    lastLogin: '22 juin · 11:48',
    active: true,
  },
  {
    id: 4,
    initials: 'JS',
    name: 'João Silva',
    email: 'operateur-br@futurekawa.example',
    role: 'Opérateur',
    roleKey: 'operator',
    country: 'Brésil',
    countryKey: 'brazil',
    lastLogin: '22 juin · 09:30',
    active: true,
  },
  {
    id: 5,
    initials: 'SI',
    name: 'Simulateur',
    email: 'simulateur@futurekawa.example',
    role: 'Lecteur',
    roleKey: 'reader',
    country: 'Technique',
    countryKey: 'all',
    lastLogin: '22 juin · 11:48',
    active: true,
  },
];

function FilterChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

function RoleBadge({ role }) {
  const styles =
    role === 'Super Admin'
      ? 'bg-sky-50 text-sky-700 border border-sky-200'
      : role === 'Admin Pays'
      ? 'bg-slate-100 text-slate-700 border border-slate-200'
      : role === 'Opérateur'
      ? 'bg-amber-50 text-amber-700 border border-amber-200'
      : 'bg-slate-100 text-slate-600 border border-slate-200';

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {role}
    </span>
  );
}

function Toggle({ checked }) {
  return (
    <button
      type="button"
      className={`relative h-6 w-11 rounded-full transition ${
        checked ? 'bg-emerald-500' : 'bg-slate-300'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

function ModalField({ label, children, full = false }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function UsersManagement() {
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(true);

  const filteredUsers = useMemo(() => {
    return USERS.filter((user) => {
      const matchCountry =
        selectedCountry === 'all' || user.countryKey === selectedCountry;

      const matchRole =
        selectedRole === 'all' || user.roleKey === selectedRole;

      const query = search.trim().toLowerCase();
      const matchSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);

      return matchCountry && matchRole && matchSearch;
    });
  }, [selectedCountry, selectedRole, search]);

  return (
    <DashboardLayout
      title="Administration"
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
          Utilisateurs
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          Gérez les comptes et leurs accès selon votre périmètre.
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:flex-row xl:items-center">
        <div className="relative w-full xl:max-w-md">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Rechercher un nom ou un e-mail…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {ROLE_FILTERS.map((role) => (
            <FilterChip
              key={role.id}
              active={selectedRole === role.id}
              onClick={() => setSelectedRole(role.id)}
            >
              {role.label}
            </FilterChip>
          ))}
        </div>

        <div className="xl:ml-auto">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            + Nouvel utilisateur
          </button>
        </div>
      </div>

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Pays
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Actif
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                        {user.initials}
                      </div>

                      <div>
                        <div className="font-semibold text-slate-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-700">
                    {user.country}
                  </td>

                  <td className="px-6 py-4 text-sm font-mono text-slate-500">
                    {user.lastLogin}
                  </td>

                  <td className="px-6 py-4">
                    <Toggle checked={user.active} />
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                      ⋯
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    Aucun utilisateur trouvé pour ce filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
            ‹
          </button>
          <button className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white">
            1
          </button>
          <button className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm text-slate-700 hover:bg-slate-50">
            2
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
            ›
          </button>
        </div>
      </section>

      {/* Modal demo */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h3 className="text-xl font-bold text-slate-900">
                Nouvel utilisateur
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <ModalField label="Prénom">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Maria"
                  />
                </ModalField>

                <ModalField label="Nom">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Vera"
                  />
                </ModalField>

                <ModalField label="Adresse e-mail" full>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    placeholder="prenom.nom@futurekawa.example"
                  />
                </ModalField>

                <ModalField label="Rôle">
                  <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
                    <option>Opérateur</option>
                    <option>Lecteur</option>
                    <option>Admin Pays</option>
                    <option>Super Admin</option>
                  </select>
                </ModalField>

                <ModalField label="Pays">
                  <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
                    <option>Brésil</option>
                    <option selected>Équateur</option>
                    <option>Colombie</option>
                  </select>
                </ModalField>

                <ModalField label="Mot de passe provisoire" full>
                  <input
                    type="password"
                    defaultValue="Operateur123!"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    L’utilisateur devra le modifier à sa première connexion.
                  </p>
                </ModalField>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-5">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
                Créer le compte
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}