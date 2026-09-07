"use client";

import type { City } from "@/lib/types";
import IndiaFlag from "./IndiaFlag";

type Props = {
  cities: City[];
  selected: string | null;
  onSelect: (cityId: string | null) => void;
};

export default function BoardTabs({ cities, selected, onSelect }: Props) {
  const cityActive = selected !== null;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
          !cityActive
            ? "bg-foreground text-background"
            : "bg-surface text-foreground/70 hover:text-foreground"
        }`}
      >
        <IndiaFlag className="h-3.5 w-5" /> National
      </button>

      <div className="relative min-w-0 flex-1 sm:flex-none">
        <select
          value={selected ?? ""}
          onChange={(e) => onSelect(e.target.value || null)}
          aria-label="Choose your city"
          className={`w-full min-w-0 cursor-pointer appearance-none rounded-full py-2 pr-9 pl-4 text-sm font-semibold transition-colors outline-none sm:w-auto ${
            cityActive
              ? "bg-foreground text-background"
              : "bg-surface text-foreground/70 hover:text-foreground"
          }`}
        >
          <option value="" disabled>
            Choose your city
          </option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className={`pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 ${
            cityActive ? "text-background/70" : "text-foreground/50"
          }`}
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
