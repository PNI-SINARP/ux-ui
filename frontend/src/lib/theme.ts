/**
 * Simple theme management utility to avoid external dependencies.
 * Handles data-theme attribute and localStorage persistence.
 */

export type Theme = "light" | "dark";

export const getStoredTheme = (): Theme | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("glocation-theme") as Theme | null;
};

export const setStoredTheme = (theme: Theme) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("glocation-theme", theme);
  document.cookie = `glocation-theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
};

export const applyTheme = (theme: Theme) => {
  if (typeof window === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  } else {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }
  setStoredTheme(theme);
};

export const toggleTheme = () => {
  const current = document.documentElement.getAttribute("data-theme") as Theme || "light";
  const next = current === "light" ? "dark" : "light";
  applyTheme(next);
};
