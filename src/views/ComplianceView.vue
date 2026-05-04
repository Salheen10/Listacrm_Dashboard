<script setup>
import { useAppStore } from '../store'
import KpiCard from '../components/KpiCard.vue'
import DataTable from '../components/DataTable.vue'

const store = useAppStore()

const columns = [
  { key: 'workspace', label: 'Workspace ID', strong: true },
  { key: 'idx', label: 'IDX', type: 'badge' },
  { key: 'mls', label: 'MLS', type: 'badge' },
  { key: 'broker', label: 'Broker', type: 'badge' },
  { key: 'sync', label: 'Sync', type: 'badge' },
  { key: 'last', label: 'Last Check' },
  { key: 'risk', label: 'Risk', type: 'badge' }
]
</script>

<template>
  <div class="compliance">
    <section class="kpi-grid">
      <KpiCard title="IDX Active" value="151" trend="+9.8%" icon="IDX" />
      <KpiCard title="IDX Pending" value="93" trend="+2.4%" icon="…" />
      <KpiCard title="IDX Suspended" value="18" trend="+5.1%" icon="!" trendType="down" />
      <KpiCard title="MLS Sync Failures" value="27" trend="+3.7%" icon="⚠" trendType="down" />
    </section>
    <section class="content-grid">
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Compliance Queue</div><div class="panel-subtitle">IDX/MLS state, broker authorization, sync, and risk exposure.</div></div></div>
        <DataTable :columns="columns" :rows="store.compliance" />
      </div>
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Compliance Actions</div><div class="panel-subtitle">Recommended automatic and manual controls.</div></div></div>
        <div class="panel-body">
          <div class="insight-list">
            <div class="insight"><strong>Suspend IDX Display</strong><p>If MLS membership fails or broker authorization is revoked, public IDX display and MLS sync should be disabled.</p></div>
            <div class="insight"><strong>Notify Broker + Agent</strong><p>Compliance events should trigger auditable notifications with violation reason and timestamp.</p></div>
            <div class="insight"><strong>Revalidation Queue</strong><p>Pending broker authorization older than 3 days should move to operations follow-up.</p></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
