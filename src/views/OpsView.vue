<script setup>
import { useAppStore } from '../store'
import KpiCard from '../components/KpiCard.vue'
import Badge from '../components/Badge.vue'

const store = useAppStore()
</script>

<template>
  <div class="ops">
    <section class="kpi-grid">
      <KpiCard title="Open Ops Alerts" value="238" trend="+6.1%" icon="⚙" trendType="down" />
      <KpiCard title="Failed Jobs" value="41" trend="+3.2%" icon="!" trendType="down" />
      <KpiCard title="SLA Breaches" value="17" trend="-1.2%" icon="⏱" trendType="down" />
      <KpiCard title="Resolved Today" value="86" trend="+12.2%" icon="✓" />
    </section>
    <section class="content-grid three">
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Payment Recovery</div><div class="panel-subtitle">Failed payment and retry workflow.</div></div></div>
        <div class="panel-body">
          <div class="cards-list">
            <div class="queue-card" v-for="q in store.rescueQueue" :key="'i'+q.name">
              <div class="queue-top">
                <div><div class="queue-title">{{ q.name }}</div><div class="queue-meta">Current step: {{ q.current }}</div></div>
                <Badge :value="q.risk" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Onboarding Rescue</div><div class="panel-subtitle">Stuck workspaces and next action.</div></div></div>
        <div class="panel-body">
          <div class="cards-list">
            <div class="queue-card" v-for="q in store.rawData.rescueQueue" :key="'o'+q.name">
              <div class="queue-top">
                <div><div class="queue-title">{{ q.name }}</div><div class="queue-meta">Current step: {{ q.current }}</div></div>
                <Badge :value="q.risk" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">IDX Verification</div><div class="panel-subtitle">Pending MLS/broker cases.</div></div></div>
        <div class="panel-body">
          <div class="cards-list">
             <div class="queue-card" v-for="q in store.rawData.rescueQueue" :key="'i'+q.name">
              <div class="queue-top">
                <div><div class="queue-title">{{ q.name }}</div><div class="queue-meta">Current step: {{ q.current }}</div></div>
                <Badge :value="q.risk" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
