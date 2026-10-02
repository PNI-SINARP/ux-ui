"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"
import { ChevronDownIcon, XIcon, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface Option {
  value: string
  label: string
}

export interface MultiselectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  maxCount?: number
  className?: string
  state?: "default" | "success" | "error"
  size?: "sm" | "default" | "lg"
  label?: string
  helpText?: string
  required?: boolean
}

export function Multiselect({
  options,
  selected,
  onChange,
  placeholder = "Selecciona opciones...",
  searchPlaceholder = "Buscar...",
  emptyText = "No se encontraron resultados.",
  disabled = false,
  maxCount = 3,
  className,
  state = "default",
  size = "default",
  label,
  helpText,
  required
}: MultiselectProps) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  const handleSelect = (currentValue: string) => {
    const isSelected = selected.includes(currentValue)
    if (isSelected) {
      onChange(selected.filter((item) => item !== currentValue))
    } else {
      onChange([...selected, currentValue])
    }
  }

  const handleRemove = (e: React.MouseEvent | React.KeyboardEvent, valueToRemove: string) => {
    e.stopPropagation()
    onChange(selected.filter((item) => item !== valueToRemove))
  }

  const selectedOptions = options.filter((opt) => selected.includes(opt.value))

  return (
    <div className={cn("flex flex-col gap-1.5 relative text-left", className)} ref={containerRef}>
      {label && (
        <label className={cn(
          "text-sm font-semibold text-left",
          state === "error" ? "text-danger" : "text-foreground",
          disabled && "opacity-50"
        )}>
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      <div
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "w-full cursor-pointer relative",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <InputGroup state={state} size={size} className="w-full">
          <div className="flex-1 flex gap-1 items-center overflow-hidden py-1.5 px-2">
            {selected.length === 0 && (
              <span className="text-muted-foreground ml-1 text-sm truncate">
                {placeholder}
              </span>
            )}

            {selected.length > 0 && selected.length <= maxCount && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex gap-1 overflow-hidden">
                      {selectedOptions.map((opt) => (
                        <Badge
                          key={opt.value}
                          tone="neutral"
                          appearance="soft"
                          className="px-3 py-0.5 font-semibold h-7 rounded-full gap-1 shrink-0"
                        >
                          {opt.label}
                          <div
                            role="button"
                            tabIndex={0}
                            className="ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer hover:bg-primary/30 p-0.5"
                            onClick={(e) => handleRemove(e, opt.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRemove(e, opt.value)
                            }}
                          >
                            <XIcon className="h-3 w-3" />
                          </div>
                        </Badge>
                      ))}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{selectedOptions.map(o => o.label).join(", ")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {selected.length > maxCount && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      tone="neutral"
                      appearance="soft"
                      className="px-3 py-0.5 font-semibold h-7 rounded-full shrink-0"
                    >
                      {selectedOptions[0]?.label} +{selected.length - 1} seleccionadas
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{selectedOptions.map(o => o.label).join(", ")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              variant="ghost"
              size="icon-xs"
              className={cn("pointer-events-none transition-transform", open && "rotate-180")}
            >
              <ChevronDownIcon className="h-4 w-4" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>

        {open && (
          <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
            <Command className="w-full max-h-[300px] bg-transparent overflow-hidden">
              <div className="flex items-center border-b border-border px-3 py-2">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <CommandPrimitive.Input
                  placeholder={searchPlaceholder}
                  className="flex h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <CommandList className="max-h-[220px] overflow-y-auto p-1 no-scrollbar">
                <CommandEmpty className="py-6 text-center text-sm">
                  {emptyText}
                </CommandEmpty>
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = selected.includes(option.value)
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        onSelect={() => handleSelect(option.value)}
                        className="flex items-center gap-2 px-2 py-1.5 cursor-pointer data-[selected=true]:bg-accent/50 rounded-sm"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => { }}
                        />
                        <span className="flex-1 truncate">{option.label}</span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
      </div>

      {helpText && (
        <p className={cn(
          "text-xs",
          state === "error" ? "text-danger" : "text-muted-foreground",
          disabled && "opacity-50"
        )}>
          {helpText}
        </p>
      )}
    </div>
  )
}
