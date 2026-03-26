'use client';

import { useState, useEffect } from 'react';
import { Send, Check, Search, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { siteConfig } from '@/lib/config';

type BusinessForOutreach = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string;
  state: string;
  phone: string | null;
  email: string | null;
  website: string | null;
};

export default function OutreachPage() {
  const [businesses, setBusinesses] = useState<BusinessForOutreach[]>([]);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [selectedBiz, setSelectedBiz] = useState<BusinessForOutreach | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function load() {
      // Get all published businesses
      const { data: bizData } = await supabase
        .from('businesses')
        .select('id, name, slug, address, city, state, phone, email, website')
        .eq('is_published', true)
        .order('name');

      // Get businesses already contacted
      const { data: contactData } = await supabase
        .from('contact_log')
        .select('business_id')
        .eq('contact_type', 'email')
        .eq('subject', 'Warm-up Email');

      if (bizData) setBusinesses(bizData);
      if (contactData) {
        setSentIds(new Set(contactData.map((c: any) => c.business_id)));
      }
    }
    load();
  }, []);

  const filtered = businesses.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.address?.toLowerCase().includes(q);
  });

  const notYetContacted = filtered.filter((b) => !sentIds.has(b.id));
  const alreadyContacted = filtered.filter((b) => sentIds.has(b.id));

  function generateEmail(biz: BusinessForOutreach) {
    const hasWebsite = !!biz.website;
    return {
      subject: `Quick question about ${biz.name}`,
      body: `Hi,

I'm emailing because I built a community resource website for the ${siteConfig.city} area. My goal is to make it the best place to get info about ${siteConfig.city} businesses.

Your business has a listing already on the site. I just want to make sure I have all the information correct.

Is this your correct information?

Business: ${biz.name}
${biz.address ? `Address: ${biz.address}, ${biz.city}, ${biz.state}` : ''}
${biz.phone ? `Phone: ${biz.phone}` : ''}

Simply reply YES to this email if this is correct, or send me any changes needed.

${!hasWebsite ? `PS: By the way, I don't currently have your website on file. If you'd like it included in your live listing, just send it over in your reply and I'll add it.` : ''}

Thanks!
Roger
${siteConfig.name}
${siteConfig.url}`.trim(),
    };
  }

  async function logOutreach(biz: BusinessForOutreach) {
    setSending(true);
    const email = generateEmail(biz);

    // Log to contact_log
    await supabase.from('contact_log').insert({
      business_id: biz.id,
      contact_type: 'email',
      subject: 'Warm-up Email',
      notes: `Sent to: ${customEmail || biz.email || 'manual'}. Subject: ${email.subject}`,
    });

    setSentIds((prev) => new Set([...prev, biz.id]));
    setSending(false);
    setShowPreview(false);
    setSelectedBiz(null);
    setCustomEmail('');
    setSuccessMsg(`Outreach to ${biz.name} logged! Copy the email below to send manually, or use the API integration.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-marshall-900">Outreach</h1>
          <p className="text-marshall-500 text-sm mt-1">
            Send warm-up verification emails to businesses. {notYetContacted.length} businesses not yet contacted.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-forest-50 text-forest-700 rounded-lg text-sm border border-forest-200">
          <Check size={16} className="inline mr-2" /> {successMsg}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-marshall-400" />
        <input
          type="text"
          placeholder="Search businesses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9 text-sm"
        />
      </div>

      {/* Email Preview Modal */}
      {showPreview && selectedBiz && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <h2 className="font-display text-lg font-bold text-marshall-900 mb-4">
              Email Preview — {selectedBiz.name}
            </h2>

            <div className="bg-cream-50 rounded-lg p-4 mb-4">
              <div className="text-xs text-marshall-400 mb-1">Subject:</div>
              <div className="font-medium text-marshall-900 mb-3">
                {generateEmail(selectedBiz).subject}
              </div>
              <div className="text-xs text-marshall-400 mb-1">Body:</div>
              <pre className="text-sm text-marshall-700 whitespace-pre-wrap font-body leading-relaxed">
                {generateEmail(selectedBiz).body}
              </pre>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-marshall-700 mb-1">
                Send to email (optional — for logging)
              </label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder={selectedBiz.email || 'Enter their email if known'}
                className="input-field text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => logOutreach(selectedBiz)}
                disabled={sending}
                className="btn-primary text-sm flex-1"
              >
                {sending ? 'Logging...' : 'Log as Sent & Copy Email'}
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(generateEmail(selectedBiz).body); }}
                className="btn-outline text-sm"
              >
                Copy Email
              </button>
              <button
                onClick={() => { setShowPreview(false); setSelectedBiz(null); }}
                className="btn-outline text-sm"
              >
                Cancel
              </button>
            </div>

            <p className="text-marshall-400 text-xs mt-3">
              For now, copy this email and send it manually from your marshalltoday.com email. 
              Once Resend is connected, this will send automatically via API.
            </p>
          </div>
        </div>
      )}

      {/* Not yet contacted */}
      <div className="mb-8">
        <h2 className="font-display text-sm font-semibold text-marshall-700 uppercase tracking-wider mb-3">
          Not Yet Contacted ({notYetContacted.length})
        </h2>
        {notYetContacted.length === 0 ? (
          <div className="card p-6 text-center text-marshall-400 text-sm">
            All filtered businesses have been contacted!
          </div>
        ) : (
          <div className="space-y-2">
            {notYetContacted.map((biz) => (
              <div key={biz.id} className="card p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-marshall-900">{biz.name}</div>
                  <div className="text-xs text-marshall-500 truncate">
                    {[biz.address, biz.phone, biz.email].filter(Boolean).join(' · ') || 'No contact info'}
                  </div>
                  {!biz.website && (
                    <span className="text-xs text-marshall-400 bg-marshall-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                      No website — PS will ask for it
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setSelectedBiz(biz); setShowPreview(true); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-forest-600 text-white text-xs font-semibold rounded-lg hover:bg-forest-700 transition-colors flex-shrink-0"
                >
                  <Mail size={14} /> Preview & Send
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Already contacted */}
      {alreadyContacted.length > 0 && (
        <div>
          <h2 className="font-display text-sm font-semibold text-marshall-400 uppercase tracking-wider mb-3">
            Already Contacted ({alreadyContacted.length})
          </h2>
          <div className="space-y-2 opacity-60">
            {alreadyContacted.map((biz) => (
              <div key={biz.id} className="card p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-marshall-900 flex items-center gap-2">
                    {biz.name}
                    <Check size={14} className="text-forest-600" />
                  </div>
                  <div className="text-xs text-marshall-500 truncate">
                    {[biz.address, biz.phone].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <span className="text-xs text-marshall-400 font-medium">Sent</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
