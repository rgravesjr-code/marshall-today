'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Business, Category } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, ExternalLink } from 'lucide-react';

const PLAN_TIERS = ['free', 'spotlight', 'ultimate'];

export default function AdminEditBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [form, setForm] = useState<Partial<Business>>({
    name: '', slug: '', short_description: '', description: '',
    address: '', city: 'Marshall', state: 'MI', zip: '', phone: '',
    email: '', website: '', google_business_url: '', facebook_url: '',
    logo_url: '', cover_image_url: '',
    is_published: true, is_featured: false, is_claimed: false,
    plan_tier: 'free',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const checkAuth = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push('/admin/login');
  }, [router]);

  useEffect(() => {
    checkAuth();
    supabase.from('categories').select('*').order('display_order').then(({ data }) => {
      setCategories((data as Category[]) ?? []);
    });
    if (!isNew) {
      supabase.from('businesses').select('*').eq('id', id).single().then(({ data }) => {
        if (data) setForm(data as Business);
        setLoading(false);
      });
      supabase.from('business_categories').select('category_id').eq('business_id', id).then(({ data }) => {
        setSelectedCats((data ?? []).map((r: any) => r.category_id));
      });
    }
  }, [checkAuth, id, isNew]);

  function set(field: keyof Business, value: any) {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (isNew && field === 'name') {
        next.slug = (value as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
      }
      return next;
    });
  }

  async function handleImageUpload(file: File, field: 'logo_url' | 'cover_image_url') {
    if (field === 'logo_url') setUploadingLogo(true);
    else setUploadingCover(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const slug = form.slug || `biz-${Date.now()}`;
    const path = `${slug}-${field === 'logo_url' ? 'logo' : 'cover'}.${ext}`;
    const { error: upErr } = await supabase.storage.from('marshall-today').upload(path, file, { upsert: true });
    if (!upErr) {
      const { data } = supabase.storage.from('marshall-today').getPublicUrl(path);
      set(field, data.publicUrl);
    }
    if (field === 'logo_url') setUploadingLogo(false);
    else setUploadingCover(false);
  }

  async function handleSave() {
    if (!form.name || !form.slug) { setError('Name and slug are required'); return; }
    setSaving(true); setError('');
    const payload = { ...form };
    delete (payload as any).id;
    delete (payload as any).created_at;
    delete (payload as any).updated_at;
    delete (payload as any).categories;

    let bizId = id;
    if (isNew) {
      const { data, error: err } = await supabase.from('businesses').insert(payload).select().single();
      if (err) { setError(err.message); setSaving(false); return; }
      bizId = data.id;
    } else {
      const { error: err } = await supabase.from('businesses').update(payload).eq('id', id);
      if (err) { setError(err.message); setSaving(false); return; }
    }

    // Sync categories
    await supabase.from('business_categories').delete().eq('business_id', bizId);
    if (selectedCats.length) {
      await supabase.from('business_categories').insert(
        selectedCats.map(cid => ({ business_id: bizId, category_id: cid }))
      );
    }
    setSaving(false);
    router.push('/admin');
  }

  async function handleDelete() {
    if (!confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    await supabase.from('businesses').delete().eq('id', id);
    router.push('/admin');
  }

  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-marshall-200 bg-white text-marshall-900 text-sm focus:outline-none focus:ring-2 focus:ring-marshall-400 focus:border-marshall-400 placeholder-marshall-300 transition-colors";
  const labelClass = "block text-xs font-semibold text-marshall-600 uppercase tracking-wider mb-1.5";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50">
      <p className="text-marshall-400">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-white border-b border-marshall-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-marshall-400 hover:text-marshall-700 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-marshall-900">
              {isNew ? 'Add Business' : form.name || 'Edit Business'}
            </h1>
            {!isNew && form.is_published && (
              <Link href={`/businesses/${form.slug}`} target="_blank"
                className="text-xs text-forest-600 hover:underline flex items-center gap-1">
                <ExternalLink size={11} /> View live listing
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={15} /> Delete
            </button>
          )}
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-marshall-700 text-white text-sm font-semibold rounded-lg hover:bg-marshall-800 transition-colors disabled:opacity-50">
            <Save size={15} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

        {/* Status toggles */}
        <div className="bg-white rounded-xl border border-marshall-100 p-5 shadow-sm">
          <h2 className="font-semibold text-marshall-800 text-sm mb-4">Status & Visibility</h2>
          <div className="flex flex-wrap gap-6">
            {[
              { field: 'is_published', label: 'Published (shows on site)' },
              { field: 'is_featured', label: 'Featured (homepage spotlight)' },
              { field: 'is_claimed', label: 'Claimed by owner' },
            ].map(({ field, label }) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!(form as any)[field]}
                  onChange={(e) => set(field as keyof Business, e.target.checked)}
                  className="w-4 h-4 rounded border-marshall-300 text-forest-600 focus:ring-forest-500" />
                <span className="text-sm text-marshall-700">{label}</span>
              </label>
            ))}
            <div className="flex items-center gap-2">
              <label className="text-sm text-marshall-700">Plan:</label>
              <select value={form.plan_tier || 'free'} onChange={(e) => set('plan_tier', e.target.value)}
                className="text-sm border border-marshall-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-marshall-400">
                {PLAN_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-xl border border-marshall-100 p-5 shadow-sm">
          <h2 className="font-semibold text-marshall-800 text-sm mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Business Name *</label>
              <input className={inputClass} value={form.name || ''} onChange={(e) => set('name', e.target.value)} placeholder="Schuler's Restaurant" />
            </div>
            <div>
              <label className={labelClass}>Slug *</label>
              <input className={inputClass} value={form.slug || ''} onChange={(e) => set('slug', e.target.value)} placeholder="schulers-restaurant" />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input className={inputClass} value={form.city || ''} onChange={(e) => set('city', e.target.value)} placeholder="Marshall" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Short Description (card preview)</label>
              <input className={inputClass} value={form.short_description || ''} onChange={(e) => set('short_description', e.target.value)} placeholder="Iconic Marshall dining since 1909" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Full Description</label>
              <textarea className={inputClass + ' resize-y'} rows={4} value={form.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Tell the full story of this business..." />
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="bg-white rounded-xl border border-marshall-100 p-5 shadow-sm">
          <h2 className="font-semibold text-marshall-800 text-sm mb-4">Contact & Location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Street Address</label>
              <input className={inputClass} value={form.address || ''} onChange={(e) => set('address', e.target.value)} placeholder="115 S Eagle St" />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input className={inputClass} value={form.state || ''} onChange={(e) => set('state', e.target.value)} placeholder="MI" />
            </div>
            <div>
              <label className={labelClass}>ZIP</label>
              <input className={inputClass} value={form.zip || ''} onChange={(e) => set('zip', e.target.value)} placeholder="49068" />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} placeholder="(269) 781-0600" />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input className={inputClass} value={form.email || ''} onChange={(e) => set('email', e.target.value)} placeholder="hello@business.com" />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input className={inputClass} value={form.website || ''} onChange={(e) => set('website', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className={labelClass}>Google Business URL</label>
              <input className={inputClass} value={form.google_business_url || ''} onChange={(e) => set('google_business_url', e.target.value)} placeholder="https://maps.google.com/..." />
            </div>
            <div>
              <label className={labelClass}>Facebook URL</label>
              <input className={inputClass} value={form.facebook_url || ''} onChange={(e) => set('facebook_url', e.target.value)} placeholder="https://facebook.com/..." />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-marshall-100 p-5 shadow-sm">
          <h2 className="font-semibold text-marshall-800 text-sm mb-4">Images</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { field: 'logo_url' as const, label: 'Logo', uploading: uploadingLogo },
              { field: 'cover_image_url' as const, label: 'Cover Photo', uploading: uploadingCover },
            ].map(({ field, label, uploading }) => (
              <div key={field}>
                <label className={labelClass}>{label}</label>
                <input className={inputClass + ' mb-2'} value={(form as any)[field] || ''}
                  onChange={(e) => set(field, e.target.value)} placeholder="https://..." />
                <input type="file" accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], field)}
                  className="block w-full text-xs text-marshall-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-cream-200 file:text-marshall-700 hover:file:bg-cream-300 cursor-pointer" />
                {uploading && <p className="text-xs text-marshall-400 mt-1">Uploading...</p>}
                {(form as any)[field] && (
                  <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-marshall-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={(form as any)[field]} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl border border-marshall-100 p-5 shadow-sm">
          <h2 className="font-semibold text-marshall-800 text-sm mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button key={cat.id} type="button"
                onClick={() => setSelectedCats(prev =>
                  prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id]
                )}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedCats.includes(cat.id)
                    ? 'bg-marshall-700 text-white border-marshall-700'
                    : 'bg-white text-marshall-600 border-marshall-200 hover:border-marshall-400'
                }`}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Save footer */}
        <div className="flex justify-end gap-3 pb-8">
          <Link href="/admin" className="px-5 py-2.5 border border-marshall-200 text-marshall-600 text-sm rounded-lg hover:border-marshall-400 transition-colors">
            Cancel
          </Link>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-marshall-700 text-white text-sm font-semibold rounded-lg hover:bg-marshall-800 transition-colors disabled:opacity-50">
            <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
