import type { App } from 'vue'
import ExplorerContainer from './components/ExplorerContainer.vue'
import { useExplorerStore } from './stores/explorer'
import { createColumn } from './helpers/columnBuilder'

export { ExplorerContainer, useExplorerStore, createColumn }

export * from './types'
export * from './helpers/columnBuilder'

export default {
  install(app: App) {
    app.component('ExplorerContainer', ExplorerContainer)
  }
}
