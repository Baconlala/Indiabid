"use client";

import { useEffect, useRef, useState } from "react";
import type { City } from "@/lib/types";
import IndiaFlag from "./IndiaFlag";

type Props = {
  cities: City[];
  selected: string | null;
  onSelect: (cityId: string | null) => void;
};

export default function BoardTabs({ cities, selected, onSelect }: Props) {
  const cityActive = selected !== null;
  const selectedCity = cities.find((c) => c.id === selected);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <button
        type="button"
        onClick={() => {
          onSelect(null);
          setOpen(false);
        }}
        className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
          !cityActive
            ? "bg-foreground text-background"
            : "bg-surface text-foreground/70 hover:text-foreground"
        }`}
      >
        <IndiaFlag className="h-3.5 w-5" /> National
      </button>

      <div ref={rootRef} className="relative min-w-0 flex-1 sm:flex-none">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`flex w-full min-w-0 items-center gap-1.5 rounded-full py-2 pr-3 pl-4 text-sm font-semibold whitespace-nowrap transition-colors sm:w-auto ${
            cityActive
              ? "bg-foreground text-background"
              : "bg-surface text-foreground/70 hover:text-foreground"
          }`}
        >
          <span className="min-w-0 flex-1 truncate text-left">
            {selectedCity ? selectedCity.name : "Choose your city"}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""} ${
              cityActive ? "text-background/70" : "text-foreground/50"
            }`}
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && (
          <ul
            role="listbox"
            aria-label="Choose your city"
            className="absolute top-full left-0 z-30 mt-2 max-h-64 w-48 overflow-y-auto rounded-2xl border border-border bg-surface-raised p-1.5 shadow-xl"
          >
            {cities.map((city) => (
              <li key={city.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected === city.id}
                  onClick={() => {
                    onSelect(city.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                    selected === city.id
                      ? "bg-saffron/15 text-saffron"
                      : "text-foreground/80 hover:bg-surface"
                  }`}
                >
                  {city.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
