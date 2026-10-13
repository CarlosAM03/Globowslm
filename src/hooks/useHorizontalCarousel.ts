"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { getCarouselState, getCarouselStep } from "@/lib/carousel";

export function useHorizontalCarousel(resetKey: string) {
  const viewport = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState({ previous: false, next: false });
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    element.scrollTo({ left: 0, behavior: "instant" });
    const update = () => setAvailable(getCarouselState(element.scrollLeft, element.clientWidth, element.scrollWidth));
    const observer = new ResizeObserver(update);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    element.addEventListener("scroll", update);
    update();
    return () => { observer.disconnect(); element.removeEventListener("scroll", update); };
  }, [resetKey]);

  function move(direction: number) {
    const element = viewport.current;
    const track = element?.firstElementChild;
    if (!element || !track) return;
    const cardWidth = track.firstElementChild?.getBoundingClientRect().width ?? 0;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    element.scrollBy({ left: direction * getCarouselStep(cardWidth, gap, element.clientWidth), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault(); viewport.current?.scrollTo({ left: event.key === "Home" ? 0 : viewport.current.scrollWidth, behavior: "instant" });
    }
  }
  return { viewport, available, move, onKeyDown };
}
