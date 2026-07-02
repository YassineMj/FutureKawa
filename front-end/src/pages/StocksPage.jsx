import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { paysApi, toBackendCode, formatDate } from '../services/api';
import {
  Package, Clock, AlertTriangle, CheckCircle2, XCircle,
  Eye, Pencil, Trash2, Plus, Search, X,
} from 'lucide-react';

const COUNTRIES = [
  { id: 'all', label: 'Tous' },
  { id: 'brazil', label: 'Brésil' },
  { id: 'ecuador', label: 'Équateur' },
  { id: 'colombia', label: 'Colombie' },
];

const PAYS_LABEL = { BRESIL: 'Brésil', EQUATEUR: 'Équateur', COLOMBIE: 'Colombie' };
const PAYS_OPTIONS = ['BRESIL', 'EQUATEUR', 'COLOMBIE'];

const STATUT_CONFIG = {
  CONFORME: { label: 'Conforme', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  EN_ALERTE: { label: 'En alerte', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  PERIME: { label: 'Périmé', className: 'bg-rose-50 text-rose-700 border border-rose-200' },
};
const STATUT_OPTIONS = ['CONFORME', 'EN_ALERTE', 'PERIME'];
const STATUT_FILTERS = ['Tous', 'CONFORME', 'EN_ALERTE', 'PERIME'];
const LOT_PATCHES_KEY = 'fk_lot_patches';
const LOT_DELETIONS_KEY = 'fk_lot_deletions';

function readJsonStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function lotKey(lot) {
  return `${lot.pays || 'UNKNOWN'}:${lot.id}`;
}

async function loadEntrepotsForCountry(code) {
  const exploitations = await paysApi.exploitations(code);
  const nested = await Promise.all(
    (exploitations || []).map(async (exp) => {
      const ents = await paysApi.entrepots(code, exp.id);
      return (ents || []).map((ent) => ({
        id: ent.id,
        nom: ent.nom,
        label: `${ent.nom} · ${exp.nom} (#${ent.id})`,
        exploitationId: exp.id,
      }));
    })
  );
  return nested.flat();
}

function applyLocalLotPatches(remoteLots) {
  const deletedKeys = new Set(readJsonStorage(LOT_DELETIONS_KEY, []));
  const patches = readJsonStorage(LOT_PATCHES_KEY, {});

  return (remoteLots || [])
    .filter((lot) => !deletedKeys.has(lotKey(lot)))
    .map((lot) => patches[lotKey(lot)] || lot);
}

function StatutBadge({ statut }) {
  const cfg = STATUT_CONFIG[statut] || { label: statut, className: 'bg-slate-100 text-slate-600 border border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin" />
    </div>
  );
}

function ModalField({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

const INPUT_CLS = 'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100';
const SELECT_CLS = `${INPUT_CLS} bg-white`;

const EMPTY_LOT = { reference: '', entrepotId: '', dateStockage: '', statut: 'CONFORME', pays: 'BRESIL' };

// ─── Create / Edit Modal ─────────────────────────────────────────────────────

function LotFormModal({ mode, lot, onClose, onSave, showPays, defaultPays = 'BRESIL' }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(
    isEdit
      ? {
          reference: lot.reference || '',
          entrepotId: lot.entrepotId ?? '',
          dateStockage: lot.dateStockage ? lot.dateStockage.slice(0, 10) : '',
          statut: lot.statut || 'CONFORME',
          pays: lot.pays || 'BRESIL',
        }
      : { ...EMPTY_LOT, pays: defaultPays }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [entrepots, setEntrepots] = useState([]);
  const [entrepotsLoading, setEntrepotsLoading] = useState(false);
  const [entrepotsError, setEntrepotsError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    let cancelled = false;
    setEntrepotsLoading(true);
    setEntrepotsError('');

    const loadEntrepots = async () => {
      const nested = await loadEntrepotsForCountry(form.pays);

      if (!cancelled) {
        setEntrepots(nested);
        setEntrepotsLoading(false);
      }
    };

    loadEntrepots().catch((err) => {
      if (!cancelled) {
        setEntrepots([]);
        setEntrepotsError(err.message);
        setEntrepotsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [form.pays, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSave(form, entrepots);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h3 className="text-xl font-bold text-slate-900">
            {isEdit ? 'Modifier le lot' : 'Nouveau lot'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {showPays && (
                <ModalField label="Pays">
                  <select
                    value={form.pays}
                    onChange={set('pays')}
                    className={SELECT_CLS}
                    required
                  >
                    {PAYS_OPTIONS.map((p) => (
                      <option key={p} value={p}>{PAYS_LABEL[p]}</option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-slate-500">
                    Le pays détermine les entrepôts disponibles.
                  </p>
                </ModalField>
              )}
              <ModalField label="Référence">
                <input value={form.reference} onChange={set('reference')} className={INPUT_CLS} placeholder="LOT-2024-001" required />
              </ModalField>
              <ModalField label="Entrepôt">
                <select value={form.entrepotId} onChange={set('entrepotId')} className={SELECT_CLS} required>
                  <option value="">Sélectionner un entrepôt</option>
                  {entrepotsLoading ? (
                    <option value="" disabled>Chargement…</option>
                  ) : (
                    entrepots.map((ent) => (
                      <option key={ent.id} value={ent.id}>{ent.label}</option>
                    ))
                  )}
                </select>
                {entrepotsError ? (
                  <p className="mt-2 text-xs text-rose-600">{entrepotsError}</p>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    L'ID est sélectionné automatiquement via cet entrepôt.
                  </p>
                )}
              </ModalField>
              <ModalField label="Date de stockage">
                <input type="date" value={form.dateStockage} onChange={set('dateStockage')} className={INPUT_CLS} required />
              </ModalField>
              {isEdit && (
                <ModalField label="Statut">
                  <select value={form.statut} onChange={set('statut')} className={SELECT_CLS}>
                    {STATUT_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUT_CONFIG[s].label}</option>
                    ))}
                  </select>
                </ModalField>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-5">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
              {loading
                ? (isEdit ? 'Modification…' : 'Création…')
                : (isEdit ? 'Enregistrer' : 'Créer le lot')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────

function LotViewModal({ lot, onClose }) {
  const rows = [
    { label: 'Référence', value: lot.reference },
    { label: 'Pays', value: PAYS_LABEL[lot.pays] || lot.pays || '—' },
    { label: 'Entrepôt', value: lot.entrepotNom || `#${lot.entrepotId}` },
    { label: 'Date de stockage', value: formatDate(lot.dateStockage) },
    { label: 'Jours en stock', value: `${lot.joursEnStock ?? '—'} j` },
    { label: 'Statut', value: <StatutBadge statut={lot.statut} /> },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h3 className="text-xl font-bold text-slate-900">Détail du lot</h3>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <dl className="divide-y divide-slate-100 px-6 py-4">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-3">
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="text-sm font-medium text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="border-t border-slate-200 px-6 py-4 flex justify-end">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function LotDeleteModal({ lot, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl">
        <div className="px-6 py-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
            <Trash2 className="w-5 h-5 text-rose-600" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-slate-900">Supprimer le lot</h3>
          <p className="text-sm text-slate-500">
            Confirmez-vous la suppression du lot <span className="font-semibold text-slate-800">{lot.reference}</span> ? Cette action est irréversible.
          </p>
          {error && (
            <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Annuler
          </button>
          <button onClick={handleConfirm} disabled={loading} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
            {loading ? 'Suppression…' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StocksPage() {
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [statutFilter, setStatutFilter] = useState('Tous');
  const [search, setSearch] = useState('');
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modal, setModal] = useState(null); // { type: 'view'|'create'|'edit'|'delete', lot? }

  const backendCode = selectedCountry === 'all' ? null : toBackendCode(selectedCountry);

  const fetchLots = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    paysApi.lots(backendCode)
      .then((data) => {
        if (!cancelled) setLots(applyLocalLotPatches(data || []));
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [backendCode]);

  useEffect(() => {
    return fetchLots();
  }, [fetchLots]);

  const filteredLots = useMemo(() => {
    let result = lots;
    if (statutFilter !== 'Tous') result = result.filter((l) => l.statut === statutFilter);
    const q = search.trim().toLowerCase();
    if (q) result = result.filter((l) => l.reference?.toLowerCase().includes(q));
    return result;
  }, [lots, statutFilter, search]);

  const stats = useMemo(() => ({
    total: lots.length,
    conformes: lots.filter((l) => l.statut === 'CONFORME').length,
    enAlerte: lots.filter((l) => l.statut === 'EN_ALERTE').length,
    perimes: lots.filter((l) => l.statut === 'PERIME').length,
  }), [lots]);

  const closeModal = () => setModal(null);

  const handleCreate = async (form) => {
    const code = form.pays;
    const allEntrepots = await loadEntrepotsForCountry(code);
    const selectedEntrepot = allEntrepots.find((ent) => String(ent.id) === String(form.entrepotId));

    if (!selectedEntrepot) {
      throw new Error("Entrepôt introuvable pour ce pays. Vérifie l'ID dans la page Entrepôts.");
    }

    await paysApi.creerLot(code, {
      reference: form.reference,
      exploitationId: selectedEntrepot.exploitationId,
      entrepotId: Number(selectedEntrepot.id),
      dateStockage: form.dateStockage,
    });
    closeModal();
    fetchLots();
  };

  const handleEdit = async (form, entList) => {
    const lot = modal.lot;
    const code = lot.pays || backendCode;
    const allEntrepots = entList?.length ? entList : await loadEntrepotsForCountry(code);
    const selectedEntrepot = allEntrepots.find((ent) => String(ent.id) === String(form.entrepotId));

    if (!selectedEntrepot) {
      throw new Error("Entrepôt introuvable pour ce pays. Vérifie l'ID dans la page Entrepôts.");
    }

    const updatedLot = {
      ...lot,
      reference: form.reference,
      exploitationId: selectedEntrepot.exploitationId,
      entrepotId: Number(selectedEntrepot.id),
      entrepotNom: selectedEntrepot.nom,
      dateStockage: `${form.dateStockage}T00:00:00.000Z`,
      statut: form.statut,
      pays: code,
    };

    const patches = readJsonStorage(LOT_PATCHES_KEY, {});
    patches[lotKey(updatedLot)] = updatedLot;
    writeJsonStorage(LOT_PATCHES_KEY, patches);

    setLots((currentLots) =>
      currentLots.map((currentLot) => (
        lotKey(currentLot) === lotKey(lot) ? updatedLot : currentLot
      ))
    );
    closeModal();
  };

  const handleDelete = async () => {
    const lot = modal.lot;
    const key = lotKey(lot);
    const deleted = new Set(readJsonStorage(LOT_DELETIONS_KEY, []));
    deleted.add(key);
    writeJsonStorage(LOT_DELETIONS_KEY, [...deleted]);

    setLots((currentLots) => currentLots.filter((currentLot) => lotKey(currentLot) !== key));
    closeModal();
  };

  const colSpan = selectedCountry === 'all' ? 7 : 6;

  return (
    <DashboardLayout
      title="Stocks & lots"
      topTabs={COUNTRIES}
      activeTab={selectedCountry}
      onTabChange={(id) => { setSelectedCountry(id); setStatutFilter('Tous'); setSearch(''); }}
    >
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
          {selectedCountry === 'all'
            ? 'Stocks & lots — tous les pays'
            : `Stocks & lots — ${PAYS_LABEL[backendCode] || ''}`}
        </h1>
        <p className="text-slate-500 text-base">
          Suivi des lots de café en stock et de leur état qualité.
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-rose-700">
          Erreur de chargement : {error}
        </div>
      ) : (
        <>
          {/* Stats */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-5 h-5 text-slate-500" />
                <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Total lots</p>
              </div>
              <p className="text-4xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="bg-white border-l-4 border-emerald-500 border-t border-r border-b border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Conformes</p>
              </div>
              <p className="text-4xl font-bold text-slate-900">{stats.conformes}</p>
            </div>
            <div className="bg-white border-l-4 border-amber-500 border-t border-r border-b border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <p className="text-sm font-medium uppercase tracking-wider text-slate-500">En alerte</p>
              </div>
              <p className="text-4xl font-bold text-slate-900">{stats.enAlerte}</p>
            </div>
            <div className="bg-white border-l-4 border-rose-500 border-t border-r border-b border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <XCircle className="w-5 h-5 text-rose-500" />
                <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Périmés</p>
              </div>
              <p className="text-4xl font-bold text-slate-900">{stats.perimes}</p>
            </div>
          </section>

          {/* Table */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-slate-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-slate-900 shrink-0">
                Liste des lots
                <span className="ml-2 text-base font-normal text-slate-400">
                  ({filteredLots.length !== lots.length ? `${filteredLots.length} / ${lots.length}` : lots.length})
                </span>
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher par référence…"
                    className="h-9 w-56 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Statut filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  {STATUT_FILTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatutFilter(s)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                        statutFilter === s
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {s === 'Tous' ? 'Tous' : (STATUT_CONFIG[s]?.label || s)}
                    </button>
                  ))}
                </div>

                {/* Add button */}
                <button
                  onClick={() => setModal({ type: 'create' })}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 transition"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un lot
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Référence</th>
                    {selectedCountry === 'all' && (
                      <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Pays</th>
                    )}
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Entrepôt</th>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Date de stockage</th>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Jours en stock</th>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLots.length === 0 ? (
                    <tr>
                      <td colSpan={colSpan} className="px-6 py-12 text-center text-slate-400 text-sm">
                        Aucun lot trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredLots.map((lot) => (
                      <tr key={`${lot.pays}-${lot.id}`} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800">{lot.reference}</td>
                        {selectedCountry === 'all' && (
                          <td className="px-6 py-4 text-slate-600">{PAYS_LABEL[lot.pays] || lot.pays || '—'}</td>
                        )}
                        <td className="px-6 py-4 text-slate-600">{lot.entrepotNom || `Entrepôt #${lot.entrepotId}`}</td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {lot.dateStockage ? formatDate(lot.dateStockage) : '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${lot.joursEnStock > 365 ? 'text-rose-600' : 'text-slate-700'}`}>
                            {lot.joursEnStock ?? '—'} j
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatutBadge statut={lot.statut} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title="Voir"
                              onClick={() => setModal({ type: 'view', lot })}
                              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              title="Modifier"
                              onClick={() => setModal({ type: 'edit', lot })}
                              className="p-2 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              title="Supprimer"
                              onClick={() => setModal({ type: 'delete', lot })}
                              className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* Modals */}
      {modal?.type === 'view' && (
        <LotViewModal lot={modal.lot} onClose={closeModal} />
      )}
      {modal?.type === 'create' && (
        <LotFormModal
          mode="create"
          onClose={closeModal}
          onSave={handleCreate}
          showPays={selectedCountry === 'all'}
          defaultPays={backendCode || 'BRESIL'}
        />
      )}
      {modal?.type === 'edit' && (
        <LotFormModal
          mode="edit"
          lot={modal.lot}
          onClose={closeModal}
          onSave={handleEdit}
          showPays={false}
        />
      )}
      {modal?.type === 'delete' && (
        <LotDeleteModal lot={modal.lot} onClose={closeModal} onConfirm={handleDelete} />
      )}
    </DashboardLayout>
  );
}
