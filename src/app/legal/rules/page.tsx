export const metadata = { title: "Rules · IndiaBid" };

export default function RulesPage() {
  return (
    <>
      <h1>Rules</h1>
      <p>How ranking actually works, in full.</p>

      <h2>Adding a listing</h2>
      <ul>
        <li>Submitting a URL, title, description, category, city (optional), and screenshot is free.</li>
        <li>One listing per URL or business handle. Duplicate submissions are removed.</li>
        <li>Listings in a sensitive category (adult, gambling, MLM, or anything illegal) are held for
          manual review before they go live.</li>
      </ul>

      <h2>How rank is decided</h2>
      <ul>
        <li>Rank is based entirely on total amount paid to claim or improve rank on that board.</li>
        <li>Paying more than the current #1 on a board takes that spot, immediately.</li>
        <li>Minimum bid is ₹21. Every bid after that must be in ₹10 increments: ₹21, ₹31, ₹41, and so
          on. There is no maximum.</li>
        <li>If two listings have paid the exact same total, the older listing keeps priority.</li>
        <li>A national board listing only competes against other national listings. A city board
          listing only competes within that city.</li>
      </ul>

      <h2>Reclaiming a rank</h2>
      <p>
        If your listing gets outranked, you don&apos;t have to pay the new leader&apos;s full amount
        to get back on top. You only pay the difference between your last bid and the new leader&apos;s
        bid, plus ₹10.
      </p>

      <h2>Premium lock</h2>
      <p>
        Paying 5x the current #1&apos;s bid locks your listing at #1 for 3 hours. During that window,
        no one, regardless of how much they bid, can take the spot from you.
      </p>

      <h2>Clicks and stats</h2>
      <p>
        Click counts shown on listings and in the owner dashboard only count verified clicks through
        to a listing&apos;s outbound link. We don&apos;t inflate numbers, and we don&apos;t sell click
        data.
      </p>
    </>
  );
}
