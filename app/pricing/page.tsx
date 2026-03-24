import { Metadata } from 'next';
import Link from 'next/link';
import { Check, Star, Zap } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: `Pricing — ${siteConfig.name} Business Listings`,
  description: `Get your business listed on ${siteConfig.name}. Free and premium plans available.`,
};

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get your business on the map',
    cta: 'Add Your Business',
    ctaHref: '/add',
    highlight: false,
    features: [
      'Basic business listing',
      'Business name & description',
      'Address & contact info',
      'Category listing',
      'Searchable in directory',
    ],
  },
  {
    name: 'Local Spotlight',
    price: '$29',
    period: '/month',
    description: 'Stand out from the crowd',
    cta: 'Get Started',
    ctaHref: '/claim',
    highlight: true,
    features: [
      'Everything in Free, plus:',
      'Featured placement in directory',
      'Cover photo & logo display',
      'Business hours display',
      'Direct website link',
      'Priority in search results',
      '"Verified Business" badge',
    ],
  },
  {
    name: 'Ultimate Exposure',
    price: '$79',
    period: '/month',
    description: 'Maximum visibility & growth',
    cta: 'Get Started',
    ctaHref: '/claim',
    highlight: false,
    features: [
      'Everything in Local Spotlight, plus:',
      'Top-of-page featured placement',
      'Photo gallery (up to 10 images)',
      'Social media links',
      'Google review highlights',
      'Monthly performance report',
      'Priority support',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-marshall-900">
          Simple, Honest Pricing
        </h1>
        <p className="mt-4 text-marshall-500 text-lg max-w-xl mx-auto">
          Every business gets a free listing. Upgrade when you&apos;re ready for more visibility.
        </p>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`card p-6 sm:p-8 flex flex-col ${
              plan.highlight
                ? 'border-forest-400 border-2 shadow-lg relative'
                : ''
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-forest-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                  <Star size={12} fill="currentColor" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h2 className="font-display text-xl font-bold text-marshall-900">{plan.name}</h2>
              <p className="text-marshall-500 text-sm mt-1">{plan.description}</p>
            </div>

            <div className="mb-6">
              <span className="font-display text-4xl font-bold text-marshall-900">{plan.price}</span>
              <span className="text-marshall-400 text-sm ml-1">{plan.period}</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  {i === 0 && plan.name !== 'Free' ? (
                    <Zap size={16} className="text-marshall-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Check size={16} className="text-forest-600 mt-0.5 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${i === 0 && plan.name !== 'Free' ? 'text-marshall-500 font-medium' : 'text-marshall-600'}`}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.ctaHref}
              className={`w-full text-center text-sm ${
                plan.highlight ? 'btn-primary' : 'btn-outline'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* FAQ-like note */}
      <div className="mt-16 max-w-2xl mx-auto text-center">
        <p className="text-marshall-500 text-sm leading-relaxed">
          All plans can be cancelled anytime. No contracts, no hidden fees. 
          Premium features are activated after verification. 
          Questions? Reach out to us anytime.
        </p>
      </div>
    </div>
  );
}
