/**
 * Export Plugin
 *
 * Export table data to various formats:
 * - CSV
 * - JSON
 * - Excel (XLSX) via pure JS (no dependencies!)
 * - HTML
 *
 * ZERO DEPENDENCIES - Pure JavaScript implementation
 */

import type { Column } from '../types'

export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'html'

export interface ExportConfig {
  /** Filename (without extension) */
  filename?: string

  /** Include headers in export */
  includeHeaders?: boolean

  /** Columns to export (default: all visible) */
  columns?: string[]

  /** Custom delimiter for CSV */
  delimiter?: string

  /** Format dates in export */
  dateFormat?: (date: Date) => string
}

/**
 * Export Manager
 * ZERO DEPENDENCIES - Pure JavaScript
 */
export class ExportManager<TData = unknown> {
  private data: TData[]
  private columns: Column<TData>[]

  constructor(data: TData[], columns: Column<TData>[]) {
    this.data = data
    this.columns = columns
  }

  /**
   * Export to CSV
   *
   * @performance O(n * m) where n = rows, m = columns
   */
  exportCSV(config: ExportConfig = {}): void {
    const {
      filename = 'export',
      includeHeaders = true,
      columns: columnIds,
      delimiter = ',',
    } = config

    const exportColumns = this.getExportColumns(columnIds)
    const rows: string[] = []

    // Add headers
    if (includeHeaders) {
      const headers = exportColumns.map(col => this.escapeCSV(col.header))
      rows.push(headers.join(delimiter))
    }

    // Add data rows
    this.data.forEach(row => {
      const values = exportColumns.map(col => {
        const value = this.getCellValue(row, col)
        return this.escapeCSV(this.formatValue(value, config))
      })
      rows.push(values.join(delimiter))
    })

    // Download
    const csv = rows.join('\n')
    this.download(csv, `${filename}.csv`, 'text/csv;charset=utf-8;')
  }

  /**
   * Export to JSON
   *
   * @performance O(n * m)
   */
  exportJSON(config: ExportConfig = {}): void {
    const { filename = 'export', columns: columnIds } = config

    const exportColumns = this.getExportColumns(columnIds)

    const json = this.data.map(row => {
      const obj: Record<string, unknown> = {}
      exportColumns.forEach(col => {
        obj[col.id] = this.getCellValue(row, col)
      })
      return obj
    })

    const jsonString = JSON.stringify(json, null, 2)
    this.download(
      jsonString,
      `${filename}.json`,
      'application/json;charset=utf-8;'
    )
  }

  /**
   * Export to Excel (XLSX)
   * Simple XLSX implementation without dependencies
   *
   * @performance O(n * m)
   */
  exportXLSX(config: ExportConfig = {}): void {
    const {
      filename = 'export',
      includeHeaders = true,
      columns: columnIds,
    } = config

    const exportColumns = this.getExportColumns(columnIds)

    // Build XML for Excel
    const rows: string[] = []

    // Add headers
    if (includeHeaders) {
      const headerCells = exportColumns
        .map(col => `<Cell><Data ss:Type="String">${this.escapeXML(col.header)}</Data></Cell>`)
        .join('')
      rows.push(`<Row>${headerCells}</Row>`)
    }

    // Add data rows
    this.data.forEach(row => {
      const cells = exportColumns
        .map(col => {
          const value = this.getCellValue(row, col)
          const type = typeof value === 'number' ? 'Number' : 'String'
          const formattedValue = this.formatValue(value, config)
          return `<Cell><Data ss:Type="${type}">${this.escapeXML(String(formattedValue))}</Data></Cell>`
        })
        .join('')
      rows.push(`<Row>${cells}</Row>`)
    })

    // Build Excel XML
    const xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Sheet1">
    <Table>
      ${rows.join('\n      ')}
    </Table>
  </Worksheet>
</Workbook>`

    this.download(xml, `${filename}.xls`, 'application/vnd.ms-excel')
  }

  /**
   * Export to HTML table
   *
   * @performance O(n * m)
   */
  exportHTML(config: ExportConfig = {}): void {
    const {
      filename = 'export',
      includeHeaders = true,
      columns: columnIds,
    } = config

    const exportColumns = this.getExportColumns(columnIds)

    let html = '<table border="1" cellpadding="5" cellspacing="0">\n'

    // Add headers
    if (includeHeaders) {
      html += '  <thead>\n    <tr>\n'
      exportColumns.forEach(col => {
        html += `      <th>${this.escapeHTML(col.header)}</th>\n`
      })
      html += '    </tr>\n  </thead>\n'
    }

    // Add data rows
    html += '  <tbody>\n'
    this.data.forEach(row => {
      html += '    <tr>\n'
      exportColumns.forEach(col => {
        const value = this.getCellValue(row, col)
        const formattedValue = this.formatValue(value, config)
        html += `      <td>${this.escapeHTML(String(formattedValue))}</td>\n`
      })
      html += '    </tr>\n'
    })
    html += '  </tbody>\n</table>'

    this.download(html, `${filename}.html`, 'text/html;charset=utf-8;')
  }

  /**
   * Main export method
   */
  export(format: ExportFormat, config: ExportConfig = {}): void {
    switch (format) {
      case 'csv':
        this.exportCSV(config)
        break
      case 'json':
        this.exportJSON(config)
        break
      case 'xlsx':
        this.exportXLSX(config)
        break
      case 'html':
        this.exportHTML(config)
        break
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  private getExportColumns(columnIds?: string[]): Column<TData>[] {
    if (columnIds) {
      return this.columns.filter(col => columnIds.includes(col.id))
    }
    return this.columns
  }

  private getCellValue(row: TData, column: Column<TData>): unknown {
    if (column.accessor) {
      return column.accessor(row)
    }
    return (row as Record<string, unknown>)[column.id]
  }

  private formatValue(value: unknown, config: ExportConfig): string {
    if (value == null) return ''

    // Format dates
    if (value instanceof Date) {
      return config.dateFormat
        ? config.dateFormat(value)
        : value.toISOString()
    }

    return String(value)
  }

  private escapeCSV(value: string): string {
    // Escape quotes and wrap in quotes if needed
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  private escapeHTML(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  private escapeXML(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  /**
   * Download file to browser
   * Pure JavaScript, no dependencies
   */
  private download(content: string, filename: string, mimeType: string): void {
    // Create blob
    const blob = new Blob([content], { type: mimeType })

    // Create download link
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  /**
   * Update data (when table data changes)
   */
  updateData(data: TData[], columns: Column<TData>[]): void {
    this.data = data
    this.columns = columns
  }
}
