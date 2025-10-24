import type { ExplorerItem } from '../src/types'

// Helper function to simulate API call delay
export async function simulateApiCall<T>(data: T, delayMs: number = 1000): Promise<T> {
  await new Promise(resolve => setTimeout(resolve, delayMs))
  return data
}

export interface User {
  id: string
  fullName: string
  email: string
  age: number
}

export const users: User[] = [
  {
    id: 'user-1',
    fullName: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@example.com',
    age: 28
  },
  {
    id: 'user-2',
    fullName: 'Ayşe Kaya',
    email: 'ayse.kaya@example.com',
    age: 34
  },
  {
    id: 'user-3',
    fullName: 'Mehmet Demir',
    email: 'mehmet.demir@example.com',
    age: 19
  }
]

export const folders = [
  { id: 'books', name: 'Books', icon: 'lucide:book' },
  { id: 'notes', name: 'Notes', icon: 'lucide:file-text' }
]

export const userBooks: Record<string, ExplorerItem[]> = {
  'user-1': [
    {
      id: 'book-1-1',
      name: 'JavaScript: The Good Parts',
      type: 'folder',
      icon: 'lucide:folder',
      metadata: { type: 'Book Folder' },
      writer: 'Douglas Crockford'
    },
    {
      id: 'book-1-2',
      name: 'Clean Code',
      type: 'folder',
      icon: 'lucide:folder',
      metadata: { type: 'Book Folder' },
      writer: 'Robert C. Martin'
    },
    {
      id: 'book-1-3',
      name: 'Design Patterns',
      type: 'folder',
      icon: 'lucide:folder',
      metadata: { type: 'Book Folder' },
      writer: 'Gang of Four'
    }
  ],
  'user-2': [
    {
      id: 'book-2-1',
      name: 'Vue.js Guide',
      type: 'folder',
      icon: 'lucide:folder',
      metadata: { type: 'Book Folder' },
      writer: 'Evan You'
    },
    {
      id: 'book-2-2',
      name: 'React Handbook',
      type: 'folder',
      icon: 'lucide:folder',
      metadata: { type: 'Book Folder' },
      writer: 'Facebook Team'
    },
    {
      id: 'book-2-3',
      name: 'TypeScript Deep Dive',
      type: 'folder',
      icon: 'lucide:folder',
      metadata: { type: 'Book Folder' },
      writer: 'Basarat Ali Syed'
    }
  ],
  'user-3': [
    {
      id: 'book-3-1',
      name: 'Python Crash Course',
      type: 'folder',
      icon: 'lucide:folder',
      metadata: { type: 'Book Folder' },
      writer: 'Eric Matthes'
    },
    {
      id: 'book-3-2',
      name: 'Data Structures',
      type: 'folder',
      icon: 'lucide:folder',
      metadata: { type: 'Book Folder' },
      writer: 'Various Authors'
    },
    {
      id: 'book-3-3',
      name: 'Algorithms',
      type: 'folder',
      icon: 'lucide:folder',
      metadata: { type: 'Book Folder' },
      writer: 'Robert Sedgewick'
    }
  ]
}

export const userNotes: Record<string, ExplorerItem[]> = {
  'user-1': [
    {
      id: 'note-1-1',
      name: 'Meeting Notes.pdf',
      type: 'file',
      icon: 'lucide:file',
      metadata: { size: '245 KB', date: '2025-10-15' }
    },
    {
      id: 'note-1-2',
      name: 'Project Ideas.pdf',
      type: 'file',
      icon: 'lucide:file',
      metadata: { size: '128 KB', date: '2025-10-18' }
    }
  ],
  'user-2': [
    {
      id: 'note-2-1',
      name: 'Weekly Review.pdf',
      type: 'file',
      icon: 'lucide:file',
      metadata: { size: '189 KB', date: '2025-10-20' }
    },
    {
      id: 'note-2-2',
      name: 'Learning Path.pdf',
      type: 'file',
      icon: 'lucide:file',
      metadata: { size: '310 KB', date: '2025-10-21' }
    }
  ],
  'user-3': [
    {
      id: 'note-3-1',
      name: 'Study Notes.pdf',
      type: 'file',
      icon: 'lucide:file',
      metadata: { size: '567 KB', date: '2025-10-19' }
    },
    {
      id: 'note-3-2',
      name: 'Homework.pdf',
      type: 'file',
      icon: 'lucide:file',
      metadata: { size: '423 KB', date: '2025-10-22' }
    }
  ]
}

