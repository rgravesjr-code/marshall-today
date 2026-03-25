'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { siteConfig } from '@/lib/config';
import type { Business } from '@/lib/supabase';
import { Search, X, Eye, EyeOff, LogOut, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'on' | 'off'>('all');
  const [toggling, setToggling] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push('/admin/login');
      return false;
    }
    return true;
  }, [router]);

  const fetchBusinesses = useCallback(async () => {
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .order('city', { ascending: true })
      .order('name', { ascending: true });
    setBusinesses((data as Business[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth().then((ok) => { if (ok) fetchBusinesses(); });
  }, [checkAuth, fetchBusinesses]);

  async function togglePublished(id: string, current: boolean) {
    setToggling(id);
    await supabase.from('businesses').update({ is_published: !current }).eq('id', id);
    setBusinesses((prev) => prev.map((b) => b.id === id ? { ...b, is_published: !current } : b));
    setToggling(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  const filtered = businesses.filter((b) => {
    const matchSearch = !search.trim() ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase()) ||
      b.address?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchFilter =
      filter === 'all' ||
      (filter === 'on' && b.is_published) ||
      (filter === 'off' && !b.is_published);
    return matchSearch && matchFilter;
  });

  const onCount = businesses.filter((b) => b.is_published).length;
  const offCount = businesses.filter((b) => !b.is_published).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <p className="text-marshall-400 font-sans">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-white border-b border-marshall-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-marshall-900">{siteConfig.name} Admin</h1>
          <p className="text-marshall-400 text-sm">
            {businesses.length} businesses · {onCount} live · {offCount} hidden
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-marshall-500 hover:text-marshall-700 transition-colors">
            <ExternalLink size={15} /> View Site
          </Link>
          <button onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-sm text-marshall-500 hover:text-red-600 transition-colors">
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-marshall-400" />
            <input
              type="text"
              placeholder="Search by name, city, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 pr-8 py-2.5 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-marshall-400 hover:text-marshall-600">
                <X size={15} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {(['all', 'on', 'off'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
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

        {/* Business list */}
        <div className="bg-white rounded-xl border border-marshall-100 overflow-hidden shadow-sm">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-marshall-400 font-sans text-sm">No businesses found.</div>
          ) : (
            <div className="divide-y divide-marshall-50">
              {filtered.map((biz) => (
                <div key={biz.id} className="flex items-center gap-4 px-5 py-3 hover:bg-cream-50 transition-colors">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-marshall-100 shrink-0 flex items-center justify-center">
                    {biz.logo_url || biz.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={biz.logo_url || biz.cover_image_url || ''}
                        alt={biz.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">🏢</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-marshall-900 text-sm truncate">{biz.name}</span>
                      {biz.is_featured && (
                        <span className="text-xs px-1.5 py-0.5 bg-marshall-100 text-marshall-600 rounded font-medium shrink-0">Featured</span>
                      )}
                    </div>
                    <div className="text-xs text-marshall-400 font-sans mt-0.5">
                      {[biz.address, biz.city, biz.state].filter(Boolean).join(', ')}
                    </div>
                  </div>

                  {/* City badge (for multi-city) */}
                  <span className="hidden sm:block text-xs px-2 py-1 bg-cream-200 text-marshall-600 rounded font-medium shrink-0">
                    {biz.city}
                  </span>

                  {/* Plan */}
                  <span className={`hidden md:block text-xs px-2 py-1 rounded font-medium shrink-0 capitalize ${
                    biz.plan_tier === 'ultimate' ? 'bg-marshall-700 text-white' :
                    biz.plan_tier === 'spotlight' ? 'bg-forest-100 text-forest-700' :
                    'bg-cream-200 text-marshall-500'
                  }`}>
                    {biz.plan_tier}
                  </span>

                  {/* View on site */}
                  {biz.is_published && (
                    <Link href={`/businesses/${biz.slug}`} target="_blank"
                      className="text-marshall-400 hover:text-marshall-600 transition-colors shrink-0">
                      <ExternalLink size={15} />
                    </Link>
                  )}

                  {/* Toggle ON/OFF */}
                  <button
                    onClick={() => togglePublished(biz.id, biz.is_published)}
                    disabled={toggling === biz.id}
                    title={biz.is_published ? 'Click to hide from directory' : 'Click to show in directory'}
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
          )}
        </div>

        <p className="text-center text-marshall-300 text-xs font-sans mt-6">
          Showing {filtered.length} of {businesses.length} businesses
        </p>
      </div>
    </div>
  );
}
