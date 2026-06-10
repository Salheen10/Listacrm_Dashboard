<script setup>
import { useAppStore } from '../store'
import KpiCard from '../components/KpiCard.vue'
import DataTable from '../components/DataTable.vue'

const store = useAppStore()

const money = (n) => "$" + n.toLocaleString()

const requestColumns = [
  { key: 'id', label: 'Request ID', strong: true },
  { key: 'brokerage', label: 'Brokerage Name' },
  { key: 'contact', label: 'Contact Person' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'type', label: 'Request Type', type: 'badge' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'date', label: 'Date' }
]

const enterpriseColumns = [
  { key: 'id', label: 'Workspace ID', type: 'workspace' },
  { key: 'brokerage', label: 'Brokerage Name' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'health', label: 'Health Score', type: 'health' },
  { key: 'mrr', label: 'Monthly Revenue', type: 'money' },
  { key: 'seats', label: 'Seats' },
  { key: 'onboarding', label: 'Onboarding', type: 'badge' }
]

import { ref, computed } from 'vue'

const enterpriseWorkspaces = computed(() => store.enterpriseWorkspaces)

const searchRequests = ref('')
const filteredRequests = computed(() => {
  if (!searchRequests.value) return store.rawData.enterpriseRequests
  const q = searchRequests.value.toLowerCase()
  return store.rawData.enterpriseRequests.filter(r => 
    r.id.toLowerCase().includes(q) || 
    r.brokerage.toLowerCase().includes(q) ||
    r.contact.toLowerCase().includes(q)
  )
})

const searchWorkspaces = ref('')
const filteredWorkspaces = computed(() => {
  if (!searchWorkspaces.value) return enterpriseWorkspaces.value
  const q = searchWorkspaces.value.toLowerCase()
  return enterpriseWorkspaces.value.filter(w => 
    w.id.toLowerCase().includes(q) || 
    (w.brokerage && w.brokerage.toLowerCase().includes(q))
  )
})

const totalEnterpriseRevenue = computed(() => {
  return enterpriseWorkspaces.value.reduce((sum, w) => sum + w.mrr, 0)
})

const pendingRequestsCount = computed(() => {
  return store.rawData.enterpriseRequests.filter(r => r.status === 'New' || r.status === 'In Progress').length
})
</script>

<template>
  <div class="enterprise">
    <section class="kpi-grid">
      <KpiCard title="Enterprise Workspaces" :value="enterpriseWorkspaces.length" trend="+12.4%" icon="▣" />
      <KpiCard title="Enterprise Revenue" :value="money(totalEnterpriseRevenue)" trend="+15.2%" icon="$" />
      <KpiCard title="Pending Requests" :value="pendingRequestsCount" trend="+3.1%" icon="✉" />
      <KpiCard title="Contact / Demo Requests" :value="store.rawData.enterpriseRequests.length" trend="+8.4%" icon="★" />
    </section>

    <section class="content-grid" style="grid-template-columns: 1fr; margin-bottom: 17px;">
      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Enterprise Contact & Demo Requests</div>
            <div class="panel-subtitle">Manage high-value inquiries, demo requests, and custom plan negotiations.</div>
          </div>
        </div>
        <div style="padding: 12px 20px 0;">
          <div class="search-box" style="width: 100%; margin-bottom: 12px;">
            <span>⌕</span>
            <input type="text" v-model="searchRequests" placeholder="Search requests by ID, Brokerage, or Contact..." />
          </div>
        </div>
        <DataTable :columns="requestColumns" :rows="filteredRequests" />
      </div>
    </section>

    <section class="content-grid" style="grid-template-columns: 1fr;">
      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Enterprise Workspaces</div>
            <div class="panel-subtitle">Lifecycle status and health of all Enterprise plan accounts.</div>
          </div>
        </div>
        <div style="padding: 12px 20px 0;">
          <div class="search-box" style="width: 100%; margin-bottom: 12px;">
            <span>⌕</span>
            <input type="text" v-model="searchWorkspaces" placeholder="Search workspaces by ID or Brokerage..." />
          </div>
        </div>
        <DataTable :columns="enterpriseColumns" :rows="filteredWorkspaces" />
      </div>
    </section>
  </div>
</template>
