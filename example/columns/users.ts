import { createColumn } from '../../src/helpers/columnBuilder'
import type { ExplorerItem } from '../../src/types'
import { users } from '../mockData'
import { createFoldersColumn } from './folders'

export const usersColumn = createColumn({
  id: 'users',
  name: 'Users',

  fetchData: ({ filters }) => {
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

  singleActions: [
    {
      key: 'show-detail',
      label: 'Show User Detail',
      icon: 'lucide:user',
      color: 'primary',
      handler: async (selectedIds) => {
        const userId = selectedIds[0]
        const user = users.find(u => u.id === userId)
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
