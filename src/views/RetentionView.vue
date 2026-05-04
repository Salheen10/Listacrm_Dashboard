<script setup>
import { useAppStore } from '../store'
import KpiCard from '../components/KpiCard.vue'
import Badge from '../components/Badge.vue'

const store = useAppStore()
</script>

<template>
  <div class="retention">
    <section class="kpi-grid">
      <KpiCard title="Logo Retention" value="91.2%" trend="+1.1%" icon="♡" />
      <KpiCard title="Net Revenue Retention" value="108.4%" trend="+3.8%" icon="$" />
      <KpiCard title="At-Risk Workspaces" value="126" trend="+4.2%" icon="!" trendType="down" />
      <KpiCard title="Saved Accounts" value="34" trend="+12.0%" icon="✓" />
    </section>
    <section class="content-grid">
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Customer Save Queue</div><div class="panel-subtitle">Prioritized by risk reason, MRR at risk, and recommended intervention.</div></div></div>
        <div class="panel-body">
          <div class="cards-list">
            <div class="queue-card" v-for="q in store.rescueQueue" :key="q.name">
              <div class="queue-top">
                <div>
                  <div class="queue-title">{{ q.name }}</div>
                  <div class="queue-meta">Current step: {{ q.current }} · Stuck: {{ q.stuck }}</div>
                </div>
                <Badge :value="q.risk" />
              </div>
              <div class="queue-meta">Potential MRR: <strong>{{ q.mrr }}</strong></div>
              <div class="queue-meta">Recommended action: {{ q.action }}</div>
              <div class="queue-action">
                <button class="small-btn green">Assign</button>
                <button class="small-btn">Send Reminder</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Churn Signals</div><div class="panel-subtitle">Early warning indicators across usage, payment, onboarding, support, and compliance.</div></div></div>
        <div class="panel-body">
          <div class="progress-list">
            <div class="progress-item"><div class="progress-top"><strong>No Login 14+ Days</strong><span>42</span></div><div class="progress-track"><div class="progress-fill" style="width:42%; background:#ef4444"></div></div></div>
            <div class="progress-item"><div class="progress-top"><strong>Failed Payment</strong><span>28</span></div><div class="progress-track"><div class="progress-fill" style="width:28%; background:#f59e0b"></div></div></div>
            <div class="progress-item"><div class="progress-top"><strong>No First Value</strong><span>61</span></div><div class="progress-track"><div class="progress-fill" style="width:61%; background:#ef4444"></div></div></div>
            <div class="progress-item"><div class="progress-top"><strong>Dormant Seats</strong><span>74</span></div><div class="progress-track"><div class="progress-fill" style="width:74%; background:#f59e0b"></div></div></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
