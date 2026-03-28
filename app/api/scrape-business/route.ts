import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FIRECRAWL_KEY = process.env.FIRECRAWL_API_KEY!;

function normalizeUrl(url: string): string {
  if (!url) return url;
  const t = url.trim();
  if (t.startsWith('http://') || t.startsWith('https://')) return t;
  return 'https://' + t;
}

async function fetchWithFallback(url: string): Promise<string> {
  // Try cheap web fetch first
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MarshallToday/1.0)' },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const html = await res.text();
      // Strip tags to plain text
      return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 4000);
    }
  } catch (_) {}

  // Fallback: Firecrawl (costs 1 credit)
  const fcRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FIRECRAWL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, formats: ['markdown'] }),
  });
  const fcData = await fcRes.json();
  if (fcData.success) {
    return fcData.data?.markdown?.slice(0, 4000) || '';
  }
  throw new Error('Both fetch methods failed for: ' + url);
}

function extractContact(text: string, url: string) {
  // Phone: various formats
  const phoneMatch = text.match(/(\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4})/);
  // Email
  const emailMatch = text.match(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/);
  // Address: number + street
  const addressMatch = text.match(/(\d{1,5}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:St|Ave|Blvd|Dr|Rd|Ln|Way|Ct|Pl|Pkwy|Hwy|Route|Rte)\.?))/i);

  return {
    phone: phoneMatch?.[1] || null,
    email: emailMatch?.[1] || null,
    address: addressMatch?.[1] || null,
    website: url,
    source: 'firecrawl',
  };
}

export async function POST(req: NextRequest) {
  try {
    const { business_id, url } = await req.json();

    if (!business_id || !url) {
      return NextResponse.json({ error: 'business_id and url required' }, { status: 400 });
    }

    const normalizedUrl = normalizeUrl(url);
    const text = await fetchWithFallback(normalizedUrl);
    const contact = extractContact(text, normalizedUrl);

    // Check if contact already exists for this business
    const { data: existing } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('business_id', business_id)
      .eq('source', 'firecrawl')
      .single();

    let result;
    if (existing) {
      // Update
      const { data } = await supabaseAdmin
        .from('contacts')
        .update({ ...contact, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      result = data;
    } else {
      // Insert
      const { data } = await supabaseAdmin
        .from('contacts')
        .insert({ business_id, ...contact })
        .select()
        .single();
      result = data;
    }

    // Also update the business record with any new info found
    const bizUpdate: Record<string, string> = {};
    if (contact.phone) bizUpdate.phone = contact.phone;
    if (contact.email) bizUpdate.email = contact.email;
    if (contact.address) bizUpdate.address = contact.address;

    if (Object.keys(bizUpdate).length > 0) {
      await supabaseAdmin
        .from('businesses')
        .update(bizUpdate)
        .eq('id', business_id);
    }

    return NextResponse.json({ success: true, contact: result, bizUpdated: Object.keys(bizUpdate) });
  } catch (err: any) {
    console.error('Scrape error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
