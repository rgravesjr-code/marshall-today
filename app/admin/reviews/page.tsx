'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Plus, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type AuditWithBusiness = {
  id: string;
  business_id: string;
  total_reviews: number;
  responded_reviews: number;
  unresponded_reviews: number;
  average_rating: number | null;
  notes: string | null;
  last_audited_at: string;
  businesses: { name: string; slug: string; google_business_url: string | null } | null;
};

type BusinessOption = { id: string; name: string; };

export default function ReviewsPage() {
  const [audits, setAudits] = useState<AuditWithBusiness[]>([]);
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [form, setForm] = useState({
    business_id: '',
    total_reviews: 0,
    responded_reviews: 0,
    average_rating: '',
    notes: '',
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [{ data: auditData }, { data: bizData }] = await Promise.all([
      supabase
        .from('reviews_audit')
        .select('*, businesses(name, slug, google_business_url)')
        .order('unresponded_reviews', { ascending: false }),
      supabase.from('businesses').select('id, name').eq('is_published', true).order('name'),
    ]);
    setAudits((auditData as any) || []);
    setBusinesses(bizData || []);
    setLoading(false);
  }

  async function addAudit() {
    if (!form.business_id) return;
    const unresponded = form.total_reviews - form.responded_reviews;

    await supabase.from('reviews_audit').insert({
      business_id: form.business_id,
      total_reviews: form.total_reviews,
      responded_reviews: form.responded_reviews,
      unresponded_reviews: Math.max(0, unresponded),
      average_rating: form.average_rating ? parseFloat(form.average_rating) : null,
      notes: form.notes || null,
      last_audited_at: new Date().toISOString(),
    });

    setForm({ business_id: '', total_reviews: 0, responded_reviews: 0, average_rating: '', notes: '' });
    setShowAddForm(false);
    loadData();
  }

  function getHealthColor(unresponded: number, total: number) {
    if (total === 0) return 'text-marshall-400';
    const ratio = unresponded / total;
    if (ratio > 0.5) return 'text-brick-600';
    if (ratio > 0.2) return 'text-marshall-500';
    return 'text-forest-600';
  }

  function getHealthLabel(unresponded: number, total: number) {
    if (total === 0) return 'No data';
    const ratio = unresponded / total;
    if (ratio > 0.5) return 'Needs cleanup';
    if (ratio > 0.2) return 'Fair';
    return 'Healthy';
  }

  // Calculate totals for the pitch
  const totalUnresponded = audits.reduce((sum, a) => sum + a.unresponded_reviews, 0);
  const totalPotentialRevenue = totalUnresponded * 0.24;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-marshall-900">Review Audits</h1>
          <p className="text-marshall-500 text-sm mt-1">
            Track Google review health for businesses. Identify cleanup opportunities.
          </p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary text-sm">
          <Plus size={16} className="mr-1" /> Add Audit
        </button>
      </div>

      {/* Revenue opportunity banner */}
      {totalUnresponded > 0 && (
        <div className="card p-4 mb-6 bg-gradient-to-r from-marshall-50 to-cream-100 border-marshall-200">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-marshall-600 flex-shrink-0" />
            <div>
              <div className="font-display font-semibold text-marshall-900">
                {totalUnresponded.toLocaleString()} unanswered reviews across {audits.length} businesses
              </div>
              <div className="text-sm text-marshall-600">
                Potential cleanup revenue at $0.24/reply: <span className="font-bold">${totalPotentialRevenue.toFixed(2)}</span>
                {' '}+ recurring management at $97/mo/location
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add audit form */}
      {showAddForm && (
        <div className="card p-6 mb-6 border-forest-200">
          <h2 className="font-display font-semibold text-marshall-900 mb-4">Audit a Business</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-marshall-700 mb-1">Business</label>
              <select
                value={form.business_id}
                onChange={(e) => setForm({ ...form, business_id: e.target.value })}
                className="input-field text-sm"
              >
                <option value="">Select business...</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-marshall-700 mb-1">Average Rating</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={form.average_rating}
                onChange={(e) => setForm({ ...form, average_rating: e.target.value })}
                className="input-field text-sm"
                placeholder="e.g., 4.2"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-marshall-700 mb-1">Total Reviews</label>
              <input
                type="number"
                value={form.total_reviews}
                onChange={(e) => setForm({ ...form, total_reviews: parseInt(e.target.value) || 0 })}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-marshall-700 mb-1">Responded Reviews</label>
              <input
                type="number"
                value={form.responded_reviews}
                onChange={(e) => setForm({ ...form, responded_reviews: parseInt(e.target.value) || 0 })}
                className="input-field text-sm"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-marshall-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field text-sm min-h-[60px]"
              placeholder="Observations about their review profile..."
              rows={2}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={addAudit} disabled={!form.business_id} className="btn-primary text-sm disabled:opacity-50">
              Save Audit
            </button>
            <button onClick={() => setShowAddForm(false)} className="btn-outline text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Audit list */}
      {loading ? (
        <div className="card p-8 text-center text-marshall-400">Loading...</div>
      ) : audits.length === 0 ? (
        <div className="card p-8 text-center">
          <BarChart3 size={32} className="mx-auto text-marshall-300 mb-3" />
          <p className="text-marshall-400 mb-2">No review audits yet.</p>
          <p className="text-marshall-400 text-sm">
            Go to a business's Google profile, count their total reviews vs. responded reviews, and log it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {audits.map((audit) => {
            const responseRate = audit.total_reviews > 0
              ? Math.round((audit.responded_reviews / audit.total_reviews) * 100)
              : 0;
            const cleanupCost = audit.unresponded_reviews * 0.24;

            return (
              <div key={audit.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-display font-semibold text-marshall-900">
                        {audit.businesses?.name || 'Unknown'}
                      </h3>
                      <span className={`text-xs font-bold ${getHealthColor(audit.unresponded_reviews, audit.total_reviews)}`}>
                        {getHealthLabel(audit.unresponded_reviews, audit.total_reviews)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                      <div>
                        <div className="text-marshall-400 text-xs">Total</div>
                        <div className="font-bold text-marshall-900">{audit.total_reviews}</div>
                      </div>
                      <div>
                        <div className="text-marshall-400 text-xs">Responded</div>
                        <div className="font-bold text-forest-600">{audit.responded_reviews}</div>
                      </div>
                      <div>
                        <div className="text-marshall-400 text-xs">Unanswered</div>
                        <div className="font-bold text-brick-600">{audit.unresponded_reviews}</div>
                      </div>
                      <div>
                        <div className="text-marshall-400 text-xs">Response Rate</div>
                        <div className="font-bold text-marshall-700">{responseRate}%</div>
                      </div>
                      <div>
                        <div className="text-marshall-400 text-xs">Cleanup Value</div>
                        <div className="font-bold text-marshall-700">${cleanupCost.toFixed(2)}</div>
                      </div>
                    </div>

                    {audit.average_rating && (
                      <div className="text-xs text-marshall-500 mt-2">
                        Avg rating: {'⭐'.repeat(Math.round(audit.average_rating))} {audit.average_rating}
                      </div>
                    )}

                    {audit.notes && (
                      <div className="text-sm text-marshall-500 mt-2 bg-cream-50 rounded p-2">{audit.notes}</div>
                    )}

                    <div className="text-xs text-marshall-400 mt-2">
                      Audited {new Date(audit.last_audited_at).toLocaleDateString()}
                      {audit.businesses?.google_business_url && (
                        <> · <a href={audit.businesses.google_business_url} target="_blank" className="text-forest-600 hover:underline inline-flex items-center gap-0.5">
                          Google Profile <ExternalLink size={10} />
                        </a></>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-2 bg-marshall-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-forest-500 rounded-full transition-all"
                    style={{ width: `${responseRate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
