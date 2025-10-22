<template>
  <div class="explorer-container">
    <ExplorerBreadcrumb
      v-if="store.breadcrumb.length > 0"
      :breadcrumb="store.breadcrumb"
      @navigate="handleBreadcrumbNavigate"
    />

    <div class="explorer-viewport">
      <ExplorerColumn
        v-for="(column, index) in store.visibleColumns"
        :key="index"
        :column-state="column"
        :index="index"
        :is-active="index === store.activeColumnIndex"
        @item-click="handleItemClick"
        @item-select="handleItemSelect"
        @context-menu="handleContextMenu"
        @refresh="handleRefresh"
        @load-more="handleLoadMore"
        @action="handleAction"
        @filter-change="handleFilterChange"
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
import { useExplorerStore } from '../stores/explorer'
import ExplorerBreadcrumb from './ExplorerBreadcrumb.vue'
import ExplorerColumn from './ExplorerColumn.vue'
import ExplorerContextMenu from './ExplorerContextMenu.vue'
import type { ExplorerItem, ColumnObject, ActionHandler } from '../types'

interface Props {
  rootColumn?: ColumnObject
}

const props = defineProps<Props>()
const store = useExplorerStore()

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
  store.openColumn(props.rootColumn, 0)
}

const handleItemClick = async (item: ExplorerItem, columnIndex: number) => {
  // Select the item first
  store.selectItem(columnIndex, item.id, false)

  // Then navigate if configured
  const column = store.columns.get(columnIndex)
  if (column?.config.itemClick) {
    await store.navigateToItem(item, columnIndex)
  }
}

const handleItemSelect = (item: ExplorerItem, columnIndex: number, isMultiple: boolean) => {
  store.selectItem(columnIndex, item.id, isMultiple)
}

const handleContextMenu = (item: ExplorerItem, columnIndex: number, event: MouseEvent) => {
  const column = store.columns.get(columnIndex)
  if (!column?.config.actions || column.config.actions.length === 0) return

  // Select the item if not already selected
  if (!column.selectedIds.has(item.id)) {
    store.selectItem(columnIndex, item.id, false)
  }

  contextMenu.visible = true
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.actions = column.config.actions
  contextMenu.targetItem = item
  contextMenu.targetColumnIndex = columnIndex
}

const handleContextMenuClose = () => {
  contextMenu.visible = false
}

const handleContextMenuAction = async (actionKey: string) => {
  if (contextMenu.targetColumnIndex >= 0) {
    await store.executeAction(contextMenu.targetColumnIndex, actionKey)
  }
}

const handleBreadcrumbNavigate = (index: number) => {
  store.navigateToBreadcrumb(index)
}

const handleRefresh = async (columnIndex: number) => {
  await store.refreshColumn(columnIndex)
}

const handleLoadMore = async (columnIndex: number) => {
  await store.loadNextPage(columnIndex)
}

const handleAction = async (actionKey: string, columnIndex: number) => {
  await store.executeAction(columnIndex, actionKey)
}

const handleFilterChange = (filterKey: string, value: any, columnIndex: number) => {
  store.setFilter(columnIndex, filterKey, value)
}

// Expose store for programmatic access
defineExpose({
  store,
  openColumn: (column: ColumnObject) => store.openColumn(column),
  refresh: () => store.refreshColumn(store.activeColumnIndex)
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
