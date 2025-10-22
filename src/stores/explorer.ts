import { defineStore } from 'pinia'
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

export const useExplorerStore = defineStore('explorer', {
  state: (): ExplorerState => ({
    columns: new Map(),
    activeColumnIndex: -1,
    breadcrumb: [],
    globalFilters: {},
    config: {
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
    }
  }),

  getters: {
    visibleColumns(): ColumnState[] {
      const result: ColumnState[] = []
      for (let i = 0; i <= this.activeColumnIndex; i++) {
        const col = this.columns.get(i)
        if (col) result.push(col)
      }
      return result
    },

    currentSelection(): Set<string> {
      const activeCol = this.columns.get(this.activeColumnIndex)
      return activeCol?.selectedIds || new Set()
    },

    canNavigateForward(): boolean {
      const activeCol = this.columns.get(this.activeColumnIndex)
      if (!activeCol) return false
      return activeCol.selectedIds.size > 0
    },

    getContext(): ContextData {
      const columnChain: ColumnChainItem[] = []

      for (let i = 0; i <= this.activeColumnIndex; i++) {
        const col = this.columns.get(i)
        if (col) {
          const selectedId = Array.from(col.selectedIds)[0]
          const selectedItem = selectedId
            ? col.items.find(item => item.id === selectedId) || null
            : null

          columnChain.push({
            columnId: col.config.id,
            selectedItem,
            selectedIds: col.selectedIds
          })
        }
      }

      const parentChainItem = columnChain[columnChain.length - 2]

      return {
        parentId: parentChainItem?.selectedItem?.id || null,
        parentItem: parentChainItem?.selectedItem || null,
        breadcrumb: this.breadcrumb,
        globalFilters: this.globalFilters,
        columnChain,
        getParentData(depth: number) {
          return columnChain[columnChain.length - 1 - depth]
        },
        getColumnData(columnId: string) {
          return columnChain.find(c => c.columnId === columnId)
        }
      }
    }
  },

  actions: {
    setConfig(config: Partial<ExplorerConfig>) {
      this.config = {
        appearance: { ...this.config.appearance, ...config.appearance },
        behavior: { ...this.config.behavior, ...config.behavior },
        performance: { ...this.config.performance, ...config.performance }
      }
    },

    async openColumn(config: ColumnObject, index?: number) {
      const columnIndex = index ?? this.activeColumnIndex + 1

      // Close all columns after this index
      for (let i = this.columns.size - 1; i > columnIndex; i--) {
        this.columns.delete(i)
      }

      // Initialize new column state
      const newState: ColumnState = {
        config,
        items: [],
        selectedIds: new Set(),
        page: 0,
        hasMore: true,
        isLoading: false,
        error: null,
        filters: {}
      }

      this.columns.set(columnIndex, newState)
      this.activeColumnIndex = columnIndex

      // Update breadcrumb
      if (columnIndex === 0) {
        this.breadcrumb = [{
          columnId: config.id,
          columnName: config.name
        }]
      }

      // Load initial data
      await this.loadColumnData(columnIndex)
    },

    async loadColumnData(index: number, page: number = 0) {
      const column = this.columns.get(index)
      if (!column) return

      column.isLoading = true
      column.error = null

      // Clear items on initial load (page 0) to show loading skeleton
      if (page === 0) {
        column.items = []
      }

      try {
        const context = this.getContext
        const result = await column.config.dataProvider.fetch({
          parentId: context.parentId,
          page,
          filters: { ...this.globalFilters, ...column.filters },
          context
        })

        if (page === 0) {
          column.items = result.items
        } else {
          column.items.push(...result.items)
        }

        column.hasMore = result.hasMore
        column.page = page
      } catch (error) {
        column.error = error as Error
        console.error('Error loading column data:', error)
      } finally {
        column.isLoading = false
      }
    },

    async loadNextPage(index: number) {
      const column = this.columns.get(index)
      if (!column || !column.hasMore || column.isLoading) return

      await this.loadColumnData(index, column.page + 1)
    },

    async refreshColumn(index: number) {
      const column = this.columns.get(index)
      if (!column) return

      column.selectedIds.clear()
      column.page = 0  // Reset page to 0
      await this.loadColumnData(index, 0)
    },

    selectItem(columnIndex: number, itemId: string, isMultiple: boolean = false) {
      const column = this.columns.get(columnIndex)
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
    },

    clearSelection(columnIndex: number) {
      const column = this.columns.get(columnIndex)
      if (!column) return
      column.selectedIds.clear()
    },

    async navigateToItem(item: ExplorerItem, columnIndex: number) {
      const column = this.columns.get(columnIndex)
      if (!column || !column.config.itemClick) return

      const context = this.getContext
      const result = await column.config.itemClick.handler?.(item, context)

      if (result?.column) {
        // Trim breadcrumb to current column + 1
        this.breadcrumb = this.breadcrumb.slice(0, columnIndex + 1)

        // Open the new column
        await this.openColumn(result.column, columnIndex + 1)

        // Add new breadcrumb entry with selected ITEM name (not column name)
        this.breadcrumb.push({
          columnId: result.column.id,
          columnName: item.name,  // Show selected item name in breadcrumb
          itemId: item.id,
          itemName: item.name
        })
      } else if (result?.action) {
        const action = column.config.actions?.find(a => a.key === result.action)
        if (action) {
          await this.executeAction(columnIndex, action.key)
        }
      } else if (result?.custom) {
        result.custom()
      }
    },

    async executeAction(columnIndex: number, actionKey: string) {
      const column = this.columns.get(columnIndex)
      if (!column) return

      const action = column.config.actions?.find(a => a.key === actionKey)
      if (!action) return

      const selectedIds = Array.from(column.selectedIds)
      if (selectedIds.length === 0) return

      try {
        const context = this.getContext
        await action.handler(selectedIds, context)

        // Refresh column after action
        await this.refreshColumn(columnIndex)
      } catch (error) {
        console.error('Error executing action:', error)
      }
    },

    navigateToBreadcrumb(index: number) {
      // Close all columns after this breadcrumb index
      for (let i = this.columns.size - 1; i > index; i--) {
        this.columns.delete(i)
      }

      this.activeColumnIndex = index
      this.breadcrumb = this.breadcrumb.slice(0, index + 1)
    },

    setFilter(columnIndex: number, filterKey: string, value: any) {
      const column = this.columns.get(columnIndex)
      if (!column) return

      if (value === null || value === undefined || value === '') {
        delete column.filters[filterKey]
      } else {
        column.filters[filterKey] = value
      }

      // Reload column data with new filter
      this.loadColumnData(columnIndex, 0)
    },

    setGlobalFilter(filterKey: string, value: any) {
      if (value === null || value === undefined || value === '') {
        delete this.globalFilters[filterKey]
      } else {
        this.globalFilters[filterKey] = value
      }

      // Reload all visible columns
      this.visibleColumns.forEach((_, index) => {
        this.loadColumnData(index, 0)
      })
    }
  }
})
