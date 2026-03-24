'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Search } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/businesses', label: 'Directory' },
    { href: '/categories', label: 'Categories' },
    { href: '/add', label: 'Add Business' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-marshall-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-forest-600 to-forest-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white font-display font-bold text-lg sm:text-xl">M</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg sm:text-xl text-marshall-900 leading-tight">
                {siteConfig.city}
                <span className="text-forest-600">Today</span>
              </span>
              <span className="text-[10px] sm:text-xs text-marshall-500 font-body leading-tight hidden sm:block">
                {siteConfig.city}, {siteConfig.state} Business Directory
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-marshall-600 hover:text-marshall-900 hover:bg-marshall-50 rounded-lg font-medium text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/claim" className="ml-2 btn-primary text-sm !px-4 !py-2">
              Claim Listing
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-marshall-600 hover:text-marshall-900 hover:bg-marshall-50 rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-marshall-100 pt-3 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-marshall-700 hover:bg-marshall-50 rounded-lg font-medium"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/claim"
              onClick={() => setMobileOpen(false)}
              className="block mx-4 mt-2 btn-primary text-center text-sm"
            >
              Claim Your Listing
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
