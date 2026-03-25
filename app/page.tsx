import Link from 'next/link';
import { ArrowRight, Star, Building2, Users } from 'lucide-react';
import { siteConfig } from '@/lib/config';
import { getBusinesses, getCategories } from '@/lib/supabase';
import BusinessCard from '@/components/BusinessCard';
import HeroSearch from '@/components/HeroSearch';

export const revalidate = 60; // ISR: refresh every 60 seconds

export default async function HomePage() {
  const [featuredBusinesses, categories] = await Promise.all([
    getBusinesses({ featured: true, limit: 6 }),
    getCategories(),
  ]);

  return (
    <div>
      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="relative overflow-hidden min-h-[520px] flex items-center">
        {/* Hero background image — replaced by NEXT_PUBLIC_HERO_IMAGE env var or fallback gradient */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: process.env.NEXT_PUBLIC_HERO_IMAGE
              ? `url('${process.env.NEXT_PUBLIC_HERO_IMAGE}')`
              : 'linear-gradient(135deg, #3d1f0a 0%, #1a3a1a 50%, #0d0e12 100%)'
          }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg mb-3">
            Shop Marshall
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 font-sans mb-10 drop-shadow">
            Shop Marshall Today!
          </p>

          <HeroSearch />

          {/* Quick stats */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-2 text-white/80">
              <Building2 size={18} className="text-white/60" />
              <span className="text-sm font-medium">Local Businesses</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Star size={18} className="text-white/60" />
              <span className="text-sm font-medium">Free Listings</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Users size={18} className="text-white/60" />
              <span className="text-sm font-medium">Community Driven</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CATEGORIES */}
      {/* ============================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-marshall-900">
            Browse by Category
          </h2>
          <p className="mt-3 text-marshall-500 max-w-md mx-auto">
            Find exactly what you&apos;re looking for in {siteConfig.city}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group card p-4 sm:p-5 text-center hover:border-forest-300 hover:bg-forest-50/50"
            >
              <span className="text-2xl sm:text-3xl block mb-2">{category.icon}</span>
              <span className="text-sm font-semibold text-marshall-700 group-hover:text-forest-700 transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURED BUSINESSES */}
      {/* ============================================ */}
      {featuredBusinesses.length > 0 && (
        <section className="bg-white border-y border-marshall-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-marshall-900">
                  Featured Businesses
                </h2>
                <p className="mt-3 text-marshall-500">
                  Spotlight on some of {siteConfig.city}&apos;s finest
                </p>
              </div>
              <Link
                href="/businesses"
                className="hidden sm:inline-flex items-center gap-1 text-forest-600 hover:text-forest-700 font-medium text-sm transition-colors"
              >
                View all <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/businesses" className="btn-outline text-sm">
                View All Businesses <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* CTA — Add Your Business */}
      {/* ============================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-forest-700 to-forest-900 p-8 sm:p-12 lg:p-16">
          <div className="absolute top-0 right-0 w-64 h-64 bg-forest-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-marshall-500/10 rounded-full blur-3xl" />

          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Own a Business in {siteConfig.city}?
            </h2>
            <p className="mt-4 text-forest-200 text-lg leading-relaxed">
              Get listed for free on {siteConfig.name} and connect with your community. 
              Claim your listing to manage your business information, respond to inquiries, and grow your visibility.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/add" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-forest-800 font-semibold rounded-lg hover:bg-cream-100 transition-colors">
                Add Your Business <ArrowRight size={18} />
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
