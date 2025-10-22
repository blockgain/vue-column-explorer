import type { ColumnObject, ExplorerItem } from '../src/types'
import { users, folders, userBooks, userNotes, bookFiles } from './mockData'

// Helper function to simulate async data fetching
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Users Column
export const usersColumn: ColumnObject = {
  id: 'users',
  name: 'Users',
  dataProvider: {
    fetch: async ({ filters }) => {
      await delay(300) // Simulate network delay

      let filteredUsers = [...users]

      // Apply search filter
      if (filters.search) {
        const search = filters.search.toLowerCase()
        filteredUsers = filteredUsers.filter(
          u => u.fullName.toLowerCase().includes(search) ||
               u.email.toLowerCase().includes(search)
        )
      }

      // Apply age filter
      if (filters.age) {
        const ageValue = parseInt(filters.age)
        if (!isNaN(ageValue)) {
          filteredUsers = filteredUsers.filter(u => u.age > ageValue)
        }
      }

      return {
        items: filteredUsers.map(u => ({
          id: u.id,
          name: u.fullName,
          type: 'user',
          icon: 'lucide:user',
          metadata: { email: u.email, age: u.age }
        })),
        hasMore: false
      }
    }
  },
  selection: {
    enabled: true,
    multiple: true
  },
  filters: [
    {
      key: 'search',
      label: 'Search Users',
      type: 'search'
    },
    {
      key: 'age',
      label: 'Age >',
      type: 'number',
      operator: 'gt'
    }
  ],
  actions: [
    {
      key: 'delete',
      label: 'Delete',
      icon: 'lucide:trash',
      color: 'danger',
      handler: async (selectedIds) => {
        console.log('Deleting users:', selectedIds)
        alert(`Would delete ${selectedIds.length} user(s)`)
      }
    }
  ],
  itemClick: {
    type: 'navigate',
    handler: async (item) => {
      return {
        column: createUserFoldersColumn(item.id)
      }
    }
  },
  view: {
    showIcon: true,
    showMetadata: true,
    emptyMessage: 'No users found'
  }
}

// User Folders Column (Books/Notes)
export const createUserFoldersColumn = (userId: string): ColumnObject => {
  const user = users.find(u => u.id === userId)

  return {
    id: `user_${userId}_folders`,
    name: 'Folders',
    parentColumn: 'users',
    dataProvider: {
      fetch: async () => {
        await delay(200)

        return {
          items: folders.map(f => ({
            id: f.id,
            name: f.name,
            type: 'folder',
            icon: f.icon,
            metadata: { user: user?.fullName }
          })),
          hasMore: false
        }
      }
    },
    selection: {
      enabled: false
    },
    itemClick: {
      type: 'navigate',
      handler: async (item, context) => {
        const userId = context.getParentData(1)?.selectedItem?.id
        if (!userId) return {}

        return {
          column: createContentColumn(item.id, userId)
        }
      }
    },
    view: {
      showIcon: true,
      showMetadata: true,
      emptyMessage: 'No folders'
    }
  }
}

// Content Column (Books or Notes)
export const createContentColumn = (folderType: string, userId: string): ColumnObject => {
  const folderNames: Record<string, string> = {
    books: 'Books',
    notes: 'Notes'
  }

  const isBooks = folderType === 'books'

  return {
    id: `content_${folderType}_${userId}`,
    name: folderNames[folderType] || 'Content',
    parentColumn: `user_${userId}_folders`,
    dataProvider: {
      fetch: async () => {
        await delay(250)

        let items: ExplorerItem[] = []

        if (folderType === 'books') {
          items = userBooks[userId] || []
        } else if (folderType === 'notes') {
          items = userNotes[userId] || []
        }

        return {
          items,
          hasMore: false
        }
      }
    },
    selection: {
      enabled: true,
      multiple: true
    },
    actions: [
      {
        key: 'download',
        label: 'Download',
        icon: 'lucide:download',
        color: 'primary',
        handler: async (selectedIds, context) => {
          console.log('Downloading:', selectedIds)

          // Get the actual items
          const column = context.columnChain[context.columnChain.length - 1]
          const items = selectedIds.map(id => {
            const item = (column.selectedItem || context.parentItem) as any
            return item?.name || id
          })

          alert(`Downloading ${selectedIds.length} item(s)`)
        }
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: 'lucide:trash',
        color: 'danger',
        handler: async (selectedIds) => {
          console.log('Deleting:', selectedIds)
          alert(`Would delete ${selectedIds.length} item(s)`)
        }
      }
    ],
    itemClick: {
      type: 'navigate',
      handler: async (item) => {
        // If it's a book folder, open it to show the PDF
        if (item.type === 'folder' && isBooks) {
          return {
            column: createBookContentColumn(item.id)
          }
        }

        // If it's a file (note), show file details but don't navigate
        return {}
      }
    },
    view: {
      showIcon: true,
      showMetadata: true,
      emptyMessage: `No ${folderNames[folderType].toLowerCase()} found`
    }
  }
}

// Book Content Column (shows book.pdf inside a book folder)
export const createBookContentColumn = (bookId: string): ColumnObject => {
  return {
    id: `book_content_${bookId}`,
    name: 'Files',
    dataProvider: {
      fetch: async () => {
        await delay(200)

        const files = bookFiles[bookId] || []

        return {
          items: files,
          hasMore: false
        }
      }
    },
    selection: {
      enabled: true,
      multiple: false
    },
    actions: [
      {
        key: 'download',
        label: 'Download',
        icon: 'lucide:download',
        color: 'primary',
        handler: async (selectedIds) => {
          console.log('Downloading file:', selectedIds[0])

          // Simulate file download
          const link = document.createElement('a')
          link.href = '#'
          link.download = 'book.pdf'
          alert('Downloading book.pdf...')
        }
      }
    ],
    itemClick: {
      type: 'custom',
      handler: async () => {
        // Don't navigate further, just show file info
        return {}
      }
    },
    view: {
      showIcon: true,
      showMetadata: true,
      emptyMessage: 'No files'
    }
  }
}
