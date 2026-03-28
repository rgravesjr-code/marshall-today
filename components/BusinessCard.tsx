import Link from 'next/link';
import { MapPin, Phone, Globe, Star } from 'lucide-react';
import type { Business } from '@/lib/supabase';

// Category-based placeholder emoji + gradient when no image is available
const CATEGORY_PLACEHOLDERS: Record<string, { emoji: string; gradient: string }> = {
  'food-drink':           { emoji: '🍽️', gradient: 'from-amber-50 to-orange-100' },
  'bakery':               { emoji: '🥐', gradient: 'from-amber-50 to-yellow-100' },
  'brewery':              { emoji: '🍺', gradient: 'from-amber-100 to-orange-100' },
  'coffee':               { emoji: '☕', gradient: 'from-stone-100 to-amber-50' },
  'restaurant':           { emoji: '🍽️', gradient: 'from-amber-50 to-orange-100' },
  'bar':                  { emoji: '🍸', gradient: 'from-purple-50 to-indigo-100' },
  'hair':                 { emoji: '✂️', gradient: 'from-pink-50 to-rose-100' },
  'salon':                { emoji: '💅', gradient: 'from-pink-50 to-rose-100' },
  'spa':                  { emoji: '🧖', gradient: 'from-teal-50 to-emerald-100' },
  'health':               { emoji: '🏥', gradient: 'from-blue-50 to-cyan-100' },
  'medical':              { emoji: '⚕️', gradient: 'from-blue-50 to-sky-100' },
  'legal':                { emoji: '⚖️', gradient: 'from-slate-100 to-gray-200' },
  'financial':            { emoji: '💼', gradient: 'from-slate-50 to-blue-100' },
  'real-estate':          { emoji: '🏠', gradient: 'from-green-50 to-emerald-100' },
  'automotive':           { emoji: '🔧', gradient: 'from-gray-100 to-slate-200' },
  'hotel':                { emoji: '🏨', gradient: 'from-indigo-50 to-blue-100' },
  'inn':                  { emoji: '🛏️', gradient: 'from-indigo-50 to-purple-100' },
  'camping':              { emoji: '⛺', gradient: 'from-green-50 to-lime-100' },
  'museum':               { emoji: '🏛️', gradient: 'from-stone-100 to-amber-50' },
  'theatre':              { emoji: '🎭', gradient: 'from-purple-50 to-fuchsia-100' },
  'arts':                 { emoji: '🎨', gradient: 'from-violet-50 to-purple-100' },
  'antiques':             { emoji: '🏺', gradient: 'from-amber-50 to-stone-100' },
  'shop':                 { emoji: '🛍️', gradient: 'from-rose-50 to-pink-100' },
  'plumbing':             { emoji: '🔧', gradient: 'from-blue-50 to-slate-100' },
  'church':               { emoji: '⛪', gradient: 'from-sky-50 to-blue-100' },
  'nonprofit':            { emoji: '🤝', gradient: 'from-green-50 to-teal-100' },
  'community':            { emoji: '🏘️', gradient: 'from-green-50 to-emerald-100' },
  'fitness':              { emoji: '💪', gradient: 'from-orange-50 to-red-100' },
  'education':            { emoji: '📚', gradient: 'from-yellow-50 to-amber-100' },
  'government':           { emoji: '🏛️', gradient: 'from-blue-50 to-indigo-100' },
  'default':              { emoji: '📍', gradient: 'from-marshall-100 to-cream-200' },
};

