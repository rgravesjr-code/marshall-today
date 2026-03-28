'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Search, RefreshCw, Mail, Phone, Globe, X, ChevronDown } from 'lucide-react';

type Contact = {
  id: string;
  business_id: string;
  name: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  source: string;
  outreach_status: string;
  outreach_notes: string | null;
  last_contacted_at: string | null;
  updated_at: string;
  business?: { name: string; slug: string; city: string };
};

type Business = {
  id: string;
  name: string;
  slug: string;
  city: string;
  website: string | null;
  phone: string | null;
  email: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  not_contacted: 'bg-gray-100 text-gray-600',
  emailed: 'bg-blue-50 text-blue-600',
  called: 'bg-yellow-50 text-yellow-700',
  replied: 'bg-green-50 text-green-700',
  meeting_set: 'bg-purple-50 text-purple-700',
  customer: 'bg-forest-50 text-forest-700 font-semibold',
  not_interested: 'bg-red-50 text-red-500',
};

const STATUS_LABELS: Record<string, string> = {
  not_contacted: 'Not Contacted',
  emailed: 'Emailed',
  called: 'Called',
  replied: 'Replied',
  meeting_set: 'Meeting Set',
  customer: '⭐ Customer',
  not_interested: 'Not Interested',
};

export default function AdminContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState<string | null>(null);
  const [bulkScraping, setBulkScraping] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  const checkAuth = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push('/admin/login');
  }, [router]);

  const fetchData = useCallback(async () => {
    // Get all contacts with business info
    const { data: contactData } = await supabase
      .from('contacts')
      .select('*, business:businesses(name, slug, city)')
      .order('updated_at', { ascending: false });

    // Get all businesses with websites (for scraping)
    const { data: bizData } = await supabase
      .from('businesses')
      .select('id, name, slug, city, website, phone, email')
      .eq('is_published', true)
      .order('name');

    setContacts((contactData as Contact[]) ?? []);
    setBusinesses((bizData as Business[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth().then(() => fetchData());
  }, [checkAuth, fetchData]);

  async function scrapeOne(biz: Business) {
    if (!biz.website) return;
    setScraping(biz.id);
    try {
      const res = await fetch('/api/scrape-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: biz.id, url: biz.website }),
      });
      const data = await res.json();
      if (data.success) await fetchData();
      else alert('Scrape failed: ' + data.error);
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
    setScraping(null);
  }

  async function bulkScrape() {
    const toScrape = businesses.filter(b => b.website);
    if (!confirm(`Scrape ${toScrape.length} businesses? This uses ${toScrape.length} Firecrawl credits.`)) return;
    setBulkScraping(true);
    for (const biz of toScrape) {
      setScraping(biz.id);
      await scrapeOne(biz);
      await new Promise(r => setTimeout(r, 300));
    }
    setScraping(null);
    setBulkScraping(false);
  }

  async function updateStatus(contactId: string, status: string) {
    await supabase.from('contacts').update({
      outreach_status: status,
      last_contacted_at: ['emailed', 'called'].includes(status) ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    }).eq('id', contactId);
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, outreach_status: status } : c));
  }

  async function saveNotes(contactId: string) {
    await supabase.from('contacts').update({ outreach_notes: notesText, updated_at: new Date().toISOString() }).eq('id', contactId);
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, outreach_notes: notesText } : c));
    setEditingNotes(null);
  }

  // Businesses with no contact yet
  const bizWithoutContact = businesses.filter(b =>
    b.website && !contacts.find(c => c.business_id === b.id)
  );

  const filtered = contacts.filter(c => {
    const matchSearch = !search.trim() ||
      c.business?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search);
    const matchStatus = statusFilter === 'all' || c.outreach_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = Object.keys(STATUS_LABELS).reduce((acc, s) => {
    acc[s] = contacts.filter(c => c.outreach_status === s).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) return <div className="card p-8 text-center text-marshall-400">Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-marshall-900">Contacts</h1>
          <p className="text-marshall-500 text-sm mt-1">
            {contacts.length} contacts · {bizWithoutContact.length} businesses need scraping
          </p>
        </div>
        <button
          onClick={bulkScrape}
          disabled={bulkScraping || bizWithoutContact.length === 0}
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={14} className={bulkScraping ? 'animate-spin' : ''} />
          {bulkScraping ? 'Scraping...' : `Scrape ${bizWithoutContact.length} Missing`}
        </button>
      </div>

      {/* Status pipeline */}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 mb-6">
        {Object.entries(STATUS_LABELS).map(([s, label]) => (
          <button key={s} onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
            className={`text-center px-2 py-2 rounded-lg border text-xs transition-colors ${
              statusFilter === s ? 'border-marshall-600 bg-marshall-50' : 'border-marshall-100 bg-white hover:border-marshall-300'
            }`}>
            <div className="font-bold text-marshall-900 text-lg">{statusCounts[s] || 0}</div>
            <div className="text-marshall-500 leading-tight">{label.replace('⭐ ', '')}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-marshall-400" />
        <input type="text" placeholder="Search by business, email, or phone..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="input-field pl-9 py-2.5 text-sm" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-marshall-400"><X size={14} /></button>}
      </div>

      {/* Contact list */}
      <div className="bg-white rounded-xl border border-marshall-100 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-marshall-400 text-sm">No contacts found.</div>
        ) : (
          <div className="divide-y divide-marshall-50">
            {filtered.map(contact => (
              <div key={contact.id} className="px-5 py-4 hover:bg-cream-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Business info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-marshall-900 text-sm">{contact.business?.name || '—'}</span>
                      <span className="text-xs text-marshall-400">{contact.business?.city}</span>
                      <span className="text-xs px-1.5 py-0.5 bg-cream-200 text-marshall-500 rounded">{contact.source}</span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-marshall-500">
                      {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-forest-600">
                          <Phone size={12} />{contact.phone}
                        </a>
                      )}
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-forest-600">
                          <Mail size={12} />{contact.email}
                        </a>
                      )}
                      {contact.website && (
                        <a href={contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-forest-600">
                          <Globe size={12} />{contact.website.replace(/^https?:\/\/(www\.)?/, '').slice(0, 30)}
                        </a>
                      )}
                    </div>

                    {/* Notes */}
                    {editingNotes === contact.id ? (
                      <div className="mt-2 flex gap-2">
                        <textarea value={notesText} onChange={e => setNotesText(e.target.value)}
                          className="input-field text-xs py-1.5 flex-1 min-h-[60px] resize-none" placeholder="Add outreach notes..." />
                        <div className="flex flex-col gap-1">
                          <button onClick={() => saveNotes(contact.id)} className="text-xs px-2 py-1 bg-forest-600 text-white rounded">Save</button>
                          <button onClick={() => setEditingNotes(null)} className="text-xs px-2 py-1 bg-cream-200 text-marshall-600 rounded">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingNotes(contact.id); setNotesText(contact.outreach_notes || ''); }}
                        className="mt-1.5 text-xs text-marshall-400 hover:text-marshall-700 text-left">
                        {contact.outreach_notes || '+ Add notes'}
                      </button>
                    )}
                  </div>

                  {/* Status dropdown */}
                  <div className="shrink-0">
                    <div className="relative">
                      <select
                        value={contact.outreach_status}
                        onChange={e => updateStatus(contact.id, e.target.value)}
                        className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border-0 cursor-pointer appearance-none pr-6 ${STATUS_COLORS[contact.outreach_status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {Object.entries(STATUS_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>
                    {contact.last_contacted_at && (
                      <div className="text-xs text-marshall-300 mt-1 text-right">
                        {new Date(contact.last_contacted_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Businesses needing scrape */}
      {bizWithoutContact.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold text-marshall-900 mb-3">
            Needs Scraping ({bizWithoutContact.length})
          </h2>
          <div className="bg-white rounded-xl border border-marshall-100 overflow-hidden shadow-sm divide-y divide-marshall-50">
            {bizWithoutContact.map(biz => (
              <div key={biz.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm text-marshall-900">{biz.name}</span>
                  <span className="text-xs text-marshall-400 ml-2">{biz.city}</span>
                </div>
                <span className="text-xs text-marshall-400 truncate max-w-[200px]">
                  {biz.website?.replace(/^https?:\/\/(www\.)?/, '')}
                </span>
                <button
                  onClick={() => scrapeOne(biz)}
                  disabled={scraping === biz.id}
                  className="text-xs font-medium px-3 py-1.5 bg-forest-50 text-forest-700 hover:bg-forest-100 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={11} className={scraping === biz.id ? 'animate-spin' : ''} />
                  {scraping === biz.id ? 'Scraping...' : 'Scrape'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
