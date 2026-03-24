import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { siteConfig } from '@/lib/config';
import { getCategories } from '@/lib/supabase';

export const metadata: Metadata = {
  title: `Browse Categories — ${siteConfig.city} Businesses`,
  description: `Browse business categories in ${siteConfig.city}, ${siteConfig.state}. Find restaurants, shops, services, and more.`,
};

export const revalidate = 300;

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-marshall-900">
          Business Categories
        </h1>
        <p className="mt-2 text-marshall-500 text-lg">
          Browse {siteConfig.city} businesses by category
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="card group p-6 flex items-center gap-4 hover:border-forest-300 hover:bg-forest-50/30"
          >
            <span className="text-3xl flex-shrink-0">{category.icon}</span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display font-semibold text-marshall-900 group-hover:text-forest-700 transition-colors">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-marshall-500 text-sm mt-0.5 line-clamp-1">
                  {category.description}
                </p>
              )}
            </div>
            <ArrowRight size={18} className="text-marshall-300 group-hover:text-forest-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
