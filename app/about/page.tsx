import { Metadata } from 'next';
import { MapPin, Heart, Users, Building2 } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: `About — ${siteConfig.name}`,
  description: `Learn about ${siteConfig.name}, your community business directory for ${siteConfig.city}, ${siteConfig.state}.`,
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-forest-50 text-forest-700 rounded-full text-sm font-medium mb-4">
          <MapPin size={14} />
          {siteConfig.city}, {siteConfig.state}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-marshall-900 leading-tight">
          About {siteConfig.name}
        </h1>
      </div>

      {/* Story */}
      <div className="prose prose-lg max-w-none">
        <div className="card p-8 sm:p-10 mb-8">
          <h2 className="font-display text-2xl font-bold text-marshall-900 mb-4 mt-0">
            Our Story
          </h2>
          <p className="text-marshall-600 leading-relaxed mb-4">
            {siteConfig.city} has been a special place since 1830 — a town that nearly became 
            Michigan&apos;s state capital, home to one of the largest National Historic Landmark 
            Districts in America, and a community where neighbors still know each other by name.
          </p>
          <p className="text-marshall-600 leading-relaxed mb-4">
            {siteConfig.name} was created to celebrate and support the businesses that make 
            {siteConfig.city} thrive. From the historic shops along Michigan Avenue to the 
            service providers who keep our homes running, every local business has a story worth 
            telling and a community worth connecting with.
          </p>
          <p className="text-marshall-600 leading-relaxed">
            Our directory is free for every business in {siteConfig.city}. We believe that when 
            local businesses are easy to find, the whole community benefits.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-forest-50 flex items-center justify-center mx-auto mb-4">
              <Heart size={24} className="text-forest-600" />
            </div>
            <h3 className="font-display font-bold text-marshall-900 mb-2">Community First</h3>
            <p className="text-marshall-500 text-sm">
              Built by and for the people of {siteConfig.city}. Every listing strengthens our local economy.
            </p>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-marshall-50 flex items-center justify-center mx-auto mb-4">
              <Building2 size={24} className="text-marshall-600" />
            </div>
            <h3 className="font-display font-bold text-marshall-900 mb-2">Free for All</h3>
            <p className="text-marshall-500 text-sm">
              Every business gets a free listing. Premium features available for those who want more visibility.
            </p>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-cream-200 flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-marshall-600" />
            </div>
            <h3 className="font-display font-bold text-marshall-900 mb-2">Local & Personal</h3>
            <p className="text-marshall-500 text-sm">
              Not a faceless corporation. We live here, shop here, and care about {siteConfig.city}&apos;s future.
            </p>
          </div>
        </div>

        {/* Marshall facts */}
        <div className="card p-8 sm:p-10 bg-marshall-900 text-marshall-200">
          <h2 className="font-display text-2xl font-bold text-white mb-6 mt-0">
            {siteConfig.city} by the Numbers
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <div className="font-display text-3xl font-bold text-marshall-300">1830</div>
              <div className="text-marshall-400 text-sm mt-1">Year Founded</div>
            </div>
            <div>
              <div className="font-display text-3xl font-bold text-marshall-300">850+</div>
              <div className="text-marshall-400 text-sm mt-1">Historic Structures</div>
            </div>
            <div>
              <div className="font-display text-3xl font-bold text-marshall-300">#1</div>
              <div className="text-marshall-400 text-sm mt-1">Historic Landmark District</div>
            </div>
            <div>
              <div className="font-display text-3xl font-bold text-forest-400">∞</div>
              <div className="text-marshall-400 text-sm mt-1">Community Spirit</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
