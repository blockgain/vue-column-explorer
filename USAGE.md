# Vue Column Explorer - Usage Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Example

```bash
npm run dev
```

Open http://localhost:5173/ in your browser.

## Example Walkthrough

### Multiple Examples

The example app includes two demonstrations:

**1. Users Example** - Hierarchical file explorer with sorting:
```
Users (3 users) [Sortable by Name & Age]
├── Ahmet Yılmaz (age: 28)
│   ├── Books/
│   │   ├── JavaScript: The Good Parts/
│   │   │   └── book.pdf
│   │   ├── Clean Code/
│   │   │   └── book.pdf
│   │   └── Design Patterns/
│   │       └── book.pdf
│   └── Notes/
│       ├── Meeting Notes.pdf
│       └── Project Ideas.pdf
├── Ayşe Kaya (age: 34)
│   └── ...
└── Mehmet Demir (age: 19)
    └── ...
```

**2. Orders Example** - Status tracking with colored badges:
```
Orders (8 orders)
├── ORD-001 [Tamamlandı ✓]     # Green badge
├── ORD-002 [İşleniyor ⟳]      # Blue badge
├── ORD-003 [Başarısız ✗]      # Red badge
├── ORD-004 [Bekliyor ⏸]       # Yellow badge
└── ...
```

### Features to Test

#### 1. Example Switcher

1. Click "Users Example" or "Orders (Badge Example)" buttons in header
2. Examples switch instantly
3. Each example demonstrates different features

#### 2. Search & Filters

**Search Users:**
1. In Users Example, click the filter button (funnel icon)
2. Type a name in "Search Users" input
3. Users list filters in real-time

**Age Filter:**
1. Click the filter button in Users column
2. Enter "18" in the "Age >" field
3. Only users older than 18 appear (filters out Mehmet Demir)

**Status Filter (Orders):**
1. In Orders Example, click the filter button
2. Select a status from "Durum" dropdown
3. Only orders with that status appear

#### 3. Sorting

**Sort Users:**
1. In Users Example, click the filter button
2. Select from "Sıralama" dropdown:
   - Ada Göre (A-Z)
   - Ada Göre (Z-A)
   - Yaşa Göre (Küçükten Büyüğe)
   - Yaşa Göre (Büyükten Küçüğe)
3. Users list re-sorts immediately

#### 4. Navigation

**Basic Navigation:**
1. Click on "Ahmet Yılmaz"
2. Folders column appears (Books, Notes)
3. Click on "Books"
4. Books column appears with 3 book folders
5. Click on a book folder
6. Files column appears with book.pdf

**Breadcrumb Navigation:**
1. Navigate deep into folders
2. Click on any breadcrumb item to go back
3. All columns after that point close

#### 5. Badges (Visual Status Indicators)

**View Colored Badges:**
1. Switch to Orders Example
2. See colored badges next to each order:
   - Green: "Tamamlandı" (Completed)
   - Blue: "İşleniyor" (Processing)
   - Yellow: "Bekliyor" (Pending)
   - Red: "Başarısız" (Failed)

#### 6. Selection & Actions

**Single Selection:**
1. Click on any user
2. User becomes highlighted (blue background)
3. Footer shows "1 selected"

**Multiple Selection:**
1. In Books/Notes column, select one item
2. Hold Ctrl/Cmd and click another item
3. Both items selected
4. Footer shows "2 selected"

**Actions:**
1. Select one or more items
2. Click action button in footer
3. Alert shows what would happen

**Single vs Multiple Actions:**
- Users Example: Single selection only → "Show User Detail" action
- Orders Example: Multiple selection → "Dışa Aktar" (Export) or "Sil" (Delete)

#### 7. Intelligent Context Menu

**Single Selection Context Menu:**
1. In Orders Example, right-click on one order
2. Context menu shows: "Detayları Gör" (View Details)
3. Only single-selection actions appear

**Multiple Selection Context Menu:**
1. In Orders Example, select multiple orders (use checkboxes)
2. Right-click on any selected order
3. Context menu shows: "Dışa Aktar", "Sil"
4. Only multiple-selection actions appear
5. Single-selection actions are hidden automatically

#### 8. Refresh

1. Click refresh button (circular arrow) in any column header
2. Column reloads with fresh data

## Creating Your Own Columns

### Simple Column with createColumn (Recommended)

```typescript
import { createColumn } from 'vue-column-explorer'

const myColumn = createColumn({
  id: 'unique-id',
  name: 'Column Title',

  // Fetch data
  fetchData: async ({ filters, context }) => {
    const items = await fetchMyData(filters)

    return items.map(item => ({
      id: item.id,
      name: item.title,
      type: item.type,
      icon: 'lucide:file',
      metadata: { /* any extra data */ }
    }))
  }
})
```

### Advanced: Using ColumnObject Directly

