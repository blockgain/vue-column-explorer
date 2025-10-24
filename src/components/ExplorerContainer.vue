<template>
  <div class="explorer-container">
    <ExplorerBreadcrumb
      v-if="breadcrumb.length > 0"
      :breadcrumb="breadcrumb"
      @navigate="handleBreadcrumbNavigate"
    />

    <div class="explorer-viewport">
      <ExplorerColumn
        v-for="(column, index) in visibleColumns"
        :key="index"
        :column-state="column"
        :index="index"
        :is-active="index === activeColumnIndex"
        @item-click="handleItemClick"
        @item-select="handleItemSelect"
        @context-menu="handleContextMenu"
        @refresh="handleRefresh"
        @load-more="handleLoadMore"
        @action="handleAction"
        @filter-change="handleFilterChange"
        @sort-change="handleSortChange"
      />
    </div>

    <ExplorerContextMenu
      :visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :actions="contextMenu.actions"
      @close="handleContextMenuClose"
      @action="handleContextMenuAction"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useExplorer } from '../composables/useExplorer'
import ExplorerBreadcrumb from './ExplorerBreadcrumb.vue'
import ExplorerColumn from './ExplorerColumn.vue'
import ExplorerContextMenu from './ExplorerContextMenu.vue'
import type { ExplorerItem, ColumnObject, ActionHandler } from '../types'

interface Props {
  rootColumn?: ColumnObject
  context?: Record<string, any>
}

const props = defineProps<Props>()
const store = useExplorer(props.context)

// Destructure for template access
const {
  breadcrumb,
  visibleColumns,
  activeColumnIndex,
  openColumn,
  selectItem,
  navigateToItem,
  navigateToBreadcrumb,
  refreshColumn,
  loadNextPage,
  executeAction,
  setFilter,
  setSort
} = store

const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  actions: [] as ActionHandler[],
  targetItem: null as ExplorerItem | null,
  targetColumnIndex: -1
})

// Initialize root column if provided
if (props.rootColumn) {
  openColumn(props.rootColumn, 0)
}

const handleItemClick = async (item: ExplorerItem, columnIndex: number) => {
  // Select the item first
  selectItem(columnIndex, item.id, false)

  // Then navigate if configured
  const column = store.columns.get(columnIndex)
  if (column?.config.itemClick) {
    await navigateToItem(item, columnIndex)
  }
}

const handleItemSelect = (item: ExplorerItem, columnIndex: number, isMultiple: boolean) => {
  selectItem(columnIndex, item.id, isMultiple)
}

const handleContextMenu = (item: ExplorerItem, columnIndex: number, event: MouseEvent) => {
  const column = store.columns.get(columnIndex)
  if (!column?.config.actions || column.config.actions.length === 0) return

  // Select the item if not already selected
  if (!column.selectedIds.has(item.id)) {
    selectItem(columnIndex, item.id, false)
  }

  // Filter actions based on selection count
  const selectedCount = column.selectedIds.size
  const filteredActions = column.config.actions.filter(action => {
    // If single item selected
    if (selectedCount === 1) {
      // Show only single select actions (or actions that work for both)
      if (action.showOnSingleSelect !== undefined && !action.showOnSingleSelect) return false
      if (action.showOnMultipleSelect === true && action.showOnSingleSelect !== undefined && !action.showOnSingleSelect) return false
    }
    // If multiple items selected
    else if (selectedCount > 1) {
      // Show only multiple select actions (or actions that work for both)
      if (action.showOnMultipleSelect !== undefined && !action.showOnMultipleSelect) return false
      if (action.showOnSingleSelect === true && action.showOnMultipleSelect !== undefined && !action.showOnMultipleSelect) return false
    }

    // Check custom visible function
    const selectedItems = column.items.filter(i => column.selectedIds.has(i.id))
    if (action.visible && !action.visible(selectedItems)) return false

    return true
  })

  if (filteredActions.length === 0) return

  contextMenu.visible = true
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.actions = filteredActions
  contextMenu.targetItem = item
  contextMenu.targetColumnIndex = columnIndex
}

const handleContextMenuClose = () => {
  contextMenu.visible = false
}

const handleContextMenuAction = async (actionKey: string) => {
  if (contextMenu.targetColumnIndex >= 0) {
    await executeAction(contextMenu.targetColumnIndex, actionKey)
  }
}

const handleBreadcrumbNavigate = (index: number) => {
  navigateToBreadcrumb(index)
}

const handleRefresh = async (columnIndex: number) => {
  await refreshColumn(columnIndex)
}

const handleLoadMore = async (columnIndex: number) => {
  await loadNextPage(columnIndex)
}

const handleAction = async (actionKey: string, columnIndex: number) => {
  await executeAction(columnIndex, actionKey)
}

const handleFilterChange = (filterKey: string, value: any, columnIndex: number) => {
  setFilter(columnIndex, filterKey, value)
}

const handleSortChange = (sortKey: string, columnIndex: number) => {
  setSort(columnIndex, sortKey)
}

// Expose store for programmatic access
defineExpose({
  store,
  openColumn: (column: ColumnObject) => openColumn(column),
  refresh: () => refreshColumn(activeColumnIndex.value)
})
</script>

<style scoped>
.explorer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.explorer-viewport {
  display: flex;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
}

.explorer-viewport::-webkit-scrollbar {
  height: 8px;
}

.explorer-viewport::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.explorer-viewport::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.explorer-viewport::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
