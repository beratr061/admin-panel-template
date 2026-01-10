"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isBefore,
  isAfter,
} from "date-fns"
import { tr } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface DateRange {
  from: Date | undefined
  to?: Date | undefined
}

export interface CalendarProps {
  mode?: "single" | "range"
  selected?: Date | DateRange
  onSelect?: (date: Date | DateRange | undefined) => void
  disabled?: (date: Date) => boolean
  className?: string
  locale?: Locale
}

function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  className,
  locale = tr,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    mode === "single" && selected instanceof Date
      ? selected
      : mode === "range" && selected && "from" in selected && selected.from
        ? selected.from
        : new Date()
  )

  const [rangeStart, setRangeStart] = React.useState<Date | undefined>(
    mode === "range" && selected && "from" in selected ? selected.from : undefined
  )

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDateClick = (date: Date) => {
    if (disabled?.(date)) return

    if (mode === "single") {
      onSelect?.(date)
    } else {
      // Range mode
      if (!rangeStart) {
        setRangeStart(date)
        onSelect?.({ from: date, to: undefined })
      } else {
        if (isBefore(date, rangeStart)) {
          setRangeStart(date)
          onSelect?.({ from: date, to: undefined })
        } else {
          onSelect?.({ from: rangeStart, to: date })
          setRangeStart(undefined)
        }
      }
    }
  }

  const isSelected = (date: Date): boolean => {
    if (mode === "single" && selected instanceof Date) {
      return isSameDay(date, selected)
    }
    if (mode === "range" && selected && "from" in selected) {
      if (selected.from && isSameDay(date, selected.from)) return true
      if (selected.to && isSameDay(date, selected.to)) return true
    }
    return false
  }

  const isInRange = (date: Date): boolean => {
    if (mode === "range" && selected && "from" in selected) {
      if (selected.from && selected.to) {
        return isWithinInterval(date, { start: selected.from, end: selected.to })
      }
    }
    return false
  }

  const isRangeStart = (date: Date): boolean => {
    if (mode === "range" && selected && "from" in selected && selected.from) {
      return isSameDay(date, selected.from)
    }
    return false
  }

  const isRangeEnd = (date: Date): boolean => {
    if (mode === "range" && selected && "from" in selected && selected.to) {
      return isSameDay(date, selected.to)
    }
    return false
  }

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let day = startDate
  while (day <= endDate) {
    days.push(day)
    day = addDays(day, 1)
  }

  const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]

  return (
    <div className={cn("p-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={handlePreviousMonth}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">
          {format(currentMonth, "MMMM yyyy", { locale })}
        </div>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={handleNextMonth}
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((weekDay) => (
          <div
            key={weekDay}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {weekDay}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayDate, index) => {
          const isCurrentMonth = isSameMonth(dayDate, currentMonth)
          const isDisabled = disabled?.(dayDate) ?? false
          const selected = isSelected(dayDate)
          const inRange = isInRange(dayDate)
          const rangeStart = isRangeStart(dayDate)
          const rangeEnd = isRangeEnd(dayDate)

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(dayDate)}
              disabled={isDisabled}
              className={cn(
                "h-8 w-8 rounded-md text-sm font-normal transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                isDisabled && "pointer-events-none opacity-50",
                selected && "bg-primary text-primary-foreground hover:bg-primary/90",
                inRange && !selected && "bg-accent",
                rangeStart && "rounded-r-none",
                rangeEnd && "rounded-l-none",
                inRange && !rangeStart && !rangeEnd && "rounded-none"
              )}
            >
              {format(dayDate, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { Calendar }
