"use client";

import React, { useEffect } from "react";

export function WireframeThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply data-theme="wireframe" to documentElement and body so Radix portals inherit tokens
    const root = document.documentElement;
    const prevTheme = root.getAttribute("data-theme");
    root.setAttribute("data-theme", "wireframe");
    document.body.setAttribute("data-theme", "wireframe");

    return () => {
      if (prevTheme && prevTheme !== "wireframe") {
        root.setAttribute("data-theme", prevTheme);
        document.body.setAttribute("data-theme", prevTheme);
      } else {
        root.removeAttribute("data-theme");
        document.body.removeAttribute("data-theme");
      }
    };
  }, []);

  return (
    <div
      data-theme="wireframe"
      className="min-h-screen bg-background text-foreground font-sans antialiased"
    >
      {children}
    </div>
  );
}

