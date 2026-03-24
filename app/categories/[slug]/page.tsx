import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { siteConfig } from '@/lib/config';
import { getCategoryBySlug, getBusinessesByCategory, getCategories } from '@/lib/supabase';
import BusinessCard from '@/components/BusinessCard';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found' };

  return {
    title: `${category.name} in ${siteConfig.city}`,
    description: `Find ${category.name.toLowerCase()} in ${siteConfig.city}, ${siteConfig.state}. ${category.description || ''}`,
  };
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export const revalidate = 60;

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, businesses] = await Promise.all([
    getCategoryBySlug(slug),
    getBusinessesByCategory(slug),
  ]);

  if (!category) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <Link
        href="/categories"
        className="inline-flex items-center gap-1.5 text-marshall-500 hover:text-marshall-700 text-sm font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        All Categories
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{category.icon}</span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-marshall-900">
            {category.name}
          </h1>
        </div>
        {category.description && (
          <p className="text-marshall-500 text-lg">{category.description}</p>
        )}
        <p className="text-marshall-400 text-sm mt-2">
          {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} in {siteConfig.city}
        </p>
      </div>

      {businesses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 card">
          <p className="text-marshall-400 font-display text-xl mb-2">
            No businesses listed yet
          </p>
          <p className="text-marshall-400 text-sm mb-6">
            Know a {category.name.toLowerCase()} business in {siteConfig.city}?
          </p>
          <Link href="/add" className="btn-primary text-sm">
            Add a Business
          </Link>
        </div>
      )}
    </div>
  );
}