```typescript
import type { ColumnObject } from '../src/types'

const myColumn: ColumnObject = {
  id: 'unique-id',
  name: 'Column Title',

  // Data provider - fetch data
  dataProvider: {
    fetch: async ({ parentId, page, filters, context }) => {
      // Fetch from API or local data
      const items = await fetchMyData({
        parentId,
        page,
        ...filters
      })

      return {
        items: items.map(item => ({
          id: item.id,
          name: item.title,
          type: item.type,
          icon: 'lucide:file',
          metadata: { /* any extra data */ }
        })),
        hasMore: items.hasNextPage
      }
    }
  },

  // Configure view
  view: {
    showIcon: true,
    showMetadata: true,
    emptyMessage: 'No items found'
  }
}
```

### Column with Filters

```typescript
const columnWithFilters = createColumn({
  id: 'filtered-column',
  name: 'My Column',

  filters: [
    {
      key: 'search',
      label: 'Search',
      type: 'search'
    },
    {
      key: 'age',
      label: 'Age >',
      type: 'number'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  ],

  fetchData: async ({ filters }) => {
    let items = await getAllItems()

    // Apply filters
    if (filters.search) {
      items = items.filter(i => i.name.includes(filters.search))
    }
    if (filters.age) {
      items = items.filter(i => i.metadata.age > filters.age)
    }
    if (filters.status && filters.status !== 'all') {
      items = items.filter(i => i.status === filters.status)
    }

    return items
  }
})
```

### Column with Sorting

```typescript
const sortableColumn = createColumn({
  id: 'sortable-column',
  name: 'Users',

  sortOptions: [
    {
      key: 'name-asc',
      label: 'Name (A-Z)',
      sortFn: (a, b) => a.name.localeCompare(b.name)
    },
    {
      key: 'name-desc',
      label: 'Name (Z-A)',
      sortFn: (a, b) => b.name.localeCompare(a.name)
    },
    {
      key: 'date-newest',
      label: 'Newest First',
      sortFn: (a, b) => new Date(b.metadata.date) - new Date(a.metadata.date)
    }
  ],

  fetchData: async () => {
    return await getItems()
    // Sorting is applied automatically by the store
  }
})
```

### Column with Badges

```typescript
const columnWithBadges = createColumn({
  id: 'orders',
  name: 'Orders',

  fetchData: async () => {
    const orders = await getOrders()

    return orders.map(order => ({
      id: order.id,
      name: order.orderNumber,
      type: 'order',
      icon: 'lucide:clipboard',
      description: `${order.customer} - ${order.amount}`,
      // Add colored badge
      badge: getBadgeText(order.status),
      badgeColor: getBadgeColor(order.status), // 'success', 'error', 'warning', 'info'
      metadata: order
    }))
  }
})

// Helper functions
function getBadgeText(status: string) {
  const map = {
    completed: 'Completed',
    processing: 'Processing',
    pending: 'Pending',
    failed: 'Failed'
  }
  return map[status] || status
}

function getBadgeColor(status: string) {
  const map = {
    completed: 'success',   // Green
    processing: 'info',     // Blue
    pending: 'warning',     // Yellow
    failed: 'error'         // Red
  }
  return map[status]
}
```

### Column with Single Selection Actions

```typescript
const columnWithSingleActions = createColumn({
  id: 'users',
  name: 'Users',

  allowMultipleSelection: false, // Single selection only

  singleActions: [
    {
      key: 'view-details',
      label: 'View Details',
      icon: 'lucide:eye',
      color: 'primary',
      handler: async (selectedIds) => {
        const userId = selectedIds[0]
        const user = await getUserDetails(userId)
        showDetailsModal(user)
      }
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: 'lucide:edit',
      color: 'primary',
      handler: async (selectedIds) => {
        const userId = selectedIds[0]
        openEditModal(userId)
      }
    }
  ],

  fetchData: async () => await getUsers()
})
```

### Column with Multiple Selection Actions

```typescript
const columnWithMultipleActions = createColumn({
  id: 'orders',
  name: 'Orders',

  allowMultipleSelection: true, // Enable multiple selection

  multipleActions: [
    {
      key: 'export',
      label: 'Export',
      icon: 'lucide:download',
      color: 'primary',
      handler: async (selectedIds) => {
        // Export selected orders
        const orders = selectedIds.map(id => getOrder(id))
        await exportToCSV(orders)
      }
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: 'lucide:trash',
      color: 'danger',
      handler: async (selectedIds) => {
        if (confirm(`Delete ${selectedIds.length} items?`)) {
          await deleteOrders(selectedIds)
        }
      }
    }
  ],

  fetchData: async () => await getOrders()
})
```

### Column with Both Single and Multiple Actions

