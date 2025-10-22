<template>
  <div class="explorer-breadcrumb">
    <div
      v-for="(item, index) in breadcrumb"
      :key="index"
      class="breadcrumb-item"
    >
      <button
        class="breadcrumb-item__button"
        :class="{ 'breadcrumb-item__button--active': index === breadcrumb.length - 1 }"
        @click="handleClick(index)"
      >
        {{ item.itemName || item.columnName }}
      </button>
      <ChevronRight
        v-if="index < breadcrumb.length - 1"
        :size="16"
        class="breadcrumb-separator"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import type { BreadcrumbItem } from '../types'

interface Props {
  breadcrumb: BreadcrumbItem[]
}

interface Emits {
  (e: 'navigate', index: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleClick = (index: number) => {
  emit('navigate', index)
}
</script>

<style scoped>
.explorer-breadcrumb {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-item__button {
  padding: 4px 8px;
  font-size: 14px;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.breadcrumb-item__button:hover {
  background: #f3f4f6;
  color: #111827;
}

.breadcrumb-item__button--active {
  color: #111827;
  font-weight: 500;
  cursor: default;
}

.breadcrumb-item__button--active:hover {
  background: transparent;
}

.breadcrumb-separator {
  margin: 0 4px;
  color: #d1d5db;
  flex-shrink: 0;
}
</style>
