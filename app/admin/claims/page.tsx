'use client';

import { useState, useEffect } from 'react';
import { Shield, Check, X, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ClaimWithBusiness = {
  id: string;
  business_id: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string | null;
  message: string | null;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  businesses: { name: string; slug: string; address: string | null } | null;
};

export default function ClaimsPage() {
  const [claims, setClaims] = useState<ClaimWithBusiness[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);

  async function loadClaims() {
    setLoading(true);
    let query = supabase
      .from('claims')
      .select('*, businesses(name, slug, address)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    setClaims((data as any) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadClaims();
  }, [filter]);

  async function updateClaimStatus(claimId: string, businessId: string, status: 'verified' | 'rejected') {
    // Update claim status
    await supabase.from('claims').update({ status }).eq('id', claimId);

    // If verified, mark business as claimed
    if (status === 'verified') {
      await supabase.from('businesses').update({ is_claimed: true }).eq('id', businessId);
    }

    // Log the action
    await supabase.from('contact_log').insert({
      business_id: businessId,
      contact_type: 'note',
      subject: `Claim ${status}`,
      notes: `Claim from ${claims.find(c => c.id === claimId)?.owner_email} was ${status}.`,
    });

    loadClaims();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-marshall-900">Claim Requests</h1>
        <div className="flex gap-1 bg-white rounded-lg border border-marshall-100 p-1">
          {(['pending', 'verified', 'rejected', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                filter === f ? 'bg-forest-600 text-white' : 'text-marshall-600 hover:bg-marshall-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-marshall-400">Loading claims...</div>
      ) : claims.length === 0 ? (
        <div className="card p-8 text-center">
          <Shield size={32} className="mx-auto text-marshall-300 mb-3" />
          <p className="text-marshall-400">No {filter === 'all' ? '' : filter} claims found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold text-marshall-900">
                      {claim.businesses?.name || 'Unknown Business'}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      claim.status === 'pending' ? 'bg-marshall-100 text-marshall-700' :
                      claim.status === 'verified' ? 'bg-forest-50 text-forest-700' :
                      'bg-brick-50 text-brick-700'
                    }`}>
                      {claim.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-marshall-600 mb-2">
                    <div>
                      <span className="text-marshall-400 text-xs block">Owner</span>
                      {claim.owner_name}
                    </div>
                    <div>
                      <span className="text-marshall-400 text-xs block">Email</span>
                      <a href={`mailto:${claim.owner_email}`} className="text-forest-600 hover:underline">
                        {claim.owner_email}
                      </a>
                    </div>
                    <div>
                      <span className="text-marshall-400 text-xs block">Phone</span>
                      {claim.owner_phone || '—'}
                    </div>
                  </div>

                  {claim.message && (
                    <div className="text-sm text-marshall-500 bg-cream-100 rounded-lg p-3 mt-2">
                      <span className="text-marshall-400 text-xs block mb-1">Message</span>
                      {claim.message}
                    </div>
                  )}

                  <div className="text-xs text-marshall-400 mt-2">
                    Submitted {new Date(claim.created_at).toLocaleString()}
                    {claim.businesses?.slug && (
                      <> · <a href={`/businesses/${claim.businesses.slug}`} target="_blank" className="text-forest-600 hover:underline inline-flex items-center gap-0.5">
                        View listing <ExternalLink size={10} />
                      </a></>
                    )}
                  </div>
                </div>

                {claim.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateClaimStatus(claim.id, claim.business_id, 'verified')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-forest-600 text-white text-xs font-semibold rounded-lg hover:bg-forest-700 transition-colors"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => updateClaimStatus(claim.id, claim.business_id, 'rejected')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-brick-100 text-brick-700 text-xs font-semibold rounded-lg hover:bg-brick-200 transition-colors"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
