export const metadata = { title: "Privacy Policy — IndiaBid" };

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>
        This is a first draft and will be reviewed by legal counsel before launch. It explains what
        data IndiaBid collects and why.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Listing data</strong> you submit: URL, title, description, category, city, and
          screenshot.</li>
        <li><strong>Owner contact</strong>: an email or phone number, collected when you claim or bid
          on a listing, used only to send your dashboard magic link and payment receipts.</li>
        <li><strong>Payment data</strong>: handled by Razorpay. We store the payment status and
          reference id, never your card, UPI, or bank details.</li>
        <li><strong>Click data</strong>: timestamp and referrer for clicks on a listing&apos;s outbound
          link, shown to that listing&apos;s owner in their dashboard.</li>
        <li><strong>Technical data</strong>: IP address and submission timestamps, used to enforce
          rate limits and prevent duplicate or spam submissions.</li>
      </ul>

      <h2>How we use it</h2>
      <p>
        To operate the leaderboard, process payments, send magic-link dashboard access, prevent abuse,
        and show aggregate site-wide stats. We do not sell listing, contact, or click data to third
        parties.
      </p>

      <h2>Owner dashboard access</h2>
      <p>
        Instead of accounts and passwords, we send a private magic link to the contact you provide
        when you claim a listing. Anyone with that link can view that listing&apos;s dashboard —
        keep it private, the same way you would a password.
      </p>

      <h2>Third parties</h2>
      <p>
        We use Razorpay for payment processing, Supabase for data storage, and Vercel for hosting.
        Each of these providers processes data on our behalf under their own security and privacy
        commitments.
      </p>

      <h2>Your choices</h2>
      <p>
        To update or remove a listing&apos;s contact details, or to request deletion of data we hold
        about you, email{" "}
        <a href="mailto:privacy@indiabid.example" className="text-saffron hover:underline">
          privacy@indiabid.example
        </a>
        .
      </p>
    </>
  );
}
