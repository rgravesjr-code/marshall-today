import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Phone, Globe, Mail, Clock, ArrowLeft, ExternalLink, Facebook } from 'lucide-react';
import { siteConfig } from '@/lib/config';
import { getBusinessBySlug, getBusinesses } from '@/lib/supabase';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) return { title: 'Business Not Found' };

  return {
    title: `${business.name} — ${siteConfig.city} Business`,
    description: business.short_description || business.description || `${business.name} in ${siteConfig.city}, ${siteConfig.state}`,
  };
}

// Pre-generate pages for all businesses
export async function generateStaticParams() {
  const businesses = await getBusinesses();
  return businesses.map((b) => ({ slug: b.slug }));
}

export const revalidate = 60;

export default async function BusinessDetailPage({ params }: Props) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business) notFound();

  const dayNames = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dayLabels: Record<string, string> = {
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
    thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Back link */}
      <Link
        href="/businesses"
        className="inline-flex items-center gap-1.5 text-marshall-500 hover:text-marshall-700 text-sm font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Directory
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ============================================ */}
        {/* MAIN CONTENT — Left 2 columns */}
        {/* ============================================ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover image */}
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-forest-100 to-cream-300 h-72 sm:h-80 lg:h-96">
            {business.cover_image_url ? (
              <img
                src={business.cover_image_url}
                alt={business.name}
                className="absolute inset-0 w-full h-full object-contain object-top p-2"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl font-display font-bold text-marshall-200">
                  {business.name.charAt(0)}
                </span>
              </div>
            )}

            {business.is_featured && (
              <div className="absolute top-4 left-4 featured-badge text-sm">
                ★ Featured Business
              </div>
            )}
          </div>

          {/* Header */}
          <div className="flex items-start gap-4">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt=""
                className="w-16 h-16 rounded-xl object-contain border-2 border-marshall-100 shadow-sm flex-shrink-0 bg-white"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-forest-50 border-2 border-forest-100 flex items-center justify-center flex-shrink-0">
                <span className="text-forest-600 font-display font-bold text-2xl">
                  {business.name.charAt(0)}
                </span>
              </div>
            )}

            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-marshall-900">
                {business.name}
              </h1>

              {/* Categories */}
              {business.categories && business.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {business.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      className="category-badge text-xs"
                    >
                      {cat.icon} {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {business.is_claimed && (
                <div className="mt-2 flex items-center gap-1.5 text-forest-600 text-sm font-medium">
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="7" fill="currentColor" fillOpacity="0.1" />
                    <path d="M4 7L6 9L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Verified &amp; Claimed
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {business.description && (
            <div className="card p-6 sm:p-8">
              <h2 className="font-display text-lg font-semibold text-marshall-900 mb-3">About</h2>
              <p className="text-marshall-600 leading-relaxed whitespace-pre-line">
                {business.description}
              </p>
            </div>
          )}

          {/* Business Hours */}
          {business.hours && Object.keys(business.hours).length > 0 && (
            <div className="card p-6 sm:p-8">
              <h2 className="font-display text-lg font-semibold text-marshall-900 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-marshall-400" />
                Business Hours
              </h2>
              <div className="space-y-2">
                {dayNames.map((day) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="text-marshall-600 font-medium">{dayLabels[day]}</span>
                    <span className="text-marshall-500">
                      {business.hours?.[day] || 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* SIDEBAR — Right column */}
        {/* ============================================ */}
        <div className="space-y-6">
          {/* Contact card */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-marshall-900 mb-4">Contact</h2>

            <div className="space-y-3">
              {business.address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${business.address}, ${business.city}, ${business.state} ${business.zip || ''}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-marshall-600 hover:text-forest-700 group transition-colors"
                >
                  <MapPin size={18} className="text-marshall-400 group-hover:text-forest-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm leading-snug">
                    {business.address}<br />
                    {business.city}, {business.state} {business.zip}
                  </span>
                </a>
              )}

              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-3 text-marshall-600 hover:text-forest-700 group transition-colors"
                >
                  <Phone size={18} className="text-marshall-400 group-hover:text-forest-600 flex-shrink-0" />
                  <span className="text-sm">{business.phone}</span>
                </a>
              )}

              {business.email && (
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-3 text-marshall-600 hover:text-forest-700 group transition-colors"
                >
                  <Mail size={18} className="text-marshall-400 group-hover:text-forest-600 flex-shrink-0" />
                  <span className="text-sm">{business.email}</span>
                </a>
              )}

              {business.website && (
                <a
                  href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-marshall-600 hover:text-forest-700 group transition-colors"
                >
                  <Globe size={18} className="text-marshall-400 group-hover:text-forest-600 flex-shrink-0" />
                  <span className="text-sm">{business.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  <ExternalLink size={14} className="text-marshall-300 ml-auto" />
                </a>
              )}

              {business.facebook_url && (
                <a
                  href={business.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-marshall-600 hover:text-forest-700 group transition-colors"
                >
                  <Facebook size={18} className="text-marshall-400 group-hover:text-forest-600 flex-shrink-0" />
                  <span className="text-sm">Facebook Page</span>
                  <ExternalLink size={14} className="text-marshall-300 ml-auto" />
                </a>
              )}

              {business.google_business_url && (
                <a
                  href={business.google_business_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-marshall-600 hover:text-forest-700 group transition-colors"
                >
                  <svg className="w-[18px] h-[18px] text-marshall-400 group-hover:text-forest-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-sm">Google Business Profile</span>
                  <ExternalLink size={14} className="text-marshall-300 ml-auto" />
                </a>
              )}
            </div>
          </div>

          {/* Claim CTA */}
          {!business.is_claimed && (
            <div className="card p-6 bg-cream-100 border-marshall-200">
              <h3 className="font-display font-semibold text-marshall-900 mb-2">
                Is this your business?
              </h3>
              <p className="text-marshall-500 text-sm mb-4">
                Claim this listing to update your business information and connect with customers.
              </p>
              <Link
                href={`/claim?business=${business.slug}`}
                className="btn-primary w-full text-sm"
              >
                Claim This Listing
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
