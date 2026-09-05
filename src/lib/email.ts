import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

type OwnershipEmailOptions = {
  confirmUrl: string;
  listingTitle: string;
  isNewClaim: boolean;
};

export async function sendOwnershipEmail(
  to: string,
  { confirmUrl, listingTitle, isNewClaim }: OwnershipEmailOptions
) {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured — email sending is disabled.");
  }

  const from = process.env.EMAIL_FROM ?? "IndiaBid <onboarding@resend.dev>";
  const subject = isNewClaim
    ? `Confirm you own ${listingTitle} on IndiaBid`
    : `Your IndiaBid dashboard link for ${listingTitle}`;
  const intro = isNewClaim
    ? `Click below to confirm you own <strong>${listingTitle}</strong> and unlock its click-log dashboard.`
    : `Here's your dashboard link for <strong>${listingTitle}</strong>.`;
  const cta = isNewClaim ? "Confirm ownership" : "Open dashboard";

  // The Resend SDK does not throw on a rejected send (e.g. unverified sending
  // domain) — failures come back as `error` on an otherwise-resolved promise.
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
        <p>${intro}</p>
        <p>
          <a href="${confirmUrl}" style="display:inline-block;background:#16a34a;color:#000;font-weight:bold;padding:10px 20px;border-radius:999px;text-decoration:none;">
            ${cta}
          </a>
        </p>
        <p style="color:#666;font-size:12px;">
          This link expires in 30 minutes and can only be used once. If you didn't request this, you can ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend rejected the email: ${error.message}`);
  }
}
