import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { business, type } = body;

    if (type === 'new_submission') {
      // Email to business owner
      if (business.email) {
        await resend.emails.send({
          from: 'Marshall Today <hello@marshalltoday.com>',
          to: business.email,
          subject: `Your listing for ${business.name} has been submitted!`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2c2c2c;">
              <div style="background: #2d4a2d; padding: 24px 32px; border-radius: 12px 12px 0 0;">
                <h1 style="color: #fff; font-size: 22px; margin: 0; letter-spacing: -0.3px;">Marshall Today</h1>
                <p style="color: #a8c8a8; margin: 4px 0 0; font-size: 14px;">Marshall, MI's Community Directory</p>
              </div>
              <div style="background: #fff; padding: 32px; border: 1px solid #e8e0d4; border-top: none; border-radius: 0 0 12px 12px;">
                <h2 style="font-size: 20px; color: #1a1a1a; margin: 0 0 12px;">Thanks for adding your business!</h2>
                <p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 20px;">
                  We've received your listing for <strong>${business.name}</strong> and our team will review it shortly. 
                  Once approved, you'll be live on Marshall Today for the whole community to find.
                </p>

                <div style="background: #f7f4ef; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
                  <p style="font-size: 13px; font-weight: bold; color: #666; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.5px;">Your Submission</p>
                  <table style="font-size: 14px; color: #333; border-collapse: collapse; width: 100%;">
                    <tr><td style="padding: 4px 0; color: #888; width: 110px;">Business</td><td style="padding: 4px 0; font-weight: 600;">${business.name}</td></tr>
                    ${business.address ? `<tr><td style="padding: 4px 0; color: #888;">Address</td><td style="padding: 4px 0;">${business.address}, Marshall, MI</td></tr>` : ''}
                    ${business.phone ? `<tr><td style="padding: 4px 0; color: #888;">Phone</td><td style="padding: 4px 0;">${business.phone}</td></tr>` : ''}
                    ${business.website ? `<tr><td style="padding: 4px 0; color: #888;">Website</td><td style="padding: 4px 0;">${business.website}</td></tr>` : ''}
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
        });
      }

      // Notification to Roger
      await resend.emails.send({
        from: 'Marshall Today <hello@marshalltoday.com>',
        to: 'roger@marshalltoday.com',
        subject: `New business submission: ${business.name}`,
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
                  <tr><td style="padding: 5px 0; color: #888; width: 110px;">Business</td><td style="padding: 5px 0; font-weight: 700; font-size: 16px;">${business.name}</td></tr>
                  ${business.address ? `<tr><td style="padding: 5px 0; color: #888;">Address</td><td style="padding: 5px 0;">${business.address}</td></tr>` : ''}
                  ${business.phone ? `<tr><td style="padding: 5px 0; color: #888;">Phone</td><td style="padding: 5px 0;">${business.phone}</td></tr>` : ''}
                  ${business.email ? `<tr><td style="padding: 5px 0; color: #888;">Email</td><td style="padding: 5px 0;"><a href="mailto:${business.email}" style="color: #2d4a2d;">${business.email}</a></td></tr>` : ''}
                  ${business.website ? `<tr><td style="padding: 5px 0; color: #888;">Website</td><td style="padding: 5px 0;"><a href="${business.website}" style="color: #2d4a2d;">${business.website}</a></td></tr>` : ''}
                  ${business.description ? `<tr><td style="padding: 5px 0; color: #888; vertical-align: top;">Description</td><td style="padding: 5px 0; font-size: 13px; color: #555;">${business.description}</td></tr>` : ''}
                </table>
              </div>
              <a href="https://marshalltoday.com/admin/businesses" 
                 style="display: inline-block; background: #2d4a2d; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; margin-right: 12px;">
                Review in Admin →
              </a>
              <p style="font-size: 12px; color: #aaa; margin: 24px 0 0;">Marshall Today Admin · <a href="https://marshalltoday.com/admin" style="color: #2d4a2d;">Open Admin</a></p>
            </div>
          </div>
        `,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (err: any) {
    console.error('Email error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
