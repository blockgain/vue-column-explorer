import { createColumn } from '../../src/helpers/columnBuilder'
import { bookFiles } from '../mockData'

export function createBookFilesColumn(bookId: string, bookName: string) {
  return createColumn({
    id: `book_files_${bookId}`,
    name: bookName, // Use book name instead of generic "Files"

    fetchData: () => {
      return bookFiles[bookId] || []
    },

    onItemClick: () => {
      // Don't navigate further for PDF files
      // Just show file info in the same column
      return null
    },

    allowMultipleSelection: true,

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
