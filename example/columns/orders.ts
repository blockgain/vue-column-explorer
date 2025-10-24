import { createColumn } from '../../src/helpers/columnBuilder'
import { orders } from '../mockData'

// Status to badge color mapping
const statusColorMap = {
  'completed': 'success',
  'processing': 'info',
  'pending': 'warning',
  'failed': 'error'
}

// Status labels in Turkish
const statusLabelMap = {
  'completed': 'Tamamlandı',
  'processing': 'İşleniyor',
  'pending': 'Bekliyor',
  'failed': 'Başarısız'
}

export const ordersColumn = createColumn({
  id: 'orders',
  name: 'Siparişler (Orders)',

  fetchData: ({ filters }) => {
    let filteredOrders = [...orders]

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filteredOrders = filteredOrders.filter(
        o => o.orderNumber.toLowerCase().includes(search) ||
             o.customer.toLowerCase().includes(search)
      )
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filteredOrders = filteredOrders.filter(o => o.status === filters.status)
    }

    return filteredOrders.map(o => ({
      id: o.id,
      name: o.orderNumber,
      type: 'order',
      icon: 'lucide:clipboard',
      description: `${o.customer} - ${o.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`,
      badge: statusLabelMap[o.status],
      badgeColor: statusColorMap[o.status],
      metadata: {
        customer: o.customer,
        amount: o.amount,
        date: o.date,
        status: o.status
      }
    }))
  },

  allowMultipleSelection: true,

  multipleActions: [
    {
      key: 'export',
      label: 'Dışa Aktar',
      icon: 'lucide:download',
      color: 'primary',
      handler: async (selectedIds) => {
        const selectedOrders = orders.filter(o => selectedIds.includes(o.id))
        alert(`${selectedOrders.length} sipariş dışa aktarılıyor:\n${selectedOrders.map(o => o.orderNumber).join(', ')}`)
      }
    },
    {
      key: 'delete',
      label: 'Sil',
      icon: 'lucide:trash',
      color: 'danger',
      handler: async (selectedIds) => {
        if (confirm(`${selectedIds.length} siparişi silmek istediğinize emin misiniz?`)) {
          alert(`${selectedIds.length} sipariş silindi`)
        }
      }
    }
  ],

  singleActions: [
    {
      key: 'view-details',
      label: 'Detayları Gör',
      icon: 'lucide:file-text',
      color: 'primary',
      handler: async (selectedIds) => {
        const order = orders.find(o => o.id === selectedIds[0])
        if (order) {
          alert(`Sipariş Detayları:\n\nSipariş No: ${order.orderNumber}\nMüşteri: ${order.customer}\nTutar: ${order.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}\nDurum: ${statusLabelMap[order.status]}\nTarih: ${order.date}`)
        }
      }
    }
  ],

  filters: [
    {
      key: 'search',
      label: 'Ara',
      type: 'search'
    },
    {
      key: 'status',
      label: 'Durum',
      type: 'select',
      options: [
        { value: 'all', label: 'Tümü' },
        { value: 'completed', label: 'Tamamlandı' },
        { value: 'processing', label: 'İşleniyor' },
        { value: 'pending', label: 'Bekliyor' },
        { value: 'failed', label: 'Başarısız' }
      ]
    }
  ]
})
