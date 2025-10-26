import { createColumn } from '../../src/helpers/columnBuilder'
import type { ExplorerItem } from '../../src/types'
import { users } from '../mockData'
import { createFoldersColumn } from './folders'

export const usersColumn = createColumn({
  id: 'users',
  name: 'Users',

  fetchData: ({ filters, context }) => {
    // Example: Access external context passed from parent app
    console.log('External context:', context.external)
    // You can use context.external.apiBaseUrl, context.external.userId, etc.

    let filteredUsers = [...users]

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filteredUsers = filteredUsers.filter(
        u => u.fullName.toLowerCase().includes(search) ||
             u.email.toLowerCase().includes(search)
      )
    }

    // Age filter
    if (filters.age) {
      const ageValue = parseInt(filters.age)
      if (!isNaN(ageValue)) {
        filteredUsers = filteredUsers.filter(u => u.age > ageValue)
      }
    }

    return filteredUsers.map(u => ({
      id: u.id,
      name: u.fullName,
      type: 'user',
      icon: 'lucide:user',
      metadata: { email: u.email, age: u.age },
      count: 2, // Books and Notes
      hasChildren: true
    }))
  },

  onItemClick: (item) => {
    return createFoldersColumn(item.id)
  },

  allowMultipleSelection: false, // Users don't support multiple selection

  sortOptions: [
    {
      key: 'name-asc',
      label: 'Ada Göre (A-Z)',
      sortFn: (a, b) => a.name.localeCompare(b.name, 'tr')
    },
    {
      key: 'name-desc',
      label: 'Ada Göre (Z-A)',
      sortFn: (a, b) => b.name.localeCompare(a.name, 'tr')
    },
    {
      key: 'age-asc',
      label: 'Yaşa Göre (Küçükten Büyüğe)',
      sortFn: (a, b) => (a.metadata?.age || 0) - (b.metadata?.age || 0)
    },
    {
      key: 'age-desc',
      label: 'Yaşa Göre (Büyükten Küçüğe)',
      sortFn: (a, b) => (b.metadata?.age || 0) - (a.metadata?.age || 0)
    }
  ],

  singleActions: [
    {
      key: 'show-detail',
      label: 'Show User Detail',
      icon: 'lucide:user',
      color: 'primary',
      handler: async (item: ExplorerItem) => {
        const user = users.find(u => u.id === item.id)
        if (user) {
          alert(`User Detail:\n\nName: ${user.fullName}\nEmail: ${user.email}\nAge: ${user.age}`)
        }
      }
    }
  ],

  filters: [
    {
      key: 'search',
      label: 'Search Users',
      type: 'search'
    },
    {
      key: 'age',
      label: 'Age >',
      type: 'number'
    }
  ]
})
