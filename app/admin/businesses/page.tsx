'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Business } from '@/lib/supabase';
import { Search, X, Eye, EyeOff, ExternalLink, Pencil, Trash2, Plus, CheckSquare, Square, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function AdminBusinessesPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'on' | 'off'>('all');
  const [toggling, setToggling] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkWorking, setBulkWorking] = useState(false);

  const checkAuth = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push('/admin/login');
  }, [router]);

  const fetchBusinesses = useCallback(async () => {
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .order('is_published', { ascending: true })
      .order('name', { ascending: true });
    setBusinesses((data as Business[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth().then(() => fetchBusinesses());
  }, [checkAuth, fetchBusinesses]);

  // ── Single toggle ──────────────────────────────────────────────────────────
  async function togglePublished(id: string, current: boolean) {
    setToggling(id);
    await supabase.from('businesses').update({ is_published: !current }).eq('id', id);
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, is_published: !current } : b));
    setToggling(null);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await supabase.from('businesses').delete().eq('id', id);
    setBusinesses(prev => prev.filter(b => b.id !== id));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
  }

  // ── Selection helpers ──────────────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function selectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(b => b.id)));
    }
  }

  // ── Bulk actions ───────────────────────────────────────────────────────────
  async function bulkPublish(publish: boolean) {
    if (selected.size === 0) return;
    const label = publish ? 'publish' : 'unpublish';
    if (!confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} ${selected.size} businesses?`)) return;
    setBulkWorking(true);
    const ids = [...selected];
    // Supabase can't do IN filter on update via SDK easily — batch in chunks
    for (let i = 0; i < ids.length; i += 50) {
      const chunk = ids.slice(i, i + 50);
      await supabase.from('businesses').update({ is_published: publish }).in('id', chunk);
    }
    setBusinesses(prev => prev.map(b => selected.has(b.id) ? { ...b, is_published: publish } : b));
    setSelected(new Set());
    setBulkWorking(false);
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Permanently delete ${selected.size} businesses? This cannot be undone.`)) return;
    setBulkWorking(true);
    const ids = [...selected];
    for (let i = 0; i < ids.length; i += 50) {
      const chunk = ids.slice(i, i + 50);
      await supabase.from('businesses').delete().in('id', chunk);
    }
    setBusinesses(prev => prev.filter(b => !selected.has(b.id)));
    setSelected(new Set());
    setBulkWorking(false);
  }

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = businesses.filter(b => {
    const matchSearch = !search.trim() ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.city?.toLowerCase().includes(search.toLowerCase()) ||
      b.address?.toLowerCase().includes(search.toLowerCase()) ||
      b.short_description?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchFilter =
      filter === 'all' ||
      (filter === 'on' && b.is_published) ||
      (filter === 'off' && !b.is_published);
    return matchSearch && matchFilter;
  });

  const onCount  = businesses.filter(b => b.is_published).length;
  const offCount = businesses.filter(b => !b.is_published).length;
  const allFilteredSelected = filtered.length > 0 && filtered.every(b => selected.has(b.id));

  if (loading) return <div className="card p-8 text-center text-marshall-400">Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-marshall-900">Businesses</h1>
          <p className="text-marshall-500 text-sm mt-1">
            {businesses.length} total · {onCount} live · {offCount} hidden
          </p>
        </div>
        <Link href="/admin/businesses/new"
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 bg-marshall-700 text-white rounded-lg hover:bg-marshall-800 transition-colors">
          <Plus size={15} /> Add Business
        </Link>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-marshall-400" />
          <input type="text" placeholder="Search name, city, address, description..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 pr-8 py-2.5 text-sm" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-marshall-400 hover:text-marshall-600">
              <X size={15} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {(['all', 'on', 'off'] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setSelected(new Set()); }}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-marshall-700 text-white'
                  : 'bg-white border border-marshall-200 text-marshall-600 hover:border-marshall-400'
              }`}>
              {f === 'all' ? `All (${businesses.length})` : f === 'on' ? `Live (${onCount})` : `Hidden (${offCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action toolbar — appears when anything selected */}
      <div className={`transition-all duration-200 overflow-hidden ${selected.size > 0 ? 'mb-4' : 'mb-0 h-0'}`}>
        <div className="flex items-center gap-3 bg-marshall-900 text-white px-4 py-3 rounded-xl">
          <span className="text-sm font-semibold">{selected.size} selected</span>
          <div className="flex-1" />
          <button onClick={() => bulkPublish(true)} disabled={bulkWorking}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-forest-500 hover:bg-forest-400 rounded-lg disabled:opacity-50 transition-colors">
            <Eye size={13} /> Publish All
          </button>
          <button onClick={() => bulkPublish(false)} disabled={bulkWorking}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-marshall-600 hover:bg-marshall-500 rounded-lg disabled:opacity-50 transition-colors">
            <EyeOff size={13} /> Unpublish All
          </button>
          <button onClick={bulkDelete} disabled={bulkWorking}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-red-500 hover:bg-red-400 rounded-lg disabled:opacity-50 transition-colors">
            <Trash2 size={13} /> Delete All
          </button>
          <button onClick={() => setSelected(new Set())}
            className="text-xs text-marshall-300 hover:text-white ml-1">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Business list */}
      <div className="bg-white rounded-xl border border-marshall-100 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-marshall-400 text-sm">No businesses found.</div>
        ) : (
          <>
            {/* Select-all header row */}
            <div className="flex items-center gap-3 px-5 py-2.5 bg-cream-50 border-b border-marshall-100">
              <button onClick={selectAll} className="text-marshall-400 hover:text-marshall-700 shrink-0">
                {allFilteredSelected
                  ? <CheckSquare size={16} className="text-marshall-700" />
                  : <Square size={16} />}
              </button>
              <span className="text-xs text-marshall-500 font-medium">
                {allFilteredSelected ? 'Deselect all' : `Select all ${filtered.length}`}
              </span>
            </div>

            <div className="divide-y divide-marshall-50">
              {filtered.map(biz => (
                <div key={biz.id}
                  className={`flex items-center gap-3 px-5 py-3 hover:bg-cream-50 transition-colors ${selected.has(biz.id) ? 'bg-blue-50' : ''}`}>

                  {/* Checkbox */}
                  <button onClick={() => toggleSelect(biz.id)} className="text-marshall-400 hover:text-marshall-700 shrink-0">
                    {selected.has(biz.id)
                      ? <CheckSquare size={16} className="text-marshall-700" />
                      : <Square size={16} />}
                  </button>

                  {/* Thumbnail */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-marshall-100 shrink-0 flex items-center justify-center">
                    {biz.logo_url || biz.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={biz.logo_url || biz.cover_image_url || ''} alt={biz.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">🏢</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-marshall-900 text-sm truncate">{biz.name}</span>
                      {biz.is_featured && (
                        <span className="text-xs px-1.5 py-0.5 bg-marshall-100 text-marshall-600 rounded font-medium shrink-0">Featured</span>
                      )}
                    </div>
                    <div className="text-xs text-marshall-400 mt-0.5 truncate">
                      {biz.short_description || [biz.address, biz.city].filter(Boolean).join(', ') || '—'}
                    </div>
                  </div>

                  {/* Plan badge */}
                  <span className={`hidden md:block text-xs px-2 py-1 rounded font-medium shrink-0 capitalize ${
                    biz.plan_tier === 'ultimate' ? 'bg-marshall-700 text-white' :
                    biz.plan_tier === 'spotlight' ? 'bg-forest-100 text-forest-700' :
                    'bg-cream-200 text-marshall-500'
                  }`}>
                    {biz.plan_tier}
                  </span>

                  {/* View */}
                  {biz.is_published && (
                    <Link href={`/businesses/${biz.slug}`} target="_blank"
                      className="text-marshall-400 hover:text-marshall-600 shrink-0" title="View live">
                      <ExternalLink size={14} />
                    </Link>
                  )}

                  {/* Edit */}
                  <Link href={`/admin/businesses/${biz.id}`}
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 text-marshall-600 hover:text-marshall-900 hover:bg-marshall-100 border border-marshall-200 rounded-lg transition-colors shrink-0">
                    <Pencil size={12} /> Edit
                  </Link>

                  {/* Delete */}
                  <button onClick={() => handleDelete(biz.id, biz.name)}
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors shrink-0">
                    <Trash2 size={12} />
                  </button>

                  {/* Live/Hidden toggle */}
                  <button onClick={() => togglePublished(biz.id, biz.is_published)}
                    disabled={toggling === biz.id}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0 disabled:opacity-50 ${
                      biz.is_published
                        ? 'bg-forest-50 text-forest-700 hover:bg-red-50 hover:text-red-600 border border-forest-200 hover:border-red-200'
                        : 'bg-red-50 text-red-500 hover:bg-forest-50 hover:text-forest-700 border border-red-200 hover:border-forest-200'
                    }`}>
                    {biz.is_published ? <><Eye size={13} /> Live</> : <><EyeOff size={13} /> Hidden</>}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <p className="text-center text-marshall-300 text-xs mt-4">
        Showing {filtered.length} of {businesses.length} businesses
        {selected.size > 0 && ` · ${selected.size} selected`}
      </p>
    </div>
  );
}
