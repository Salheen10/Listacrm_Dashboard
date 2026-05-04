<script setup>
import { useAppStore } from '../store'
import DataTable from '../components/DataTable.vue'
import KpiCard from '../components/KpiCard.vue'

const store = useAppStore()

const money = (n) => "$" + n.toLocaleString()

const workspaceColumns = [
  { key: 'id', label: 'Workspace ID', type: 'workspace' },
  { key: 'plan', label: 'Plan', type: 'badge' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'health', label: 'Health Score', type: 'health' },
  { key: 'risk', label: 'Risk Level', type: 'badge' },
  { key: 'mrr', label: 'MRR', type: 'money' },
  { key: 'seats', label: 'Seats' },
  { key: 'onboarding', label: 'Onboarding', type: 'badge' },
  { key: 'last', label: 'Last Active' }
]
</script>

<template>
  <div class="workspaces">
    <section class="kpi-grid">
      <KpiCard title="Total Workspaces" :value="store.filteredKpis.totalWorkspaces.toLocaleString()" trend="+12.4%" icon="▣" />
      <KpiCard title="CRM Onboarding Completed" :value="store.filteredKpis.onboardingCompleted.toLocaleString()" trend="+8.1%" icon="✓" />
      <KpiCard title="MRR" :value="money(store.filteredKpis.mrr)" trend="+9.6%" icon="$" />
      <KpiCard title="Revenue at Risk" :value="money(store.filteredKpis.revenueAtRisk)" trend="+4.2%" icon="!" trendType="down" />
      <KpiCard title="First Value Achieved" :value="store.filteredKpis.firstValue.toLocaleString()" trend="+6.7%" icon="★" />
      <KpiCard title="Paid Invoices" :value="store.filteredKpis.paidInvoices.toLocaleString()" trend="+7.8%" icon="◉" />
      <KpiCard title="Seat Utilization" :value="store.filteredKpis.seatUtilization + '%'" trend="+3.5%" icon="%" />
      <KpiCard title="Churn Risk Accounts" :value="store.filteredKpis.churnRisk.toLocaleString()" trend="-1.4%" icon="♡" trendType="down" />
    </section>

    <section class="content-grid">
      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Workspace Operating Table</div>
            <div class="panel-subtitle">Lifecycle status, health score, plan, seats, first value, and recommended action.</div>
          </div>
          <button class="link-btn">Add Note</button>
        </div>
        <DataTable :columns="workspaceColumns" :rows="store.filteredWorkspaces" />
      </div>
      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Workspace Journey Replay</div>
            <div class="panel-subtitle">Example timeline for selected workspace.</div>
          </div>
        </div>
        <div class="panel-body">
          <div class="timeline">
            <div class="timeline-item"><div class="timeline-title">Workspace Created</div><div class="timeline-note">Growth plan · Owner: Yasser Ahmed</div></div>
            <div class="timeline-item"><div class="timeline-title">Payment Completed</div><div class="timeline-note">$299 monthly subscription activated.</div></div>
            <div class="timeline-item"><div class="timeline-title">Team Setup Completed</div><div class="timeline-note">6 seats assigned out of 10 purchased.</div></div>
            <div class="timeline-item"><div class="timeline-title">No First Value Yet</div><div class="timeline-note">No lead/listing/task/deal created after 5 days.</div></div>
            <div class="timeline-item"><div class="timeline-title">Rescue Recommended</div><div class="timeline-note">Trigger guided checklist and CS onboarding support.</div></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
