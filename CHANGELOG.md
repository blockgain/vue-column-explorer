# Vue Column Explorer - Değişiklik Geçmişi

## v2.0.0 - Basitleştirilmiş Mimari (2025-10-22)

### 🎉 Yeni Özellikler

#### 1. `createColumn` Helper Fonksiyonu
- Kolon oluşturmayı çok daha basit hale getirir
- Önceki karmaşık `ColumnObject` yerine basit bir API
- `columns/users.js` gibi bağımsız dosyalarda kolon tanımlama

```javascript
// ÖNCESİ (Karmaşık)
const usersColumn: ColumnObject = {
  id: 'users',
  dataProvider: {
    fetch: async (params) => {
      return { items: [...], hasMore: false }
    }
  },
  itemClick: {
    type: 'navigate',
    handler: async (item, context) => {
      return { column: nextColumn }
    }
  }
}

// SONRASI (Basit!)
const usersColumn = createColumn({
  id: 'users',
  fetchData: () => getUsers(),
  onItemClick: (item) => createNextColumn(item.id)
})
```

#### 2. Klasör Sayıları ve Chevron
- Klasör ve item'lara `count` özelliği eklendi
- Sağda otomatik olarak sayı gösterilir
- `hasChildren: true` ile chevron ikonu gösterilir

```javascript
{
  id: 'books',
  name: 'Kitaplar',
  count: 15,  // Sağda "15" gösterir
  hasChildren: true  // Chevron ikonu gösterir
}
```

#### 3. Checkbox Konumu Değişti
- Checkbox artık solda gösteriliyor (önceden sağdaydı)
- Daha doğal bir kullanıcı deneyimi

#### 4. Mail Gönder Aksiyonu
- `lucide:mail` ikonu eklendi
- Çoklu seçimde "Mail Gönder" aksiyonu örneği

#### 5. Geliştirilmiş Breadcrumb
- Artık doğru kolon isimlerini gösteriyor
- "Files > Files > Files" yerine "Users > Folders > Books > JavaScript"
- Her seviyede doğru item ismi

### 🐛 Düzeltilen Hatalar

1. **Boş Liste Hatası**: Kitap klasörüne tıklandığında liste boş geliyordu → Düzeltildi
2. **Breadcrumb Tekrarı**: "Files" tekrar tekrar görünüyordu → Düzeltildi
3. **Çoklu Seçim**: Books ve Notes kolonlarında çoklu seçim çalışmıyordu → Düzeltildi
4. **Yanlış Breadcrumb**: "Books" breadcrumb'da görünmüyordu → Düzeltildi

### 🔄 Değişiklikler

#### Kolon Yapısı
```
ÖNCESİ:
example/
├── columns.ts       # Tüm kolonlar tek dosyada
└── mockData.ts

SONRASI:
example/
├── columns/
│   ├── users.ts      # Her kolon ayrı dosya
│   ├── folders.ts
│   ├── books.ts
│   ├── notes.ts
│   └── bookFiles.ts
└── mockData.ts
```

#### Çoklu Seçim Ayarları
- Users: Tek seçim (allowMultipleSelection: false)
- Books: Çoklu seçim (allowMultipleSelection: true)
- Notes: Çoklu seçim (allowMultipleSelection: true)
- Book Files: Çoklu seçim (allowMultipleSelection: true)

#### Aksiyonlar
Artık Books, Notes ve Book Files kolonlarında:
- ✉️ Mail Gönder
- ⬇️ İndir

### 📚 Yeni Dokümantasyon

1. **SIMPLE_USAGE.md** - Türkçe basit kullanım kılavuzu
2. **README.md** - Yenilenmiş, emoji'lerle zenginleştirilmiş
3. **CHANGELOG.md** - Bu dosya

### 🎯 Migration Rehberi (v1 → v2)

Eğer eski versiyonu kullanıyorsanız:

**1. Import değişikliği:**
```javascript
// ÖNCESİ
import { ExplorerContainer } from 'vue-column-explorer'
import { usersColumn } from './columns'

// SONRASI
import { ExplorerContainer } from 'vue-column-explorer'
import { usersColumn } from './columns/users'
```

**2. Kolon oluşturma:**
```javascript
// ÖNCESİ
import type { ColumnObject } from 'vue-column-explorer'
const myColumn: ColumnObject = { /* ... */ }

// SONRASI
import { createColumn } from 'vue-column-explorer'
const myColumn = createColumn({ /* ... */ })
```

**3. Checkbox konumu:**
- Otomatik sol tarafa taşındı, değişiklik gerekmez

**4. Item count:**
```javascript
// Klasörlere count ekleyin
return {
  id: 'books',
  name: 'Kitaplar',
  count: 15,        // YENİ
  hasChildren: true // YENİ
}
```

### 🚀 Performans

- Type checking: ✅ Hata yok
- Build: ✅ Başarılı
- Dev server: ✅ Çalışıyor
- HMR: ✅ Aktif

### 📦 Bağımlılıklar

Değişiklik yok:
- Vue 3.4+
- Pinia 2.1+
- Lucide Vue Next 0.344+

---

## v1.0.0 - İlk Sürüm (2025-10-22)

### ✨ İlk Özellikler

- Multi-column navigation
- Breadcrumb navigation
- Filtering (search, number)
- Single/multiple selection
- Actions
- Context menu
- Virtual scrolling
- TypeScript support
- Lucide icons

### 📁 İlk Yapı

- ExplorerContainer
- ExplorerColumn
- ExplorerItem
- ExplorerBreadcrumb
- ExplorerContextMenu
- Pinia store
- Type definitions

### 🎬 İlk Demo

Users → [Books|Notes] → Content yapısı
