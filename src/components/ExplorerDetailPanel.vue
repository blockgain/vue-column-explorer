<template>
  <div v-if="item" class="detail-panel">
    <div class="detail-panel__header">
      <div class="detail-panel__icon">
        <component :is="iconComponent" :size="48" :stroke-width="1.5" />
      </div>
    </div>

    <div class="detail-panel__content">
      <h3 class="detail-panel__title">{{ item.name }}</h3>
      <p v-if="item.description" class="detail-panel__description">
        {{ item.description }}
      </p>
    </div>

    <div v-if="actions.length > 0" class="detail-panel__actions">
      <button
        v-for="action in actions"
        :key="action.key"
        class="detail-panel__action-btn"
        :class="[
          `detail-panel__action-btn--${action.color || 'default'}`,
        ]"
        @click="handleAction(action.key)"
      >
        <component
          v-if="action.icon"
          :is="getIcon(action.icon)"
          :size="18"
          :stroke-width="2"
        />
        <span>{{ action.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  File,
  Folder,
  User,
  FileText,
  Download,
  Trash,
  Edit,
  Mail,
  Book,
  Clipboard,
  Globe,
  FileBadge,
  FileCheck,
  FileSpreadsheet,
} from 'lucide-vue-next'
import type { ExplorerItem, ActionHandler } from '../types'

interface Props {
  item: ExplorerItem | null
  actions: ActionHandler[]
}

interface Emits {
  (e: 'action', actionKey: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const iconComponent = computed(() => {
  if (!props.item?.icon) return File

  const iconMap: Record<string, any> = {
    'lucide:file': File,
    'lucide:folder': Folder,
    'lucide:user': User,
    'lucide:file-text': FileText,
    'lucide:book': Book,
    'lucide:clipboard': Clipboard,
    'lucide:globe': Globe,
    'lucide:file-badge': FileBadge,
    'lucide:file-check': FileCheck,
    'lucide:file-spreadsheet': FileSpreadsheet,
  }

  return iconMap[props.item.icon] || File
})

const getIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    'lucide:download': Download,
    'lucide:trash': Trash,
    'lucide:edit': Edit,
    'lucide:mail': Mail,
    'lucide:file': File,
    'lucide:globe': Globe,
  }

  return iconMap[iconName] || File
}

const handleAction = (actionKey: string) => {
  emit('action', actionKey)
}
</script>

<style scoped>
.detail-panel {
  width: 320px;
  min-width: 320px;
  flex-shrink: 0;
  height: 100%;
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.detail-panel__header {
  padding: 24px;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #f3f4f6;
}

.detail-panel__icon {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.detail-panel__content {
  padding: 24px;
  flex: 1;
}

.detail-panel__title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
  word-break: break-word;
  line-height: 1.5;
}

.detail-panel__description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
  word-break: break-word;
}

.detail-panel__actions {
  padding: 16px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid #f3f4f6;
}

.detail-panel__action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #ffffff;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100%;
  justify-content: center;
}

.detail-panel__action-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.detail-panel__action-btn--primary {
  background: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
}

.detail-panel__action-btn--primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.detail-panel__action-btn--secondary {
  background: #6b7280;
  color: #ffffff;
  border-color: #6b7280;
}

.detail-panel__action-btn--secondary:hover {
  background: #4b5563;
  border-color: #4b5563;
}

.detail-panel__action-btn--danger {
  background: #ef4444;
  color: #ffffff;
  border-color: #ef4444;
}

.detail-panel__action-btn--danger:hover {
  background: #dc2626;
  border-color: #dc2626;
}

.detail-panel::-webkit-scrollbar {
  width: 6px;
}

.detail-panel::-webkit-scrollbar-track {
  background: #f9fafb;
}

.detail-panel::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.detail-panel::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
