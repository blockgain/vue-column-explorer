# Vue Column Explorer - Basit Kullanım Kılavuzu

## Temel Kullanım

Vue Column Explorer'ı kullanmak çok basittir. Sadece `createColumn` helper fonksiyonunu kullanarak kolonlarınızı oluşturun.

## Adım 1: Kolon Dosyaları Oluşturun

### `columns/users.js` (veya .ts)

```javascript
import { createColumn } from 'vue-column-explorer'

export const usersColumn = createColumn({
  id: 'users',
  name: 'Kullanıcılar',

  // Veriyi getir
  fetchData: ({ filters }) => {
    let users = getMyUsers() // Kendi veriniz

    // Filtreleme
    if (filters.search) {
      users = users.filter(u => u.name.includes(filters.search))
    }

    // ExplorerItem formatına dönüştür
    return users.map(user => ({
      id: user.id,
      name: user.name,
      type: 'user',
      icon: 'lucide:user',
      metadata: { email: user.email },
      count: 5, // Opsiyonel: sağda gösterilecek sayı
      hasChildren: true // Opsiyonel: chevron göster
    }))
  },

  // Bir item'a tıklandığında ne olacak?
  onItemClick: (item) => {
    // Yeni bir kolon aç
    return createFoldersColumn(item.id)
  },

  // Çoklu seçim?
  allowMultipleSelection: false,

  // Filtreler
  filters: [
    {
      key: 'search',
      label: 'Ara',
      type: 'search'
    }
  ]
})
```

### `columns/folders.js`

```javascript
import { createColumn } from 'vue-column-explorer'

export function createFoldersColumn(userId) {
  return createColumn({
    id: `folders_${userId}`,
    name: 'Klasörler',

    fetchData: () => {
      return [
        {
          id: 'documents',
          name: 'Dökümanlar',
          type: 'folder',
          icon: 'lucide:folder',
          count: 10,
          hasChildren: true
        },
        {
          id: 'images',
          name: 'Resimler',
          type: 'folder',
          icon: 'lucide:folder',
          count: 25,
          hasChildren: true
        }
      ]
    },

    onItemClick: (item) => {
      // Klasör içeriğini göster
      return createFilesColumn(userId, item.id)
    },

    allowMultipleSelection: false
  })
}
```

### `columns/files.js`

```javascript
import { createColumn } from 'vue-column-explorer'

export function createFilesColumn(userId, folderId) {
  return createColumn({
    id: `files_${userId}_${folderId}`,
    name: 'Dosyalar',

    fetchData: () => {
      const files = getFiles(userId, folderId) // Kendi veriniz

      return files.map(file => ({
        id: file.id,
        name: file.name,
        type: 'file',
        icon: 'lucide:file',
        metadata: { size: file.size, date: file.date }
      }))
    },

    onItemClick: () => {
      // Dosyalar için yeni kolon açma
      return null
    },

    // Çoklu seçim aktif
    allowMultipleSelection: true,

    // Seçili dosyalar için aksiyonlar
    actions: [
      {
        key: 'send-mail',
        label: 'Mail Gönder',
        icon: 'lucide:mail',
        color: 'primary',
        handler: async (selectedIds) => {
          console.log('Mail gönderiliyor:', selectedIds)
          // Mail gönderme işlemi
        }
      },
      {
        key: 'download',
        label: 'İndir',
        icon: 'lucide:download',
        color: 'primary',
        handler: async (selectedIds) => {
          console.log('İndiriliyor:', selectedIds)
          // İndirme işlemi
        }
      },
      {
        key: 'delete',
        label: 'Sil',
        icon: 'lucide:trash',
        color: 'danger',
        handler: async (selectedIds) => {
          if (confirm('Silmek istediğinize emin misiniz?')) {
            await deleteFiles(selectedIds)
          }
        }
      }
    ]
  })
}
```

## Adım 2: App.vue'de Kullanın

```vue
<template>
  <ExplorerContainer :root-column="usersColumn" />
</template>

<script setup>
import { ExplorerContainer } from 'vue-column-explorer'
import { usersColumn } from './columns/users'
</script>
```

## Özellikler

### 1. fetchData Parametreleri

```javascript
fetchData: ({ filters, page, context, parentId }) => {
  // filters: Aktif filtreler { search: 'ahmet', age: '18' }
  // page: Sayfa numarası (pagination için)
  // context: Parent kolonlardan gelen veri
  // parentId: Seçili parent item ID
}
```

### 2. Item Yapısı

