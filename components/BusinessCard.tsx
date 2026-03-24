import Link from 'next/link';
import { MapPin, Phone, Globe, Star } from 'lucide-react';
import type { Business } from '@/lib/supabase';

export default function BusinessCard({ business }: { business: Business }) {
  return (
    <Link href={`/businesses/${business.slug}`} className="card group block overflow-hidden">
      {/* Cover image or placeholder */}
      <div className="relative h-44 bg-gradient-to-br from-marshall-100 to-cream-200 overflow-hidden">
        {business.cover_image_url ? (
          <img
            src={business.cover_image_url}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl font-display font-bold text-marshall-200">
              {business.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Featured badge */}
        {business.is_featured && (
          <div className="absolute top-3 left-3 featured-badge">
            <Star size={12} fill="currentColor" />
            Featured
          </div>
        )}

        {/* Plan tier badge */}
        {business.plan_tier !== 'free' && (
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-forest-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
            {business.plan_tier}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start gap-3">
          {/* Logo */}
          {business.logo_url ? (
            <img
              src={business.logo_url}
              alt=""
              className="w-10 h-10 rounded-lg object-cover border border-marshall-100 flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center flex-shrink-0">
              <span className="text-forest-600 font-display font-bold text-sm">
                {business.name.charAt(0)}
              </span>
            </div>
          )}

          <div className="min-w-0">
            <h3 className="font-display font-semibold text-lg text-marshall-900 group-hover:text-forest-700 transition-colors truncate">
              {business.name}
            </h3>
            {business.short_description && (
              <p className="text-marshall-500 text-sm mt-0.5 line-clamp-1">
                {business.short_description}
              </p>
            )}
          </div>
        </div>

        {/* Categories */}
        {business.categories && business.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {business.categories.slice(0, 2).map((cat) => (
              <span key={cat.id} className="category-badge text-xs">
                {cat.icon} {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* Details */}
        <div className="mt-4 space-y-1.5">
          {business.address && (
            <div className="flex items-center gap-2 text-marshall-500 text-sm">
              <MapPin size={14} className="text-marshall-400 flex-shrink-0" />
              <span className="truncate">{business.address}, {business.city}, {business.state}</span>
            </div>
          )}
          {business.phone && (
            <div className="flex items-center gap-2 text-marshall-500 text-sm">
              <Phone size={14} className="text-marshall-400 flex-shrink-0" />
              <span>{business.phone}</span>
            </div>
          )}
          {business.website && (
            <div className="flex items-center gap-2 text-marshall-500 text-sm">
              <Globe size={14} className="text-marshall-400 flex-shrink-0" />
              <span className="truncate">{business.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
            </div>
          )}
        </div>

        {/* Claimed indicator */}
        {business.is_claimed && (
          <div className="mt-3 pt-3 border-t border-marshall-50 flex items-center gap-1.5 text-forest-600 text-xs font-medium">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="7" fill="currentColor" fillOpacity="0.1" />
              <path d="M4 7L6 9L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Verified Business
          </div>
        )}
      </div>
    </Link>
  );
}
