<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../store'
import KpiCard from '../components/KpiCard.vue'

const store = useAppStore()

const funnelSteps = computed(() => store.rawData.onboardingSteps)
const maxFunnel = computed(() => Math.max(...funnelSteps.value.map(s => s.reached)))

const searchQuery = ref('')
const filterStep = ref('')

const filteredQueue = computed(() => {
  let result = store.rescueQueue
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r => 
      r.name.toLowerCase().includes(q) || 
      r.current.toLowerCase().includes(q)
    )
  }
  if (filterStep.value) {
    result = result.filter(r => r.current === filterStep.value)
  }
  return result
})
</script>

<template>
  <div class="onboarding">
    <section class="kpi-grid">
      <KpiCard title="Onboarding Started" value="1,842" trend="+12.4%" icon="↗" />
      <KpiCard title="CRM Completed" value="1,184" trend="+8.1%" icon="✓" />
      <KpiCard title="First Value Achieved" value="914" trend="+6.7%" icon="★" />
      <KpiCard title="Biggest Drop-off" value="First Value" trend="22.8%" icon="⚠" trendType="down" />
    </section>

    <section class="content-grid">
      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Onboarding Funnel</div>
            <div class="panel-subtitle">Shows how many users completed onboarding and where incomplete users usually stop.</div>
          </div>
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
            <div class="panel-title">Completion Definitions</div>
            <div class="panel-subtitle">Separate technical signup from true operational activation.</div>
          </div>
        </div>
        <div class="panel-body">
          <div class="metric-split">
            <div class="metric-box"><div class="label">Account Signup</div><div class="value">1,710</div></div>
            <div class="metric-box"><div class="label">CRM Completed</div><div class="value">1,184</div></div>
            <div class="metric-box"><div class="label">First Value</div><div class="value">914</div></div>
          </div>
          <div style="height:16px"></div>
          <div class="progress-list">
            <div class="progress-item">
              <div class="progress-top"><strong>CRM Completion Rate</strong><span>64.3%</span></div>
              <div class="progress-track"><div class="progress-fill" style="width:64.3%"></div></div>
            </div>
            <div class="progress-item">
              <div class="progress-top"><strong>First Value Rate</strong><span>77.2%</span></div>
              <div class="progress-track"><div class="progress-fill" style="width:77.2%"></div></div>
            </div>
            <div class="progress-item">
              <div class="progress-top"><strong>IDX Completion Rate</strong><span>44.9%</span></div>
              <div class="progress-track"><div class="progress-fill" style="width:44.9%; background:#f59e0b"></div></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="content-grid">
      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Incomplete Onboarding Rescue Queue</div>
            <div class="panel-subtitle">Internal action queue by current step, stuck duration, potential MRR, and recommended action.</div>
          </div>
        </div>
        <div style="padding: 12px 20px 0; display: flex; gap: 12px;">
          <div class="search-box" style="flex: 1; margin-bottom: 12px;">
            <span>⌕</span>
            <input type="text" v-model="searchQuery" placeholder="Search queue by workspace name or step..." />
          </div>
          <select v-model="filterStep" style="margin-bottom: 12px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 6px; outline: none; background: #f9fafb; font-family: inherit;">
            <option value="">All Steps</option>
            <option value="Payment Failed">Payment Failed</option>
            <option value="Broker Authorization">Broker Authorization</option>
            <option value="First Record Pending">First Record Pending</option>
          </select>
        </div>
        <div class="panel-body" style="padding-top: 0;">
          <div class="cards-list">
            <div class="queue-card" v-for="q in filteredQueue" :key="q.name">
              <div class="queue-top">
                <div>
                  <div class="queue-title">{{ q.name }}</div>
                  <div class="queue-meta">Current step: {{ q.current }} · Stuck: {{ q.stuck }}</div>
                </div>
                <Badge :value="q.risk" />
              </div>
              <div class="queue-meta">Potential MRR: <strong>{{ q.mrr }}</strong></div>
              <div class="queue-meta">Recommended action: {{ q.action }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Drop-off by Persona</div>
            <div class="panel-subtitle">Identify whether Solo, Team, or Brokerage setup is creating friction.</div>
          </div>
        </div>
        <div class="panel-body">
           <div class="bar-chart">
            <div class="bar-row">
              <div class="bar-name">Solo Agent</div>
              <div class="bar-track"><div class="bar-fill blue" style="width:73%"></div></div>
              <div class="bar-value">31%</div>
            </div>
            <div class="bar-row">
              <div class="bar-name">Team</div>
              <div class="bar-track"><div class="bar-fill orange" style="width:100%"></div></div>
              <div class="bar-value">42%</div>
            </div>
            <div class="bar-row">
              <div class="bar-name">Brokerage</div>
              <div class="bar-track"><div class="bar-fill green" style="width:66%"></div></div>
              <div class="bar-value">28%</div>
            </div>
            <div class="bar-row">
              <div class="bar-name">Enterprise</div>
              <div class="bar-track"><div class="bar-fill purple" style="width:88%"></div></div>
              <div class="bar-value">37%</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import Badge from '../components/Badge.vue';
export default {
  components: { Badge }
}
</script>
