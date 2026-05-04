<script setup>
import { useAppStore } from '../store'
import KpiCard from '../components/KpiCard.vue'
import DataTable from '../components/DataTable.vue'

const store = useAppStore()

const seatColumns = [
  { key: 'workspace', label: 'Workspace ID', strong: true },
  { key: 'free', label: 'Included Seats' },
  { key: 'purchased', label: 'Total Seats' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'active', label: 'Active' },
  { key: 'dormant', label: 'Dormant' },
  { key: 'released', label: 'Released' },
  { key: 'utilization', label: 'Utilization', type: 'badge' },
  { key: 'unused', label: 'Unused Cost' }
]

import { computed } from 'vue'

const dynamicSeatRows = computed(() => {
  return store.filteredWorkspaces.map(w => {
    let free = w.freeSeats;
    let assigned = w.users;
    let purchased = Math.max(free, assigned);
    let active = Math.max(1, Math.floor(assigned * 0.9));
    let dormant = assigned - active;
    let released = Math.floor(purchased * 0.05);
    let util = Math.round((active / purchased) * 100);
    let unusedCost = (purchased - active) * 35;
    if (w.plan === 'Starter') unusedCost = 0;
    
    return {
      workspace: w.id,
      free: free,
      purchased: purchased,
      assigned: assigned,
      active: active,
      dormant: dormant,
      released: released,
      utilization: `${util}%`,
      unused: `$${unusedCost}`
    }
  })
})
</script>

<template>
  <div class="seats">
    <section class="kpi-grid">
      <KpiCard title="Purchased Seats" value="8,940" trend="+14.2%" icon="☷" />
      <KpiCard title="Active Seats" :value="store.filteredKpis.activeSeats.toLocaleString()" trend="+10.1%" icon="✓" />
      <KpiCard title="Seat Utilization" :value="store.filteredKpis.seatUtilization + '%'" trend="+3.5%" icon="%" />
      <KpiCard title="Dormant Seats" value="1,106" trend="+6.1%" icon="!" trendType="down" />
    </section>

    <section class="content-grid">
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Seats by Workspace</div><div class="panel-subtitle">Purchased, assigned, accepted, active, dormant, released, and unused seat cost.</div></div></div>
        <DataTable :columns="seatColumns" :rows="dynamicSeatRows" />
      </div>
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Seat Change Timeline</div><div class="panel-subtitle">Audit-ready member and seat lifecycle events.</div></div></div>
        <div class="panel-body">
          <div class="timeline">
            <div class="timeline-item"><div class="timeline-title">5 seats added</div><div class="timeline-note">Growth plan expansion · May 01</div></div>
            <div class="timeline-item"><div class="timeline-title">3 invites sent</div><div class="timeline-note">2 accepted, 1 still pending.</div></div>
            <div class="timeline-item"><div class="timeline-title">1 user removed</div><div class="timeline-note">Seat released immediately; identity preserved.</div></div>
            <div class="timeline-item"><div class="timeline-title">Dormant seat alert</div><div class="timeline-note">User has not logged in for 21 days.</div></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
