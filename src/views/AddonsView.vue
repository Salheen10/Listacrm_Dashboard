<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../store'
import KpiCard from '../components/KpiCard.vue'
import DataTable from '../components/DataTable.vue'

const store = useAppStore()

const money = (n) => "$" + n.toLocaleString()

const canceledColumns = [
  { key: 'workspace', label: 'Workspace ID', strong: true },
  { key: 'brokerage', label: 'Brokerage Name' },
  { key: 'addon', label: 'Add-on Name', type: 'badge' },
  { key: 'monthlyPrice', label: 'Lost Revenue / mo', type: 'money' },
  { key: 'cancelDate', label: 'Cancellation Date' }
]

const searchQuery = ref('')
const filteredCanceled = computed(() => {
  if (!searchQuery.value) return store.canceledAddonsData.items
  const q = searchQuery.value.toLowerCase()
  return store.canceledAddonsData.items.filter(a => 
    a.workspace.toLowerCase().includes(q) || 
    (a.brokerage && a.brokerage.toLowerCase().includes(q)) ||
    (a.addon && a.addon.toLowerCase().includes(q))
  )
})
</script>

<template>
  <div class="addons">
    <section class="kpi-grid">
      <KpiCard title="Add-on Revenue" value="$96.8K" trend="+16.1%" icon="✦" />
      <KpiCard title="Attach Rate" value="41%" trend="+5.4%" icon="%" />
      <KpiCard title="Canceled Add-ons" :value="store.canceledAddonsData.total" trend="-2.1%" icon="↧" trendType="down" />
      <KpiCard title="Lost Add-on Revenue" :value="money(store.canceledAddonsData.lostRevenue)" trend="-5.4%" icon="!" trendType="down" />
    </section>
    
    <section class="content-grid">
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Add-on Funnel</div><div class="panel-subtitle">Viewed → setup started → paid → activated → renewed.</div></div></div>
        <div class="panel-body">
           <div class="bar-chart">
            <div class="bar-row" v-for="addon in store.addonFunnel" :key="addon.name">
              <div class="bar-name">{{ addon.name }}</div>
              <div class="bar-track"><div class="bar-fill" :class="addon.color" :style="{ width: addon.value + '%' }"></div></div>
              <div class="bar-value">{{ addon.value }}%</div>
            </div>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Add-on Propensity Score</div><div class="panel-subtitle">Suggested upsell based on usage behavior.</div></div></div>
        <div class="panel-body">
          <div class="insight-list">
            <div class="insight"><strong>IDX Website Opportunity</strong><p>64 workspaces have active listings but no IDX website. Recommend IDX Website add-on.</p></div>
            <div class="insight"><strong>Marketing Automation Opportunity</strong><p>88 workspaces have high lead volume and low follow-up consistency.</p></div>
            <div class="insight"><strong>Social Suite Opportunity</strong><p>32 teams show campaign activity but no social ads integration.</p></div>
          </div>
        </div>
      </div>
    </section>

    <section class="content-grid" style="grid-template-columns: 1fr; margin-top: 17px;">
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Canceled Add-ons</div><div class="panel-subtitle">Recent add-on cancellations and lost monthly recurring revenue.</div></div></div>
        <div style="padding: 12px 20px 0;">
          <div class="search-box" style="width: 100%; margin-bottom: 12px;">
            <span>⌕</span>
            <input type="text" v-model="searchQuery" placeholder="Search canceled add-ons by Workspace, Brokerage, or Add-on Name..." />
          </div>
        </div>
        <DataTable :columns="canceledColumns" :rows="filteredCanceled" />
      </div>
    </section>
  </div>
</template>
