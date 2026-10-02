"use client";
import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const folderVariants = cva(
    "relative p-4 flex flex-col items-center justify-center",
    {
        variants: {
            variant: {
                primary: "[--folder-base-color:var(--primary)]",
                secondary: "[--folder-base-color:var(--secondary)]",
                warning: "[--folder-base-color:var(--warning)]",
                info: "[--folder-base-color:var(--info)]",
                danger: "[--folder-base-color:var(--danger)]",
                error: "[--folder-base-color:var(--danger)]",
                success: "[--folder-base-color:var(--success)]",
                neutral: "[--folder-base-color:var(--muted-foreground)]",
            },
        },
        defaultVariants: {
            variant: "primary",
        },
    }
);

export interface FolderProps extends VariantProps<typeof folderVariants> {
    title?: string;
    subtitle?: string;
    footerText?: string;
    color?: string; // Optional hex or css var override
    href?: string;
    className?: string;
    actionIcon?: React.ReactNode;
    onClick?: () => void;
    isOpen?: boolean;
}

const Folder = ({
    title = "Designs",
    subtitle = "318 images",
    footerText = "Last added time Oct 13, 2025",
    variant = "primary",
    color,
    href,
    className,
    actionIcon,
    onClick,
    isOpen = false
}: FolderProps) => {
    const router = useRouter();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (href) {
            router.push(href);
        }
    };

    return (
        <div
            className={cn(folderVariants({ variant }), className)}
            style={color ? { '--folder-base-color': color } as React.CSSProperties : {}}
        >
            <div
                onClick={handleClick}
                className="relative cursor-pointer w-[240px] h-[160px] sm:w-72 sm:h-48 group perspective-1000 shrink-0"
            >
                {/* PARTE TRASERA */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden transition-colors duration-300 bg-[var(--folder-base-color)] shadow-inner">
                    <div className="absolute inset-0 bg-black/20" />
                </div>

                {/* ARCHIVO ÚNICO */}
                <div 
                    className={cn(
                        "absolute inset-x-6 top-4 bottom-10 bg-white rounded-xl shadow-md border border-black/5 transition-all duration-500 ease-out transform-gpu z-0",
                        isOpen ? "-translate-y-10 scale-[1.02] shadow-lg border-black/10" : "group-hover:-translate-y-10 group-hover:scale-[1.02] group-hover:shadow-lg group-hover:border-black/10"
                    )}
                />

                {/* TAPA FRONTAL */}
                <div
                    className={cn(
                        "absolute inset-0 rounded-2xl p-6 flex flex-col text-white border border-white/20 transition-all duration-500 ease-out origin-bottom transform-gpu shadow-2xl bg-gradient-to-br from-[var(--folder-base-color)]/95 via-[var(--folder-base-color)]/80 to-[var(--folder-base-color)]/90 backdrop-blur-md",
                        isOpen ? "-rotate-x-25 translate-y-2" : "group-hover:-rotate-x-25 group-hover:translate-y-2"
                    )}
                    style={{
                        clipPath: 'polygon(0% 20%, 45% 20%, 52% 32%, 100% 32%, 100% 100%, 0% 100%)'
                    }}
                >
                    <div className="flex justify-between items-start mt-12">
                        <div className="space-y-0">
                            <h3 className="text-xl sm:text-2xl font-bold tracking-tight font-heading leading-tight line-clamp-2">{title}</h3>
                            <p className="text-xs sm:text-sm opacity-80 font-medium">{subtitle}</p>
                        </div>
                        <div className="size-6 sm:size-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 hover:bg-white/20 transition-colors mt-1 shrink-0">
                            {actionIcon || <MoreHorizontal className="size-4" />}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <p className="text-[10px] opacity-70 font-medium tracking-tight">
                            {footerText}
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .perspective-1000 { perspective: 1000px; }

                /* Fallback para navegadores que no soportan transform-gpu de tailwind correctamente con variables */
                .group-hover\:-rotate-x-25:hover {
                    transform: rotateX(-25deg) translateY(8px);
                }
            `}</style>
        </div>
    );
};

export default Folder;
