/**
 * LiteTable Plugins
 *
 * All plugins are ZERO DEPENDENCIES - Pure TypeScript/JavaScript
 * Import only what you need to keep bundle size minimal
 */

// Virtual Scrolling - Handle 100k+ rows
export {
  VirtualScrollManager,
  calculateVirtualScroll,
  getVirtualRows,
  estimateRowHeight,
} from './virtual-scroll'
export type {
  VirtualScrollConfig,
  VirtualScrollState,
} from './virtual-scroll'

// Row Selection - Select rows with checkboxes
export { RowSelectionManager } from './row-selection'
export type {
  RowSelectionConfig,
  RowSelectionState,
  SelectionMode,
} from './row-selection'

// Server-Side Operations - AJAX data loading
export { ServerSideManager } from './server-side'
export type {
  ServerSideConfig,
  ServerRequestParams,
  ServerResponse,
  ServerTransformedData,
  ServerSideState,
} from './server-side'

// Export - Export to CSV/JSON/Excel/HTML
export { ExportManager } from './export'
export type { ExportConfig, ExportFormat } from './export'

// Column Resizing - Drag to resize columns
export {
  ColumnResizeManager,
  createResizeHandle,
  measureCellWidth,
} from './column-resize'
export type {
  ColumnResizeConfig,
  ColumnWidthState,
} from './column-resize'
