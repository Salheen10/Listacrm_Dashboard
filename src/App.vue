<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from './store'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const sidebarOpen = ref(true)

const ICONS = {
  overview: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  onboarding: 'M4 9h13l-3-3M20 15H7l3 3',
  workspaces: 'M5 21V5h9v16M14 10h5v11M3 21h18M8 9h3M8 13h3',
  usage: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 3-5 6-5s6 2 6 5M17 5a3 3 0 0 1 0 6M21 20c0-2-1-4-3-5',
  enterprise: 'M4 8h16v11H4zM9 8V5h6v3',
  compliance: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  billing: 'M12 3v18M16 7h-6a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H8',
  plans: 'M6 3h9l4 4v14H6zM9 12h7M9 16h7',
  addons: 'M12 5v14M5 12h14',
  seats: 'M3 6h18v12H3zM3 10h18',
  promo: 'M3 12V4h8l10 10-8 8zM8 8h.01',
  ops: 'M12 3l9 16H3zM12 10v4M12 17h.01',
  audit: 'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z'
}

const sections = computed(() => [
  {
    title: 'Workspace',
    items: [
      { name: 'overview', label: 'Overview', icon: 'overview' },
      { name: 'onboarding', label: 'Onboarding', icon: 'onboarding' },
      { name: 'workspaces', label: 'Customers', icon: 'workspaces' },
      { name: 'usage', label: 'Users & Engagement', icon: 'usage' },
      { name: 'enterprise', label: 'Enterprise', icon: 'enterprise' },
      { name: 'compliance', label: 'IDX / MLS', icon: 'compliance', advanced: true }
    ]
  },
  {
    title: 'Billing',
    items: [
      { name: 'billing', label: 'Financials', icon: 'billing' },
      { name: 'plans', label: 'Plans', icon: 'plans' },
      { name: 'addons', label: 'Add-ons', icon: 'addons', advanced: true },
      { name: 'seats', label: 'Seats', icon: 'seats' },
      { name: 'promo-codes', label: 'Promo Codes', icon: 'promo', match: 'promo' }
    ]
  },
  {
    title: 'Settings',
    items: [
      { name: 'ops', label: 'Ops Alerts', icon: 'ops', advanced: true },
      { name: 'audit', label: 'Audit Logs', icon: 'audit', advanced: true }
    ]
  }
].map(s => ({ ...s, items: s.items.filter(i => !(store.isMvpMode && i.advanced)) })).filter(s => s.items.length))

const isActive = item => (item.match ? String(route.name || '').startsWith(item.match) : route.name === item.name)

const pageMetaInfo = {
  onboarding: ["Onboarding Intelligence", "Track completed onboarding, first usable value, stuck users, and the exact step where most users drop off."],
  workspaces: ["Workspace Health", "Control workspace lifecycle, activation health, plan fit, risk score, and recommended interventions."],
  billing: ["Billing & Revenue Control Room", "Monitor MRR, ARR, invoices, payment failures, dunning, revenue at risk, and collection health."],
  plans: ["Plans Performance", "Analyze plan sales, upgrades, downgrades, churn by plan, and plan-fit opportunities."],
  addons: ["Add-ons Intelligence", "Track IDX, Marketing Automation, Social Suite attach rate, activation, churn, and revenue contribution."],
  seats: ["Seats Indicators & Changes", "Review purchased, assigned, active, dormant, released, CRM-only, and MLS-enabled seats."],
  usage: ["Product Usage Analytics", "Measure module adoption, first value, DAU/WAU/MAU, stickiness, and feature-to-retention signals."],
  enterprise: ["Enterprise Tracking", "Track enterprise contact requests, demo requests, upgrade inquiries, and high-value account management."],
  compliance: ["IDX / MLS Compliance Center", "Track IDX status, MLS verification, broker authorization, sync failures, violations, and audit evidence."],
  ops: ["Operations Alerts", "Manage stuck onboarding, failed jobs, support queues, billing exceptions, and internal intervention tasks."],
  audit: ["Audit Logs", "Review sensitive lifecycle, billing, member, seat, IDX, export, and permission events."]
}

// Redesigned screens render their own header and filters.
const legacy = computed(() => !route.meta.ownHeader)
const pageTitle = computed(() => (pageMetaInfo[route.name] || ['ListaCRM'])[0])
const pageSubtitle = computed(() => (pageMetaInfo[route.name] || ['', ''])[1])

const toggleMvp = () => {
  store.toggleMvpMode()
  if (store.isMvpMode && ['ops', 'audit', 'addons', 'compliance'].includes(route.name)) {
    router.push({ name: 'overview' })
  }
}
</script>

<template>
  <div class="bo-shell">
    <aside v-if="sidebarOpen" class="bo-side">
      <div class="bo-brand">
        <div class="bo-brand-word">Lista</div>
        <div class="bo-brand-tag">CRM</div>
      </div>
      <nav class="bo-navlist" aria-label="Backoffice">
        <template v-for="section in sections" :key="section.title">
          <div class="bo-navsec">{{ section.title }}</div>
          <RouterLink
            v-for="item in section.items"
            :key="item.name"
            :to="{ name: item.name }"
            class="bo-nav"
            :class="{ on: isActive(item) }"
            :aria-current="isActive(item) ? 'page' : undefined"
          >
            <svg class="bo-ic" viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS[item.icon]" /></svg>
            {{ item.label }}
          </RouterLink>
        </template>
      </nav>
    </aside>

    <div class="bo-main">
      <header class="bo-top">
        <div class="bo-top-left">
          <button class="bo-btn sm" aria-label="Toggle sidebar" @click="sidebarOpen = !sidebarOpen">
            <svg class="bo-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM9 5v14" /></svg>
          </button>
          <div><strong>ListaCRM</strong> <span class="bo-hint" style="font-size: 14px">· Backoffice</span></div>
        </div>
        <div class="bo-top-right">
          <button class="bo-btn sm" @click="toggleMvp">{{ store.isMvpMode ? 'Switch to Advanced' : 'Switch to MVP' }}</button>
          <div class="bo-avatar">MM</div>
          <div>
            <div style="font-weight: 600; line-height: 1.2">mina magdy</div>
            <div class="bo-hint">Administrator</div>
          </div>
        </div>
      </header>

      <div class="bo-content" :class="{ legacy }">
        <template v-if="legacy">
          <section class="page-header">
            <div>
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
                  <option value="Solo">Solo</option>
                  <option value="Growth">Growth</option>
                  <option value="Brokerage">Brokerage</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </label>
            </div>
          </section>
        </template>

        <div id="pageContent">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>
