'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shield, CheckCircle } from 'lucide-react';
import { siteConfig } from '@/lib/config';
import { supabase, submitClaim, type Business } from '@/lib/supabase';

export default function ClaimPage() {
  const searchParams = useSearchParams();
  const preselectedSlug = searchParams.get('business');

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    business_id: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    message: '',
  });

  useEffect(() => {
    async function loadBusinesses() {
      const { data } = await supabase
        .from('businesses')
        .select('id, name, slug, address')
        .eq('is_published', true)
        .eq('is_claimed', false)
        .order('name');

      if (data) {
        setBusinesses(data as Business[]);
        // Pre-select if coming from a business page
        if (preselectedSlug) {
          const match = data.find((b: any) => b.slug === preselectedSlug);
          if (match) {
            setForm((prev) => ({ ...prev, business_id: match.id }));
          }
        }
      }
    }
    loadBusinesses();
  }, [preselectedSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.business_id || !form.owner_name || !form.owner_email) return;

    setLoading(true);
    const success = await submitClaim(form);
    setLoading(false);

    if (success) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-forest-600" />
        </div>
        <h1 className="font-display text-3xl font-bold text-marshall-900 mb-3">
          Claim Submitted!
        </h1>
        <p className="text-marshall-500 text-lg mb-8">
          We&apos;ll verify your ownership and get back to you within 24-48 hours. 
          Once verified, you&apos;ll have full control over your listing.
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
        <div className="w-12 h-12 rounded-xl bg-marshall-50 flex items-center justify-center mb-4">
          <Shield size={24} className="text-marshall-600" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-marshall-900">
          Claim Your Listing
        </h1>
        <p className="mt-2 text-marshall-500 text-lg">
          Verify your business ownership to manage your listing on {siteConfig.name}.
        </p>
      </div>

      <div className="card p-6 sm:p-8">
        <div className="space-y-5" role="form">
          {/* Select Business */}
          <div>
            <label className="block text-sm font-semibold text-marshall-700 mb-1.5">
              Select Your Business <span className="text-brick-500">*</span>
            </label>
            <select
              value={form.business_id}
              onChange={(e) => setForm({ ...form, business_id: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Choose a business...</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.address ? `— ${b.address}` : ''}
                </option>
              ))}
            </select>
            <p className="text-marshall-400 text-xs mt-1.5">
              Don&apos;t see your business? <a href="/add" className="text-forest-600 hover:underline">Add it first</a>
            </p>
          </div>

          {/* Owner Name */}
          <div>
            <label className="block text-sm font-semibold text-marshall-700 mb-1.5">
              Your Name <span className="text-brick-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.owner_name}
              onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
              className="input-field"
              placeholder="John Smith"
            />
          </div>

          {/* Owner Email */}
          <div>
            <label className="block text-sm font-semibold text-marshall-700 mb-1.5">
              Business Email <span className="text-brick-500">*</span>
            </label>
            <input
              type="email"
              required
              value={form.owner_email}
              onChange={(e) => setForm({ ...form, owner_email: e.target.value })}
              className="input-field"
              placeholder="owner@yourbusiness.com"
            />
          </div>

          {/* Owner Phone */}
          <div>
            <label className="block text-sm font-semibold text-marshall-700 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={form.owner_phone}
              onChange={(e) => setForm({ ...form, owner_phone: e.target.value })}
              className="input-field"
              placeholder="(269) 555-1234"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-marshall-700 mb-1.5">
              Additional Information
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="input-field min-h-[80px] resize-y"
              placeholder="Any additional details to help us verify your ownership..."
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading || !form.business_id || !form.owner_name || !form.owner_email}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Claim'}
            </button>
            <p className="text-marshall-400 text-xs text-center mt-3">
              We&apos;ll verify your ownership via email within 24-48 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
