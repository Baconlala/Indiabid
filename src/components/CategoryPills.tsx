"use client";

import type { ReactNode } from "react";
import type { Category, CategoryGroup } from "@/lib/types";
import HScroller from "./HScroller";
import IndiaFlag from "./IndiaFlag";

type Props = {
  categories: Category[];
  groups: readonly CategoryGroup[];
  selected: string | "all";
  onSelect: (categoryId: string | "all") => void;
};

export default function CategoryPills({ categories, groups, selected, onSelect }: Props) {
  return (
    <HScroller scrollClassName="flex min-w-0 gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <PillGroup label="All">
        <Pill
          active={selected === "all"}
          onClick={() => onSelect("all")}
          icon={<IndiaFlag className="h-3.5 w-5" />}
          label="All"
        />
      </PillGroup>
      {groups.map((group) => {
        const groupCategories = categories.filter((c) => c.group === group && !c.isSensitive);
        if (groupCategories.length === 0) return null;
        return (
          <PillGroup key={group} label={group}>
            {groupCategories.map((cat) => (
              <Pill
                key={cat.id}
                active={selected === cat.id}
                onClick={() => onSelect(cat.id)}
                icon={cat.icon}
                label={cat.name}
              />
            ))}
          </PillGroup>
        );
      })}
    </HScroller>
  );
}

function PillGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col gap-1.5">
      <span className="text-[10px] font-semibold tracking-wider text-muted uppercase">
        {label}
      </span>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
        active
          ? "border-saffron bg-saffron/15 text-saffron"
          : "border-border bg-surface text-foreground/80 hover:border-saffron/50 hover:text-foreground"
      }`}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}
