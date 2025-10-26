import { createColumn } from '../../src/helpers/columnBuilder'
import type { ExplorerItem } from '../../src/types'
import { userNotes } from '../mockData'

export function createNotesColumn(userId: string) {
  return createColumn({
    id: `notes_${userId}`,
    name: 'Notes',

    fetchData: () => {
      return userNotes[userId] || []
    },

    onItemClick: () => {
      // Don't navigate for note files, just show info
      return null
    },

    allowMultipleSelection: true, // Allow selecting multiple notes

    multipleActions: [
      {
        key: 'send-mail',
        label: 'Mail Gönder',
        icon: 'lucide:mail',
        color: 'primary',
        handler: async (items: ExplorerItem[]) => {
          alert(`Mail gönderiliyor:\n${items.map(i => i.name).join('\n')}`)
        }
      },
      {
        key: 'download',
        label: 'İndir',
        icon: 'lucide:download',
        color: 'primary',
        handler: async (items: ExplorerItem[]) => {
          alert(`İndiriliyor:\n${items.map(i => i.name).join('\n')}`)
        }
      }
    ]
  })
}
