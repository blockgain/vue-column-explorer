<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="context-menu"
      :style="{ top: `${y}px`, left: `${x}px` }"
      @click="handleClose"
    >
      <div
        v-for="action in actions"
        :key="action.key"
        class="context-menu__item"
        @click="handleAction(action)"
      >
        <component v-if="action.icon" :is="getIcon(action.icon)" :size="16" />
        <span>{{ action.label }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Download, Trash, Edit, Eye } from 'lucide-vue-next'
import type { ActionHandler } from '../types'

interface Props {
  visible: boolean
  x: number
  y: number
  actions: ActionHandler[]
}

interface Emits {
  (e: 'close'): void
  (e: 'action', actionKey: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleClose = () => {
  emit('close')
}

const handleAction = (action: ActionHandler) => {
  emit('action', action.key)
  emit('close')
}

const getIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    'lucide:download': Download,
    'lucide:trash': Trash,
    'lucide:edit': Edit,
    'lucide:eye': Eye
  }
  return iconMap[iconName] || null
}

const handleClickOutside = () => {
  if (props.visible) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 9999;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: 180px;
  padding: 4px 0;
}

.context-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.context-menu__item:hover {
  background-color: #f3f4f6;
}
</style>
