'use client';

import { useState, useEffect } from 'react';
import { Building2, CheckCircle } from 'lucide-react';
import { siteConfig } from '@/lib/config';
import { supabase, submitBusiness, type Category } from '@/lib/supabase';

export default function AddBusinessPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    category_ids: [] as string[],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setLoading(true);
    const success = await submitBusiness(form);
    setLoading(false);

    if (success) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-forest-600" />
        </div>
        <h1 className="font-display text-3xl font-bold text-marshall-900 mb-3">
          Business Submitted!
        </h1>
        <p className="text-marshall-500 text-lg mb-8">
          Thank you for adding your business to {siteConfig.name}. We&apos;ll review your 
          submission and get your listing live shortly.
        </p>
        <a href="/businesses" className="btn-primary">
          Browse Directory
        </a>
      </div>
    );
  }

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
        <div className="space-y-5" role="form">
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

          {/* Phone & Email row */}
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

          {/* Submit */}
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading || !form.name.trim()}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Business'}
            </button>
            <p className="text-marshall-400 text-xs text-center mt-3">
              Submissions are reviewed before being published. Free listings are always free.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
