export const metadata = { title: "About · IndiaBid" };

export default function AboutPage() {
  return (
    <>
      <h1>About IndiaBid</h1>
      <p>
        IndiaBid is a public leaderboard where rank is earned by paying for it, not by an algorithm
        or a review score. Adding a listing is free. Where you sit on the board is decided entirely
        by how much you and your competitors are willing to pay to be there.
      </p>
      <p>
        We built one national board and separate city boards for Mumbai, Delhi, Bengaluru, Chennai,
        Kolkata, Hyderabad, Ahmedabad, Pune, Jaipur, and Lucknow, so a local business can compete for
        a rank against other businesses in the same city, not against every company in the country.
      </p>
      <h2>Why pay-to-rank</h2>
      <p>
        Most directories rank by an opaque algorithm. IndiaBid&apos;s ranking rule is one sentence:
        whoever has paid the most, in total, holds the rank, and anyone can take it back by paying
        more. It&apos;s transparent, and it&apos;s the same rule for everyone.
      </p>
      <h2>Giving back</h2>
      <p>
        10% of every rupee bid on IndiaBid is set aside and donated to organisations working on
        underprivileged children&apos;s education in India. This isn&apos;t a marketing promise we
        plan to make later. It comes out of the top of every payment we process.
      </p>
      <h2>Contact</h2>
      <p>
        For anything else (press, partnerships, or a listing dispute), reach us at{" "}
        <a href="mailto:hello@indiabid.example" className="text-saffron hover:underline">
          hello@indiabid.example
        </a>
        .
      </p>
    </>
  );
}
