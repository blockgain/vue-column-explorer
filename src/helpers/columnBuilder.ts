import type { ColumnObject, ExplorerItem, FetchParams } from '../types'

export interface SimpleColumnConfig {
  id: string
  name: string
  data?: ExplorerItem[]
  fetchData?: (params: FetchParams) => Promise<ExplorerItem[]> | ExplorerItem[]
  onItemClick?: (item: ExplorerItem, context: any) => ColumnObject | null
  allowMultipleSelection?: boolean
  filters?: Array<{
    key: string
    label: string
    type: 'search' | 'number' | 'select'
    options?: any[]
  }>
  sortOptions?: Array<{
    key: string
    label: string
    sortFn: (a: ExplorerItem, b: ExplorerItem) => number
  }>
  singleActions?: Array<{
    key: string
    label: string
    icon?: string
    color?: string
    skipRefresh?: boolean
    handler: (item: ExplorerItem, context?: any) => void | Promise<void>
  }>
  multipleActions?: Array<{
    key: string
    label: string
    icon?: string
    color?: string
    skipRefresh?: boolean
    handler: (items: ExplorerItem[], context?: any) => void | Promise<void>
  }>
}

export function createColumn(config: SimpleColumnConfig): ColumnObject {
  return {
    id: config.id,
    name: config.name,

    dataProvider: {
      fetch: async (params) => {
        console.log(`[ColumnBuilder-${config.id}] fetch called with params:`, params)
        console.log(`[ColumnBuilder-${config.id}] config.data:`, config.data)
        console.log(`[ColumnBuilder-${config.id}] config.fetchData:`, typeof config.fetchData)

        // If static data is provided, use it directly
        if (config.data) {
          console.log(`[ColumnBuilder-${config.id}] Using static data`)
          return {
            items: Array.isArray(config.data) ? config.data : [],
            hasMore: false
          }
        }

        // Otherwise use fetchData function
        if (config.fetchData) {
          console.log(`[ColumnBuilder-${config.id}] Calling fetchData...`)
          try {
            const items = await config.fetchData(params)
            console.log(`[ColumnBuilder-${config.id}] fetchData returned:`, items)
            return {
              items: Array.isArray(items) ? items : [],
              hasMore: false
            }
          } catch (error) {
            console.error(`[ColumnBuilder-${config.id}] Error in fetchData:`, error)
            throw error
          }
        }

        // No data source provided
        console.warn(`[ColumnBuilder-${config.id}] No data source provided!`)
        return {
          items: [],
          hasMore: false
        }
      }
    },

    selection: {
      enabled: config.allowMultipleSelection !== undefined ||
               !!(config.singleActions && config.singleActions.length > 0) ||
               !!(config.multipleActions && config.multipleActions.length > 0) ||
               !!config.onItemClick,  // Enable selection if item is clickable
      multiple: config.allowMultipleSelection !== undefined ? config.allowMultipleSelection : false
    },

    filters: config.filters?.map(f => ({
      ...f,
      default: undefined
    })),

    sortOptions: config.sortOptions,

    actions: [
      ...(config.singleActions?.map(action => ({
        key: action.key,
        label: action.label,
        icon: action.icon,
        color: action.color,
        skipRefresh: action.skipRefresh,
        showOnSingleSelect: true,
        showOnMultipleSelect: false,
        handler: async (_selectedIds: string[], context: any) => {
          // For single actions, pass the single selected item
          const item = context.selectedItems?.[0]
          if (!item) {
            console.warn(`[ColumnBuilder-${config.id}] No item found for single action: ${action.key}`)
            return
          }
          await action.handler(item, context)
        }
      })) || []),
      ...(config.multipleActions?.map(action => ({
        key: action.key,
        label: action.label,
        icon: action.icon,
        color: action.color,
        skipRefresh: action.skipRefresh,
        showOnSingleSelect: false,
        showOnMultipleSelect: true,
        handler: async (_selectedIds: string[], context: any) => {
          // For multiple actions, pass all selected items
          const items = context.selectedItems || []
          if (items.length === 0) {
            console.warn(`[ColumnBuilder-${config.id}] No items found for multiple action: ${action.key}`)
            return
          }
          await action.handler(items, context)
        }
      })) || [])
    ],

    itemClick: config.onItemClick ? {
      type: 'navigate',
      handler: async (item, context) => {
        const nextColumn = await config.onItemClick!(item, context)
        if (nextColumn) {
          return { column: nextColumn }
        }
        return {}
      }
    } : undefined,

    view: {
      showIcon: true,
      showMetadata: true,
      emptyMessage: `No ${config.name.toLowerCase()} found`
    }
  }
}
