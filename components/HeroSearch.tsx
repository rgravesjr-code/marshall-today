'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/businesses?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/businesses');
    }
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="flex shadow-2xl rounded-xl overflow-hidden">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-marshall-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category, address, or phone"
            className="w-full h-14 pl-12 pr-4 text-marshall-900 text-base bg-white focus:outline-none placeholder-marshall-400"
          />
        </div>
        <button
          type="submit"
          className="h-14 px-7 bg-marshall-700 hover:bg-marshall-800 text-white font-bold text-base transition-colors whitespace-nowrap"
        >
          Search
        </button>
      </div>
    </form>
  );
}
