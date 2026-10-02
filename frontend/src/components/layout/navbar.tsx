"use client";

// components/layout/navbar.tsx
// Barra de navegación premium con internacionalización completa.
// Utiliza routing inteligente para mantener la ruta activa al cambiar de idioma.

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { anchors, Locale } from "@/i18n/anchors";
import { Link, useRouter } from "@/routing";
import {
  Menu,
  ChevronDown
} from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

import { cn, getAssetPath } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const t = useTranslations("Navbar");
  const locale = (useLocale() as Locale) || "es";
  const locAnchors = anchors[locale] || anchors.es;
  const router = useRouter();
  const [scrolled, setScrolled] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const activeSectionId = useIntersectionObserver([
    locAnchors.hero,
    locAnchors.arsenal,
    locAnchors.howItWorks,
    locAnchors.skills,
    locAnchors.scalability,
    locAnchors.contact
  ]);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const element = document.getElementById(id);
    if (element) {
      e.preventDefault();
      const yOffset = -80; // Compensa la altura del navbar
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "auto" });
      window.history.pushState(null, "", `#${id}`);
    } else {
      router.push(`/#${id}`);
    }
    if (sheetOpen) setSheetOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const heroElement = document.getElementById(locAnchors.hero);
    if (heroElement) {
      e.preventDefault();
      const yOffset = -80;
      const y = heroElement.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "auto" });
      window.history.pushState(null, "", `/#${locAnchors.hero}`);
    }
  };

  const navLinks = [
    { label: t("home"), href: `/#${locAnchors.hero}`, id: locAnchors.hero },
    { label: t("arsenal"), href: `/#${locAnchors.arsenal}`, id: locAnchors.arsenal },
    { label: t("funcionamiento"), href: `/#${locAnchors.howItWorks}`, id: locAnchors.howItWorks },
    { label: t("habilidades"), href: `/#${locAnchors.skills}`, id: locAnchors.skills },
    { label: t("escalabilidad"), href: `/#${locAnchors.scalability}`, id: locAnchors.scalability },
    { label: t("contact"), href: `/#${locAnchors.contact}`, id: locAnchors.contact },
  ];

  const currentActiveId = activeSectionId || locAnchors.hero;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-border/60 py-3 shadow-lg shadow-black/5"
          : "bg-transparent border-transparent py-5"
      )}
    >
      {/* Tech glow line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />

      {/* Grid background structure */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)`,
          backgroundSize: "32px 32px"
        }}
      />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <nav className="flex items-center justify-between">

          {/* LOGO */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="group flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="relative h-16 flex items-center justify-center px-2">
              <div className="absolute inset-0 bg-primary/10 rounded-xl blur-lg group-hover:bg-primary/20 transition-colors" />
              <>
                <Image
                  src={getAssetPath("/logo-horizontal.svg")}
                  alt="Logo DINARP"
                  width={240}
                  height={64}
                  className="relative z-10 h-14 w-auto object-contain dark:hidden"
                  priority
                />
                <Image
                  src={getAssetPath("/logo-horizontal-blanco.svg")}
                  alt="Logo DINARP"
                  width={240}
                  height={64}
                  className="relative z-10 h-14 w-auto object-contain hidden dark:block"
                  priority
                />
              </>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:flex items-center bg-surface/40 backdrop-blur-md border border-border/40 rounded-full px-2 py-1.5 shadow-inner">
            {navLinks.map((link) => {
              const isActive = currentActiveId === link.id;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className={cn(
                    "relative px-4 lg:px-5 py-2 text-sm font-medium transition-colors duration-300 rounded-full",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-primary/10 shadow-sm border border-primary/20 rounded-full"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden md:flex items-center lg:gap-4">
            <ThemeToggle />
          </div>

          {/* MOBILE TOGGLE */}
          <div className="flex md:hidden items-center gap-3">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl border border-border/40" aria-label={t("menu")}>
                  <Menu className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] border-l-border/40 bg-background/95 backdrop-blur-xl p-0">
                <div
                  className="absolute inset-0 opacity-[0.02] pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)`,
                    backgroundSize: "32px 32px"
                  }}
                />
                <SheetHeader className="p-6 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="sr-only">DINARP</SheetTitle>
                    <>
                      <Image
                        src={getAssetPath("/logo-horizontal.svg")}
                        alt="Logo DINARP"
                        width={180}
                        height={48}
                        className="relative z-10 h-12 w-auto object-contain dark:hidden"
                        priority
                      />
                      <Image
                        src={getAssetPath("/logo-horizontal-blanco.svg")}
                        alt="Logo DINARP"
                        width={180}
                        height={48}
                        className="relative z-10 h-12 w-auto object-contain hidden dark:block"
                        priority
                      />
                    </>
                  </div>
                </SheetHeader>
                <div className="flex flex-col gap-2 p-4 md:p-6">
                  {navLinks.map((link) => {
                    const isActive = currentActiveId === link.id;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={(e) => handleNavClick(e, link.id)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl transition-colors border",
                          isActive
                            ? "bg-surface border-border/40 text-foreground"
                            : "border-transparent hover:bg-surface hover:border-border/40 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span className="font-semibold text-lg">{link.label}</span>
                        <ChevronDown className="-rotate-90 size-4 opacity-50" />
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-auto p-6 border-t border-border/40 space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-sm text-muted-foreground font-medium">{t("theme")}</span>
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </nav>
      </div>
    </header>
  );
}
