<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from './store'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const menuItems = [
  { id: 'overview', label: 'Overview', icon: '▦' },
  { id: 'onboarding', label: 'Onboarding', icon: '↗' },
  { id: 'workspaces', label: 'Workspaces', icon: '▣' },
  { id: 'billing', label: 'Billing & Revenue', icon: '◉' },
  { id: 'plans', label: 'Plans', icon: '◇' },
  { id: 'addons', label: 'Add-ons', icon: '✦' },
  { id: 'seats', label: 'Seats', icon: '☷' },
  { id: 'usage', label: 'Product Usage', icon: '▤' },
  { id: 'retention', label: 'Retention', icon: '♡' },
  { id: 'compliance', label: 'IDX / MLS Compliance', icon: '✓' },
  { id: 'ops', label: 'Ops Alerts', icon: '⚙' },
  { id: 'audit', label: 'Audit Logs', icon: '☰' }
]

const pageMetaInfo = {
  overview: ["Back Office Command Center", "Monitor workspaces, onboarding, revenue, invoices, plans, seats, add-ons, retention, and compliance from one command view."],
  onboarding: ["Onboarding Intelligence", "Track completed onboarding, first usable value, stuck users, and the exact step where most users drop off."],
  workspaces: ["Workspace Health", "Control workspace lifecycle, activation health, plan fit, risk score, and recommended interventions."],
  billing: ["Billing & Revenue Control Room", "Monitor MRR, ARR, invoices, payment failures, dunning, revenue at risk, and collection health."],
  plans: ["Plans Performance", "Analyze plan sales, upgrades, downgrades, churn by plan, and plan-fit opportunities."],
  addons: ["Add-ons Intelligence", "Track IDX, Marketing Automation, Social Suite attach rate, activation, churn, and revenue contribution."],
  seats: ["Seats Indicators & Changes", "Review purchased, assigned, active, dormant, released, CRM-only, and MLS-enabled seats."],
  usage: ["Product Usage Analytics", "Measure module adoption, first value, DAU/WAU/MAU, stickiness, and feature-to-retention signals."],
  retention: ["Retention & Churn Risk", "Prioritize at-risk customers, revenue exposure, customer save queues, and expansion opportunities."],
  compliance: ["IDX / MLS Compliance Center", "Track IDX status, MLS verification, broker authorization, sync failures, violations, and audit evidence."],
  ops: ["Operations Alerts", "Manage stuck onboarding, failed jobs, support queues, billing exceptions, and internal intervention tasks."],
  audit: ["Audit Logs", "Review sensitive lifecycle, billing, member, seat, IDX, export, and permission events."]
}

const pageTitle = computed(() => {
  const meta = pageMetaInfo[route.name]
  return meta ? meta[0] : 'ListaCRM'
})

const pageSubtitle = computed(() => {
  const meta = pageMetaInfo[route.name]
  return meta ? meta[1] : ''
})

const navigate = (name) => {
  router.push({ name })
}

const filteredMenu = computed(() => {
  if (store.isMvpMode) {
    return menuItems.filter(i => !['retention', 'ops', 'audit'].includes(i.id))
  }
  return menuItems
})

