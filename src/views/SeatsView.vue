<script setup>
import { useAppStore } from '../store'
import KpiCard from '../components/KpiCard.vue'
import DataTable from '../components/DataTable.vue'

const store = useAppStore()

const seatColumns = [
  { key: 'workspace', label: 'Workspace ID', strong: true },
  { key: 'brokerage', label: 'Brokerage Name' },
  { key: 'plan', label: 'Plan Name', type: 'badge' },
  { key: 'free', label: 'Included Seats' },
  { key: 'purchased', label: 'Total Seats' },
  { key: 'extraPurchased', label: 'Purchased Seats' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'active', label: 'Active' },
  { key: 'dormant', label: 'Dormant' },
  { key: 'released', label: 'Released' },
  { key: 'utilization', label: 'Utilization', type: 'badge' },
  { key: 'unused', label: 'Unused Cost' }
]

import { ref, computed } from 'vue'

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
    if (w.plan === 'Solo') unusedCost = 0;
    
    return {
      workspace: w.id,
      brokerage: w.brokerage,
      plan: w.plan,
      free: free,
      purchased: purchased,
      extraPurchased: Math.max(0, purchased - free),
      assigned: assigned,
      active: active,
      dormant: dormant,
      released: released,
      utilization: `${util}%`,
      unused: `$${unusedCost}`
    }
  })
})

const searchQuery = ref('')
const filteredSeats = computed(() => {
  if (!searchQuery.value) return dynamicSeatRows.value
  const q = searchQuery.value.toLowerCase()
  return dynamicSeatRows.value.filter(s => 
    s.workspace.toLowerCase().includes(q) || 
    (s.brokerage && s.brokerage.toLowerCase().includes(q))
  )
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
        <div class="panel-header"><div><div class="panel-title">Seats by Workspace</div><div class="panel-subtitle">Purchased, assigned, accepted, active, dormant, released, and unused seat cost.</div></div>        </div>
        <div style="padding: 12px 20px 0;">
          <div class="search-box" style="width: 100%; margin-bottom: 12px;">
            <span>⌕</span>
            <input type="text" v-model="searchQuery" placeholder="Search seats by Workspace ID or Brokerage Name..." />
          </div>
        </div>
        <DataTable :columns="seatColumns" :rows="filteredSeats" />
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
