// Site configuration — change these values per city deployment
// This makes the codebase reusable for BattleCreekToday, KalamazooToday, etc.

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'MarshallToday',
  city: process.env.NEXT_PUBLIC_SITE_CITY || 'Marshall',
  state: process.env.NEXT_PUBLIC_SITE_STATE || 'MI',
  tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || 'Your guide to everything Marshall, Michigan',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://marshalltoday.com',
  description: 'Discover local businesses, restaurants, services, and hidden gems in Marshall, Michigan — a historic community with one of the largest National Historic Landmark Districts in America.',
  founded: '1830',
  // For hero/about content
  heroSubtitle: 'Founded in 1830. Still making history.',
  aboutBlurb: 'Marshall is a historic gem in the heart of Michigan, known for its beautifully preserved 19th-century architecture, vibrant downtown, and tight-knit community spirit. MarshallToday connects you with the local businesses that make this town special.',
};
