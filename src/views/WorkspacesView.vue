<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../store'
import DataTable from '../components/DataTable.vue'
import KpiCard from '../components/KpiCard.vue'

const store = useAppStore()
const money = (n) => "$" + n.toLocaleString()
const searchQuery = ref('')
const filterPlan = ref('')
const filterStatus = ref('')
const top10Tab = ref('users')

const workspaceColumns = [
  { key: 'id', label: 'Workspace ID', type: 'workspace' },
  { key: 'brokerage', label: 'Brokerage Name' },
  { key: 'plan', label: 'Plan', type: 'badge' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'health', label: 'Health Score', type: 'health' },
  { key: 'mrr', label: 'Monthly Revenue', type: 'money' },
  { key: 'seats', label: 'Seats' },
  { key: 'onboarding', label: 'Onboarding', type: 'badge' },
  { key: 'last', label: 'Last Active' }
]

const filteredRows = computed(() => {
  let result = store.filteredWorkspaces
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(w => 
      w.id.toLowerCase().includes(q) || (w.brokerage && w.brokerage.toLowerCase().includes(q))
    )
  }
  if (filterPlan.value) result = result.filter(w => w.plan === filterPlan.value)
  if (filterStatus.value) result = result.filter(w => w.status === filterStatus.value)
  return result
})

const top10Data = computed(() => top10Tab.value === 'users' ? store.top10ByUsers : store.top10ByValue)
</script>

<template>
  <div class="workspaces">
    <section class="kpi-grid">
      <KpiCard title="Total Workspaces" :value="store.filteredKpis.totalWorkspaces.toLocaleString()" trend="+12.4%" icon="▣" />
      <KpiCard title="Total Seats" :value="store.filteredKpis.totalSeats.toLocaleString()" trend="+10.1%" icon="☷" />
      <KpiCard title="Total Add-ons" :value="store.filteredKpis.totalAddons.toLocaleString()" trend="+5.4%" icon="✦" />
      <KpiCard title="Monthly Recurring Revenue" :value="money(store.filteredKpis.mrr)" trend="+9.6%" icon="$" />
    </section>

    <section class="content-grid">
      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Workspace Operating Table</div>
            <div class="panel-subtitle">Lifecycle status, health score, plan, seats, first value, and recommended action.</div>
          </div>
        </div>
        <div style="padding: 12px 20px 0; display: flex; gap: 12px;">
          <div class="search-box" style="flex: 1; margin-bottom: 12px;">
            <span>⌕</span>
            <input type="text" v-model="searchQuery" placeholder="Search by Workspace ID or Brokerage Name..." />
          </div>
          <select v-model="filterPlan" style="margin-bottom: 12px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 6px; outline: none; background: #f9fafb; font-family: inherit;">
            <option value="">All Plans</option>
            <option value="Starter">Starter</option>
            <option value="Growth">Growth</option>
            <option value="Brokerage">Brokerage</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          <select v-model="filterStatus" style="margin-bottom: 12px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 6px; outline: none; background: #f9fafb; font-family: inherit;">
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Payment Failed">Payment Failed</option>
            <option value="Contract Required">Contract Required</option>
          </select>
        </div>
        <DataTable :columns="workspaceColumns" :rows="filteredRows" />
      </div>
      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Top 10 Workspaces</div>
            <div class="panel-subtitle">Ranked by users or by monthly revenue value.</div>
          </div>
        </div>
        <div style="padding: 12px 20px 0;">
          <div class="tabbar">
            <button class="tab-btn" :class="{ active: top10Tab === 'users' }" @click="top10Tab = 'users'">By Users</button>
            <button class="tab-btn" :class="{ active: top10Tab === 'value' }" @click="top10Tab = 'value'">By Value</button>
          </div>
        </div>
        <div class="panel-body" style="padding-top: 0;">
          <div class="cards-list">
            <div class="queue-card" v-for="(w, i) in top10Data" :key="w.id">
              <div class="queue-top">
                <div>
                  <div class="queue-title">{{ i + 1 }}. {{ w.brokerage || w.id }}</div>
                  <div class="queue-meta">{{ w.id }} · {{ w.plan }} Plan</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 800; font-size: 16px;">{{ top10Tab === 'users' ? w.users + ' users' : '$' + w.mrr.toLocaleString() }}</div>
                  <div class="queue-meta">{{ top10Tab === 'users' ? '$' + w.mrr.toLocaleString() + '/mo' : w.users + ' users' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