const toggleMvp = () => {
  store.toggleMvpMode()
  if (store.isMvpMode && ['retention', 'ops', 'audit'].includes(route.name)) {
    router.push({ name: 'overview' })
  }
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-word">Lista<span>CRM</span></div>
        <div class="brand-subtitle">BACK OFFICE</div>
      </div>

      <nav class="side-nav">
        <div class="nav-section">COMMAND</div>
        <button class="nav-item" :class="{ active: route.name === 'overview' }" @click="navigate('overview')">
          <span class="nav-icon">▦</span><span>Overview</span>
        </button>
        <button class="nav-item" :class="{ active: route.name === 'onboarding' }" @click="navigate('onboarding')">
          <span class="nav-icon">↗</span><span>Onboarding</span>
        </button>
        <button class="nav-item" :class="{ active: route.name === 'workspaces' }" @click="navigate('workspaces')">
          <span class="nav-icon">▣</span><span>Workspaces</span>
        </button>

        <div class="nav-section">COMMERCIAL</div>
        <button class="nav-item" :class="{ active: route.name === 'billing' }" @click="navigate('billing')">
          <span class="nav-icon">◉</span><span>Billing & Revenue</span>
        </button>
        <button class="nav-item" :class="{ active: route.name === 'plans' }" @click="navigate('plans')">
          <span class="nav-icon">◇</span><span>Plans</span>
        </button>
        <button v-if="!store.isMvpMode" class="nav-item" :class="{ active: route.name === 'addons' }" @click="navigate('addons')">
          <span class="nav-icon">✦</span><span>Add-ons</span>
        </button>
        <button class="nav-item" :class="{ active: route.name === 'seats' }" @click="navigate('seats')">
          <span class="nav-icon">☷</span><span>Seats</span>
        </button>

        <div class="nav-section">PRODUCT</div>
        <button class="nav-item" :class="{ active: route.name === 'usage' }" @click="navigate('usage')">
          <span class="nav-icon">▤</span><span>Product Usage</span>
        </button>
        <button v-if="!store.isMvpMode" class="nav-item" :class="{ active: route.name === 'retention' }" @click="navigate('retention')">
          <span class="nav-icon">♡</span><span>Retention</span>
        </button>

        <template v-if="!store.isMvpMode">
          <div class="nav-section">GOVERNANCE</div>
          <button class="nav-item" :class="{ active: route.name === 'compliance' }" @click="navigate('compliance')">
            <span class="nav-icon">✓</span><span>IDX / MLS Compliance</span>
          </button>
          <button class="nav-item" :class="{ active: route.name === 'ops' }" @click="navigate('ops')">
            <span class="nav-icon">⚙</span><span>Ops Alerts</span>
          </button>
          <button class="nav-item" :class="{ active: route.name === 'audit' }" @click="navigate('audit')">
            <span class="nav-icon">☰</span><span>Audit Logs</span>
          </button>
        </template>
      </nav>

      <div class="sidebar-footer">
        <div class="mini-card">
          <div class="mini-card-title">Revenue at Risk</div>
          <div class="mini-card-value">${{ (store.filteredKpis.revenueAtRisk / 1000).toFixed(1) }}K</div>
          <div class="mini-card-note">{{ store.filteredWorkspaces.filter(w => w.risk !== 'Healthy').length }} workspaces need action</div>
        </div>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <button class="collapse-btn">≪</button>
        <div class="search-box">
          <span>⌕</span>
          <input type="text" placeholder="Search workspaces, invoices, plans, users..." />
        </div>
        <div class="topbar-actions">
          <button class="ghost-btn" @click="toggleMvp">
            {{ store.isMvpMode ? 'Switch to Advanced' : 'Switch to MVP' }}
          </button>
          <button class="quick-btn">+ Quick Action</button>
          <button class="icon-btn">◯</button>
          <button class="icon-btn">⚙</button>
          <div class="admin-menu">
            <div class="avatar">A</div>
            <span>Admin</span>
            <span>⌄</span>
          </div>
        </div>
      </header>

      <section class="page-header">
        <div>
          <button class="back-chip">←</button>
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageSubtitle }}</p>
        </div>
        <div class="date-pill">
          <span class="dot"></span>
          Live mock data · May 2026
        </div>
      </section>

      <section class="filter-card">
        <div class="filter-row">
          <label>
            Date Range
            <select v-model="store.filters.dateRange">
              <option value="month">Current Month</option>
              <option value="quarter">Current Quarter</option>
              <option value="year">Current Year</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label>
            Plan
            <select v-model="store.filters.plan">
              <option value="all">All Plans</option>
              <option value="Starter">Starter</option>
              <option value="Growth">Growth</option>
              <option value="Brokerage">Brokerage</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </label>
          <label>
            Risk
            <select v-model="store.filters.risk">
              <option value="all">All Risk Levels</option>
              <option value="Healthy">Healthy</option>
              <option value="Needs Attention">Needs Attention</option>
              <option value="At Risk">At Risk</option>
              <option value="Critical">Critical</option>
            </select>
          </label>
        </div>
      </section>

      <div id="pageContent">
        <router-view />
      </div>
    </main>
  </div>
</template>
