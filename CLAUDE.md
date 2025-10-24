# Vue Column Explorer - Claude İçin Teknik Mimari Dokümantasyonu

> Bu doküman, Claude'un Vue Column Explorer projesini tamamen anlaması ve kod geliştirmeleri yapabilmesi için hazırlanmıştır.

## 📋 İçindekiler

1. [Proje Genel Bakış](#proje-genel-bakış)
2. [Mimari Yapı](#mimari-yapı)
3. [Veri Akışı](#veri-akışı)
4. [Type System](#type-system)
5. [Component Hiyerarşisi](#component-hiyerarşisi)
6. [State Management](#state-management)
7. [Helper Functions](#helper-functions)
8. [Örnek Uygulama](#örnek-uygulama)
9. [Kod Geliştirme Kuralları](#kod-geliştirme-kuralları)
10. [Sorun Giderme](#sorun-giderme)

---

## Proje Genel Bakış

### Amaç
Vue 3 için macOS Finder tarzı multi-column file explorer component. Kullanıcılar kolayca hiyerarşik veri yapılarını gezebilir.

### Temel Özellikler
- ✅ Multi-column navigation
- ✅ Breadcrumb navigation
- ✅ Filtering (search, number, select)
- ✅ Sorting (custom sort functions)
- ✅ Single/multiple selection
- ✅ Actions on selected items (single/multiple)
- ✅ Intelligent context menu
- ✅ Colored badges (status indicators)
- ✅ TypeScript support
- ✅ Lucide icons
- ✅ Basit `createColumn` API

### Teknoloji Stack
```
Vue 3.4+ (Composition API)
TypeScript 5.4+
Pinia 2.1+ (State Management)
Vite 5.1+ (Build Tool)
Lucide Vue Next 0.344+ (Icons)
```

---

## Mimari Yapı

### Klasör Yapısı
```
src/
├── components/           # Vue components
│   ├── ExplorerContainer.vue    # Ana container
│   ├── ExplorerColumn.vue       # Tek bir kolon
│   ├── ExplorerItem.vue         # Tek bir satır/öğe
│   ├── ExplorerBreadcrumb.vue   # Breadcrumb navigasyon
│   └── ExplorerContextMenu.vue  # Sağ-tık menüsü
├── stores/
│   └── explorer.ts              # Pinia store
├── helpers/
│   └── columnBuilder.ts         # Basit kolon oluşturma helper
├── types/
│   └── index.ts                 # TypeScript type definitions
└── index.ts                     # Package exports

example/
├── columns/              # Kolon tanımlamaları (modüler)
│   ├── users.ts          # Users example with sorting
│   ├── folders.ts
│   ├── books.ts
│   ├── notes.ts
│   ├── bookFiles.ts
│   └── orders.ts         # Orders example with badges
├── mockData.ts          # Örnek veri
├── App.vue              # Demo app with example switcher
└── main.ts              # Entry point
```

### Mimari Katmanlar

```
┌─────────────────────────────────────────┐
│         USER INTERFACE LAYER            │
│  (ExplorerContainer, Column, Item)      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      STATE MANAGEMENT LAYER             │
│         (Pinia Store)                   │
│  - Column states                        │
│  - Selection tracking                   │
│  - Breadcrumb management                │
│  - Filter state                         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         DATA PROVIDER LAYER             │
│    (User-defined fetch functions)      │
│  - API calls                            │
│  - Data transformation                  │
│  - Filtering logic                      │
└─────────────────────────────────────────┘
```

---

## Veri Akışı

### 1. Kolon Açılma Akışı

```
User clicks item
    ↓
ExplorerItem emits 'click' event
    ↓
ExplorerColumn handles click → store.selectItem()
    ↓
ExplorerContainer handles item-click → store.navigateToItem()
    ↓
Store executes itemClick.handler
    ↓
Handler returns new ColumnObject
    ↓
Store calls openColumn()
    ↓
Store updates breadcrumb
    ↓
Store calls loadColumnData()
    ↓
dataProvider.fetch() called with context
    ↓
Items loaded into column state
    ↓
ExplorerColumn re-renders with new items
```

### 2. Filtreleme Akışı

```
User types in filter input
    ↓
ExplorerColumn emits 'filter-change'
    ↓
ExplorerContainer handles event → store.setFilter()
    ↓
Store updates column filters
    ↓
Store calls loadColumnData(index, 0) // page 0
    ↓
dataProvider.fetch() called with new filters
    ↓
Filtered items returned
    ↓
Column re-renders with filtered items
```

### 3. Seçim ve Aksiyon Akışı

```
User selects items (checkbox or click)
    ↓
ExplorerItem emits 'select'
    ↓
ExplorerColumn handles → store.selectItem()
    ↓
Store updates selectedIds Set
    ↓
Column footer shows selection count
    ↓
User clicks action button
    ↓
ExplorerColumn emits 'action'
    ↓
ExplorerContainer → store.executeAction()
    ↓
Action handler called with selectedIds
    ↓
Handler executes (API call, download, etc.)
    ↓
Store refreshes column
```

### 4. Breadcrumb Navigasyon Akışı

```
User clicks breadcrumb item
    ↓
ExplorerBreadcrumb emits 'navigate' with index
    ↓
ExplorerContainer → store.navigateToBreadcrumb(index)
    ↓
Store deletes columns after index
    ↓
Store updates activeColumnIndex
    ↓
Store trims breadcrumb array
    ↓
UI updates to show only columns up to index
```

### 5. Sıralama Akışı

```
User opens filter panel and selects sort option
    ↓
ExplorerColumn emits 'sort-change'
    ↓
ExplorerContainer → store.setSort()
    ↓
Store updates column.currentSort
    ↓
Store calls loadColumnData(index, 0) // page 0
    ↓
dataProvider.fetch() returns items
    ↓
Store applies sortFn from sortOptions
    ↓
Sorted items displayed in column
```

### 6. Akıllı Context Menu Akışı

```
User right-clicks item
    ↓
ExplorerContainer.handleContextMenu()
    ↓
Check selectedIds.size
    ↓
Filter actions based on selection mode:
  - Single selection: show only showOnSingleSelect actions
  - Multiple selection: show only showOnMultipleSelect actions
    ↓
Context menu opens with filtered actions
    ↓
User clicks action
    ↓
executeAction() called with selected IDs
```

---

## Type System

### Ana Tipler

#### 1. ExplorerItem
```typescript
interface ExplorerItem {
  id: string                      // ZORUNLU: Benzersiz tanımlayıcı
  name: string                    // ZORUNLU: Görünen isim
  type: string                    // ZORUNLU: Öğe tipi (user, folder, file)
  icon?: string                   // Opsiyonel: Lucide icon adı
  metadata?: Record<string, any>  // Opsiyonel: Ek bilgiler (size, date, vb.)
  count?: number                  // Opsiyonel: Sağda gösterilecek sayı
  hasChildren?: boolean           // Opsiyonel: Chevron ikonu göster
  badge?: string                  // Opsiyonel: Badge text (status, durum vb.)
  badgeColor?: string             // Opsiyonel: Badge rengi ('success', 'error', 'warning', 'info' veya CSS rengi)
  [key: string]: any              // Ek özel alanlar
}
```

**Kullanım Örnekleri:**
```typescript
// Kullanıcı
{
  id: 'user-1',
  name: 'Ahmet Yılmaz',
  type: 'user',
  icon: 'lucide:user',
  metadata: { email: 'ahmet@example.com', age: 28 },
  count: 2,  // 2 klasör var
  hasChildren: true
}

// Klasör
{
  id: 'books',
  name: 'Kitaplar',
  type: 'folder',
  icon: 'lucide:book',
  count: 15,  // 15 kitap var
  hasChildren: true
}

// Dosya
{
  id: 'file-1',
  name: 'book.pdf',
  type: 'file',
  icon: 'lucide:file',
  metadata: { size: '2.4 MB', pages: 176 }
}

// Sipariş (Badge ile)
{
  id: 'order-1',
  name: 'ORD-001',
  type: 'order',
  icon: 'lucide:clipboard',
  description: 'Ahmet Yılmaz - 1,250.00 TL',
  badge: 'Tamamlandı',
  badgeColor: 'success',  // Yeşil badge
  metadata: { customer: 'Ahmet Yılmaz', amount: 1250, status: 'completed' }
}

// Badge renk seçenekleri:
// - 'success'  → Yeşil (tamamlandı, başarılı)
// - 'error'    → Kırmızı (hata, başarısız)
// - 'warning'  → Sarı (bekliyor, uyarı)
// - 'info'     → Mavi (işleniyor, bilgi)
// - Veya direkt CSS rengi: '#FF5733', 'rgb(255, 87, 51)'
```

#### 2. ColumnObject (Düşük Seviye - createColumn kullanın)
```typescript
interface ColumnObject {
  id: string                    // Benzersiz kolon ID
  name: string                  // Kolon başlığı
  parentColumn?: string         // Parent kolon ID
  dataProvider: DataProvider    // Veri sağlayıcı
  selection?: SelectionConfig   // Seçim ayarları
  actions?: ActionHandler[]     // Aksiyonlar
  itemClick?: ItemClickHandler  // Tıklama davranışı
  view?: ViewConfig            // Görünüm ayarları
  filters?: FilterOption[]     // Filtreler
  sortOptions?: SortOption[]   // Sıralama seçenekleri
}
```

**NOT:** Doğrudan ColumnObject oluşturmak yerine `createColumn` helper'ını kullanın!

#### 3. SimpleColumnConfig (Yüksek Seviye - ÖNERİLEN)
```typescript
interface SimpleColumnConfig {
  id: string
  name: string
  fetchData: (params: FetchParams) => Promise<ExplorerItem[]> | ExplorerItem[]
  onItemClick?: (item: ExplorerItem, context: any) => ColumnObject | null
  allowMultipleSelection?: boolean
  filters?: Array<{
    key: string
    label: string
    type: 'search' | 'number' | 'select'
    options?: any[]
  }>
  sortOptions?: Array<{
    key: string
    label: string
    sortFn: (a: ExplorerItem, b: ExplorerItem) => number
  }>
  singleActions?: Array<{      // Tek seçimde gösterilecek aksiyonlar
    key: string
    label: string
    icon?: string
    color?: string
    skipRefresh?: boolean
    handler: (selectedIds: string[]) => void | Promise<void>
  }>
  multipleActions?: Array<{    // Çoklu seçimde gösterilecek aksiyonlar
    key: string
    label: string
    icon?: string
    color?: string
    skipRefresh?: boolean
    handler: (selectedIds: string[]) => void | Promise<void>
  }>
}
```

#### 4. ContextData
```typescript
interface ContextData {
  parentId?: string | null          // Parent item ID
  parentItem?: ExplorerItem | null  // Parent item tam objesi
  breadcrumb: BreadcrumbItem[]      // Tam navigasyon yolu
  globalFilters: FilterObject       // Global filtreler
  columnChain: ColumnChainItem[]    // Tüm kolon zinciri

  // Helper methods
  getParentData(depth: number): ColumnChainItem | undefined
  getColumnData(columnId: string): ColumnChainItem | undefined
}
```

**Kullanım:**
```typescript
fetchData: ({ context }) => {
  // 1 seviye üst parent
  const parent = context.parentItem

  // 2 seviye üst
  const grandparent = context.getParentData(2)?.selectedItem

  // Spesifik kolon verisi
  const userData = context.getColumnData('users')

  return getItems(parent?.id, grandparent?.id)
}
```

---

## Component Hiyerarşisi

### Component Ağacı

```
ExplorerContainer (root)
├── ExplorerBreadcrumb
│   └── BreadcrumbItem (v-for) [button]
│
├── ExplorerViewport [div.explorer-viewport]
│   └── ExplorerColumn (v-for visible columns)
│       ├── ColumnHeader [div]
│       │   ├── Title [h3]
│       │   ├── FilterButton [button] (v-if hasFilters)
│       │   └── RefreshButton [button]
│       │
│       ├── ColumnFilters [div] (v-if showFilters)
│       │   └── FilterItem (v-for) [input/select]
│       │
│       ├── ColumnContent [div with scroll]
│       │   ├── LoadingSkeleton (v-if isLoading && no items)
│       │   ├── ErrorState (v-else-if error)
│       │   ├── EmptyState (v-else-if no items)
│       │   └── ItemsList (v-else)
│       │       ├── ExplorerItem (v-for items)
│       │       │   ├── Checkbox [input] (v-if selectable, LEFT side)
│       │       │   ├── ItemContent [div]
│       │       │   │   ├── Icon [lucide component]
│       │       │   │   └── Details [div]
│       │       │   │       ├── Name [div]
│       │       │   │       └── Metadata [div] (v-if metadata)
│       │       │   └── ChevronInfo [div] (v-if count/hasChildren, RIGHT side)
│       │       │       ├── Count [span] (v-if count)
│       │       │       └── ChevronRight [lucide]
│       │       └── LoadingMore (v-if loading more)
│       │
│       └── ColumnFooter (v-if hasSelection)
│           ├── SelectionInfo [div]
│           └── QuickActions [div]
│               └── ActionButton (v-for visible actions)
│
└── ExplorerContextMenu (Teleport to body)
    └── ContextMenuItem (v-for actions)
```

### Component Sorumlulukları

#### ExplorerContainer
**Görevler:**
- Root component
- Store'u başlatır
- Event routing (item-click, item-select, vb.)
- Context menu yönetimi
- Root column'u mount eder

**Props:**
```typescript
{
  rootColumn?: ColumnObject  // İlk gösterilecek kolon
}
```

**Key Methods:**
```typescript
handleItemClick(item, columnIndex)      // Item tıklama
handleItemSelect(item, columnIndex, isMultiple) // Seçim
handleContextMenu(item, columnIndex, event)     // Sağ tık
handleBreadcrumbNavigate(index)         // Breadcrumb tıklama
handleRefresh(columnIndex)              // Yenileme
handleLoadMore(columnIndex)             // Daha fazla yükle
handleAction(actionKey, columnIndex)    // Aksiyon çalıştır
handleFilterChange(key, value, index)   // Filtre değişimi
```

#### ExplorerColumn
**Görevler:**
- Tek bir kolon görünümü
- Item listesini render eder
- Filtreleri gösterir
- Seçim footer'ını gösterir
- Scroll olaylarını yönetir

**Props:**
```typescript
{
  columnState: ColumnState  // Kolon state'i
  index: number             // Kolon index'i
  isActive: boolean         // Aktif kolon mu
}
```

**Emits:**
```typescript
'item-click'        // (item, columnIndex)
'item-select'       // (item, columnIndex, isMultiple)
'context-menu'      // (item, columnIndex, event)
'refresh'           // (columnIndex)
'load-more'         // (columnIndex)
'action'            // (actionKey, columnIndex)
'filter-change'     // (filterKey, value, columnIndex)
```

**Önemli Computed:**
```typescript
hasFilters          // Filtre var mı?
hasSelection        // Seçili item var mı?
visibleActions      // Görünür aksiyonlar (visible fn check)
```

#### ExplorerItem
**Görevler:**
- Tek bir satırı render eder
- Icon, name, metadata gösterir
- Checkbox (solda), Count/Chevron (sağda)
- Click, double-click, context-menu events

**Props:**
```typescript
{
  item: ExplorerItem
  selected: boolean
  selectable: boolean
  clickable: boolean
  showIcon: boolean
  showMetadata: boolean
}
```

**Emits:**
```typescript
'click'         // (item, event)
'dblclick'      // (item, event)
'contextmenu'   // (item, event)
'select'        // (item, isMultiple)
```

**Layout:**
```
[Checkbox] [Icon] [Name/Metadata] ........... [Count] [Chevron]
   (sol)                                        (sağ)
```

#### ExplorerBreadcrumb
**Görevler:**
- Navigasyon yolunu gösterir
- Geri gitme için tıklanabilir
- Breadcrumb item'ları arasında separator

**Props:**
```typescript
{
  breadcrumb: BreadcrumbItem[]
}
```

**Emits:**
```typescript
'navigate'  // (index)
```

**Görünüm:**
```
Users > Ahmet Yılmaz > Books > JavaScript
```

#### ExplorerContextMenu
**Görevler:**
- Sağ tık menüsü
- Teleport to body (z-index için)
- Click outside to close

**Props:**
```typescript
{
  visible: boolean
  x: number               // Mouse X position
  y: number               // Mouse Y position
  actions: ActionHandler[]
}
```

**Emits:**
```typescript
'close'         // Menü kapat
'action'        // (actionKey)
```

---

## State Management

### Pinia Store (useExplorerStore)

#### State Yapısı
```typescript
{
  columns: Map<number, ColumnState>  // Index → Column mapping
  activeColumnIndex: number          // Aktif kolon index'i
  breadcrumb: BreadcrumbItem[]       // Breadcrumb yolu
  globalFilters: FilterObject        // Global filtreler
  config: ExplorerConfig             // Görünüm konfigürasyonu
}
```

#### ColumnState Yapısı
```typescript
{
  config: ColumnObject        // Kolon konfigürasyonu
  items: ExplorerItem[]       // Yüklü öğeler
  selectedIds: Set<string>    // Seçili ID'ler
  page: number                // Mevcut sayfa
  hasMore: boolean            // Daha fazla veri var mı
  isLoading: boolean          // Yükleniyor mu
  error: Error | null         // Hata
  filters: FilterObject       // Aktif filtreler
}
```

#### Getters

**visibleColumns**: `ColumnState[]`
- 0'dan activeColumnIndex'e kadar olan tüm kolonlar
- UI'da görünen kolonlar

**currentSelection**: `Set<string>`
- Aktif kolondaki seçili ID'ler

**canNavigateForward**: `boolean`
- Aktif kolonda seçili item var mı (navigasyon için gerekli)

**getContext**: `ContextData`
- Mevcut context objesini oluşturur
- columnChain'i build eder
- Parent bilgilerini toplar

#### Actions

##### openColumn(config: ColumnObject, index?: number)
```typescript
// Yeni kolon açar
// Index sonrasındaki tüm kolonları kapatır
// Column state'i initialize eder
// Breadcrumb'ı günceller (sadece ilk kolon için)
// loadColumnData() çağırır
```

##### loadColumnData(index: number, page: number = 0)
```typescript
// Kolon verilerini yükler
// dataProvider.fetch() çağırır
// Context'i hazırlar ve geçirir
// Items'ı state'e ekler
// Loading state'i yönetir
```

##### selectItem(columnIndex: number, itemId: string, isMultiple: boolean)
```typescript
// Item seçimi yapar
// Multiple seçim kontrolü
// Tek seçimde diğerlerini temizler
// Set'e ekler/çıkarır
// Breadcrumb günceller (eğer aktif kolondaysa)
```

##### navigateToItem(item: ExplorerItem, columnIndex: number)
```typescript
// Item'a tıklandığında navigasyon
// itemClick.handler'ı çalıştırır
// Yeni ColumnObject döndürürse openColumn() çağırır
// Breadcrumb'ı doğru şekilde günceller:
//   1. Mevcut breadcrumb'ı trim eder (columnIndex + 1'e kadar)
//   2. Yeni item bilgisini ekler
// Action veya custom handler'ları destekler
```

##### executeAction(columnIndex: number, actionKey: string)
```typescript
// Action'ı çalıştırır
// Seçili ID'leri toplar
// Context hazırlar
// action.handler() çağırır
// İşlem sonrası kolonu refresh eder
```

##### navigateToBreadcrumb(index: number)
```typescript
// Breadcrumb'dan geri git
// Index sonrasındaki kolonları sil
// activeColumnIndex'i güncelle
// Breadcrumb'ı trim et
```

##### setFilter(columnIndex: number, filterKey: string, value: any)
```typescript
// Kolon filtresi ayarla
// value boşsa filtre kaldır
// loadColumnData(index, 0) çağır (ilk sayfa)
```

##### setSort(columnIndex: number, sortKey: string)
```typescript
// Kolon sıralamasını ayarla
// sortKey boşsa sıralamayı kaldır
// loadColumnData(index, 0) çağır (ilk sayfa)
// loadColumnData içinde sortFn uygulanır
```

---

## Helper Functions

### createColumn (columnBuilder.ts)

**Amaç:** Basit bir API ile ColumnObject oluşturma

**Signature:**
```typescript
function createColumn(config: SimpleColumnConfig): ColumnObject
```

**SimpleColumnConfig → ColumnObject Dönüşümü:**

```typescript
SimpleColumnConfig {
  id, name
  fetchData: (params) => ExplorerItem[]
  onItemClick?: (item, context) => ColumnObject | null
  allowMultipleSelection?: boolean
  filters?: [...]
  sortOptions?: [...]
  singleActions?: [...]
  multipleActions?: [...]
}

      ↓ createColumn() dönüşümü ↓

ColumnObject {
  id, name
  dataProvider: {
    fetch: async (params) => {
      items = await fetchData(params)
      return { items, hasMore: false }
    }
  }
  selection: {
    enabled: allowMultipleSelection || singleActions.length > 0 || multipleActions.length > 0
    multiple: allowMultipleSelection
  }
  filters: [...] // Mapped with default: undefined
  sortOptions: [...] // Direct pass-through
  actions: [
    ...singleActions.map(a => ({ ...a, showOnSingleSelect: true, showOnMultipleSelect: false })),
    ...multipleActions.map(a => ({ ...a, showOnSingleSelect: false, showOnMultipleSelect: true }))
  ]
  itemClick: onItemClick ? {
    type: 'navigate',
    handler: async (item, context) => {
      nextColumn = onItemClick(item, context)
      return nextColumn ? { column: nextColumn } : {}
    }
  } : undefined
  view: {
    showIcon: true,
    showMetadata: true,
    emptyMessage: `No ${name} found`
  }
}
```

**Önemli Detaylar:**

1. **fetchData Wrapping:**
   - User'ın synchronous veya async fonksiyonunu destekler
   - Sonucu `{ items, hasMore }` formatına wrap eder
   - hasMore her zaman false (pagination yok)

2. **Selection Auto-Enable:**
   - allowMultipleSelection tanımlıysa enabled = true
   - singleActions veya multipleActions varsa enabled = true
   - multiple sadece allowMultipleSelection ile kontrol edilir

3. **Actions Wrapping:**
   - singleActions → showOnSingleSelect: true, showOnMultipleSelect: false
   - multipleActions → showOnSingleSelect: false, showOnMultipleSelect: true
   - User handler: `(selectedIds) => void`
   - Wrapped handler: `(selectedIds, context) => Promise<void>`
   - Context parametresi eklenir ama handler'a geçilmez (backward compatibility)

4. **ItemClick Wrapping:**
   - null dönerse navigasyon olmaz
   - ColumnObject dönerse { column: ... } wrap edilir

5. **Sort Options:**
   - Direct pass-through, wrapping yok
   - sortFn store içinde loadColumnData'da uygulanır

---

## Örnek Uygulama

### Klasör Yapısı
```
example/
├── columns/
│   ├── users.ts        # Root kolon (sorting örneği)
│   ├── folders.ts      # User → Folders
│   ├── books.ts        # Folders → Books
│   ├── notes.ts        # Folders → Notes
│   ├── bookFiles.ts    # Books → PDF files
│   └── orders.ts       # Orders (badge örneği)
├── mockData.ts
├── App.vue             # Example switcher ile
└── main.ts
```

### Örnekler

**1. Users Example** - Sorting ve Single Selection
- Ada göre sıralama (A-Z, Z-A)
- Yaşa göre sıralama (Küçükten Büyüğe, Büyükten Küçüğe)
- Tek seçim
- Show User Detail aksiyonu

**2. Orders Example** - Badges ve Multiple Selection
- Renkli status badge'leri (Success, Error, Warning, Info)
- Status filter (dropdown)
- Çoklu seçim
- Export ve Delete aksiyonları

### Veri Akış Örneği

**Navigasyon Yolu:**
```
Users → Ahmet Yılmaz → Folders → Books → JavaScript → book.pdf
```

**Breadcrumb:**
```
[Users] > [Ahmet Yılmaz] > [Folders] > [Books] > [JavaScript]
```

**Column Hierarchy:**
```
Column 0: users
  ↓ onItemClick(Ahmet)
Column 1: folders_user-1
  ↓ onItemClick(Books)
Column 2: books_user-1
  ↓ onItemClick(JavaScript book)
Column 3: book_files_book-1-1
  → book.pdf (no navigation)
```

### Kolon Tanımlama Örneği

**users.ts:**
```typescript
import { createColumn } from '../../src/helpers/columnBuilder'

export const usersColumn = createColumn({
  id: 'users',
  name: 'Users',

  fetchData: ({ filters }) => {
    let users = [...mockUsers]

    if (filters.search) {
      users = users.filter(u =>
        u.fullName.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.age) {
      const ageValue = parseInt(filters.age)
      users = users.filter(u => u.age > ageValue)
    }

    return users.map(u => ({
      id: u.id,
      name: u.fullName,
      type: 'user',
      icon: 'lucide:user',
      metadata: { email: u.email, age: u.age },
      count: 2,  // Books and Notes folders
      hasChildren: true
    }))
  },

  onItemClick: (item) => createFoldersColumn(item.id),

  allowMultipleSelection: false,  // Tek seçim

  filters: [
    { key: 'search', label: 'Search Users', type: 'search' },
    { key: 'age', label: 'Age >', type: 'number' }
  ]
})
```

**books.ts:**
```typescript
export function createBooksColumn(userId: string) {
  return createColumn({
    id: `books_${userId}`,
    name: 'Books',

    fetchData: () => {
      const books = userBooks[userId] || []
      return books.map(book => ({
        ...book,
        count: bookFiles[book.id]?.length || 0,
        hasChildren: true
      }))
    },

    onItemClick: (item) => createBookFilesColumn(item.id, item.name),

    allowMultipleSelection: true,  // Çoklu seçim

    actions: [
      {
        key: 'send-mail',
        label: 'Mail Gönder',
        icon: 'lucide:mail',
        color: 'primary',
        handler: async (selectedIds) => {
          alert(`Mailing: ${selectedIds.join(', ')}`)
        }
      },
      {
        key: 'download',
        label: 'İndir',
        icon: 'lucide:download',
        color: 'primary',
        handler: async (selectedIds) => {
          alert(`Downloading: ${selectedIds.join(', ')}`)
        }
      }
    ]
  })
}
```

---

## Kod Geliştirme Kuralları

### 1. Yeni Kolon Ekleme

**Adımlar:**
1. `example/columns/` altında yeni .ts dosyası oluştur
2. `createColumn` kullan
3. `fetchData` fonksiyonunu implement et
4. `onItemClick` ile navigasyonu tanımla
5. Gerekirse `actions` ve `filters` ekle

**Template:**
```typescript
import { createColumn } from '../../src/helpers/columnBuilder'

export function createMyColumn(parentId: string) {
  return createColumn({
    id: `my-column_${parentId}`,
    name: 'My Column',

    fetchData: ({ filters, context }) => {
      // Veriyi getir
      const items = getMyData(parentId)

      // Filtrele
      if (filters.search) {
        items = items.filter(...)
      }

      // ExplorerItem formatına dönüştür
      return items.map(item => ({
        id: item.id,
        name: item.name,
        type: 'my-type',
        icon: 'lucide:icon-name',
        metadata: { ... },
        count: item.childCount,
        hasChildren: item.hasChildren
      }))
    },

    onItemClick: (item) => {
      if (item.type === 'folder') {
        return createNextColumn(item.id)
      }
      return null  // No navigation
    },

    allowMultipleSelection: true,

    actions: [
      {
        key: 'my-action',
        label: 'My Action',
        icon: 'lucide:icon',
        handler: async (ids) => {
          // Action logic
        }
      }
    ],

    filters: [
      {
        key: 'search',
        label: 'Search',
        type: 'search'
      }
    ]
  })
}
```

### 2. Yeni Component Ekleme

**Kurallar:**
- `src/components/` altına ekle
- Composition API kullan
- TypeScript ile tip tanımla
- Props ve Emits interface'lerini tanımla
- Scoped CSS kullan

**Template:**
```vue
<template>
  <div class="my-component">
    <!-- Component content -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MyType } from '../types'

interface Props {
  myProp: MyType
  optionalProp?: string
}

interface Emits {
  (e: 'my-event', data: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Component logic
</script>

<style scoped>
.my-component {
  /* Styles */
}
</style>
```

### 3. Store Action Ekleme

**Kurallar:**
- `src/stores/explorer.ts` içinde actions bölümüne ekle
- State'i doğrudan değiştir (Pinia allows this)
- Async işlemler için async/await kullan
- Error handling ekle

**Template:**
```typescript
async myNewAction(param: string) {
  const column = this.columns.get(this.activeColumnIndex)
  if (!column) return

  column.isLoading = true
  try {
    // Action logic
    const result = await someAsyncOperation(param)

    // Update state
    column.items = result
  } catch (error) {
    column.error = error as Error
    console.error('Error in myNewAction:', error)
  } finally {
    column.isLoading = false
  }
}
```

### 4. Type Tanımlama

**Kurallar:**
- `src/types/index.ts` içine ekle
- Interface kullan (type yerine)
- Export et
- Açıklayıcı yorumlar ekle

**Template:**
```typescript
export interface MyNewType {
  id: string              // Açıklama
  name: string            // Açıklama
  optional?: boolean      // Opsiyonel alan
  metadata?: Record<string, any>
}
```

### 5. Icon Ekleme

**Mevcut İkonlar:**
```typescript
// ExplorerItem.vue
User, Folder, File, Book, FileText, Clipboard, ChevronRight

// ExplorerColumn.vue
Filter, RefreshCw, Trash, Download, Edit, Mail
```

**Yeni İkon Ekleme:**
1. Lucide Vue Next'ten import et
2. iconComponent computed'a ekle
3. getIcon fonksiyonuna ekle

```typescript
// Import
import { MyNewIcon } from 'lucide-vue-next'

// Kullanım
const iconMap = {
  'lucide:my-icon': MyNewIcon
}
```

### 6. CSS Kuralları

**Naming Convention:**
```css
.component-name { }              /* Component root */
.component-name__element { }     /* Element (BEM) */
.component-name--modifier { }    /* Modifier (BEM) */
```

**Renkler:**
```css
/* Text */
--text-primary: #111827
--text-secondary: #6b7280
--text-tertiary: #9ca3af

/* Background */
--bg-primary: #ffffff
--bg-secondary: #f9fafb
--bg-hover: #f3f4f6

/* Border */
--border-color: #e5e7eb
--border-color-dark: #d1d5db

/* Accent */
--accent-primary: #3b82f6
--accent-hover: #2563eb
--accent-light: #dbeafe

/* Danger */
--danger: #ef4444
--danger-light: #fef2f2
```

### 7. Event Handling

**Naming:**
- Component events: kebab-case (`item-click`, `filter-change`)
- Handler fonksiyonlar: handleEventName (`handleItemClick`)

**Event Flow:**
```
Child emits → Parent handles → Store action
```

**Örnek:**
```typescript
// Child (ExplorerItem.vue)
emit('click', item, event)

// Parent (ExplorerColumn.vue)
@click="handleItemClick"
handleItemClick(item, event) {
  emit('item-click', item, props.index)
}

// Grandparent (ExplorerContainer.vue)
@item-click="handleItemClick"
handleItemClick(item, columnIndex) {
  store.navigateToItem(item, columnIndex)
}
```

---

## Sorun Giderme

### Kolon Açılmıyor

**Sebep 1:** onItemClick null döndürüyor
```typescript
// ❌ Yanlış
onItemClick: () => null

// ✅ Doğru
onItemClick: (item) => createNextColumn(item.id)
```

**Sebep 2:** ColumnObject ID'si unique değil
```typescript
// ❌ Yanlış - Her user için aynı ID
id: 'folders'

// ✅ Doğru - Unique ID
id: `folders_${userId}`
```

### Breadcrumb Yanlış Gösteriliyor

**Sebep:** navigateToItem'da breadcrumb güncellemesi yanlış

**Kontrol:**
```typescript
// navigateToItem içinde
this.breadcrumb = this.breadcrumb.slice(0, columnIndex + 1)
this.breadcrumb.push({
  columnId: result.column.id,
  columnName: result.column.name,
  itemId: item.id,
  itemName: item.name
})
```

### Filtreler Çalışmıyor

**Sebep:** fetchData içinde filters kullanılmıyor

```typescript
// ❌ Yanlış
fetchData: () => {
  return getAllItems()
}

// ✅ Doğru
fetchData: ({ filters }) => {
  let items = getAllItems()
  if (filters.search) {
    items = items.filter(i => i.name.includes(filters.search))
  }
  return items
}
```

### Çoklu Seçim Çalışmıyor

**Sebep 1:** allowMultipleSelection tanımlı değil
```typescript
allowMultipleSelection: true  // Ekle
```

**Sebep 2:** Actions tanımlı değil
```typescript
actions: [
  { key: 'download', label: 'Download', handler: (ids) => {} }
]
```

### Checkbox Görünmüyor

**Sebep:** Selection enabled değil

**Çözüm:**
- `allowMultipleSelection` tanımla VEYA
- `actions` array'i ekle

### Count/Chevron Görünmüyor

**Sebep:** Item'da count veya hasChildren yok

```typescript
// ✅ Doğru
return items.map(item => ({
  ...item,
  count: 5,
  hasChildren: true
}))
```

### TypeScript Hataları

**Sık Hatalar:**

1. **Type mismatch:**
```typescript
// ❌ Yanlış
fetchData: () => { return myData }

// ✅ Doğru
fetchData: (): ExplorerItem[] => {
  return myData.map(d => ({
    id: d.id,
    name: d.name,
    type: d.type
  }))
}
```

2. **Async/Sync karışması:**
```typescript
// ❌ Yanlış
fetchData: () => Promise.resolve([])

// ✅ Doğru (iki yol da OK)
fetchData: async () => await getItems()
fetchData: () => getItems()  // Promise döner
```

### Store State Güncellenmiyor

**Sebep:** Reactive olmayan değişiklik

```typescript
// ❌ Yanlış
column.items.push(newItem)  // Array mutation

// ✅ Doğru
column.items = [...column.items, newItem]

// VEYA Pinia'da mutation OK
column.items.push(newItem)  // Pinia bunu yakalıyor
```

---

## Performans Optimizasyonu

### 1. Virtual Scrolling

**Durum:** 100+ item varsa
**Çözüm:** Henüz implement edilmedi, gelecek versiyonda eklenecek

### 2. Pagination

**Durum:** Şu an hasMore her zaman false
**İyileştirme:**
```typescript
fetchData: ({ page }) => {
  const items = getItems()
  const pageSize = 50
  const start = page * pageSize
  const end = start + pageSize

  return {
    items: items.slice(start, end),
    hasMore: end < items.length
  }
}
```

**Store:**
```typescript
// loadColumnData zaten pagination destekliyor
// Sadece fetchData'da hasMore: true döndür
```

### 3. Debouncing Filters

**ExplorerColumn.vue:**
```typescript
import { debounce } from 'lodash-es'

const debouncedFilterChange = debounce((key, value) => {
  emit('filter-change', key, value, props.index)
}, 300)
```

---

## Gelecek İyileştirmeler

### Roadmap

1. **Virtual Scrolling** - 1000+ item için performans
2. **Drag & Drop** - Item taşıma
3. **Keyboard Navigation** - Arrow keys ile navigasyon
4. **Custom Themes** - CSS variables ile tema desteği
5. **Column Resizing** - Kolon genişliği değiştirme
6. **Search Highlight** - Arama sonuçlarını highlight
7. **Sorting** - Kolon bazlı sıralama
8. **Bulk Actions Progress** - Toplu işlem progress bar
9. **Undo/Redo** - İşlemleri geri alma
10. **Export/Import** - Veri export/import

---

## Özet Kontrol Listesi

**Yeni Özellik Eklerken:**

- [ ] Type tanımları eklendi mi? (`src/types/index.ts`)
- [ ] Component oluşturuldu mu? (`src/components/`)
- [ ] Store action gerekiyor mu? (`src/stores/explorer.ts`)
- [ ] Helper fonksiyon gerekiyor mu? (`src/helpers/`)
- [ ] Example güncellendi mi? (`example/`)
- [ ] TypeScript type check geçiyor mu? (`npm run type-check`)
- [ ] Dev server çalışıyor mu? (`npm run dev`)
- [ ] Dokümantasyon güncellendi mi?

**Kod Review Kontrolleri:**

- [ ] Props ve Emits interface tanımlı
- [ ] TypeScript strict mode uyumlu
- [ ] Event naming convention doğru
- [ ] CSS BEM naming kullanılmış
- [ ] Error handling mevcut
- [ ] Console.log'lar temizlenmiş
- [ ] Yorum satırları açıklayıcı

---

## Son Notlar

**Bu Dokümanı Kullanırken:**

1. **Type Sistemi:** Her zaman `src/types/index.ts` referans alın
2. **Store:** State değişiklikleri sadece store actions ile
3. **Helper:** createColumn kullanın, manuel ColumnObject oluşturmayın
4. **Events:** Event flow'u takip edin (Child → Parent → Store)
5. **CSS:** BEM naming ve mevcut color variables kullanın
6. **Icons:** Lucide icons, `lucide:icon-name` formatı
7. **Filters:** fetchData içinde filters parametresini kullanın
8. **Actions:** allowMultipleSelection veya actions tanımlayın

**Test Etmek İçin:**
```bash
npm run dev
# http://localhost:5173
```

**Build Etmek İçin:**
```bash
npm run build
```

**Type Check:**
```bash
npm run type-check
```

---

**Bu doküman, Claude'un Vue Column Explorer projesini tam olarak anlaması ve özerk kod geliştirmeleri yapabilmesi için tüm gerekli bilgileri içermektedir.**
