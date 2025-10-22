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

### Users → [Books|Notes] → Content Structure

The example demonstrates a hierarchical file explorer:

```
Users (3 users)
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

### Features to Test

#### 1. Search & Filters

**Search Users:**
1. Click the filter button (funnel icon) in Users column
2. Type a name in "Search Users" input
3. Users list filters in real-time

**Age Filter:**
1. Click the filter button in Users column
2. Enter "18" in the "Age >" field
3. Only users older than 18 appear (filters out Mehmet Demir)

#### 2. Navigation

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

#### 3. Selection & Actions

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
2. Click "Download" or "Delete" button in footer
3. Alert shows what would happen

#### 4. Context Menu

**Right-Click Download:**
1. Navigate to a book.pdf file
2. Right-click on the file
3. Context menu appears
4. Click "Download"
5. Alert shows download action

#### 5. Refresh

1. Click refresh button (circular arrow) in any column header
2. Column reloads with fresh data

## Creating Your Own Columns

### Basic Column

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
const columnWithFilters: ColumnObject = {
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
      type: 'number',
      operator: 'gt'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  ],

  dataProvider: {
    fetch: async ({ filters }) => {
      // Use filters.search, filters.age, filters.status
      // in your query
      return { items: [], hasMore: false }
    }
  }
}
```

### Column with Actions

```typescript
const columnWithActions: ColumnObject = {
  id: 'actionable-column',
  name: 'Files',

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
        // Download selected items
        for (const id of selectedIds) {
          await downloadFile(id)
        }
      }
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: 'lucide:trash',
      color: 'danger',
      visible: (items) => {
        // Only show if user has permission
        return hasDeletePermission()
      },
      handler: async (selectedIds) => {
        if (confirm('Delete items?')) {
          await deleteFiles(selectedIds)
        }
      }
    }
  ],

  dataProvider: {
    fetch: async () => ({ items: [], hasMore: false })
  }
}
```

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
