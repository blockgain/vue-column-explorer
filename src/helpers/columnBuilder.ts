import type { ColumnObject, ExplorerItem, FetchParams } from '../types'

export interface SimpleColumnConfig {
  id: string
  name: string
  fetchData: (params: FetchParams) => Promise<ExplorerItem[]> | ExplorerItem[]
  onItemClick?: (item: ExplorerItem, context: any) => ColumnObject | null
  allowMultipleSelection?: boolean
  filters?: Array<{
    key: string
    label: string
    type: 'search' | 'number' | 'select'
    options?: any[]
  }>
  singleActions?: Array<{
    key: string
    label: string
    icon?: string
    color?: string
    handler: (selectedIds: string[]) => void | Promise<void>
  }>
  multipleActions?: Array<{
    key: string
    label: string
    icon?: string
    color?: string
    handler: (selectedIds: string[]) => void | Promise<void>
  }>
}

export function createColumn(config: SimpleColumnConfig): ColumnObject {
  return {
    id: config.id,
    name: config.name,

    dataProvider: {
      fetch: async (params) => {
        const items = await config.fetchData(params)
        return {
          items: Array.isArray(items) ? items : [],
          hasMore: false
        }
      }
    },

    selection: {
      enabled: config.allowMultipleSelection !== undefined ||
               !!(config.singleActions && config.singleActions.length > 0) ||
               !!(config.multipleActions && config.multipleActions.length > 0),
      multiple: config.allowMultipleSelection !== undefined ? config.allowMultipleSelection : false
    },

    filters: config.filters?.map(f => ({
      ...f,
      default: undefined
    })),

    actions: [
      ...(config.singleActions?.map(action => ({
        key: action.key,
        label: action.label,
        icon: action.icon,
        color: action.color,
        showOnSingleSelect: true,
        showOnMultipleSelect: false,
        handler: async (selectedIds: string[], _context: any) => {
          await action.handler(selectedIds)
        }
      })) || []),
      ...(config.multipleActions?.map(action => ({
        key: action.key,
        label: action.label,
        icon: action.icon,
        color: action.color,
        showOnSingleSelect: false,
        showOnMultipleSelect: true,
        handler: async (selectedIds: string[], _context: any) => {
          await action.handler(selectedIds)
        }
      })) || [])
    ],

    itemClick: config.onItemClick ? {
      type: 'navigate',
      handler: async (item, context) => {
        const nextColumn = config.onItemClick!(item, context)
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
