export interface ExplorerItem {
  id: string
  name: string
  type: string
  icon?: string
  metadata?: Record<string, any>
  disabled?: boolean
  status?: string
  badge?: string  // Badge text to display
  badgeColor?: string  // Badge color: 'success', 'error', 'warning', 'info', or any CSS color
  [key: string]: any
}

export interface FetchParams {
  parentId?: string | null
  page: number
  filters: FilterObject
  context: ContextData
}

export interface FetchResult {
  items: ExplorerItem[]
  hasMore: boolean
  totalCount?: number
}

export interface DataProvider {
  fetch: (params: FetchParams) => Promise<FetchResult>
}

export interface SelectionConfig {
  enabled: boolean
  multiple?: boolean
  persistOnNavigate?: boolean
}

export interface ActionHandler {
  key: string
  label: string
  icon?: string
  color?: string
  visible?: (items: ExplorerItem[]) => boolean
  handler: (selectedIds: string[], context: ContextData) => Promise<any>
  requireConfirm?: boolean
  showOnSingleSelect?: boolean  // Show this action when exactly 1 item is selected
  showOnMultipleSelect?: boolean  // Show this action when multiple items are selected
  skipRefresh?: boolean  // Skip column refresh after action execution
}

export type ItemClickType = 'navigate' | 'action' | 'custom'

export interface ItemClickHandler {
  type: ItemClickType
  handler?: (item: ExplorerItem, context: ContextData) => Promise<{
    column?: ColumnObject
    action?: string
    custom?: () => void
  }>
}

export interface ViewConfig {
  itemHeight?: number
  showIcon?: boolean
  showMetadata?: boolean
  emptyMessage?: string
  loadingRows?: number
}

export interface FilterOption {
  key: string
  label: string
  type: 'select' | 'search' | 'date' | 'number'
  options?: any[]
  default?: any
  operator?: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains'
}

export interface SortOption {
  key: string
  label: string
  sortFn: (a: ExplorerItem, b: ExplorerItem) => number
}

export interface ColumnObject {
  id: string
  name: string
  parentColumn?: string
  dataProvider: DataProvider
  selection?: SelectionConfig
  actions?: ActionHandler[]
  itemClick?: ItemClickHandler
  view?: ViewConfig
  filters?: FilterOption[]
  sortOptions?: SortOption[]
}

export interface FilterObject {
  [key: string]: any
}

export interface BreadcrumbItem {
  columnId: string
  columnName: string
  itemId?: string
  itemName?: string
}

export interface ColumnChainItem {
  columnId: string
  selectedItem: ExplorerItem | null
  selectedIds: Set<string>
}

export interface ContextData {
  parentId?: string | null
  parentItem?: ExplorerItem | null
  breadcrumb: BreadcrumbItem[]
  globalFilters: FilterObject
  columnChain: ColumnChainItem[]
  external?: Record<string, any>  // External context from parent app

  getParentData(depth: number): ColumnChainItem | undefined
  getColumnData(columnId: string): ColumnChainItem | undefined
}

export interface ColumnState {
  config: ColumnObject
  items: ExplorerItem[]
  selectedIds: Set<string>
  page: number
  hasMore: boolean
  isLoading: boolean
  error: Error | null
  filters: FilterObject
  currentSort?: string  // Current sort option key
}

export interface ExplorerConfig {
  appearance?: {
    columnWidth?: number
    maxVisibleColumns?: number
    animationDuration?: number
    theme?: 'light' | 'dark' | 'auto'
  }
  behavior?: {
    clickBehavior?: 'single' | 'double'
    selectionPersistence?: boolean
    autoLoadNextPage?: boolean
    scrollBehavior?: 'smooth' | 'instant'
  }
  performance?: {
    itemsPerPage?: number
    virtualScrollThreshold?: number
    maxConcurrentRequests?: number
    requestTimeout?: number
  }
}
