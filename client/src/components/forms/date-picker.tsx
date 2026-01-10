"use client"

import * as React from "react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, DateRange } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  disabledDates?: (date: Date) => boolean
}

function DatePicker({
  value,
  onChange,
  placeholder = "Tarih seçin",
  disabled = false,
  className,
  disabledDates,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (date: Date | DateRange | undefined) => {
    if (date instanceof Date) {
      onChange?.(date)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP", { locale: tr }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          disabled={disabledDates}
        />
      </PopoverContent>
    </Popover>
  )
}

export interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  disabledDates?: (date: Date) => boolean
}

function DateRangePicker({
  value,
  onChange,
  placeholder = "Tarih aralığı seçin",
  disabled = false,
  className,
  disabledDates,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (date: Date | DateRange | undefined) => {
    if (date && typeof date === "object" && "from" in date) {
      onChange?.(date)
      // Close popover when both dates are selected
      if (date.from && date.to) {
        setOpen(false)
      }
    }
  }

  const formatDateRange = () => {
    if (!value?.from) return placeholder
    if (!value.to) return format(value.from, "PPP", { locale: tr })
    return `${format(value.from, "PP", { locale: tr })} - ${format(value.to, "PP", { locale: tr })}`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={handleSelect}
          disabled={disabledDates}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker, DateRangePicker }