```typescript
const columnWithBothActions = createColumn({
  id: 'files',
  name: 'Files',

  allowMultipleSelection: true,

  // Actions for single selection
  singleActions: [
    {
      key: 'preview',
      label: 'Preview',
      icon: 'lucide:eye',
      color: 'primary',
      handler: async (selectedIds) => {
        const fileId = selectedIds[0]
        openPreview(fileId)
      }
    },
    {
      key: 'rename',
      label: 'Rename',
      icon: 'lucide:edit',
      handler: async (selectedIds) => {
        const fileId = selectedIds[0]
        const newName = prompt('New name:')
        if (newName) await renameFile(fileId, newName)
      }
    }
  ],

  // Actions for multiple selection
  multipleActions: [
    {
      key: 'download-all',
      label: 'Download All',
      icon: 'lucide:download',
      color: 'primary',
      handler: async (selectedIds) => {
        await downloadFiles(selectedIds)
      }
    },
    {
      key: 'delete-all',
      label: 'Delete All',
      icon: 'lucide:trash',
      color: 'danger',
      handler: async (selectedIds) => {
        if (confirm(`Delete ${selectedIds.length} files?`)) {
          await deleteFiles(selectedIds)
        }
      }
    }
  ],

  fetchData: async () => await getFiles()
})
```

**How It Works:**
- **Context Menu Intelligence**: Right-click menu automatically shows only relevant actions
  - Single item selected → Only `singleActions` appear
  - Multiple items selected → Only `multipleActions` appear
- **Footer Actions**: Same logic applies to action buttons in column footer

### Navigable Column

```typescript
const navigableColumn: ColumnObject = {
  id: 'folders',
  name: 'Folders',

  itemClick: {
    type: 'navigate',
    handler: async (item, context) => {
      // Open a new column when item is clicked
      if (item.type === 'folder') {
        return {
          column: createSubfolderColumn(item.id)
        }
      }

      // Or trigger an action
      if (item.type === 'file') {
        return {
          action: 'download'
        }
      }

      // Or custom behavior
      return {
        custom: () => {
          showPreview(item)
        }
      }
    }
  },

  dataProvider: {
    fetch: async () => ({ items: [], hasMore: false })
  }
}
```

### Dynamic Column Factory

```typescript
const createUserFoldersColumn = (userId: string): ColumnObject => {
  return {
    id: `user_${userId}_folders`,
    name: 'Folders',
    parentColumn: 'users',

    dataProvider: {
      fetch: async ({ context }) => {
        // Access parent data
        const user = context.parentItem

        // Fetch folders for this user
        const folders = await api.getUserFolders(userId)

        return {
          items: folders,
          hasMore: false
        }
      }
    },

    itemClick: {
      type: 'navigate',
      handler: async (folder, context) => {
        // Get user from parent column
        const userId = context.getParentData(1)?.selectedItem?.id

        return {
          column: createFolderContentColumn(folder.id, userId)
        }
      }
    }
  }
}
```

## Using Context Data

The context object provides access to parent columns:

```typescript
dataProvider: {
  fetch: async ({ context }) => {
    // Get immediate parent
    const parent = context.parentItem

    // Get parent 2 levels up
    const grandparent = context.getParentData(2)?.selectedItem

    // Get specific column data
    const userData = context.getColumnData('users')

    // Access breadcrumb
    const path = context.breadcrumb.map(b => b.columnName).join(' / ')

    // Use in your query
    return {
      items: await fetchItems({
        parentId: parent?.id,
        userId: grandparent?.id
      }),
      hasMore: false
    }
  }
}
```

## Available Icons

Using Lucide icons:

```typescript
icon: 'lucide:user'       // User icon
icon: 'lucide:folder'     // Folder icon
icon: 'lucide:file'       // File icon
icon: 'lucide:book'       // Book icon
icon: 'lucide:file-text'  // Document icon
icon: 'lucide:clipboard'  // Clipboard icon
icon: 'lucide:download'   // Download icon
icon: 'lucide:trash'      // Trash icon
icon: 'lucide:edit'       // Edit icon
```

See [Lucide Icons](https://lucide.dev/icons/) for more options.

## Customization

### Column Width

```typescript
import { useExplorerStore } from 'vue-column-explorer'

const store = useExplorerStore()
store.setConfig({
  appearance: {
    columnWidth: 400 // Default is 300
  }
})
```

### Performance Settings

```typescript
store.setConfig({
  performance: {
    itemsPerPage: 100,     // Default is 50
    maxConcurrentRequests: 3  // Default is 2
  }
})
```

## Troubleshooting

### Column not opening
- Check that `itemClick` handler returns `{ column: ... }`
- Verify column ID is unique
- Check browser console for errors

### Filters not working
- Ensure filter keys match what you check in `dataProvider.fetch`
- Filters are passed in `filters` parameter

### Actions not visible
- Check `selection.enabled = true`
- Select at least one item
- Verify `visible` function if used

### Performance issues
- Reduce `itemsPerPage` if items are complex
- Implement virtual scrolling for 1000+ items
- Use pagination instead of loading all at once

## Development

### Type Checking

```bash
npm run type-check
```

### Build Package

```bash
npm run build
```

Output will be in `dist/` folder.

### Adding New Components

1. Create component in `src/components/`
2. Export from `src/index.ts`
3. Add TypeScript types to `src/types/index.ts`

## Support

For issues or questions, please check:
- Example code in `example/` folder
- Type definitions in `src/types/index.ts`
- Architecture documentation
