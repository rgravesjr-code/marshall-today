'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { Business, Category } from '@/lib/supabase';
import BusinessCard from './BusinessCard';

interface BusinessSearchProps {
  businesses: Business[];
  categories: Category[];
  initialQuery?: string;
}

export default function BusinessSearch({ businesses, categories, initialQuery = '' }: BusinessSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let results = businesses;

    // Filter by search query
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.short_description?.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q) ||
          b.address?.toLowerCase().includes(q) ||
          b.categories?.some((c) => c.name.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (selectedCategory) {
      results = results.filter((b) =>
        b.categories?.some((c) => c.slug === selectedCategory)
      );
    }

    return results;
  }, [businesses, query, selectedCategory]);

  return (
    <div>
      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-marshall-400" />
          <input
            type="text"
            placeholder="Search businesses, services, restaurants..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field pl-11 pr-10"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-marshall-400 hover:text-marshall-600 p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`category-badge transition-all ${
            !selectedCategory ? 'bg-forest-600 text-white hover:bg-forest-700' : ''
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
            className={`category-badge transition-all ${
              selectedCategory === cat.slug ? 'bg-forest-600 text-white hover:bg-forest-700' : ''
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="mb-6 text-marshall-500 text-sm">
        {filtered.length === businesses.length
          ? `${businesses.length} businesses listed`
          : `${filtered.length} of ${businesses.length} businesses`}
      </div>

      {/* Business grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-marshall-400 text-lg font-display">No businesses found</p>
          <p className="text-marshall-400 text-sm mt-2">
            Try adjusting your search or browse all categories
          </p>
        </div>
      )}
    </div>
  );
}
