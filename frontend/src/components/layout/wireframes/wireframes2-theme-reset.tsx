"use client";

import React, { useEffect } from "react";
import { applyTheme, getStoredTheme } from "@/lib/theme";

export function Wireframes2ThemeReset({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("data-theme") === "wireframe") {
      const stored = getStoredTheme() || "light";
      applyTheme(stored);
    }
    if (document.body.getAttribute("data-theme") === "wireframe") {
      document.body.removeAttribute("data-theme");
    }
  }, []);

  return <>{children}</>;
}
