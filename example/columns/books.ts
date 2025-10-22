import { createColumn } from '../../src/helpers/columnBuilder'
import { userBooks, bookFiles, simulateApiCall } from '../mockData'
import { createBookFilesColumn } from './bookFiles'

export function createBooksColumn(userId: string) {
  return createColumn({
    id: `books_${userId}`,
    name: 'Books',

    fetchData: async () => {
      // Simulate API call - fetch books from backend
      const books = userBooks[userId] || []
      const booksWithCount = books.map(book => ({
        ...book,
        count: bookFiles[book.id]?.length || 0,
        hasChildren: true
      }))

      // Simulate network delay (1.5 seconds)
      return await simulateApiCall(booksWithCount, 1500)
    },

    onItemClick: (item) => {
      // Navigate into book folder to show PDF
      return createBookFilesColumn(item.id, item.name)
    },

    allowMultipleSelection: true, // Allow selecting multiple books

    singleActions: [
      {
        key: 'show-writer',
        label: 'Show Writer',
        icon: 'lucide:user',
        color: 'primary',
        handler: async (selectedIds) => {
          const bookId = selectedIds[0]
          const books = userBooks[userId] || []
          const book = books.find(b => b.id === bookId)
          if (book && book.writer) {
            alert(`Writer: ${book.writer}\nBook: ${book.name}`)
          }
        }
      }
    ],

    multipleActions: [
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