function getPlaceholder(business: Business) {
  const name = business.name.toLowerCase();
  if (name.includes('plumb') || name.includes('heating') || name.includes('hvac')) return CATEGORY_PLACEHOLDERS.plumbing;
  if (name.includes('salon') || name.includes('hair') || name.includes('barber') || name.includes('nail') || name.includes('lash')) return CATEGORY_PLACEHOLDERS.salon;
  if (name.includes('spa')) return CATEGORY_PLACEHOLDERS.spa;
  if (name.includes('restaurant') || name.includes('grill') || name.includes('grille') || name.includes('diner') || name.includes('bistro') || name.includes('cafe') || name.includes('kitchen') || name.includes('eatery')) return CATEGORY_PLACEHOLDERS['food-drink'];
  if (name.includes('bakery') || name.includes('bake') || name.includes('pastry')) return CATEGORY_PLACEHOLDERS.bakery;
  if (name.includes('brew') || name.includes('beer') || name.includes('taproom')) return CATEGORY_PLACEHOLDERS.brewery;
  if (name.includes('coffee') || name.includes('espresso') || name.includes('tea')) return CATEGORY_PLACEHOLDERS.coffee;
  if (name.includes('bar') || name.includes('pub') || name.includes('tavern')) return CATEGORY_PLACEHOLDERS.bar;
  if (name.includes('inn') || name.includes('bed & breakfast') || name.includes('b&b')) return CATEGORY_PLACEHOLDERS.inn;
  if (name.includes('hotel') || name.includes('hampton') || name.includes('holiday inn') || name.includes('motel')) return CATEGORY_PLACEHOLDERS.hotel;
  if (name.includes('camp') || name.includes('resort')) return CATEGORY_PLACEHOLDERS.camping;
  if (name.includes('museum') || name.includes('historical') || name.includes('history')) return CATEGORY_PLACEHOLDERS.museum;
  if (name.includes('theatre') || name.includes('theater') || name.includes('bogar')) return CATEGORY_PLACEHOLDERS.theatre;
  if (name.includes('gallery') || name.includes('art') || name.includes('studio')) return CATEGORY_PLACEHOLDERS.arts;
  if (name.includes('antique')) return CATEGORY_PLACEHOLDERS.antiques;
  if (name.includes('church') || name.includes('presbyterian') || name.includes('methodist') || name.includes('episcopal') || name.includes('baptist') || name.includes('catholic')) return CATEGORY_PLACEHOLDERS.church;
  if (name.includes('attorney') || name.includes('law') || name.includes('legal') || name.includes('plc') || name.includes('pllc')) return CATEGORY_PLACEHOLDERS.legal;
  if (name.includes('financial') || name.includes('insurance') || name.includes('credit union') || name.includes('bank')) return CATEGORY_PLACEHOLDERS.financial;
  if (name.includes('real estate') || name.includes('realty') || name.includes('realtor')) return CATEGORY_PLACEHOLDERS['real-estate'];
  if (name.includes('auto') || name.includes('car') || name.includes('truck') || name.includes('tire') || name.includes('motor')) return CATEGORY_PLACEHOLDERS.automotive;
  if (name.includes('fitness') || name.includes('gym') || name.includes('yoga') || name.includes('anytime fitness')) return CATEGORY_PLACEHOLDERS.fitness;
  if (name.includes('school') || name.includes('college') || name.includes('academy') || name.includes('tutoring')) return CATEGORY_PLACEHOLDERS.education;
  if (name.includes('city of') || name.includes('township') || name.includes('county') || name.includes('postal')) return CATEGORY_PLACEHOLDERS.government;
  if (name.includes('nonprofit') || name.includes('foundation') || name.includes('association') || name.includes('rotary') || name.includes('kiwanis') || name.includes('lions') || name.includes('mobile meals') || name.includes('free store')) return CATEGORY_PLACEHOLDERS.nonprofit;
  if (name.includes('shop') || name.includes('boutique') || name.includes('store') || name.includes('gift')) return CATEGORY_PLACEHOLDERS.shop;
  // Fall back to first category if available
  const cat = business.categories?.[0]?.slug || '';
  return CATEGORY_PLACEHOLDERS[cat] || CATEGORY_PLACEHOLDERS.default;
}

export default function BusinessCard({ business }: { business: Business }) {
  const placeholder = getPlaceholder(business);
  const hasImage = !!(business.cover_image_url || business.logo_url);

  return (
    <Link href={`/businesses/${business.slug}`} className="card group block overflow-hidden">
      {/* Cover image or category placeholder */}
      <div className={`relative h-44 overflow-hidden ${!hasImage ? `bg-gradient-to-br ${placeholder.gradient}` : 'bg-marshall-100'}`}>
        {business.cover_image_url ? (
          <img
            src={business.cover_image_url}
            alt={business.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            style={{ objectPosition: 'center' }}
          />
        ) : business.logo_url ? (
          <img
            src={business.logo_url}
            alt={business.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            style={{ objectPosition: 'center' }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-5xl">{placeholder.emoji}</span>
            <span className="text-xs font-medium text-marshall-400 tracking-wide uppercase">
              {business.city || 'Marshall'}
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
          {/* Logo thumbnail */}
          {business.logo_url ? (
            <img
              src={business.logo_url}
              alt=""
              className="w-10 h-10 rounded-lg object-contain border border-marshall-100 flex-shrink-0 bg-white"
            />
          ) : (
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${placeholder.gradient} border border-marshall-100 flex items-center justify-center flex-shrink-0`}>
              <span className="text-lg">{placeholder.emoji}</span>
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
