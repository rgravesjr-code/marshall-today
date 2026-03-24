import { Metadata } from 'next';
import { siteConfig } from '@/lib/config';
import { getBusinesses, getCategories } from '@/lib/supabase';
import BusinessSearch from '@/components/BusinessSearch';

export const metadata: Metadata = {
  title: `Business Directory — ${siteConfig.city} Local Businesses`,
  description: `Browse all local businesses in ${siteConfig.city}, ${siteConfig.state}. Find restaurants, shops, services, and more.`,
};

export const revalidate = 60;

export default async function BusinessesPage() {
  const [businesses, categories] = await Promise.all([
    getBusinesses(),
    getCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-marshall-900">
          {siteConfig.city} Business Directory
        </h1>
        <p className="mt-2 text-marshall-500 text-lg">
          Discover local businesses and services in {siteConfig.city}, {siteConfig.state}
        </p>
      </div>

      {/* Search + Grid */}
      <BusinessSearch businesses={businesses} categories={categories} />
    </div>
  );
}
