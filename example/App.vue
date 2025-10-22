<template>
  <div id="app">
    <header class="app-header">
      <h1>Vue Column Explorer - Example</h1>
      <p class="subtitle">Users → [Books|Notes] → Content</p>
    </header>

    <main class="app-main">
      <ExplorerContainer :root-column="usersColumn" />
    </main>

    <footer class="app-footer">
      <div class="instructions">
        <h3>Instructions:</h3>
        <ul>
          <li>Click on a user to see their folders (Books/Notes)</li>
          <li>Click on Books to see book folders, then click a book to see book.pdf</li>
          <li>Click on Notes to see PDF files directly</li>
          <li>Right-click on files to download</li>
          <li>Use filters to search users by name or filter by age {'>'} 18</li>
          <li>Select multiple items and use action buttons</li>
        </ul>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ExplorerContainer } from '../src'
import { usersColumn } from './columns/users'
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
