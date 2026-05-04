<script setup>
import { useAppStore } from '../store'
import KpiCard from '../components/KpiCard.vue'
import DataTable from '../components/DataTable.vue'

const store = useAppStore()

const columns = [
  { key: 'event', label: 'Event', strong: true },
  { key: 'actor', label: 'Actor' },
  { key: 'workspace', label: 'Workspace ID' },
  { key: 'target', label: 'Target' },
  { key: 'time', label: 'Time' },
  { key: 'severity', label: 'Severity', type: 'badge' }
]
</script>

<template>
  <div class="audit">
    <section class="kpi-grid">
      <KpiCard title="Audit Events" value="12,448" trend="+15.1%" icon="☰" />
      <KpiCard title="High Severity" value="46" trend="+4.2%" icon="!" trendType="down" />
      <KpiCard title="Exports" value="286" trend="+7.4%" icon="⇩" />
      <KpiCard title="Role Changes" value="138" trend="+2.1%" icon="↔" />
    </section>
    <section class="content-grid">
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Sensitive Event Log</div><div class="panel-subtitle">Lifecycle, billing, seat, member, role, export, and compliance events.</div></div></div>
        <DataTable :columns="columns" :rows="store.audit" />
      </div>
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Audit Filters</div><div class="panel-subtitle">Recommended back office governance filters.</div></div></div>
        <div class="panel-body">
          <div class="insight-list">
            <div class="insight"><strong>Permission Changes</strong><p>Track who changed role, scope, and access level.</p></div>
            <div class="insight"><strong>Seat Lifecycle</strong><p>Track seat added, assigned, accepted, released, removed, and dormant states.</p></div>
            <div class="insight"><strong>IDX/MLS Controls</strong><p>Track broker approval, verification, suspension, revalidation, and public display changes.</p></div>
            <div class="insight"><strong>Exports</strong><p>Track exported object, role, scope, count, timestamp, and reason.</p></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
