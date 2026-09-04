"use client";

import { useEffect, useRef, useState, type ReactNode, type WheelEvent } from "react";

type Props = {
  id?: string;
  scrollClassName: string;
  children: ReactNode;
};

/**
 * A horizontally-scrolling row that works for touch (native swipe), mouse
 * wheel/trackpad (redirected to horizontal here, since browsers don't do
 * that by default for vertical wheel input), and click — via visible arrow
 * buttons on non-touch screens, since a hidden scrollbar gives mouse users
 * no affordance at all otherwise.
 */
export default function HScroller({ id, scrollClassName, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function updateEdges() {
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }

    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      ro.disconnect();
    };
  }, []);

  function onWheel(e: WheelEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    // Redirect plain vertical wheel/trackpad scroll into horizontal — sideways
    // trackpad swipes already work natively and pass straight through.
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }

  function scrollByAmount(amount: number) {
    ref.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-220)}
          aria-label="Scroll left"
          className="absolute top-1/2 left-0 z-10 hidden h-8 w-8 -translate-x-1/3 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-md hover:border-saffron sm:flex"
        >
          ‹
        </button>
      )}
      <div id={id} ref={ref} onWheel={onWheel} className={scrollClassName}>
        {children}
      </div>
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(220)}
          aria-label="Scroll right"
          className="absolute top-1/2 right-0 z-10 hidden h-8 w-8 translate-x-1/3 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-md hover:border-saffron sm:flex"
        >
          ›
        </button>
      )}
    </div>
  );
}
