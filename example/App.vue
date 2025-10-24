<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <div>
          <h1>Vue Column Explorer - Examples</h1>
          <p class="subtitle">{{ currentExample.subtitle }}</p>
        </div>
        <div class="example-switcher">
          <button
            v-for="example in examples"
            :key="example.id"
            :class="['example-btn', { 'active': currentExampleId === example.id }]"
            @click="switchExample(example.id)"
          >
            {{ example.name }}
          </button>
        </div>
      </div>
    </header>

    <main class="app-main">
      <ExplorerContainer :key="currentExampleId" :root-column="currentExample.column" :context="externalContext" />
    </main>

    <footer class="app-footer">
      <div class="instructions">
        <h3>Instructions:</h3>
        <ul>
          <li v-for="(instruction, idx) in currentExample.instructions" :key="idx">
            {{ instruction }}
          </li>
        </ul>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ExplorerContainer } from '../src'
import { usersColumn } from './columns/users'
import { ordersColumn } from './columns/orders'

const examples = [
  {
    id: 'users',
    name: 'Users Example',
    subtitle: 'Users → [Books|Notes] → Content',
    column: usersColumn,
    instructions: [
      'Click on a user to see their folders (Books/Notes)',
      'Click on Books to see book folders, then click a book to see book.pdf',
      'Click on Notes to see PDF files directly',
      'Right-click on files to download',
      'Use filters to search users by name or filter by age > 18',
      'Select items and use action buttons'
    ]
  },
  {
    id: 'orders',
    name: 'Orders (Badge Example)',
    subtitle: 'Orders with colored status badges',
    column: ordersColumn,
    instructions: [
      'View orders with colored status badges (Success, Error, Warning, Info)',
      'Filter orders by status using the dropdown filter',
      'Search orders by order number or customer name',
      'Select single order to view details',
      'Select multiple orders to export or delete',
      'Right-click on an order for context menu actions'
    ]
  }
]

const currentExampleId = ref('users')

const currentExample = computed(() => {
  return examples.find(e => e.id === currentExampleId.value) || examples[0]
})

const switchExample = (exampleId: string) => {
  currentExampleId.value = exampleId
}

// Example: Pass external context to the explorer
// This context will be available in all fetchData and action handlers
const externalContext = {
  appName: 'My App',
  userId: 'current-user-123',
  apiBaseUrl: 'https://api.example.com',
  customData: {
    theme: 'light',
    permissions: ['read', 'write']
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #f3f4f6;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.app-header {
  padding: 20px 32px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
}

.app-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
}

.example-switcher {
  display: flex;
  gap: 8px;
}

.example-btn {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.example-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.example-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.app-main {
  flex: 1;
  padding: 24px;
  overflow: hidden;
}

.app-footer {
  padding: 16px 32px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.instructions h3 {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.instructions ul {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.instructions li {
  font-size: 12px;
  color: #6b7280;
  padding-left: 16px;
  position: relative;
}

.instructions li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #3b82f6;
  font-weight: bold;
}
</style>
