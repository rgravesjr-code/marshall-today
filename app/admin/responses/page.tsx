'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Phone, Mail, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ContactWithBusiness = {
  id: string;
  business_id: string;
  contact_type: string;
  subject: string | null;
  notes: string | null;
  created_at: string;
  businesses: { name: string; slug: string } | null;
};

type BusinessOption = {
  id: string;
  name: string;
};

export default function ResponsesPage() {
  const [contacts, setContacts] = useState<ContactWithBusiness[]>([]);
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const [form, setForm] = useState({
    business_id: '',
    contact_type: 'email' as string,
    subject: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [filter]);

  async function loadData() {
    setLoading(true);

    let query = supabase
      .from('contact_log')
      .select('*, businesses(name, slug)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter !== 'all') {
      query = query.eq('contact_type', filter);
    }

    const [{ data: contactData }, { data: bizData }] = await Promise.all([
      query,
      supabase.from('businesses').select('id, name').eq('is_published', true).order('name'),
    ]);

    setContacts((contactData as any) || []);
    setBusinesses(bizData || []);
    setLoading(false);
  }

  async function addResponse() {
    if (!form.business_id || !form.notes) return;

    await supabase.from('contact_log').insert({
      business_id: form.business_id,
      contact_type: form.contact_type,
      subject: form.subject || null,
      notes: form.notes,
    });

    setForm({ business_id: '', contact_type: 'email', subject: '', notes: '' });
    setShowAddForm(false);
    loadData();
  }

  const typeIcons: Record<string, any> = {
    email: Mail,
    phone: Phone,
    follow_up: CheckCircle,
    note: FileText,
  };

  const typeColors: Record<string, string> = {
    email: 'bg-forest-50 text-forest-700',
    phone: 'bg-marshall-100 text-marshall-700',
    follow_up: 'bg-cream-200 text-marshall-700',
    note: 'bg-cream-100 text-marshall-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-marshall-900">Responses & Contact Log</h1>
          <p className="text-marshall-500 text-sm mt-1">
            Track all conversations with businesses — emails sent, replies received, phone calls, notes.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary text-sm"
        >
          <Plus size={16} className="mr-1" /> Log Response
        </button>
      </div>

      {/* Add response form */}
      {showAddForm && (
        <div className="card p-6 mb-6 border-forest-200">
          <h2 className="font-display font-semibold text-marshall-900 mb-4">Log a New Response</h2>
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
              <label className="block text-xs font-semibold text-marshall-700 mb-1">Type</label>
              <select
                value={form.contact_type}
                onChange={(e) => setForm({ ...form, contact_type: e.target.value })}
                className="input-field text-sm"
              >
                <option value="email">Email Reply</option>
                <option value="phone">Phone Call</option>
                <option value="follow_up">Follow Up</option>
                <option value="note">Internal Note</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-marshall-700 mb-1">Subject / Summary</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="input-field text-sm"
              placeholder="e.g., Replied YES — info confirmed"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-marshall-700 mb-1">Notes / Details</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field text-sm min-h-[80px]"
              placeholder="What did they say? What's the next step? Any review cleanup opportunity?"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={addResponse} disabled={!form.business_id || !form.notes} className="btn-primary text-sm disabled:opacity-50">
              Save Response
            </button>
            <button onClick={() => setShowAddForm(false)} className="btn-outline text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white rounded-lg border border-marshall-100 p-1 mb-6">
        {['all', 'email', 'phone', 'follow_up', 'note'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
              filter === f ? 'bg-forest-600 text-white' : 'text-marshall-600 hover:bg-marshall-50'
            }`}
          >
            {f === 'follow_up' ? 'Follow-ups' : f === 'all' ? 'All' : f + 's'}
          </button>
        ))}
      </div>

      {/* Contact log list */}
      {loading ? (
        <div className="card p-8 text-center text-marshall-400">Loading...</div>
      ) : contacts.length === 0 ? (
        <div className="card p-8 text-center">
          <MessageSquare size={32} className="mx-auto text-marshall-300 mb-3" />
          <p className="text-marshall-400">No responses logged yet. Start by sending outreach emails!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => {
            const Icon = typeIcons[contact.contact_type] || FileText;
            const colorClass = typeColors[contact.contact_type] || typeColors.note;

            return (
              <div key={contact.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm text-marshall-900">
                        {contact.businesses?.name || 'Unknown'}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${colorClass}`}>
                        {contact.contact_type}
                      </span>
                    </div>
                    {contact.subject && (
                      <div className="text-sm text-marshall-700 font-medium">{contact.subject}</div>
                    )}
                    {contact.notes && (
                      <div className="text-sm text-marshall-500 mt-1 whitespace-pre-line">{contact.notes}</div>
                    )}
                    <div className="text-xs text-marshall-400 mt-1.5">
                      {new Date(contact.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
