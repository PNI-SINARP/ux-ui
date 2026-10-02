import * as React from "react"
import { cn } from "@/lib/utils"
import { Minus, Plus } from "lucide-react"
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

export interface NumberFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  label?: string
  helpText?: React.ReactNode
  error?: string
  size?: "sm" | "default" | "lg"
  onValueChange?: (value: number | undefined) => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  allowDecimals?: boolean
  allowNegative?: boolean
}

export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      className,
      label,
      helpText,
      error,
      size = "default",
      min,
      max,
      step = 1,
      required,
      disabled,
      readOnly,
      value,
      defaultValue,
      onValueChange,
      onChange,
      allowDecimals = true,
      allowNegative = true,
      placeholder,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<string>(
      value !== undefined ? String(value) : defaultValue !== undefined ? String(defaultValue) : ""
    )

    // Sync with controlled value
    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(String(value))
      }
    }, [value])

    const numericValue = internalValue === "" || internalValue === "-" ? undefined : Number(internalValue)

    const isAtMin = min !== undefined && numericValue !== undefined && numericValue <= Number(min)
    const isAtMax = max !== undefined && numericValue !== undefined && numericValue >= Number(max)

    const triggerChange = (newVal: string) => {
      setInternalValue(newVal)
      
      const num = newVal === "" || newVal === "-" ? undefined : Number(newVal)
      onValueChange?.(num)
      
      if (onChange) {
        // Mock event for standard onChange handlers
        const event = {
          target: { value: newVal, name: props.name },
          currentTarget: { value: newVal, name: props.name }
        } as React.ChangeEvent<HTMLInputElement>
        onChange(event)
      }
    }

    const handleIncrement = () => {
      if (disabled || readOnly || isAtMax) return
      const current = numericValue ?? 0
      let next = current + Number(step)
      if (max !== undefined && next > Number(max)) next = Number(max)
      // Fix float math issues
      next = Number(next.toPrecision(10))
      triggerChange(String(next))
    }

    const handleDecrement = () => {
      if (disabled || readOnly || isAtMin) return
      const current = numericValue ?? 0
      let next = current - Number(step)
      if (min !== undefined && next < Number(min)) next = Number(min)
      if (!allowNegative && next < 0) next = 0
      // Fix float math issues
      next = Number(next.toPrecision(10))
      triggerChange(String(next))
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value

      // Regex validation based on props
      let regexStr = "^"
      if (allowNegative) regexStr += "-?"
      regexStr += "\\d*"
      if (allowDecimals) regexStr += "(\\.\\d*)?"
      regexStr += "$"
      
      const isValid = new RegExp(regexStr).test(val)

      if (isValid || val === "") {
        // Don't cap on typing to allow intermediate states (like "1" when typing "10" even if min is 5)
        triggerChange(val)
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      let val = internalValue
      
      // Clean up hanging decimals or minus signs
      if (val === "-" || val === ".") val = ""
      if (val.endsWith(".")) val = val.slice(0, -1)

      if (val !== "") {
        let num = Number(val)
        if (min !== undefined && num < Number(min)) num = Number(min)
        if (max !== undefined && num > Number(max)) num = Number(max)
        if (!allowNegative && num < 0) num = 0
        val = String(num)
      }

      if (val !== internalValue) {
        triggerChange(val)
      }

      props.onBlur?.(e)
    }

    const state = error ? "error" : "default"

    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        {label && (
          <label className={cn(
            "text-sm font-semibold",
            error ? "text-danger" : "text-foreground",
            disabled && "opacity-50"
          )}>
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </label>
        )}

        <InputGroup
          state={state}
          size={size}
          disabled={disabled}
          className={cn(readOnly && "bg-muted/10 pointer-events-none")}
          leftIcon={
            <InputGroupButton
              variant="ghost"
              size={size === "sm" ? "icon-xs" : "icon-sm"}
              onClick={handleDecrement}
              disabled={disabled || readOnly || isAtMin}
              aria-label="Disminuir"
              className={cn("shrink-0")}
            >
              <Minus />
            </InputGroupButton>
          }
          rightIcon={
            <InputGroupButton
              variant="ghost"
              size={size === "sm" ? "icon-xs" : "icon-sm"}
              onClick={handleIncrement}
              disabled={disabled || readOnly || isAtMax}
              aria-label="Aumentar"
              className={cn("shrink-0")}
            >
              <Plus />
            </InputGroupButton>
          }
        >
          <InputGroupInput
            ref={ref}
            type="text"
            inputMode={allowDecimals ? "decimal" : "numeric"}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            required={required}
            className="text-center font-sans"
            aria-invalid={!!error}
            {...props}
          />
        </InputGroup>

        {(helpText || error) && (
          <p className={cn(
            "text-xs",
            error ? "text-danger" : "text-muted-foreground",
            disabled && "opacity-50"
          )}>
            {error || helpText}
          </p>
        )}
      </div>
    )
  }
)
NumberField.displayName = "NumberField"
