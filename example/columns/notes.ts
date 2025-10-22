import { createColumn } from '../../src/helpers/columnBuilder'
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

    actions: [
      {
        key: 'send-mail',
        label: 'Mail Gönder',
        icon: 'lucide:mail',
        color: 'primary',
        handler: async (selectedIds) => {
          alert(`Mail gönderiliyor:\n${selectedIds.join('\n')}`)
        }
      },
      {
        key: 'download',
        label: 'İndir',
        icon: 'lucide:download',
        color: 'primary',
        handler: async (selectedIds) => {
          alert(`İndiriliyor:\n${selectedIds.join('\n')}`)
        }
      }
    ]
  })
}
