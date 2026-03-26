import { redirect } from 'next/navigation';
import Link from 'next/link';
import { siteConfig } from '@/lib/config';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, MessageSquare, Send, BarChart3, Shield, Building2 } from 'lucide-react';

// This layout wraps all /admin pages
// For production, you'd check Supabase auth session here
// For now, we'll add auth in Phase 2

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/businesses', label: 'Businesses', icon: Building2 },
    { href: '/admin/claims', label: 'Claims', icon: Shield },
    { href: '/admin/outreach', label: 'Outreach', icon: Send },
    { href: '/admin/responses', label: 'Responses', icon: MessageSquare },
    { href: '/admin/reviews', label: 'Review Audits', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Admin header bar */}
      <div className="bg-marshall-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-forest-600 flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">M</span>
            </div>
            <span className="font-display font-semibold text-sm">
              {siteConfig.name} <span className="text-marshall-400">Admin</span>
            </span>
          </div>
          <Link href="/" className="text-marshall-400 hover:text-white text-xs transition-colors">
            ← Back to Site
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Admin nav tabs */}
        <nav className="flex flex-wrap gap-1 mb-6 bg-white rounded-lg border border-marshall-100 p-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-marshall-600 hover:text-marshall-900 hover:bg-marshall-50 rounded-md transition-colors"
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Page content */}
        {children}
      </div>
    </div>
  );
}
