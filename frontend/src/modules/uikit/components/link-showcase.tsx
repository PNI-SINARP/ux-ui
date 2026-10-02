"use client";

import React from "react";
import { Link } from "@/components/ui/link";
import { ArrowRight, FileText } from "lucide-react";

export function LinkShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  const sections = [
    {
      title: "Variantes Principales",
      items: [
        {
          name: "Default Link",
          desc: "Para navegar hacia otra página o sección.",
          component: <Link href="#">Ver detalles</Link>,
        },
        {
          name: "Inline Link",
          desc: "Para incluir un enlace dentro de un texto o párrafo.",
          component: (
            <p className="text-body text-foreground">
              Para conocer más información, consulta los <Link variant="inline" href="#">términos y condiciones</Link>.
            </p>
          ),
        },
      ],
    },
    {
      title: "Enlaces con Íconos",
      items: [
        {
          name: "Leading Icon",
          desc: "Cuando el ícono ayuda a identificar la acción antes del texto.",
          component: <Link href="#" leadingIcon={<FileText />}>Ver ficha completa</Link>,
        },
        {
          name: "Trailing Icon",
          desc: "Para reforzar visualmente que el enlace lleva a otra vista o acción relacionada.",
          component: <Link href="#" trailingIcon={<ArrowRight />}>Ver más</Link>,
        },
        {
          name: "External Link",
          desc: "Para indicar que el usuario será dirigido a un recurso externo.",
          component: <Link href="#" isExternal>Descargar documentación</Link>,
        },
      ],
    },
    {
      title: "Estados",
      items: [
        {
          name: "Disabled",
          desc: "Para mostrar una opción temporalmente no disponible sión permitir interacción.",
          component: <Link href="#" isDisabled>Enlace deshabilitado</Link>,
        },
        {
          name: "Disabled External",
          desc: "Un enlace externo que actualmente está deshabilitado.",
          component: <Link href="#" isExternal isDisabled>Sitio no disponible</Link>,
        },
      ],
    },
    {
      title: "Tamaños",
      items: [
        {
          name: "Small (sm)",
          desc: "Usado en interfaces densas o textos secundarios.",
          component: <Link href="#" size="sm" isExternal>Ministerio de Educación</Link>,
        },
        {
          name: "Por defecto",
          desc: "El tamaño estándar para la mayoría de los casos.",
          component: <Link href="#" isExternal>Ministerio de Educación</Link>,
        },
        {
          name: "Large (lg)",
          desc: "Para llamadas a la acción principales o lugares destacados.",
          component: <Link href="#" size="lg" isExternal>Ministerio de Educación</Link>,
        },
      ],
    },
  ];

  return (
    <div className="space-y-12">
      {sections.map((section, idx) => (
        <div key={idx} className="flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-3">
            {section.title}
          </h4>
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-border/60">
                {section.items.map((item, itemIdx) => (
                  <tr key={itemIdx} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="py-4 pl-6 pr-4 align-top w-[35%]">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-foreground">{item.name}</span>
                        {item.desc && (
                          <span className="text-[11px] text-muted-foreground leading-tight pr-4">
                            {item.desc}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <div className="flex items-center w-full min-h-[24px]">
                        {item.component}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
