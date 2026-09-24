'use client';

import { useState, useEffect } from 'react';

export function useScrollSpy(
  sectionIds: string[],
  offset = 120,
  enabled = true
): [string, (id: string) => void] {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] || '');

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || sectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((entry) => entry.isIntersecting);
        if (intersecting.length > 0) {
          const topEntry = intersecting.reduce((prev, curr) =>
            Math.abs(curr.boundingClientRect.top - offset) < Math.abs(prev.boundingClientRect.top - offset)
              ? curr
              : prev
          );
          setActiveSection(topEntry.target.id);
        }
      },
      {
        root: null,
        rootMargin: '-100px 0px -50% 0px',
        threshold: [0, 0.2, 0.5, 0.8],
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [sectionIds, offset, enabled]);

  return [activeSection, setActiveSection];
}
