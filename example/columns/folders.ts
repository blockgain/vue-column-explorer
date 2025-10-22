import { createColumn } from '../../src/helpers/columnBuilder'
import { userBooks, userNotes } from '../mockData'
import { createBooksColumn } from './books'
import { createNotesColumn } from './notes'

export function createFoldersColumn(userId: string) {
  return createColumn({
    id: `folders_${userId}`,
    name: 'Folders',

    fetchData: () => {
      const bookCount = userBooks[userId]?.length || 0
      const noteCount = userNotes[userId]?.length || 0

      return [
        {
          id: 'books',
          name: 'Books',
          type: 'folder',
          icon: 'lucide:book',
          metadata: { type: 'Folder' },
          count: bookCount,
          hasChildren: true
        },
        {
          id: 'notes',
          name: 'Notes',
          type: 'folder',
          icon: 'lucide:file-text',
          metadata: { type: 'Folder' },
          count: noteCount,
          hasChildren: true
        }
      ]
    },

    onItemClick: (item) => {
      if (item.id === 'books') {
        return createBooksColumn(userId)
      } else if (item.id === 'notes') {
        return createNotesColumn(userId)
      }
      return null
    },

    allowMultipleSelection: false
  })
}
