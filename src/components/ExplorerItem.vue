<template>
  <div
    class="explorer-item"
    :class="{
      'explorer-item--selected': selected,
      'explorer-item--clickable': clickable
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
        <div v-if="showMetadata && item.metadata" class="explorer-item__metadata">
          {{ formatMetadata(item.metadata) }}
        </div>
      </div>
    </div>
    <div v-if="item.count !== undefined || item.hasChildren" class="explorer-item__chevron">
      <span v-if="item.count !== undefined" class="item-count">{{ item.count }}</span>
      <ChevronRight :size="16" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { File, Folder, User, Book, FileText, Clipboard, ChevronRight } from 'lucide-vue-next'
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
    return props.item.type === 'folder' ? Folder : File
  }

  const iconMap: Record<string, any> = {
    'lucide:user': User,
    'lucide:folder': Folder,
    'lucide:file': File,
    'lucide:book': Book,
    'lucide:file-text': FileText,
    'lucide:clipboard': Clipboard
  }

  return iconMap[props.item.icon] || File
})

const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
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

const formatMetadata = (metadata: Record<string, any>): string => {
  const entries = Object.entries(metadata)
  if (entries.length === 0) return ''

  const first = entries[0]
  return String(first[1])
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
  background-color: #dbeafe !important;
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
</style>
