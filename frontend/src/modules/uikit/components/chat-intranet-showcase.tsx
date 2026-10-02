"use client";
import { SubSection } from "./sub-section";

import * as React from "react";
import { ChatIntranet } from "@/components/ui/chat-intranet";
import { MessageCircle, Sparkles, Building2 } from "lucide-react";

import { Card } from "@/components/ui/card";




export function ChatIntranetShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  return (
    <div className="space-y-10 w-full">
      {/* Description */}
      <SubSection icon={Building2} id="chat-intranet" title="Chat Integrado" description="Previsualización interactiva del componente." registerSection={registerSection}>
        <div className="p-8 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group bg-muted/10">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Sparkles className="size-32 text-primary" />
          </div>

          <div className="relative z-10 w-full flex justify-center">
            <ChatIntranet className="max-w-4xl w-full" />
          </div>
        </div>
      </SubSection>
    </div>
  );
}
