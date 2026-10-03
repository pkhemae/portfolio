"use client";

import { useEffect, useState, useRef } from "react";
import { GraphActivity, type ActivityDay } from "@/components/registry/default/graph-activity/graph-activity";

export default function GithubContributions() {
  const [days, setDays] = useState<ActivityDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("https://github-contributions-api.jogruber.de/v4/pkhemae?y=last")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch contributions");
        return res.json();
      })
      .then((data) => {
        if (data?.contributions && Array.isArray(data.contributions)) {
          setDays(
            data.contributions.map((c: { date: string; count: number }) => ({
              date: c.date,
              count: c.count,
            }))
          );
        }
      })
      .catch((err) => {
        console.error("Error loading GitHub contributions:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Automatically scroll to the most recent contributions on smaller screens
  useEffect(() => {
    if (containerRef.current) {
      const scrollEl = containerRef.current.querySelector(".scrollbar-graph");
      if (scrollEl) {
        scrollEl.scrollLeft = scrollEl.scrollWidth;
      }
    }
  }, [days]);

  return (
    <div ref={containerRef} className="w-full">
      {days.length > 0 ? (
        <GraphActivity
          title="COMMITS"
          days={days}
          palette="mono"
        />
      ) : (
        <div className="relative w-full min-h-[160px] graph-frame flex items-center justify-center p-8 text-graph-muted text-xs font-mono select-none">
          <span aria-hidden="true" className="pointer-events-none absolute z-10 flex size-4 items-center justify-center bg-background font-mono text-sm leading-none text-graph-frame top-0 left-0 -translate-x-1/2 -translate-y-1/2">+</span>
          <span aria-hidden="true" className="pointer-events-none absolute z-10 flex size-4 items-center justify-center bg-background font-mono text-sm leading-none text-graph-frame top-0 right-0 translate-x-1/2 -translate-y-1/2">+</span>
          <span aria-hidden="true" className="pointer-events-none absolute z-10 flex size-4 items-center justify-center bg-background font-mono text-sm leading-none text-graph-frame bottom-0 left-0 -translate-x-1/2 translate-y-1/2">+</span>
          <span aria-hidden="true" className="pointer-events-none absolute z-10 flex size-4 items-center justify-center bg-background font-mono text-sm leading-none text-graph-frame right-0 bottom-0 translate-x-1/2 translate-y-1/2">+</span>
          <span className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 bg-background px-2.5 tracking-wide whitespace-nowrap uppercase text-graph-accent font-mono text-sm">[ COMMITS ]</span>
          <span>{isLoading ? "Chargement des contributions..." : "Impossible de charger les contributions"}</span>
        </div>
      )}
    </div>
  );
}
