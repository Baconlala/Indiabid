"use client";

import type { ReactNode } from "react";
import type { City } from "@/lib/types";
import IndiaFlag from "./IndiaFlag";

type Props = {
  cities: City[];
  selected: string | null;
  onSelect: (cityId: string | null) => void;
};

export default function BoardTabs({ cities, selected, onSelect }: Props) {
  return (
    <div
      id="board-tabs"
      className="flex min-w-0 scroll-mt-20 gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <Tab active={selected === null} onClick={() => onSelect(null)}>
        <IndiaFlag className="h-3.5 w-5" /> National
      </Tab>
      {cities.map((city) => (
        <Tab key={city.id} active={selected === city.id} onClick={() => onSelect(city.id)}>
          {city.name}
        </Tab>
      ))}
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
        active
          ? "bg-foreground text-background"
          : "bg-surface text-foreground/70 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
