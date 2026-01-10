/**
 * Export utilities for DataTable
 * Provides CSV and Excel export functionality
 */

export interface ExportColumn {
  id: string
  header: string
}

/**
 * Converts data to CSV format and triggers download
 */
export function exportToCSV<TData extends Record<string, unknown>>(
  data: TData[],
  columns: ExportColumn[],
  filename: string = "export"
): void {
  if (data.length === 0) return

  // Create header row
  const headers = columns.map((col) => col.header)
  
  // Create data rows
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col.id]
      // Handle special characters and commas in CSV
      if (value === null || value === undefined) return ""
      const stringValue = String(value)
      // Escape quotes and wrap in quotes if contains comma, newline, or quote
      if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    })
  )

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n")

  // Create and trigger download
  downloadFile(csvContent, `${filename}.csv`, "text/csv;charset=utf-8;")
}

/**
 * Converts data to Excel-compatible format (TSV with .xls extension)
 * For true Excel format, consider using a library like xlsx
 */
export function exportToExcel<TData extends Record<string, unknown>>(
  data: TData[],
  columns: ExportColumn[],
  filename: string = "export"
): void {
  if (data.length === 0) return

  // Create header row
  const headers = columns.map((col) => col.header)
  
  // Create data rows
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col.id]
      if (value === null || value === undefined) return ""
      return String(value)
    })
  )

  // Create tab-separated content (Excel compatible)
  const tsvContent = [
    headers.join("\t"),
    ...rows.map((row) => row.join("\t")),
  ].join("\n")

  // Create and trigger download
  downloadFile(tsvContent, `${filename}.xls`, "application/vnd.ms-excel;charset=utf-8;")
}

/**
 * Helper function to trigger file download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Get visible columns from table for export
 */
export function getExportColumns<TData>(
  columns: { id: string; header: string | (() => React.ReactNode) }[]
): ExportColumn[] {
  return columns
    .filter((col) => col.id !== "select" && col.id !== "actions")
    .map((col) => ({
      id: col.id,
      header: typeof col.header === "string" ? col.header : col.id,
    }))
}
