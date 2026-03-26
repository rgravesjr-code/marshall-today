import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

function normalizeUrl(url: string): string {
  if (!url || !url.trim()) return url;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return 'https://' + trimmed;
}

function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
    '-' +
    Date.now().toString(36)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, address, phone, email, website, category_ids, logo_url, cover_image_url, owner_id } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
    }

    // Insert business (server-side, bypasses RLS)
    const { data: biz, error: bizErr } = await supabaseAdmin
      .from('businesses')
      .insert({
        name: name.trim(),
        slug: generateSlug(name),
        description: description || null,
        address: address || null,
        phone: phone || null,
        email: email || null,
        website: website ? normalizeUrl(website) : null,
        logo_url: logo_url || null,
        cover_image_url: cover_image_url || null,
        owner_id: owner_id || null,
        is_claimed: owner_id ? true : false,
        is_published: false,
        city: 'Marshall',
        state: 'MI',
      })
      .select()
      .single();

    if (bizErr || !biz) {
      console.error('Insert error:', bizErr);
      return NextResponse.json({ error: bizErr?.message || 'Insert failed' }, { status: 500 });
    }

    // Link categories
    if (category_ids?.length) {
      await supabaseAdmin.from('business_categories').insert(
        category_ids.map((cid: string) => ({
          business_id: biz.id,
          category_id: cid,
        }))
      );
    }

    // Send emails (non-blocking)
    try {
      const emailPromises = [];

      // Email to business owner
      if (email) {
        emailPromises.push(
          resend.emails.send({
            from: 'Marshall Today <hello@marshalltoday.com>',
            to: email,
            subject: `Your listing for ${name} has been submitted!`,
            html: `
              <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2c2c2c;">
                <div style="background: #2d4a2d; padding: 24px 32px; border-radius: 12px 12px 0 0;">
                  <h1 style="color: #fff; font-size: 22px; margin: 0; letter-spacing: -0.3px;">Marshall Today</h1>
                  <p style="color: #a8c8a8; margin: 4px 0 0; font-size: 14px;">Marshall, MI's Community Directory</p>
                </div>
                <div style="background: #fff; padding: 32px; border: 1px solid #e8e0d4; border-top: none; border-radius: 0 0 12px 12px;">
                  <h2 style="font-size: 20px; color: #1a1a1a; margin: 0 0 12px;">Thanks for adding your business!</h2>
                  <p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 20px;">
                    We've received your listing for <strong>${name}</strong> and our team will review it shortly. 
                    Once approved, you'll be live on Marshall Today for the whole community to find.
                  </p>
                  <div style="background: #f7f4ef; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
                    <p style="font-size: 13px; font-weight: bold; color: #666; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.5px;">Your Submission</p>
                    <table style="font-size: 14px; color: #333; border-collapse: collapse; width: 100%;">
                      <tr><td style="padding: 4px 0; color: #888; width: 110px;">Business</td><td style="padding: 4px 0; font-weight: 600;">${name}</td></tr>
                      ${address ? `<tr><td style="padding: 4px 0; color: #888;">Address</td><td style="padding: 4px 0;">${address}, Marshall, MI</td></tr>` : ''}
                      ${phone ? `<tr><td style="padding: 4px 0; color: #888;">Phone</td><td style="padding: 4px 0;">${phone}</td></tr>` : ''}
                      ${website ? `<tr><td style="padding: 4px 0; color: #888;">Website</td><td style="padding: 4px 0;">${normalizeUrl(website)}</td></tr>` : ''}
                    </table>
                  </div>
                  <p style="font-size: 14px; color: #777; margin: 0 0 24px;">
                    Want to update your listing or add photos? You can claim your listing once it's live — 
                    just look for the "Claim this listing" button on your business page.
                  </p>
                  <a href="https://marshalltoday.com/businesses" 
                     style="display: inline-block; background: #2d4a2d; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
                    Browse the Directory
                  </a>
                  <p style="font-size: 12px; color: #aaa; margin: 32px 0 0;">
                    Marshall Today · Your Community, Connected · <a href="https://marshalltoday.com" style="color: #2d4a2d;">marshalltoday.com</a>
                  </p>
                </div>
              </div>
            `,
          })
        );
      }

      // Alert to Roger
      emailPromises.push(
        resend.emails.send({
          from: 'Marshall Today <hello@marshalltoday.com>',
          to: 'roger@marshalltoday.com',
          subject: `New business submission: ${name}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2c2c2c;">
              <div style="background: #2d4a2d; padding: 24px 32px; border-radius: 12px 12px 0 0;">
                <h1 style="color: #fff; font-size: 20px; margin: 0;">New Submission 🏢</h1>
                <p style="color: #a8c8a8; margin: 4px 0 0; font-size: 13px;">Marshall Today Admin Alert</p>
              </div>
              <div style="background: #fff; padding: 32px; border: 1px solid #e8e0d4; border-top: none; border-radius: 0 0 12px 12px;">
                <p style="font-size: 15px; color: #333; margin: 0 0 20px;">
                  A new business has been submitted and is waiting for your review.
                </p>
                <div style="background: #f7f4ef; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
                  <table style="font-size: 14px; color: #333; border-collapse: collapse; width: 100%;">
                    <tr><td style="padding: 5px 0; color: #888; width: 110px;">Business</td><td style="padding: 5px 0; font-weight: 700; font-size: 16px;">${name}</td></tr>
                    ${address ? `<tr><td style="padding: 5px 0; color: #888;">Address</td><td style="padding: 5px 0;">${address}</td></tr>` : ''}
                    ${phone ? `<tr><td style="padding: 5px 0; color: #888;">Phone</td><td style="padding: 5px 0;">${phone}</td></tr>` : ''}
                    ${email ? `<tr><td style="padding: 5px 0; color: #888;">Email</td><td style="padding: 5px 0;"><a href="mailto:${email}" style="color: #2d4a2d;">${email}</a></td></tr>` : ''}
                    ${website ? `<tr><td style="padding: 5px 0; color: #888;">Website</td><td style="padding: 5px 0;"><a href="${normalizeUrl(website)}" style="color: #2d4a2d;">${normalizeUrl(website)}</a></td></tr>` : ''}
                    ${description ? `<tr><td style="padding: 5px 0; color: #888; vertical-align: top;">Description</td><td style="padding: 5px 0; font-size: 13px; color: #555;">${description}</td></tr>` : ''}
                  </table>
                </div>
                <a href="https://marshalltoday.com/admin/businesses" 
                   style="display: inline-block; background: #2d4a2d; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
                  Review in Admin →
                </a>
                <p style="font-size: 12px; color: #aaa; margin: 24px 0 0;">Marshall Today Admin · <a href="https://marshalltoday.com/admin" style="color: #2d4a2d;">Open Admin</a></p>
              </div>
            </div>
          `,
        })
      );

      await Promise.allSettled(emailPromises);
    } catch (emailErr) {
      console.error('Email send error (non-fatal):', emailErr);
    }

    return NextResponse.json({ success: true, id: biz.id });
  } catch (err: any) {
    console.error('Submit error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
