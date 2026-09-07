"use client";

import { useState } from "react";

export default function CopyLinkButton({ path, className }: { path: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — nothing sensible to do but leave the button as-is.
    }
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
