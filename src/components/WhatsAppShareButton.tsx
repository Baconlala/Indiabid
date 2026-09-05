type Props = {
  text: string;
  path: string;
  label: string;
  className?: string;
};

export default function WhatsAppShareButton({ text, path, label, className }: Props) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://indiabid.vercel.app";
  const fullUrl = `${siteUrl}${path}`;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${fullUrl}`)}`;

  return (
    <a
      href={shareUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
    </a>
  );
}
