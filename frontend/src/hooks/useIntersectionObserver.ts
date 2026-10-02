import { useEffect, useState, useRef } from 'react';

export function useIntersectionObserver(sectionIds: string[]): string {
  const [activeId, setActiveId] = useState<string>('');
  const activeIdRef = useRef<string>('');
  const sectionIdsKey = sectionIds.join(',');

  useEffect(() => {
    const ids = sectionIdsKey.split(',').filter(Boolean);

    const updateActiveSection = () => {
      const offset = 150; // Viewport trigger line below sticky navbar
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // At the very bottom of the page, activate the last section (contacto)
      if (scrollPosition + windowHeight >= documentHeight - 50 && ids.length > 0) {
        const lastId = ids[ids.length - 1];
        if (activeIdRef.current !== lastId) {
          activeIdRef.current = lastId;
          setActiveId(lastId);
        }
        return;
      }

      let currentActive = activeIdRef.current || ids[0] || '';

      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset && rect.bottom > offset) {
            currentActive = id;
            break;
          }
        }
      }

      if (currentActive && currentActive !== activeIdRef.current) {
        activeIdRef.current = currentActive;
        setActiveId(currentActive);
      }
    };

    updateActiveSection();

    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [sectionIdsKey]);

  return activeId;
}


