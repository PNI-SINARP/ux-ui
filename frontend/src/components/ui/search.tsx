"use client"

import * as React from "react"
import { SearchIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  InputGroup,
  InputGroupInput,
  InputGroupButton
} from "@/components/ui/input-group"

export interface SearchProps extends Omit<React.ComponentProps<"input">, "size"> {
  size?: "default" | "sm" | "lg"
  onClear?: () => void
}

const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ className, size, onClear, value, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || "")

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value)
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value)
      onChange?.(e)
    }

    const handleClear = () => {
      setInternalValue("")
      if (onClear) {
        onClear()
      }
      // Trigger onChange with empty value if needed, but usually onClear is enough
    }

    const hasValue = internalValue !== ""

    return (
      <InputGroup
        size={size}
        className={cn("group/search", className)}
        leftIcon={
          <SearchIcon
            className={cn(
              "opacity-50 transition-colors group-focus-within/search:opacity-100 group-focus-within/search:text-primary",
              size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4"
            )}
          />
        }
        rightIcon={
          hasValue ? (
            <InputGroupButton
              onClick={handleClear}
              variant="ghost"
              size="icon-xs"
              className="size-7 rounded-full hover:bg-transparent"
            >
              <XIcon className="size-3.5 opacity-50 hover:opacity-100" />
            </InputGroupButton>
          ) : null
        }
      >
        <InputGroupInput
          ref={ref}
          value={internalValue}
          onChange={handleChange}
          {...props}
        />
      </InputGroup>
    )
  }
)
Search.displayName = "Search"

export { Search }
