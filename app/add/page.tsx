'use client';

import { useState, useEffect } from 'react';
import { Building2, CheckCircle, ChevronLeft, MapPin, Phone, Mail, Globe, Tag, Pencil } from 'lucide-react';
import { siteConfig } from '@/lib/config';
import { supabase, submitBusiness, type Category } from '@/lib/supabase';
import Link from 'next/link';

type FormData = {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  category_ids: string[];
};

type Step = 'form' | 'preview' | 'success';

export default function AddBusinessPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [submittedName, setSubmittedName] = useState('');

  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    category_ids: [],
  });

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');
      if (data) setCategories(data);
    }
    loadCategories();
  }, []);

  const toggleCategory = (id: string) => {
    setForm((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter((c) => c !== id)
        : [...prev.category_ids, id],
    }));
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setStep('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const success = await submitBusiness(form);
    if (success) {
      // Fire notification emails (non-blocking — don't fail submission if email fails)
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'new_submission', business: form }),
        });
      } catch (_) {
        // email failure shouldn't block success
      }
      setSubmittedName(form.name);
      setStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setLoading(false);
  };

  const selectedCategories = categories.filter((c) => form.category_ids.includes(c.id));

  // ── SUCCESS ──────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-forest-600" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-marshall-900 mb-4">
          You're in the queue!
        </h1>
        <p className="text-marshall-500 text-lg mb-3">
          Thanks for adding <strong className="text-marshall-800">{submittedName}</strong> to {siteConfig.name}.
        </p>
        {form.email && (
          <p className="text-marshall-400 text-base mb-8">
            We sent a confirmation to <strong>{form.email}</strong>. Check your inbox — and your spam folder just in case.
          </p>
        )}
        {!form.email && (
          <p className="text-marshall-400 text-base mb-8">
            We'll review your listing and get it live on the directory shortly.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/businesses" className="btn-primary">
            Browse the Directory
          </Link>
          <Link href="/" className="btn-outline">
            Back to Home
          </Link>
        </div>

        <p className="text-marshall-300 text-sm mt-10">
          Want to manage your listing once it's live? Look for the "Claim this listing" button on your business page.
        </p>
      </div>
    );
  }

  // ── PREVIEW ──────────────────────────────────────────────
  if (step === 'preview') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <button
          onClick={() => setStep('form')}
          className="inline-flex items-center gap-1.5 text-sm text-marshall-500 hover:text-marshall-800 mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> Back to edit
        </button>

        <div className="mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-marshall-900">
            Does this look right?
          </h1>
          <p className="text-marshall-500 mt-1">
            Here's how your listing will appear in the directory.
          </p>
        </div>

        {/* Listing preview card */}
        <div className="card overflow-hidden mb-8">
          {/* Cover image placeholder */}
          <div className="h-32 bg-gradient-to-br from-marshall-100 to-cream-200 flex items-center justify-center">
            <Building2 size={48} className="text-marshall-300" />
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-marshall-900">{form.name}</h2>
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedCategories.map((cat) => (
                      <span key={cat.id} className="category-badge text-xs">
                        {cat.icon} {cat.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-xs px-2 py-1 bg-cream-200 text-marshall-500 rounded font-medium shrink-0 mt-1">
                Pending Review
              </span>
            </div>

            {form.description && (
              <p className="text-marshall-600 text-sm leading-relaxed mb-4">{form.description}</p>
            )}

            <div className="space-y-2 text-sm text-marshall-600">
              {form.address && (
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-marshall-400 shrink-0" />
                  <span>{form.address}, Marshall, MI</span>
                </div>
              )}
              {form.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-marshall-400 shrink-0" />
                  <span>{form.phone}</span>
                </div>
              )}
              {form.email && (
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-marshall-400 shrink-0" />
                  <span>{form.email}</span>
                </div>
              )}
              {form.website && (
                <div className="flex items-center gap-2">
                  <Globe size={15} className="text-marshall-400 shrink-0" />
                  <span className="text-forest-600">{form.website}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : '✓ Looks good — Submit!'}
          </button>
          <button
            onClick={() => setStep('form')}
            className="btn-outline flex-1 inline-flex items-center justify-center gap-1.5"
          >
            <Pencil size={15} /> Edit listing
          </button>
        </div>

        <p className="text-marshall-400 text-xs text-center mt-4">
          Your listing will be reviewed before going live. Free listings are always free.
        </p>
      </div>
    );
  }

  // ── FORM ──────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-forest-50 flex items-center justify-center mb-4">
          <Building2 size={24} className="text-forest-600" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-marshall-900">
          Add Your Business
        </h1>
        <p className="mt-2 text-marshall-500 text-lg">
          Get a free listing on {siteConfig.name}. It only takes a minute.
        </p>
      </div>

      <div className="card p-6 sm:p-8">
        <form onSubmit={handlePreview} className="space-y-5">
          {/* Business Name */}
          <div>
            <label className="block text-sm font-semibold text-marshall-700 mb-1.5">
              Business Name <span className="text-brick-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              placeholder="e.g., Marshall Coffee House"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-marshall-700 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field min-h-[100px] resize-y"
              placeholder="Tell the community about your business..."
              rows={4}
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-semibold text-marshall-700 mb-2">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`category-badge transition-all cursor-pointer ${
                    form.category_ids.includes(cat.id)
                      ? 'bg-forest-600 text-white hover:bg-forest-700'
                      : ''
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-marshall-700 mb-1.5">
              Street Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="input-field"
              placeholder="123 Michigan Ave"
            />
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-marshall-700 mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
                placeholder="(269) 555-1234"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-marshall-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="info@business.com"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-semibold text-marshall-700 mb-1.5">
              Website
            </label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="input-field"
              placeholder="https://www.yourbusiness.com"
            />
          </div>

          {/* Submit → Preview */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!form.name.trim()}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Preview My Listing →
            </button>
            <p className="text-marshall-400 text-xs text-center mt-3">
              You'll get to review before submitting. Free listings are always free.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
