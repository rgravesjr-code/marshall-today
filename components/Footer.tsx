import Link from 'next/link';
import { siteConfig } from '@/lib/config';

export default function Footer() {
  return (
    <footer className="bg-marshall-900 text-marshall-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-forest-600 flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">M</span>
              </div>
              <span className="font-display font-bold text-xl text-white">
                {siteConfig.city}<span className="text-forest-400">Today</span>
              </span>
            </Link>
            <p className="text-marshall-400 text-sm leading-relaxed max-w-xs">
              Connecting the {siteConfig.city} community with local businesses since 2026. 
              Your guide to everything {siteConfig.city}, {siteConfig.state}.
            </p>
          </div>

          {/* Directory */}
          <div>
            <h4 className="text-white font-display font-semibold text-sm uppercase tracking-wider mb-4">
              Directory
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/businesses" className="text-sm hover:text-white transition-colors">All Businesses</Link></li>
              <li><Link href="/categories" className="text-sm hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/add" className="text-sm hover:text-white transition-colors">Add Your Business</Link></li>
              <li><Link href="/claim" className="text-sm hover:text-white transition-colors">Claim a Listing</Link></li>
            </ul>
          </div>

          {/* Plans */}
          <div>
            <h4 className="text-white font-display font-semibold text-sm uppercase tracking-wider mb-4">
              For Businesses
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/pricing" className="text-sm hover:text-white transition-colors">Pricing Plans</Link></li>
              <li><Link href="/about" className="text-sm hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-display font-semibold text-sm uppercase tracking-wider mb-4">
              {siteConfig.city}, {siteConfig.state}
            </h4>
            <p className="text-sm text-marshall-400 leading-relaxed">
              Proudly serving the {siteConfig.city} community and surrounding areas in Calhoun County, Michigan.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-marshall-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-marshall-500 text-xs">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-marshall-600 text-xs">
            Est. {siteConfig.founded} &middot; {siteConfig.city}, {siteConfig.state}
          </p>
        </div>
      </div>
    </footer>
  );
}
