<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../store'
import DataTable from '../components/DataTable.vue'
import KpiCard from '../components/KpiCard.vue'

const store = useAppStore()

const money = (n) => "$" + n.toLocaleString()

const maxMix = computed(() => {
  if (store.revenueMix.length === 0) return 1
  return Math.max(...store.revenueMix.map(m => m.value))
})

const invoiceColumns = [
  { key: 'id', label: 'Invoice', strong: true },
  { key: 'workspace', label: 'Workspace ID' },
  { key: 'brokerage', label: 'Brokerage Name' },
  { key: 'plan', label: 'Plan', type: 'badge' },
  { key: 'amount', label: 'Amount', strong: true },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'due', label: 'Due' },
  { key: 'age', label: 'Age' }
]

const searchQuery = ref('')
const filteredInvoices = computed(() => {
  if (!searchQuery.value) return store.invoices
  const q = searchQuery.value.toLowerCase()
  return store.invoices.filter(i => 
    i.id.toLowerCase().includes(q) || 
    i.workspace.toLowerCase().includes(q) || 
    (i.brokerage && i.brokerage.toLowerCase().includes(q))
  )
})
</script>

<template>
  <div class="billing">
    <section class="kpi-grid">
      <KpiCard title="Monthly Recurring Revenue" :value="money(store.filteredKpis.mrr)" trend="+9.6%" icon="$" />
      <KpiCard title="Annual Recurring Revenue" :value="money(store.filteredKpis.arr)" trend="+11.3%" icon="↥" />
      <KpiCard title="Paid Invoices" :value="store.filteredKpis.paidInvoices.toLocaleString()" trend="+7.8%" icon="◉" />
      <KpiCard title="Total Paid Amount" :value="money(store.filteredKpis.paidAmount)" trend="+8.2%" icon="$" />
      <KpiCard title="Revenue at Risk" :value="money(store.filteredKpis.revenueAtRisk)" trend="+4.2%" icon="!" trendType="down" />
      <KpiCard title="Overdue Invoices" :value="store.filteredKpis.overdueInvoices.toString()" trend="-2.9%" icon="◉" trendType="down" />
    </section>

    <section class="content-grid">
      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Invoices Control Room</div>
            <div class="panel-subtitle">Paid, open, failed, overdue, disputed, refunded, and dunning-state invoices.</div>
          </div>
        </div>
        <div style="padding: 12px 20px 0;">
          <div class="search-box" style="width: 100%; margin-bottom: 12px;">
            <span>⌕</span>
            <input type="text" v-model="searchQuery" placeholder="Search invoices by ID, Workspace, or Brokerage..." />
          </div>
        </div>
        <DataTable :columns="invoiceColumns" :rows="filteredInvoices" />
      </div>
      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Revenue Mix</div>
            <div class="panel-subtitle">Revenue by plan and add-on contribution.</div>
          </div>
        </div>
        <div class="panel-body">
           <div class="bar-chart">
            <div class="bar-row" v-for="mix in store.revenueMix" :key="mix.name">
              <div class="bar-name">{{ mix.name }}</div>
              <div class="bar-track"><div class="bar-fill" :class="mix.color" :style="{ width: Math.round((mix.value / maxMix) * 100) + '%' }"></div></div>
              <div class="bar-value">${{ Math.round(mix.value / 1000) }}K</div>
            </div>
            <div v-if="store.revenueMix.length === 0" class="bar-row">No revenue data for selected filters.</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
