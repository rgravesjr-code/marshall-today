import { supabase } from '@/lib/supabase';
import { Building2, Shield, Send, MessageSquare, Star, AlertTriangle, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getStats() {
  const [
    { count: totalBusinesses },
    { count: publishedBusinesses },
    { count: claimedBusinesses },
    { count: pendingClaims },
    { count: totalContacts },
    { count: featuredBusinesses },
  ] = await Promise.all([
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_claimed', true),
    supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('contact_log').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_featured', true),
  ]);

  return {
    totalBusinesses: totalBusinesses || 0,
    publishedBusinesses: publishedBusinesses || 0,
    claimedBusinesses: claimedBusinesses || 0,
    pendingClaims: pendingClaims || 0,
    totalContacts: totalContacts || 0,
    featuredBusinesses: featuredBusinesses || 0,
  };
}

async function getRecentClaims() {
  const { data } = await supabase
    .from('claims')
    .select('*, businesses(name, slug)')
    .order('created_at', { ascending: false })
    .limit(5);
  return data || [];
}

async function getRecentContacts() {
  const { data } = await supabase
    .from('contact_log')
    .select('*, businesses(name, slug)')
    .order('created_at', { ascending: false })
    .limit(5);
  return data || [];
}

export default async function AdminDashboardPage() {
  const [stats, recentClaims, recentContacts] = await Promise.all([
    getStats(),
    getRecentClaims(),
    getRecentContacts(),
  ]);

  const statCards = [
    { label: 'Total Businesses', value: stats.totalBusinesses, icon: Building2, color: 'bg-forest-50 text-forest-600' },
    { label: 'Published', value: stats.publishedBusinesses, icon: Star, color: 'bg-cream-200 text-marshall-600' },
    { label: 'Claimed', value: stats.claimedBusinesses, icon: Shield, color: 'bg-forest-50 text-forest-600' },
    { label: 'Pending Claims', value: stats.pendingClaims, icon: AlertTriangle, color: stats.pendingClaims > 0 ? 'bg-marshall-100 text-marshall-700' : 'bg-cream-100 text-marshall-500' },
    { label: 'Featured', value: stats.featuredBusinesses, icon: Star, color: 'bg-marshall-50 text-marshall-600' },
    { label: 'Contact Log Entries', value: stats.totalContacts, icon: MessageSquare, color: 'bg-cream-200 text-marshall-600' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-marshall-900 mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={16} />
            </div>
            <div className="font-display text-2xl font-bold text-marshall-900">{stat.value}</div>
            <div className="text-marshall-500 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Claims */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-marshall-900">Recent Claims</h2>
            <Link href="/admin/claims" className="text-forest-600 text-sm hover:underline">View all</Link>
          </div>
          {recentClaims.length > 0 ? (
            <div className="space-y-3">
              {recentClaims.map((claim: any) => (
                <div key={claim.id} className="flex items-center justify-between py-2 border-b border-marshall-50 last:border-0">
                  <div>
                    <div className="font-medium text-sm text-marshall-900">
                      {claim.businesses?.name || 'Unknown'}
                    </div>
                    <div className="text-xs text-marshall-500">
                      {claim.owner_name} · {claim.owner_email}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    claim.status === 'pending' ? 'bg-marshall-100 text-marshall-700' :
                    claim.status === 'verified' ? 'bg-forest-50 text-forest-700' :
                    'bg-brick-50 text-brick-700'
                  }`}>
                    {claim.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-marshall-400 text-sm">No claims yet.</p>
          )}
        </div>

        {/* Recent Contact Log */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-marshall-900">Recent Outreach</h2>
            <Link href="/admin/responses" className="text-forest-600 text-sm hover:underline">View all</Link>
          </div>
          {recentContacts.length > 0 ? (
            <div className="space-y-3">
              {recentContacts.map((contact: any) => (
                <div key={contact.id} className="flex items-center justify-between py-2 border-b border-marshall-50 last:border-0">
                  <div>
                    <div className="font-medium text-sm text-marshall-900">
                      {contact.businesses?.name || 'Unknown'}
                    </div>
                    <div className="text-xs text-marshall-500">
                      {contact.subject || contact.contact_type} · {new Date(contact.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cream-200 text-marshall-600 font-medium">
                    {contact.contact_type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-marshall-400 text-sm">No outreach logged yet.</p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8 card p-6">
        <h2 className="font-display text-lg font-semibold text-marshall-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/outreach" className="btn-primary text-sm">
            <Send size={16} className="mr-2" /> Send Outreach Email
          </Link>
          <Link href="/admin/claims" className="btn-secondary text-sm">
            <Shield size={16} className="mr-2" /> Review Claims ({stats.pendingClaims})
          </Link>
          <Link href="/admin/reviews" className="btn-outline text-sm">
            <BarChart3 size={16} className="mr-2" /> Audit Reviews
          </Link>
        </div>
      </div>
    </div>
  );
}
