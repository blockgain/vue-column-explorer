import type { App } from 'vue'
import ExplorerContainer from './components/ExplorerContainer.vue'
import { useExplorer } from './composables/useExplorer'
import { createColumn } from './helpers/columnBuilder'

export { ExplorerContainer, useExplorer, createColumn }

export * from './types'
export * from './helpers/columnBuilder'

export default {
  install(app: App) {
    app.component('ExplorerContainer', ExplorerContainer)
  }
}
