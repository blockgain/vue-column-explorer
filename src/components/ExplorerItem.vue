<template>
  <div
    class="explorer-item"
    :class="{
      'explorer-item--selected': selected,
      'explorer-item--clickable': clickable && !item.disabled,
      'explorer-item--disabled': item.disabled
    }"
    @click="handleClick"
    @dblclick="handleDoubleClick"
    @contextmenu.prevent="handleContextMenu"
  >
    <div v-if="selectable" class="explorer-item__checkbox">
      <input
        type="checkbox"
        :checked="selected"
        @click.stop="handleCheckboxClick"
      />
    </div>
    <div class="explorer-item__content">
      <div v-if="showIcon" class="explorer-item__icon">
        <component :is="iconComponent" :size="20" />
      </div>
      <div class="explorer-item__details">
        <div class="explorer-item__name">{{ item.name }}</div>
        <div v-if="showMetadata && item.description" class="explorer-item__metadata">
          {{ item.description }}
        </div>
      </div>
    </div>
    <div v-if="item.badge !== undefined || item.status !== undefined || item.count !== undefined || item.hasChildren" class="explorer-item__chevron">
      <span v-if="item.badge !== undefined" :class="['item-badge', badgeColorClass]" :style="badgeStyle">{{ item.badge }}</span>
      <span v-else-if="item.status !== undefined" class="item-status">{{ item.status }}</span>
      <span v-else-if="item.count !== undefined" class="item-count">{{ item.count }}</span>
      <ChevronRight v-if="item.hasChildren" :size="16" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as LucideIcons from 'lucide-vue-next'
import type { ExplorerItem as Item } from '../types'

interface Props {
  item: Item
  selected?: boolean
  selectable?: boolean
  clickable?: boolean
  showIcon?: boolean
  showMetadata?: boolean
}

interface Emits {
  (e: 'click', item: Item, event: MouseEvent): void
  (e: 'dblclick', item: Item, event: MouseEvent): void
  (e: 'contextmenu', item: Item, event: MouseEvent): void
  (e: 'select', item: Item, isMultiple: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  selectable: false,
  clickable: true,
  showIcon: true,
  showMetadata: true
})

const emit = defineEmits<Emits>()

const iconComponent = computed(() => {
  if (!props.item.icon) {
    return props.item.type === 'folder' ? LucideIcons.Folder : LucideIcons.File
  }

  // Support lucide:icon-name format
  if (props.item.icon.startsWith('lucide:')) {
    const iconName = props.item.icon.replace('lucide:', '')
    // Convert kebab-case to PascalCase (e.g., 'building-2' -> 'Building2')
    const pascalCaseName = iconName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')

    const IconComponent = (LucideIcons as any)[pascalCaseName]
    if (IconComponent) {
      return IconComponent
    }
  }

  // Fallback to File icon
  return LucideIcons.File
})

const badgeColorClass = computed(() => {
  const color = props.item.badgeColor
  if (!color) return ''

  // Preset colors
  const presetColors = ['success', 'error', 'warning', 'info']
  if (presetColors.includes(color.toLowerCase())) {
    return `item-badge--${color.toLowerCase()}`
  }

  return ''
})

const badgeStyle = computed(() => {
  const color = props.item.badgeColor
  if (!color) return {}

  // If it's not a preset color, treat it as a custom CSS color
  const presetColors = ['success', 'error', 'warning', 'info']
  if (!presetColors.includes(color.toLowerCase())) {
    return {
      backgroundColor: color,
      color: '#ffffff'
    }
  }

  return {}
})

const handleClick = (event: MouseEvent) => {
  if (props.clickable && !props.item.disabled) {
    emit('click', props.item, event)
  }
}

const handleDoubleClick = (event: MouseEvent) => {
  emit('dblclick', props.item, event)
}

const handleContextMenu = (event: MouseEvent) => {
  emit('contextmenu', props.item, event)
}

const handleCheckboxClick = (_event: Event) => {
  // If checkbox is visible (selectable=true), it means multiple selection is enabled
  // So always treat checkbox clicks as multiple selection (toggle behavior)
  emit('select', props.item, true)
}
</script>

<style scoped>
.explorer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: default;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.15s ease;
  user-select: none;
}

.explorer-item--clickable {
  cursor: pointer;
}

.explorer-item:hover {
  background-color: #f3f4f6;
}

.explorer-item--selected {
  background-color: #3b82f6 !important;
  border-left: 4px solid #1d4ed8;
}

.explorer-item--selected .explorer-item__name {
  color: #ffffff !important;
  font-weight: 600;
}

.explorer-item--selected .explorer-item__metadata {
  color: #e0e7ff !important;
}

.explorer-item--selected .explorer-item__icon {
  color: #ffffff !important;
}

.explorer-item--selected .explorer-item__chevron {
  color: #ffffff !important;
}

.explorer-item--selected .item-count {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff !important;
}

.explorer-item__content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.explorer-item__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  color: #6b7280;
}

.explorer-item--selected .explorer-item__icon {
  color: #2563eb;
}

.explorer-item__details {
  flex: 1;
  min-width: 0;
}

.explorer-item__name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.explorer-item__metadata {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.explorer-item__checkbox {
  flex-shrink: 0;
  margin-right: 8px;
}

.explorer-item__checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.explorer-item__chevron {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #9ca3af;
  margin-left: 8px;
}

.item-count {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.item-status {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.item-badge {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.item-badge--success {
  background: #dcfce7;
  color: #166534;
}

.item-badge--error {
  background: #fee2e2;
  color: #991b1b;
}

.item-badge--warning {
  background: #fef3c7;
  color: #92400e;
}

.item-badge--info {
  background: #dbeafe;
  color: #1e40af;
}

.explorer-item--selected .item-badge {
  opacity: 0.9;
}

.explorer-item--disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
}

.explorer-item--disabled .explorer-item__name {
  color: #9ca3af !important;
}

.explorer-item--disabled .explorer-item__icon {
  color: #d1d5db !important;
}

.explorer-item--disabled:hover {
  background-color: transparent !important;
}
</style>
