"use client"

import * as React from "react"
import { Search } from "@/components/ui/search"
import { Sparkles } from "lucide-react"

export function SearchShowcase() {
  const sizes = [
    { id: "sm", label: "Small (h-9)", sub: "size=\"sm\"" },
    { id: "default", label: "Standard (h-11)", sub: "size=\"default\"" },
    { id: "lg", label: "Large (h-14)", sub: "size=\"lg\"" },
  ] as const

  return (
    <div className="space-y-12">
        {/* MATRIX OF SIZES */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
            Variantes de Tamaño
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {sizes.map((size) => (
              <div key={size.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{size.label}</span>
                  <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{size.sub}</code>
                </div>
                <Search
                  size={size.id as "default" | "sm" | "lg"}
                  placeholder="Escribe algo..."
                />
              </div>
            ))}
          </div>
        </div>

    </div>
  )
}
