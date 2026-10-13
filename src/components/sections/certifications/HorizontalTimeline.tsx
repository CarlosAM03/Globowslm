"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTimelineScrollDistance, getTimelineScrollState } from "@/lib/certifications";

export function HorizontalTimeline({ children }: { children: ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState({ previous: false, next: false });
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const update = () => setAvailable(getTimelineScrollState(element.scrollLeft, element.clientWidth, element.scrollWidth));
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update);
    update();
    return () => { observer.disconnect(); element.removeEventListener("scroll", update); };
  }, []);
  function move(direction: number) {
    const element = viewport.current;
    if (element) {
      const list = element.querySelector("ol");
      const cardWidth = list?.querySelector("li")?.getBoundingClientRect().width ?? 0;
      const gap = list ? Number.parseFloat(getComputedStyle(list).columnGap) || 0 : 0;
      element.scrollBy({ left: direction * getTimelineScrollDistance(cardWidth, gap, element.clientWidth), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }
  return (
    <div className="horizontal-timeline">
      <div className="timeline-controls" role="group" aria-label="Navegar por certificaciones">
        <button type="button" disabled={!available.previous} aria-label="Certificación anterior" aria-controls="certification-timeline" onClick={() => move(-1)}><ChevronLeft strokeWidth={1.75} aria-hidden="true" /></button>
        <button type="button" disabled={!available.next} aria-label="Certificación siguiente" aria-controls="certification-timeline" onClick={() => move(1)}><ChevronRight strokeWidth={1.75} aria-hidden="true" /></button>
      </div>
      <div ref={viewport} id="certification-timeline" className="timeline-viewport" role="region" aria-label="Trayectoria de credenciales verificadas" tabIndex={0}>
        <ol className="timeline-list">{children}</ol>
      </div>
    </div>
  );
}
