<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePromoStore, statusOf, discountLabel, totalsOf, TARGET_LABEL } from '../store/promos'
import { usd, fmtDate } from '../utils/format'
import { NOW } from '../data/catalog'

const router = useRouter()
const store = usePromoStore()

const query = ref('')
const status = ref('all')
const target = ref('all')

const STATUS_TONE = { Active: 'ok', Scheduled: 'info', 'Sync failed': 'bad', Syncing: 'warn', Inactive: '', Expired: '', Draft: '' }
const SYNC_TONE = { Synced: 'ok', Failed: 'bad', Pending: 'warn', Disabled: '' }

const all = computed(() =>
  store.promos.map(p => {
    const st = statusOf(p), t = totalsOf(p)
    return {
      p, status: st, tone: STATUS_TONE[st], syncTone: SYNC_TONE[p.sync], uses: t.uses, discount: t.discount,
      validity: p.start.length >= 10 && p.end.length >= 10 ? `${fmtDate(p.start)} – ${fmtDate(p.end)}` : 'Not set',
      canReactivate: st === 'Inactive' && NOW >= p.start && NOW <= p.end
    }
  })
)

const rows = computed(() => {
  const q = query.value.trim().toLowerCase()
  return all.value.filter(r =>
    (status.value === 'all' || r.status === status.value) &&
    (target.value === 'all' || r.p.target === target.value) &&
    (!q || r.p.code.toLowerCase().includes(q) || r.p.name.toLowerCase().includes(q))
  )
})

// Usage and discount totals count finalized redemptions only (all USD in R1).
const stats = computed(() => [
  { label: 'Active codes', value: all.value.filter(r => r.status === 'Active').length, sub: 'Redeemable right now' },
  { label: 'Scheduled', value: all.value.filter(r => r.status === 'Scheduled').length, sub: 'Start date in the future' },
  { label: 'Successful redemptions', value: all.value.reduce((s, r) => s + r.uses, 0), sub: 'Finalized invoices only' },
  { label: 'Total discount granted', value: usd(all.value.reduce((s, r) => s + r.discount, 0)), sub: 'USD · all promo codes' }
])

const open = p => {
  store.clearFlash()
  if (p.draft) router.push({ name: 'promo-create', query: { draft: p.id } })
  else router.push({ name: 'promo-detail', params: { id: p.id } })
}
const clearFilters = () => { query.value = ''; status.value = 'all'; target.value = 'all' }
</script>

<template>
  <div class="bo-page">
    <div class="bo-crumbs">Billing / <strong>Promo Codes</strong></div>
    <div class="bo-between" style="align-items: flex-end">
      <div>
        <h1 class="bo-h1">Promo codes</h1>
        <div class="bo-sub">Controlled discounts for plans, add-ons and renewals, synced with Stripe. One successful use per workspace.</div>
      </div>
      <RouterLink class="bo-btn pri" :to="{ name: 'promo-create' }" @click="store.clearFlash()">Create promo code</RouterLink>
    </div>

    <div v-if="store.flash" class="bo-banner" :class="store.flash.tone === 'ok' ? '' : store.flash.tone" role="status">
      <div>{{ store.flash.text }}</div>
      <button class="bo-btn sm" @click="store.clearFlash()">Dismiss</button>
    </div>

    <section class="bo-grid-stats">
      <div v-for="s in stats" :key="s.label" class="bo-card" style="padding: 14px 16px">
        <div class="bo-kpi-label">{{ s.label }}</div>
        <div class="bo-kpi-value">{{ s.value }}</div>
        <div class="bo-hint">{{ s.sub }}</div>
      </div>
    </section>

    <section class="bo-card">
      <div class="bo-rowflex" style="padding: 14px 16px; border-bottom: 1px solid var(--bo-line)">
        <input v-model="query" class="bo-in" type="search" placeholder="Search by code or internal name" aria-label="Search promo codes" style="flex: 1 1 240px" />
        <select v-model="status" class="bo-in" aria-label="Filter by status" style="width: 170px">
          <option value="all">All statuses</option>
          <option>Active</option>
          <option>Scheduled</option>
          <option>Inactive</option>
          <option>Expired</option>
          <option>Draft</option>
          <option>Sync failed</option>
        </select>
        <select v-model="target" class="bo-in" aria-label="Filter by target type" style="width: 170px">
          <option value="all">All target types</option>
          <option value="PLAN">Plan</option>
          <option value="ADD_ON">Add-on</option>
          <option value="RENEWAL">Renewal</option>
        </select>
      </div>

      <div class="bo-tablewrap">
        <table class="bo-table" style="min-width: 1040px">
          <thead>
            <tr>
              <th>Promo code</th><th>Target</th><th>Discount</th><th>Validity</th><th>Status</th><th>Stripe</th>
              <th class="bo-num">Uses</th><th class="bo-num">Total discount</th><th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.p.id" class="click" @click="open(r.p)">
              <td>
                <div class="bo-mono">{{ r.p.code }}</div>
                <div class="bo-hint">{{ r.p.name || 'Untitled draft' }}</div>
              </td>
              <td>{{ TARGET_LABEL[r.p.target] }}</td>
              <td style="font-weight: 600">{{ discountLabel(r.p) }}</td>
              <td>{{ r.validity }}</td>
              <td><span class="bo-pill" :class="r.tone">{{ r.status }}</span></td>
              <td><span class="bo-pill" :class="r.syncTone">{{ r.p.sync }}</span></td>
              <td class="bo-num">{{ r.uses }}</td>
              <td class="bo-num">{{ usd(r.discount) }}</td>
              <td class="bo-num" @click.stop>
                <div class="bo-rowflex" style="justify-content: flex-end; flex-wrap: nowrap">
                  <button v-if="r.status === 'Sync failed'" class="bo-btn sm" @click="store.retrySync(r.p.id)">Retry sync</button>
                  <button v-else-if="r.canReactivate" class="bo-btn sm" @click="store.reactivate(r.p.id)">Reactivate</button>
                  <button class="bo-btn sm" @click="open(r.p)">{{ r.p.draft ? 'Continue' : 'View' }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!rows.length" class="bo-empty">
        No promo codes match these filters. <button class="bo-link" @click="clearFilters">Clear filters</button>
      </div>
    </section>
  </div>
</template>
