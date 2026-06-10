<script setup>
import { computed } from 'vue'
import { useAppStore } from '../store'
import Badge from '../components/Badge.vue'
import KpiCard from '../components/KpiCard.vue'

const store = useAppStore()

const totalUpgrades = computed(() => store.planPerformance.reduce((sum, p) => sum + p.upgrades, 0))
const totalDowngrades = computed(() => store.planPerformance.reduce((sum, p) => sum + p.downgrades, 0))
const totalSamePlan = computed(() => store.planPerformance.reduce((sum, p) => sum + p.samePlan, 0))
const totalUpsale = computed(() => store.planPerformance.reduce((sum, p) => sum + p.upsale, 0))

const upsaleWorkspaces = computed(() => {
  return store.filteredWorkspaces.filter(w => w.idx === 'Not Purchased' && w.microsites === 0).slice(0, 3)
})
</script>

<template>
  <div class="plans">
    <section class="kpi-grid">
      <KpiCard title="Total Upgrades" :value="totalUpgrades" trend="+18.7%" icon="↥" />
      <KpiCard title="Total Downgrades" :value="totalDowngrades" trend="-3.8%" icon="↧" trendType="down" />
      <KpiCard title="Same Plan" :value="totalSamePlan" trend="+2.6%" icon="=" />
      <KpiCard title="Upsale Opportunities" :value="totalUpsale" trend="+11.1%" icon="✦" />
    </section>
    <section class="content-grid">
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Plan Performance Matrix</div><div class="panel-subtitle">Compare revenue, upgrades, downgrades, and upsale opportunities by plan.</div></div></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Plan</th><th>Accounts</th><th>Revenue</th><th>Upgrades</th><th>Downgrades</th><th>Same Plan</th><th>Upsale (Zero Addons)</th><th>Signal</th></tr></thead>
            <tbody>
              <tr v-for="row in store.planPerformance" :key="row.plan">
                <td><Badge :value="row.plan" /></td>
                <td>{{ row.accounts }}</td>
                <td>{{ row.revenue }}</td>
                <td>{{ row.upgrades }}</td>
                <td>{{ row.downgrades }}</td>
                <td>{{ row.samePlan }}</td>
                <td>{{ row.upsale }}</td>
                <td><Badge :value="row.signal" /></td>
              </tr>
              <tr v-if="store.planPerformance.length === 0">
                <td colspan="8">No workspaces match the selected filters.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Upsale Recommendations</div><div class="panel-subtitle">Accounts with zero add-ons that could benefit from an upgrade.</div></div></div>
        <div class="panel-body">
          <div class="cards-list">
            <div class="queue-card" v-for="w in upsaleWorkspaces" :key="w.id">
              <div class="queue-top">
                <div>
                  <div class="queue-title">{{ w.brokerage || w.id }}</div>
                  <Badge :value="w.plan" />
                </div>
              </div>
              <div class="queue-meta">{{ w.users }} users · No add-ons purchased.</div>
            </div>
            <div v-if="upsaleWorkspaces.length === 0" style="color: #666; font-size: 13px;">No immediate upsale opportunities found.</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
