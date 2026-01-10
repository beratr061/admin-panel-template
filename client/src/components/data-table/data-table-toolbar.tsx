"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { X, Download, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FilterConfig, BulkAction } from "./data-table"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filterConfigs?: FilterConfig[]
  bulkActions?: BulkAction[]
  selectedRowIds: string[]
  enableColumnVisibility?: boolean
  enableExport?: boolean
  onExport?: (format: "csv" | "excel") => void
}

export function DataTableToolbar<TData>({
  table,
  filterConfigs = [],
  bulkActions = [],
  selectedRowIds,
  enableColumnVisibility = false,
  enableExport = false,
  onExport,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const hasSelection = selectedRowIds.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* Text search filters */}
        {filterConfigs
          .filter((config) => config.type === "text")
          .map((config) => (
            <Input
              key={config.id}
              placeholder={`Filter ${config.label}...`}
              value={(table.getColumn(config.id)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(config.id)?.setFilterValue(event.target.value)
              }
              className="h-8 w-[150px] lg:w-[250px]"
            />
          ))}

        {/* Select filters */}
        {filterConfigs
          .filter((config) => config.type === "select" && config.options)
          .map((config) => (
            <Select
              key={config.id}
              value={(table.getColumn(config.id)?.getFilterValue() as string) ?? ""}
              onValueChange={(value) =>
                table.getColumn(config.id)?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue placeholder={config.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {config.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Bulk actions */}
        {hasSelection && bulkActions.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {selectedRowIds.length} selected
            </span>
            {bulkActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant ?? "default"}
                size="sm"
                onClick={() => action.onClick(selectedRowIds)}
                className="h-8"
              >
                {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Export buttons */}
        {enableExport && onExport && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export as</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={false}
                onCheckedChange={() => onExport("csv")}
              >
                CSV
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={false}
                onCheckedChange={() => onExport("excel")}
              >
                Excel
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Column visibility toggle */}
        {enableColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" && column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
