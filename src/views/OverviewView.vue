<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../store'
import KpiCard from '../components/KpiCard.vue'
import DataTable from '../components/DataTable.vue'

const store = useAppStore()

const money = (n) => "$" + n.toLocaleString()

const workspaceColumns = [
  { key: 'id', label: 'Workspace ID', type: 'workspace' },
  { key: 'brokerage', label: 'Brokerage Name' },
  { key: 'plan', label: 'Plan', type: 'badge' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'health', label: 'Health Score', type: 'health' },
  { key: 'mrr', label: 'Monthly Revenue', type: 'money' },
  { key: 'seats', label: 'Seats' },
  { key: 'onboarding', label: 'Onboarding', type: 'badge' },
  { key: 'idx', label: 'IDX Website', type: 'badge' }
]

const funnelSteps = computed(() => store.rawData.onboardingSteps)
const maxFunnel = computed(() => Math.max(...funnelSteps.value.map(s => s.reached)))

const searchQuery = ref('')
const filterPlan = ref('')
const filterStatus = ref('')

const filteredWorkspaces = computed(() => {
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
</script>

<template>
  <div class="overview">
    <section class="kpi-grid">
      <KpiCard title="Total Workspaces" :value="store.filteredKpis.totalWorkspaces.toLocaleString()" trend="+12.4%" icon="▣" />
      <KpiCard title="CRM Onboarding Completed" :value="store.filteredKpis.onboardingCompleted.toLocaleString()" trend="+8.1%" icon="✓" />
      <KpiCard title="Monthly Recurring Revenue" :value="money(store.filteredKpis.mrr)" trend="+9.6%" icon="$" />
      <KpiCard title="Revenue at Risk" :value="money(store.filteredKpis.revenueAtRisk)" trend="+4.2%" icon="!" trendType="down" />
      <KpiCard title="Paid Invoices" :value="store.filteredKpis.paidInvoices.toLocaleString()" trend="+7.8%" icon="◉" />
      <KpiCard title="Paid Amount" :value="money(store.filteredKpis.paidAmount)" trend="+8.2%" icon="$" />
      <KpiCard title="Seat Utilization" :value="store.filteredKpis.seatUtilization + '%'" trend="+3.5%" icon="%" />
      <KpiCard title="Churn Risk Accounts" :value="store.filteredKpis.churnRisk.toLocaleString()" trend="-1.4%" icon="♡" trendType="down" />
    </section>

    <section class="content-grid">
      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Onboarding Funnel & Drop-off</div>
            <div class="panel-subtitle">CRM completion is separate from optional IDX activation.</div>
          </div>
          <button class="link-btn" @click="$router.push({ name: 'onboarding' })">Open Onboarding</button>
        </div>
        <div class="panel-body">
          <div class="funnel">
            <div class="funnel-row" v-for="s in funnelSteps" :key="s.step">
              <div class="funnel-name">{{ s.step }}</div>
              <div class="funnel-bar">
                <div class="funnel-fill" :style="{ width: Math.max(12, Math.round((s.reached / maxFunnel) * 100)) + '%' }">{{ s.reached.toLocaleString() }}</div>
              </div>
              <div><strong>{{ s.next.toLocaleString() }}</strong></div>
              <div class="funnel-drop">{{ s.drop }}%</div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Workspace Health Score</div>
            <div class="panel-subtitle">Based on activation, usage, payment, seats, and add-on adoption.</div>
          </div>
        </div>
        <div class="panel-body">
          <div class="health-ring">
            <div class="health-ring-inner">
              <div>
                <div class="health-score">74</div>
                <div class="health-note">Portfolio Avg</div>
              </div>
            </div>
          </div>
          <div class="progress-list">
            <div class="progress-item">
              <div class="progress-top"><strong>Healthy</strong><span>64%</span></div>
              <div class="progress-track"><div class="progress-fill" style="width:64%"></div></div>
            </div>
            <div class="progress-item">
              <div class="progress-top"><strong>Needs Attention</strong><span>21%</span></div>
              <div class="progress-track"><div class="progress-fill" style="width:21%; background:#f59e0b"></div></div>
            </div>
            <div class="progress-item">
              <div class="progress-top"><strong>Critical</strong><span>15%</span></div>
              <div class="progress-track"><div class="progress-fill" style="width:15%; background:#ef4444"></div></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="content-grid">
      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Workspace Portfolio</div>
            <div class="panel-subtitle">Clickable operating table for workspace lifecycle, plan, seats, onboarding, and IDX state.</div>
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
        <DataTable :columns="workspaceColumns" :rows="filteredWorkspaces" />
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Smart Insights</div>
            <div class="panel-subtitle">Actionable signals for leadership, CS, finance, product, and compliance.</div>
          </div>
        </div>
        <div class="panel-body">
          <div class="insight-list">
            <div class="insight"><strong>First Value Gap</strong><p>22.8% of CRM-completed workspaces did not create a lead, listing, task, or deal yet.</p></div>
            <div class="insight"><strong>Revenue at Risk</strong><p>$82.4K Monthly Revenue is exposed due to failed payments, low usage, dormant seats, or onboarding abandonment.</p></div>
            <div class="insight"><strong>IDX Website Friction</strong><p>55.1% drop-off at optional IDX activation, mostly related to broker authorization and MLS verification.</p></div>
            <div class="insight"><strong>Expansion Radar</strong><p>43 Growth plan workspaces use 80%+ of seats and are candidates for upgrade.</p></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
