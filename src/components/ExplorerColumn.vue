<template>
  <div class="explorer-column" :class="{ 'explorer-column--active': isActive }">
    <div class="explorer-column__header">
      <h3 class="explorer-column__title">{{ columnState.config.name }}</h3>
      <div class="explorer-column__actions">
        <button
          v-if="hasFilters || hasSortOptions"
          class="explorer-column__filter-btn"
          @click="toggleFilters"
          :class="{ 'active': showFilters }"
        >
          <Filter :size="16" />
        </button>
        <button class="explorer-column__refresh-btn" @click="handleRefresh">
          <RefreshCw :size="16" />
        </button>
      </div>
    </div>

    <div v-if="showFilters && (hasFilters || hasSortOptions)" class="explorer-column__filters">
      <div v-if="hasSortOptions" class="filter-item">
        <label class="filter-item__label">Sıralama</label>
        <select
          class="filter-item__select"
          :value="columnState.currentSort || ''"
          @change="handleSortChange(($event.target as HTMLSelectElement).value)"
        >
          <option value="">Varsayılan</option>
          <option
            v-for="sortOption in columnState.config.sortOptions"
            :key="sortOption.key"
            :value="sortOption.key"
          >
            {{ sortOption.label }}
          </option>
        </select>
      </div>

      <div
        v-for="filter in columnState.config.filters"
        :key="filter.key"
        class="filter-item"
      >
        <label class="filter-item__label">{{ filter.label }}</label>
        <input
          v-if="filter.type === 'search'"
          type="text"
          class="filter-item__input"
          :placeholder="`Search ${filter.label.toLowerCase()}...`"
          :value="columnState.filters[filter.key] || ''"
          @input="handleFilterChange(filter.key, ($event.target as HTMLInputElement).value)"
        />
        <input
          v-else-if="filter.type === 'number'"
          type="number"
          class="filter-item__input"
          :placeholder="filter.label"
          :value="columnState.filters[filter.key] || ''"
          @input="handleFilterChange(filter.key, ($event.target as HTMLInputElement).value)"
        />
        <select
          v-else-if="filter.type === 'select'"
          class="filter-item__select"
          :value="columnState.filters[filter.key] || ''"
          @change="handleFilterChange(filter.key, ($event.target as HTMLSelectElement).value)"
        >
          <option value="">All</option>
          <option
            v-for="option in filter.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <div
      ref="scrollContainer"
      class="explorer-column__content"
      @scroll="handleScroll"
    >
      <div v-if="showLoadingSkeleton" class="explorer-column__loading">
        <div v-for="i in loadingRows" :key="i" class="skeleton-item">
          <div class="skeleton-item__icon"></div>
          <div class="skeleton-item__content">
            <div class="skeleton-item__name"></div>
            <div class="skeleton-item__metadata"></div>
          </div>
          <div class="skeleton-item__chevron"></div>
        </div>
      </div>

      <div v-else-if="columnState.error" class="explorer-column__error">
        <p>Error loading data</p>
        <p class="error-message" v-if="columnState.error.message">{{ columnState.error.message }}</p>
        <button @click="handleRefresh">Retry</button>
      </div>

      <div v-else-if="columnState.items.length === 0 && !columnState.isLoading" class="explorer-column__empty">
        {{ emptyMessage }}
      </div>

      <div v-else-if="columnState.items.length > 0" class="explorer-column__items">
        <ExplorerItem
          v-for="item in columnState.items"
          :key="item.id"
          :item="item"
          :selected="columnState.selectedIds.has(item.id)"
          :selectable="columnState.config.selection?.multiple ?? false"
          :clickable="true"
          :show-icon="columnState.config.view?.showIcon ?? true"
          :show-metadata="columnState.config.view?.showMetadata ?? true"
          @click="(item, event) => handleItemClick(item, event)"
          @select="(item, isMultiple) => handleItemSelect(item, isMultiple)"
          @contextmenu="(item, event) => handleContextMenu(item, event)"
        />

        <div
          v-if="columnState.isLoading && columnState.items.length > 0"
          class="explorer-column__loading-more"
        >
          Loading more...
        </div>
      </div>
    </div>

    <div v-if="hasSelection" class="explorer-column__footer">
      <div class="explorer-column__selection-info">
        {{ columnState.selectedIds.size }} selected
      </div>
      <div class="explorer-column__quick-actions">
        <button
          v-for="action in visibleActions"
          :key="action.key"
          class="action-btn"
          :class="`action-btn--${action.color || 'default'}`"
          @click="handleAction(action.key)"
        >
          <component v-if="action.icon" :is="getIcon(action.icon)" :size="14" />
          {{ action.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Filter, RefreshCw, Trash, Download, Edit, Mail } from 'lucide-vue-next'
import ExplorerItem from './ExplorerItem.vue'
import type { ColumnState, ExplorerItem as Item } from '../types'

interface Props {
  columnState: ColumnState
  index: number
  isActive: boolean
}

interface Emits {
  (e: 'item-click', item: Item, columnIndex: number): void
  (e: 'item-select', item: Item, columnIndex: number, isMultiple: boolean): void
  (e: 'context-menu', item: Item, columnIndex: number, event: MouseEvent): void
  (e: 'refresh', columnIndex: number): void
  (e: 'load-more', columnIndex: number): void
  (e: 'action', actionKey: string, columnIndex: number): void
  (e: 'filter-change', filterKey: string, value: any, columnIndex: number): void
  (e: 'sort-change', sortKey: string, columnIndex: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const scrollContainer = ref<HTMLElement | null>(null)
const showFilters = ref(false)

const hasFilters = computed(() => {
  return props.columnState.config.filters && props.columnState.config.filters.length > 0
})

const hasSortOptions = computed(() => {
  return props.columnState.config.sortOptions && props.columnState.config.sortOptions.length > 0
})

const hasSelection = computed(() => {
  return props.columnState.selectedIds.size > 0
})

const loadingRows = computed(() => {
  return props.columnState.config.view?.loadingRows || 10
})

const emptyMessage = computed(() => {
  return props.columnState.config.view?.emptyMessage || 'No items found'
})

const showLoadingSkeleton = computed(() => {
  // Show skeleton when loading AND no items (initial load or refresh)
  return props.columnState.isLoading && props.columnState.items.length === 0
})

const visibleActions = computed(() => {
  if (!props.columnState.config.actions) return []

  const selectedItems = props.columnState.items.filter(item =>
    props.columnState.selectedIds.has(item.id)
  )
  const selectedCount = selectedItems.length

  return props.columnState.config.actions.filter(action => {
    // Check single/multiple selection visibility
    if (selectedCount === 1 && action.showOnSingleSelect === false) return false
    if (selectedCount > 1 && action.showOnMultipleSelect === false) return false
    if (selectedCount === 1 && action.showOnMultipleSelect === true && action.showOnSingleSelect === false) return false
    if (selectedCount > 1 && action.showOnSingleSelect === true && action.showOnMultipleSelect === false) return false

    // Check custom visible function
    if (!action.visible) return true
    return action.visible(selectedItems)
  })
})

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const handleItemClick = (item: Item, _event: MouseEvent) => {
  emit('item-click', item, props.index)
}

const handleItemSelect = (item: Item, isMultiple: boolean) => {
  emit('item-select', item, props.index, isMultiple)
}

const handleContextMenu = (item: Item, event: MouseEvent) => {
  emit('context-menu', item, props.index, event)
}

const handleRefresh = () => {
  emit('refresh', props.index)
}

const handleScroll = () => {
  if (!scrollContainer.value) return

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
  const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100

  if (isNearBottom && props.columnState.hasMore && !props.columnState.isLoading) {
    emit('load-more', props.index)
  }
}

const handleAction = (actionKey: string) => {
  emit('action', actionKey, props.index)
}

const handleFilterChange = (filterKey: string, value: any) => {
  emit('filter-change', filterKey, value, props.index)
}

const handleSortChange = (sortKey: string) => {
  emit('sort-change', sortKey, props.index)
}

const getIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    'lucide:trash': Trash,
    'lucide:download': Download,
    'lucide:edit': Edit,
    'lucide:mail': Mail
  }
  return iconMap[iconName] || null
}
</script>

<style scoped>
.explorer-column {
  display: flex;
  flex-direction: column;
  width: 300px;
  min-width: 300px;
  height: 100%;
  background: white;
  border-right: 1px solid #e5e7eb;
  overflow: hidden;
}

/* Active column border removed */
.explorer-column--active {
  /* box-shadow: inset 0 0 0 2px #3b82f6; */
}

.explorer-column__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.explorer-column__title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.explorer-column__actions {
  display: flex;
  gap: 8px;
}

.explorer-column__filter-btn,
.explorer-column__refresh-btn {
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  color: #6b7280;
  display: flex;
  align-items: center;
  transition: all 0.15s ease;
}

.explorer-column__filter-btn:hover,
.explorer-column__refresh-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.explorer-column__filter-btn.active {
  background: #3b82f6;
  color: white;
}

.explorer-column__filters {
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.filter-item {
  margin-bottom: 8px;
}

.filter-item:last-child {
  margin-bottom: 0;
}

.filter-item__label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.filter-item__input,
.filter-item__select {
  width: 100%;
  padding: 6px 8px;
  font-size: 13px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.15s ease;
}

.filter-item__input:focus,
.filter-item__select:focus {
  border-color: #3b82f6;
}

.explorer-column__content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.explorer-column__loading {
  padding: 0;
}

.explorer-column__error,
.explorer-column__empty {
  padding: 20px;
  text-align: center;
  color: #6b7280;
}

.skeleton-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
}

.skeleton-item__icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  flex-shrink: 0;
}

.skeleton-item__content {
  flex: 1;
  min-width: 0;
}

.skeleton-item__name {
  height: 14px;
  width: 70%;
  border-radius: 4px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  margin-bottom: 4px;
}

.skeleton-item__metadata {
  height: 12px;
  width: 50%;
  border-radius: 4px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-item__chevron {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  flex-shrink: 0;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.explorer-column__error button {
  margin-top: 10px;
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.explorer-column__items {
  min-height: 100%;
}

.explorer-column__loading-more {
  padding: 12px;
  text-align: center;
  font-size: 13px;
  color: #6b7280;
}

.explorer-column__footer {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.explorer-column__selection-info {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.explorer-column__quick-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: #f3f4f6;
}

.action-btn--danger {
  border-color: #ef4444;
  color: #ef4444;
}

.action-btn--danger:hover {
  background: #fef2f2;
}

.action-btn--primary {
  border-color: #3b82f6;
  color: #3b82f6;
}

.action-btn--primary:hover {
  background: #eff6ff;
}
</style>