```javascript
{
  id: 'unique-id',           // Zorunlu: Benzersiz ID
  name: 'Görünen isim',      // Zorunlu: Gösterilecek isim
  type: 'user|folder|file',  // Zorunlu: Tip
  icon: 'lucide:user',       // Opsiyonel: Lucide icon
  metadata: { ... },         // Opsiyonel: Alt bilgi
  count: 5,                  // Opsiyonel: Sağda gösterilecek sayı
  hasChildren: true          // Opsiyonel: Chevron göster
}
```

### 3. Mevcut İkonlar

```javascript
'lucide:user'       // Kullanıcı
'lucide:folder'     // Klasör
'lucide:file'       // Dosya
'lucide:book'       // Kitap
'lucide:file-text'  // Döküman
'lucide:mail'       // Mail
'lucide:download'   // İndir
'lucide:trash'      // Sil
'lucide:edit'       // Düzenle
```

[Tüm ikonlar için](https://lucide.dev/icons/)

### 4. Filtre Tipleri

```javascript
filters: [
  {
    key: 'search',
    label: 'Ara',
    type: 'search'  // Metin arama
  },
  {
    key: 'age',
    label: 'Yaş >',
    type: 'number'  // Sayı filtresi
  },
  {
    key: 'status',
    label: 'Durum',
    type: 'select',  // Seçim listesi
    options: [
      { value: 'active', label: 'Aktif' },
      { value: 'inactive', label: 'Pasif' }
    ]
  }
]
```

### 5. Aksiyon Renkleri

```javascript
actions: [
  {
    color: 'primary',  // Mavi
    // veya
    color: 'danger',   // Kırmızı
    // veya renk belirtmeyin (varsayılan gri)
  }
]
```

## Gerçek Veri Entegrasyonu

### API'den Veri Çekme

```javascript
export const usersColumn = createColumn({
  id: 'users',
  name: 'Kullanıcılar',

  fetchData: async ({ filters, page }) => {
    // API'den veri çek
    const response = await fetch(`/api/users?page=${page}&search=${filters.search || ''}`)
    const data = await response.json()

    // Formatla ve döndür
    return data.users.map(user => ({
      id: user.id,
      name: user.fullName,
      type: 'user',
      icon: 'lucide:user',
      metadata: { email: user.email }
    }))
  }
})
```

### Vuex/Pinia Store'dan Veri

```javascript
import { useUserStore } from '@/stores/user'

export const usersColumn = createColumn({
  id: 'users',
  name: 'Kullanıcılar',

  fetchData: ({ filters }) => {
    const userStore = useUserStore()
    let users = userStore.users

    // Filtrele
    if (filters.search) {
      users = users.filter(u => u.name.includes(filters.search))
    }

    return users.map(user => ({
      id: user.id,
      name: user.name,
      type: 'user',
      icon: 'lucide:user'
    }))
  }
})
```

## Örnek Proje Yapısı

```
src/
├── columns/
│   ├── users.js         # Kullanıcılar kolonu
│   ├── folders.js       # Klasörler kolonu
│   ├── files.js         # Dosyalar kolonu
│   └── index.js         # Tümünü export et
├── components/
│   └── MyExplorer.vue   # Explorer component
└── App.vue
```

## İpuçları

1. **Basit tutun**: Her kolon sadece kendi işini yapsın
2. **Dinamik ID**: Parent ID'leri kullanarak dinamik kolonlar oluşturun
3. **Tip kontrolü**: TypeScript kullanıyorsanız `.ts` uzantısı kullanın
4. **Metadata**: Dosya boyutu, tarih gibi ek bilgileri metadata'da saklayın
5. **Count**: Klasörlerde içerdeki öğe sayısını göstermek için `count` kullanın
6. **hasChildren**: Chevron göstermek için `hasChildren: true` ekleyin

## Sorun Giderme

### Kolon açılmıyor
- `onItemClick` fonksiyonunun bir `ColumnObject` döndürdüğünden emin olun
- Veya navigasyon istemiyorsanız `null` döndürün

### Çoklu seçim çalışmıyor
- `allowMultipleSelection: true` olduğundan emin olun
- En az bir `action` tanımlayın

### Filtreler çalışmıyor
- `fetchData` içinde `filters` parametresini kullandığınızdan emin olun
- Filter key'leri eşleşiyor mu kontrol edin

### Aksiyonlar görünmüyor
- `allowMultipleSelection` veya `actions` tanımlı mı?
- En az bir item seçili mi?
