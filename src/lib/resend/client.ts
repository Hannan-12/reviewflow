import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export interface EmailNotificationData {
  userEmail: string;
  userName: string;
  profileName: string;
  reviewerName: string;
  rating: number;
  comment: string;
  reviewDate: string;
  profileId: string;
  reviewId: string;
}

export async function sendNewReviewEmail(data: EmailNotificationData) {
  try {
    const result = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@gohighreview.de',
      to: data.userEmail,
      subject: `New ${data.rating}★ Review on "${data.profileName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; border-radius: 8px 8px 0 0;">
            <h2>New Review Received!</h2>
          </div>

          <div style="padding: 20px; background: #f5f5f5;">
            <p>Hi ${data.userName},</p>

            <p>You have a new <strong>${data.rating}★ review</strong> on <strong>${data.profileName}</strong></p>

            <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-weight: bold; color: #333;">${data.reviewerName}</p>
              <p style="margin: 5px 0; color: #666;">★ Rating: ${data.rating}/5</p>
              <p style="margin: 10px 0; color: #444;">"${data.comment}"</p>
              <p style="margin: 10px 0; font-size: 12px; color: #999;">${data.reviewDate}</p>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reviews?profileId=${data.profileId}&reviewId=${data.reviewId}"
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View & Reply
              </a>
            </div>

            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px;">
              You can manage notification settings in your profile preferences.
            </p>
          </div>
        </div>
      `,
    });

    return result;
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    throw error;
  }
}

export interface DigestReview {
  reviewId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  reviewDate: string;
}

export async function sendDigestEmail(data: {
  userEmail: string;
  userName: string;
  profileName: string;
  profileId: string;
  reviews: DigestReview[];
  frequency: 'daily' | 'weekly';
}) {
  const period = data.frequency === 'daily' ? 'today' : 'this week'
  const count = data.reviews.length

  const reviewsHtml = data.reviews.map((r) => `
    <div style="background: white; padding: 16px; border-left: 4px solid #667eea; margin: 12px 0; border-radius: 4px;">
      <p style="margin: 0; font-weight: bold; color: #333;">${r.reviewerName}</p>
      <p style="margin: 4px 0; color: #666;">&#9733; ${r.rating}/5</p>
      ${r.comment ? `<p style="margin: 8px 0; color: #444;">"${r.comment}"</p>` : ''}
      <p style="margin: 4px 0; font-size: 12px; color: #999;">${r.reviewDate}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reviews?profileId=${data.profileId}&reviewId=${r.reviewId}"
         style="color: #667eea; font-size: 13px; text-decoration: none;">View &amp; Reply &#8594;</a>
    </div>
  `).join('')

  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@gohighreview.de',
    to: data.userEmail,
    subject: `${count} new review${count !== 1 ? 's' : ''} on "${data.profileName}" ${period}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">${data.frequency === 'daily' ? 'Daily' : 'Weekly'} Review Digest</h2>
          <p style="margin: 4px 0 0; opacity: 0.85;">${data.profileName}</p>
        </div>
        <div style="padding: 20px; background: #f5f5f5;">
          <p>Hi ${data.userName},</p>
          <p>You received <strong>${count} new review${count !== 1 ? 's' : ''}</strong> on <strong>${data.profileName}</strong> ${period}.</p>
          ${reviewsHtml}
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reviews?profileId=${data.profileId}"
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View All Reviews
            </a>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px;">
            You're receiving this ${data.frequency} digest from GoHighReview.
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/notifications" style="color: #667eea;">Manage preferences</a>
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendReplyConfirmationEmail(
  userEmail: string,
  userName: string,
  profileName: string,
  reviewerName: string
) {
  try {
    const result = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@gohighreview.de',
      to: userEmail,
      subject: `Your reply to ${reviewerName}'s review posted on "${profileName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; border-radius: 8px 8px 0 0;">
            <h2>&#10003; Reply Posted</h2>
          </div>

          <div style="padding: 20px; background: #f5f5f5;">
            <p>Hi ${userName},</p>

            <p>Your reply to <strong>${reviewerName}</strong>'s review on <strong>${profileName}</strong> has been successfully posted to Google Business Profile.</p>

            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px;">
              Thank you for engaging with your customers!
            </p>
          </div>
        </div>
      `,
    });

    return result;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
}
