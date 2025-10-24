import { ref, computed, reactive, markRaw } from 'vue'
import type {
  ColumnObject,
  ColumnState,
  ExplorerItem,
  ContextData,
  BreadcrumbItem,
  ColumnChainItem,
  FilterObject,
  ExplorerConfig
} from '../types'

export interface ExplorerState {
  columns: Map<number, ColumnState>
  activeColumnIndex: number
  breadcrumb: BreadcrumbItem[]
  globalFilters: FilterObject
  config: ExplorerConfig
}

export function useExplorer(externalContext?: Record<string, any>) {
  // State
  const columns = reactive(new Map<number, ColumnState>())
  const activeColumnIndex = ref(-1)
  const breadcrumb = ref<BreadcrumbItem[]>([])
  const globalFilters = ref<FilterObject>({})
  const config = ref<ExplorerConfig>({
    appearance: {
      columnWidth: 300,
      maxVisibleColumns: 4,
      animationDuration: 200,
      theme: 'light'
    },
    behavior: {
      clickBehavior: 'single',
      selectionPersistence: false,
      autoLoadNextPage: true,
      scrollBehavior: 'smooth'
    },
    performance: {
      itemsPerPage: 50,
      virtualScrollThreshold: 100,
      maxConcurrentRequests: 2,
      requestTimeout: 10000
    }
  })

  // Getters (computed)
  const visibleColumns = computed((): ColumnState[] => {
    const cols: ColumnState[] = []
    for (let i = 0; i <= activeColumnIndex.value; i++) {
      const col = columns.get(i)
      if (col) cols.push(col)
    }
    return cols
  })

  const currentSelection = computed((): Set<string> => {
    const column = columns.get(activeColumnIndex.value)
    return column?.selectedIds || new Set()
  })

  const canNavigateForward = computed((): boolean => {
    const column = columns.get(activeColumnIndex.value)
    return !!(column && column.selectedIds.size > 0)
  })

  const getContext = computed((): ContextData => {
    const columnChain: ColumnChainItem[] = []

    for (let i = 0; i <= activeColumnIndex.value; i++) {
      const col = columns.get(i)
      if (col) {
        const selectedItem = col.items.find(item =>
          col.selectedIds.has(item.id)
        )
        columnChain.push({
          columnId: col.config.id,
          selectedItem: selectedItem || null,
          selectedIds: new Set(col.selectedIds)
        })
      }
    }

    const parentColumn = activeColumnIndex.value > 0
      ? columns.get(activeColumnIndex.value - 1)
      : null
    const parentItem = parentColumn
      ? parentColumn.items.find(item => parentColumn.selectedIds.has(item.id))
      : null

    return {
      parentId: parentItem?.id || null,
      parentItem: parentItem || null,
      breadcrumb: breadcrumb.value,
      globalFilters: globalFilters.value,
      columnChain,
      external: externalContext,  // Include external context
      getParentData(depth: number) {
        const index = activeColumnIndex.value - depth
        return columnChain[index]
      },
      getColumnData(columnId: string) {
        return columnChain.find(c => c.columnId === columnId)
      }
    }
  })

  // Actions
  function setConfig(newConfig: Partial<ExplorerConfig>) {
    config.value = {
      appearance: { ...config.value.appearance, ...newConfig.appearance },
      behavior: { ...config.value.behavior, ...newConfig.behavior },
      performance: { ...config.value.performance, ...newConfig.performance }
    }
  }

  async function openColumn(columnConfig: ColumnObject, index?: number) {
    const columnIndex = index ?? activeColumnIndex.value + 1

    // Close all columns after this index
    for (let i = columns.size - 1; i > columnIndex; i--) {
      columns.delete(i)
    }

    // Initialize new column state
    // Use markRaw to prevent Vue from making the config reactive
    // This preserves functions like dataProvider.fetch
    const newState: ColumnState = {
      config: markRaw(columnConfig),
      items: [],
      selectedIds: new Set(),
      page: 0,
      hasMore: true,
      isLoading: false,
      error: null,
      filters: {}
    }

    columns.set(columnIndex, newState)
    activeColumnIndex.value = columnIndex

    // Update breadcrumb
    if (columnIndex === 0) {
      breadcrumb.value = [{
        columnId: columnConfig.id,
        columnName: columnConfig.name
      }]
    }

    // Load initial data
    await loadColumnData(columnIndex)
  }

  async function loadColumnData(index: number, page: number = 0) {
    const column = columns.get(index)
    if (!column) return

    column.isLoading = true
    column.error = null

    // Clear items on initial load (page 0) to show loading skeleton
    if (page === 0) {
      column.items = []
    }

    try {
      const context = getContext.value
      const result = await column.config.dataProvider.fetch({
        parentId: context.parentId,
        page,
        filters: { ...globalFilters.value, ...column.filters },
        context
      })

      let items = result.items

      // Apply sorting if a sort option is selected
      if (column.currentSort && column.config.sortOptions) {
        const sortOption = column.config.sortOptions.find(s => s.key === column.currentSort)
        if (sortOption) {
          items = [...items].sort(sortOption.sortFn)
        }
      }

      if (page === 0) {
        column.items = items
      } else {
        column.items.push(...items)
      }

      column.hasMore = result.hasMore
      column.page = page
    } catch (error) {
      column.error = error as Error
      console.error('Error loading column data:', error)
    } finally {
      column.isLoading = false
    }
  }

  async function loadNextPage(index: number) {
    const column = columns.get(index)
    if (!column || !column.hasMore || column.isLoading) return

    await loadColumnData(index, column.page + 1)
  }

  async function refreshColumn(index: number) {
    const column = columns.get(index)
    if (!column) return

    column.selectedIds.clear()
    column.page = 0
    await loadColumnData(index, 0)
  }

  function selectItem(columnIndex: number, itemId: string, isMultiple: boolean = false) {
    const column = columns.get(columnIndex)
    if (!column || !column.config.selection?.enabled) return

    if (isMultiple && column.config.selection.multiple) {
      if (column.selectedIds.has(itemId)) {
        column.selectedIds.delete(itemId)
      } else {
        column.selectedIds.add(itemId)
      }
    } else {
      column.selectedIds.clear()
      column.selectedIds.add(itemId)
    }
  }

  function clearSelection(columnIndex: number) {
    const column = columns.get(columnIndex)
    if (!column) return
    column.selectedIds.clear()
  }

  async function navigateToItem(item: ExplorerItem, columnIndex: number) {
    const column = columns.get(columnIndex)
    if (!column || !column.config.itemClick) return

    const context = getContext.value
    const result = await column.config.itemClick.handler?.(item, context)

    if (result?.column) {
      // Trim breadcrumb to current column + 1
      breadcrumb.value = breadcrumb.value.slice(0, columnIndex + 1)

      // Open the new column - use markRaw to ensure functions are preserved
      await openColumn(markRaw(result.column), columnIndex + 1)

      // Add new breadcrumb entry with selected ITEM name (not column name)
      breadcrumb.value.push({
        columnId: result.column.id,
        columnName: item.name,
        itemId: item.id,
        itemName: item.name
      })
    } else if (result?.action) {
      const action = column.config.actions?.find(a => a.key === result.action)
      if (action) {
        await executeAction(columnIndex, action.key)
      }
    } else if (result?.custom) {
      result.custom()
    }
  }

  async function executeAction(columnIndex: number, actionKey: string) {
    const column = columns.get(columnIndex)
    if (!column) return

    const action = column.config.actions?.find(a => a.key === actionKey)
    if (!action) return

    const selectedIds = Array.from(column.selectedIds)
    if (selectedIds.length === 0) return

    try {
      const context = getContext.value
      await action.handler(selectedIds, context)

      // Refresh column after action (unless skipRefresh is true)
      console.log('[executeAction] skipRefresh:', action.skipRefresh, 'actionKey:', actionKey)
      if (!action.skipRefresh) {
        console.log('[executeAction] Refreshing column', columnIndex)
        await refreshColumn(columnIndex)
      } else {
        console.log('[executeAction] Skipping refresh for column', columnIndex)
      }
    } catch (error) {
      console.error('Error executing action:', error)
    }
  }

  function navigateToBreadcrumb(index: number) {
    // Close all columns after this breadcrumb index
    for (let i = columns.size - 1; i > index; i--) {
      columns.delete(i)
    }

    activeColumnIndex.value = index
    breadcrumb.value = breadcrumb.value.slice(0, index + 1)
  }

  function setFilter(columnIndex: number, filterKey: string, value: any) {
    const column = columns.get(columnIndex)
    if (!column) return

    if (value === null || value === undefined || value === '') {
      delete column.filters[filterKey]
    } else {
      column.filters[filterKey] = value
    }

    // Reload column data with new filter
    loadColumnData(columnIndex, 0)
  }

  function setSort(columnIndex: number, sortKey: string) {
    const column = columns.get(columnIndex)
    if (!column) return

    if (sortKey === null || sortKey === undefined || sortKey === '') {
      column.currentSort = undefined
    } else {
      column.currentSort = sortKey
    }

    // Reload column data with new sort
    loadColumnData(columnIndex, 0)
  }

  return {
    // State
    columns,
    activeColumnIndex,
    breadcrumb,
    globalFilters,
    config,

    // Getters
    visibleColumns,
    currentSelection,
    canNavigateForward,
    getContext,

    // Actions
    setConfig,
    openColumn,
    loadColumnData,
    loadNextPage,
    refreshColumn,
    selectItem,
    clearSelection,
    navigateToItem,
    executeAction,
    navigateToBreadcrumb,
    setFilter,
    setSort
  }
}
