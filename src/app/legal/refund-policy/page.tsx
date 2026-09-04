export const metadata = { title: "Refund and Cancellation Policy — IndiaBid" };

export default function RefundPolicyPage() {
  return (
    <>
      <h1>Refund and Cancellation Policy</h1>
      <p>
        This is a first draft and will be reviewed by legal counsel before launch. It covers how
        payments for rank on IndiaBid are handled.
      </p>

      <h2>Payments are final</h2>
      <p>
        A bid payment buys the rank position it was calculated for at the moment of payment, not a
        guaranteed rank for any length of time (outside an active premium lock). Because rank can
        change the instant someone else outbids you, we do not offer refunds for being outranked
        after a successful payment — this is made clear in the consent step before every checkout.
      </p>

      <h2>When we will refund</h2>
      <ul>
        <li>You were charged for a bid that failed to register a rank change due to a technical
          error on our side.</li>
        <li>You were double-charged for the same bid due to a payment gateway or processing error.</li>
        <li>A listing you paid to claim or improve is removed by us for a moderation reason unrelated
          to anything you did (for example, a categorisation mistake on our part).</li>
      </ul>
      <p>
        In these cases, contact us within 7 days of the charge at{" "}
        <a href="mailto:support@indiabid.example" className="text-saffron hover:underline">
          support@indiabid.example
        </a>{" "}
        with your payment reference. Approved refunds are processed back to the original payment
        method within 5–7 business days via Razorpay.
      </p>

      <h2>When we will not refund</h2>
      <ul>
        <li>Your listing was outranked by a higher bid after your payment was processed.</li>
        <li>You changed your mind after a successful payment.</li>
        <li>Your listing was removed for violating our Rules or Terms (for example, spam, a
          prohibited category, or misrepresenting who you are).</li>
      </ul>

      <h2>Cancellations</h2>
      <p>
        Because a bid takes effect immediately on payment, there is no cancellation window between
        payment and rank change. Review the amount and the consent statement carefully before
        completing checkout.
      </p>
    </>
  );
}
