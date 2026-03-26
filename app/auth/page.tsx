'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Building2, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/add';
  const reason = searchParams.get('reason') || 'add';

  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      const { error: signUpErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { display_name: form.name },
          emailRedirectTo: `${window.location.origin}${redirect}`,
        },
      });
      if (signUpErr) { setError(signUpErr.message); setLoading(false); return; }
      setCheckEmail(true);
    } else {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (signInErr) { setError(signInErr.message); setLoading(false); return; }
      router.push(redirect);
    }

    setLoading(false);
  }

  if (checkEmail) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-forest-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-marshall-900 mb-3">Check your email!</h2>
        <p className="text-marshall-500 mb-2">
          We sent a confirmation link to <strong>{form.email}</strong>.
        </p>
        <p className="text-marshall-400 text-sm">
          Click the link to confirm your account, then you can add your business.
        </p>
        <p className="text-marshall-300 text-xs mt-6">Didn't get it? Check your spam folder.</p>
      </div>
    );
  }

  const heading = reason === 'claim'
    ? 'Sign in to claim your listing'
    : 'Create a free account first';
  const subtext = reason === 'claim'
    ? 'Sign in or create an account to claim and manage your business listing.'
    : 'A free account lets you manage your listing, update info, and add photos anytime.';

  return (
    <>
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-forest-50 flex items-center justify-center mx-auto mb-3">
          <Building2 size={24} className="text-forest-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-marshall-900">{heading}</h1>
        <p className="text-marshall-500 text-sm mt-1">{subtext}</p>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-cream-100 rounded-lg p-1 mb-5">
        {(['signup', 'signin'] as const).map((m) => (
          <button
            key={m} type="button"
            onClick={() => { setMode(m); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
              mode === m ? 'bg-white text-marshall-900 shadow-sm' : 'text-marshall-500 hover:text-marshall-700'
            }`}
          >
            {m === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-sm font-semibold text-marshall-700 mb-1.5">Your Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-marshall-400" />
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field pl-9" placeholder="Jane Smith" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-marshall-700 mb-1.5">Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-marshall-400" />
            <input type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field pl-9" placeholder="you@example.com" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-marshall-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-marshall-400" />
            <input type="password" required minLength={6} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field pl-9"
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'} />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account & Continue' : 'Sign In & Continue'}
          {!loading && <ArrowRight size={15} />}
        </button>
      </form>

      <p className="text-center text-marshall-400 text-xs mt-5">
        Free forever. No credit card.
      </p>
    </>
  );
}

export default function AuthPage() {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="card p-6 sm:p-8">
        <Suspense fallback={
          <div className="text-center py-12 text-marshall-400 text-sm">Loading...</div>
        }>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}
