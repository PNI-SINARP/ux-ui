// src/i18n/anchors.ts

export const anchors = {
  es: {
    hero: "inicio",
    arsenal: "arsenal",
    howItWorks: "funcionamiento",
    video: "video",
    skills: "habilidades",
    scalability: "escalabilidad",
    contact: "contacto",
  },
  en: {
    hero: "home",
    arsenal: "arsenal",
    howItWorks: "how-it-works",
    video: "video",
    skills: "skills",
    scalability: "scalability",
    contact: "contact",
  },
  pt: {
    hero: "inicio",
    arsenal: "arsenal",
    howItWorks: "como-funciona",
    video: "video",
    skills: "habilidades",
    scalability: "escalabilidade",
    contact: "contato",
  },
} as const;

export type Locale = keyof typeof anchors;
export type AnchorKeys = keyof typeof anchors.es;

export const getTranslatedHash = (currentHash: string, currentLocale: string, newLocale: string): string => {
  const hash = currentHash.replace("#", "");
  if (!hash) return currentHash;
  
  const currentLangAnchors = anchors[currentLocale as Locale];
  if (!currentLangAnchors) return currentHash;

  const key = (Object.keys(currentLangAnchors) as AnchorKeys[]).find(
    (k) => currentLangAnchors[k] === hash
  );
  
  if (!key) return currentHash;

  const newLangAnchors = anchors[newLocale as Locale];
  if (!newLangAnchors) return currentHash;
  
  return `#${newLangAnchors[key]}`;
};

export const getCurrentSectionId = (currentLocale: string): string => {
  if (typeof window === "undefined") return "";
  const langAnchors = anchors[currentLocale as Locale];
  if (!langAnchors) return "";
  
  const sectionIds = Object.values(langAnchors);
  let bestId = "";
  let minDiff = Infinity;
  
  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      const diff = Math.abs(rect.top - 80);
      if (diff < minDiff) {
        minDiff = diff;
        bestId = id;
      }
    }
  });
  
  return bestId;
};