export interface Order {
  id: string
  orderNumber: string
  customer: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  date: string
}

export const orders: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-001',
    customer: 'Ahmet Yılmaz',
    amount: 1250.00,
    status: 'completed',
    date: '2025-10-20'
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-002',
    customer: 'Ayşe Kaya',
    amount: 890.50,
    status: 'processing',
    date: '2025-10-21'
  },
  {
    id: 'order-3',
    orderNumber: 'ORD-003',
    customer: 'Mehmet Demir',
    amount: 2100.00,
    status: 'failed',
    date: '2025-10-22'
  },
  {
    id: 'order-4',
    orderNumber: 'ORD-004',
    customer: 'Fatma Şahin',
    amount: 450.75,
    status: 'pending',
    date: '2025-10-23'
  },
  {
    id: 'order-5',
    orderNumber: 'ORD-005',
    customer: 'Ali Öztürk',
    amount: 3200.00,
    status: 'completed',
    date: '2025-10-23'
  },
  {
    id: 'order-6',
    orderNumber: 'ORD-006',
    customer: 'Zeynep Aydın',
    amount: 1650.00,
    status: 'processing',
    date: '2025-10-24'
  },
  {
    id: 'order-7',
    orderNumber: 'ORD-007',
    customer: 'Can Yıldız',
    amount: 780.25,
    status: 'completed',
    date: '2025-10-24'
  },
  {
    id: 'order-8',
    orderNumber: 'ORD-008',
    customer: 'Elif Çelik',
    amount: 5400.00,
    status: 'failed',
    date: '2025-10-24'
  }
]

export const bookFiles: Record<string, ExplorerItem[]> = {
  'book-1-1': [
    {
      id: 'file-book-1-1',
      name: 'book.pdf',
      type: 'file',
      icon: 'lucide:file',
      metadata: { size: '2.4 MB', pages: 176 }
    }
  ],
  'book-1-2': [
    {
      id: 'file-book-1-2',
      name: 'book.pdf',
      type: 'file',
      icon: 'lucide:file',
      metadata: { size: '3.1 MB', pages: 464 }
    }
  ],
  'book-1-3': [
    {
      id: 'file-book-1-3',
      name: 'book.pdf',
      type: 'file',
      icon: 'lucide:file',
      metadata: { size: '5.2 MB', pages: 395 }
    }
  ],
  'book-2-1': [
    {
      id: 'file-book-2-1',
      name: 'book.pdf',
      type: 'file',
      icon: 'lucide:file',
      metadata: { size: '4.8 MB', pages: 512 }
    }
  ],
  'book-2-2': [
    {
      id: 'file-book-2-2',
      name: 'book.pdf',
      type: 'file',
      icon: 'lucide:file',
      metadata: { size: '3.5 MB', pages: 287 }
    }
  ],
  'book-2-3': [
    {
      id: 'file-book-2-3',
      name: 'book.pdf',
      type: 'file',
      icon: 'lucide:file',
      metadata: { size: '6.1 MB', pages: 584 }
    }
  ],
  'book-3-1': [
    {
      id: 'file-book-3-1',
      name: 'book.pdf',
      type: 'file',
      icon: 'lucide:file',
      metadata: { size: '2.9 MB', pages: 544 }
    }
  ],
  'book-3-2': [
    {
      id: 'file-book-3-2',
      name: 'book.pdf',
      type: 'file',
      icon: 'lucide:file',
      metadata: { size: '4.2 MB', pages: 398 }
    }
  ],
  'book-3-3': [
    {
      id: 'file-book-3-3',
      name: 'book.pdf',
      type: 'file',
      icon: 'lucide:file',
      metadata: { size: '5.7 MB', pages: 672 }
    }
  ]
}
