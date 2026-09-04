import { formatRupees } from "@/lib/format";

type Props = {
  charityDonated: number;
};

export default function CharityBanner({ charityDonated }: Props) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-full border border-india-green/30 bg-india-green/10 px-4 py-2 text-center text-xs font-medium text-india-green sm:text-sm">
      <span aria-hidden="true">💛</span>
      <span>
        10% of every rupee bid goes to underprivileged kids&apos; education
        {charityDonated > 0 ? ` — ${formatRupees(charityDonated)} donated so far` : ""}.
      </span>
    </div>
  );
}
