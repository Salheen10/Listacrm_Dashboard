<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePromoStore, statusOf, discountOf, discountLabel, totalsOf, TARGET_LABEL, MODE_LABEL, APPLIES_TO } from '../store/promos'
import { usd, fmtDate, fmtDateTime } from '../utils/format'
import { NOW, PLANS } from '../data/catalog'

const route = useRoute()
const store = usePromoStore()

const promo = computed(() => store.byId(route.params.id))
const status = computed(() => (promo.value ? statusOf(promo.value) : ''))
const totals = computed(() => totalsOf(promo.value))
const STATUS_TONE = { Active: 'ok', Scheduled: 'info', 'Sync failed': 'bad', Syncing: 'warn' }
const SYNC_TONE = { Synced: 'ok', Failed: 'bad', Pending: 'warn' }

const redemptions = computed(() =>
  promo.value.reds.map(r => {
    const d = discountOf(promo.value, r.orig)
    return { ...r, discount: d, final: r.orig - d }
  })
)
// ---- redemption search and filters (table only; the tiles above always cover the whole promo) ----
const query = ref('')
const planFilter = ref('all')
const dateFrom = ref('')
const dateTo = ref('')
const rangeError = computed(() => !!dateFrom.value && !!dateTo.value && dateTo.value < dateFrom.value)
const hasFilters = computed(() => !!(query.value.trim() || planFilter.value !== 'all' || dateFrom.value || dateTo.value))
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return redemptions.value.filter(r => {
    const day = r.at.slice(0, 10) // redemption date in UTC
    return (!q || [r.ws, r.wsId, r.admin, r.adminEmail].some(v => (v || '').toLowerCase().includes(q))) &&
      (planFilter.value === 'all' || r.plan === planFilter.value) &&
      (!dateFrom.value || day >= dateFrom.value) &&
      (!dateTo.value || day <= dateTo.value)
  })
})
const filteredTotals = computed(() =>
  filtered.value.reduce((t, r) => ({ original: t.original + r.orig, discount: t.discount + r.discount, final: t.final + r.final }), { original: 0, discount: 0, final: 0 })
)
const clearFilters = () => { query.value = ''; planFilter.value = 'all'; dateFrom.value = ''; dateTo.value = '' }
watch(() => route.params.id, clearFilters)

const fmtTime = iso => fmtDateTime(iso).split(', ').pop()
const audit = computed(() => [...promo.value.audit].reverse())
const canDeactivate = computed(() => ['Active', 'Scheduled'].includes(status.value))
const canReactivate = computed(() => status.value === 'Inactive' && NOW >= promo.value.start && NOW <= promo.value.end)

const confirming = ref(false)
const reason = ref('Campaign ended early')
const REASONS = ['Campaign ended early', 'Budget reached', 'Created in error', 'Suspected misuse']
const deactivate = () => {
  store.deactivate(promo.value.id, reason.value)
  confirming.value = false
}
</script>

<template>
  <div v-if="!promo" class="bo-page">
    <div class="bo-card bo-empty">
      This promo code does not exist. <RouterLink class="bo-link" :to="{ name: 'promo-codes' }">Back to promo codes</RouterLink>
    </div>
  </div>

  <div v-else class="bo-page">
    <div class="bo-crumbs">Billing / <RouterLink :to="{ name: 'promo-codes' }" @click="store.clearFlash()">Promo Codes</RouterLink> / <strong>{{ promo.code }}</strong></div>
    <div class="bo-between" style="align-items: flex-end">
      <div>
        <div class="bo-rowflex">
          <h1 class="bo-h1 bo-mono">{{ promo.code }}</h1>
          <span class="bo-pill" :class="STATUS_TONE[status]">{{ status }}</span>
          <span class="bo-pill" :class="SYNC_TONE[promo.sync]">Stripe: {{ promo.sync }}</span>
        </div>
        <div class="bo-sub">{{ promo.name }} · shown to customers as “{{ promo.label }}”</div>
      </div>
      <div class="bo-rowflex">
        <button v-if="status === 'Sync failed'" class="bo-btn pri" @click="store.retrySync(promo.id)">Retry Stripe sync</button>
        <button v-if="status === 'Syncing'" class="bo-btn" disabled>Syncing with Stripe…</button>
        <button v-if="canReactivate" class="bo-btn pri" @click="store.reactivate(promo.id)">Reactivate</button>
        <button v-if="canDeactivate && !confirming" class="bo-btn danger" @click="confirming = true">Deactivate</button>
      </div>
    </div>

    <div v-if="store.flash" class="bo-banner" :class="store.flash.tone === 'ok' ? '' : store.flash.tone" role="status">
      <div>{{ store.flash.text }}</div>
      <button class="bo-btn sm" @click="store.clearFlash()">Dismiss</button>
    </div>

    <div v-if="status === 'Sync failed'" class="bo-banner err note">
      <div><strong>Not redeemable.</strong> The promo code was saved but Stripe synchronization failed. Review the provider error and retry — retrying never creates a duplicate Stripe object.</div>
    </div>

    <div v-if="confirming" class="bo-card bo-pad bo-stack" style="border-color: #e6b4ae">
      <div>
        <h2 class="bo-h2">Deactivate {{ promo.code }}?</h2>
        <div class="bo-sub">New redemptions are blocked immediately. Paid invoices and past redemptions stay unchanged.</div>
      </div>
      <div class="bo-rowflex" style="align-items: flex-end">
        <div style="flex: 0 1 280px">
          <label class="bo-lbl" for="deact-reason">Reason</label>
          <select id="deact-reason" v-model="reason" class="bo-in">
            <option v-for="r in REASONS" :key="r">{{ r }}</option>
          </select>
        </div>
        <button class="bo-btn danger" @click="deactivate">Deactivate promo code</button>
        <button class="bo-btn" @click="confirming = false">Keep active</button>
      </div>
    </div>

    <section class="bo-grid-stats">
      <div class="bo-card bo-stat">
        <div class="bo-kpi-label">Successful uses</div>
        <div class="bo-kpi-value">{{ totals.uses }}</div>
        <div class="bo-hint">{{ promo.cap ? `of ${promo.cap} total cap` : 'No total cap' }}</div>
      </div>
      <div class="bo-card bo-stat">
        <div class="bo-kpi-label">Total discount</div>
        <div class="bo-kpi-value">{{ usd(totals.discount) }}</div>
        <div class="bo-hint">USD · finalized invoices</div>
      </div>
      <div class="bo-card bo-stat">
        <div class="bo-kpi-label">Billed after discount</div>
        <div class="bo-kpi-value">{{ usd(totals.final) }}</div>
        <div class="bo-hint">From {{ usd(totals.original) }} original</div>
      </div>
      <div class="bo-card bo-stat">
        <div class="bo-kpi-label">Failed attempts</div>
        <div class="bo-kpi-value">{{ promo.failed.length }}</div>
        <div class="bo-hint">Not counted as usage</div>
      </div>
    </section>

    <section class="bo-card">
      <div class="bo-pad" style="padding-bottom: 12px">
        <div class="bo-between" style="align-items: flex-end">
          <div>
            <h2 class="bo-h2">Redemptions</h2>
            <div class="bo-hint">Amounts match the finalized invoice snapshot for each workspace.</div>
          </div>
          <div v-if="redemptions.length" class="bo-hint" role="status">Showing {{ filtered.length }} of {{ redemptions.length }} redemptions</div>
        </div>
        <div v-if="redemptions.length" class="bo-rowflex" style="margin-top: 14px; align-items: flex-end">
          <div style="flex: 1 1 280px">
            <label class="bo-flabel" for="rd-q">Search</label>
            <input id="rd-q" v-model="query" class="bo-in" type="search" placeholder="Workspace, workspace ID, admin name or email" />
          </div>
          <div style="flex: 0 1 170px">
            <label class="bo-flabel" for="rd-plan">Plan</label>
            <select id="rd-plan" v-model="planFilter" class="bo-in">
              <option value="all">All plans</option>
              <option v-for="p in PLANS" :key="p.id" :value="p.id">{{ p.id }}</option>
            </select>
          </div>
          <div style="flex: 0 1 165px">
            <label class="bo-flabel" for="rd-from">Redeemed from</label>
            <input id="rd-from" v-model="dateFrom" class="bo-in" :class="{ err: rangeError }" type="date" :max="dateTo || undefined" />
          </div>
          <div style="flex: 0 1 165px">
            <label class="bo-flabel" for="rd-to">Redeemed to</label>
            <input id="rd-to" v-model="dateTo" class="bo-in" :class="{ err: rangeError }" type="date" :min="dateFrom || undefined" />
          </div>
          <button class="bo-btn" :disabled="!hasFilters" @click="clearFilters">Clear filters</button>
        </div>
        <div v-if="rangeError" class="bo-err">The "Redeemed to" date must be on or after the "Redeemed from" date.</div>
        <div v-else-if="redemptions.length" class="bo-hint" style="margin-top: 6px">Dates are UTC. Filters apply to this table and its totals; the figures above always cover the whole promo code.</div>
      </div>
      <div v-if="filtered.length" class="bo-tablewrap">
        <table class="bo-table roomy" style="min-width: 900px">
          <thead>
            <tr>
              <th>Workspace</th><th>Redeemed by</th><th>Purchase</th><th class="bo-num">Original</th><th class="bo-num">Discount</th><th class="bo-num">Final</th><th>Redeemed</th><th>Billing</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.inv">
              <td class="nowrap"><div style="font-weight: 600">{{ r.ws }}</div><div class="bo-hint">{{ r.wsId }} · {{ r.plan }}</div></td>
              <td class="nowrap"><div>{{ r.admin }}</div><div class="bo-hint">{{ r.adminEmail }}</div></td>
              <td class="nowrap"><div>{{ r.item }} {{ r.kind.startsWith('Add-on') ? 'add-on' : 'plan' }}</div><div class="bo-hint">{{ r.inv }}</div></td>
              <td class="bo-num nowrap">{{ usd(r.orig) }}</td>
              <td class="bo-num nowrap" style="color: var(--bo-good); font-weight: 600">−{{ usd(r.discount) }}</td>
              <td class="bo-num nowrap" style="font-weight: 600">{{ usd(r.final) }}</td>
              <td class="nowrap"><div>{{ fmtDate(r.at) }}</div><div class="bo-hint">{{ fmtTime(r.at) }} UTC</div></td>
              <td><span class="bo-pill ok">Paid</span></td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">Total · {{ filtered.length }}<template v-if="hasFilters"> of {{ redemptions.length }}</template> redemptions</td>
              <td class="bo-num">{{ usd(filteredTotals.original) }}</td>
              <td class="bo-num">−{{ usd(filteredTotals.discount) }}</td>
              <td class="bo-num">{{ usd(filteredTotals.final) }}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div v-else-if="redemptions.length" class="bo-empty">
        No redemptions match these filters. <button class="bo-link" @click="clearFilters">Clear filters</button>
      </div>
      <div v-else class="bo-empty">This promo code has not been successfully redeemed yet.</div>
    </section>

    <div class="bo-split">
      <div class="bo-col-main">

        <section v-if="promo.failed.length" class="bo-card bo-pad">
          <h2 class="bo-h2">Failed and abandoned attempts</h2>
          <div class="bo-hint" style="margin-bottom: 6px">Kept for audit. These never count toward usage or total discount, and the workspace can still redeem the code.</div>
          <div v-for="f in promo.failed" :key="f.wsId + f.at" class="bo-item">
            <div style="flex: 1; min-width: 0">
              <div style="font-weight: 600">{{ f.ws }} <span class="bo-hint">· {{ f.wsId }}</span></div>
              <div class="bo-hint">{{ f.reason }}</div>
            </div>
            <div class="bo-hint" style="flex: none">{{ fmtDateTime(f.at) }}</div>
          </div>
        </section>
        <section class="bo-card bo-pad">
          <h2 class="bo-h2" style="margin-bottom: 4px">Audit trail</h2>
          <div v-for="(a, i) in audit" :key="i" class="bo-item">
            <div style="flex: 1; min-width: 0">
              <div style="font-weight: 600">{{ a.what }}</div>
              <div class="bo-hint">{{ a.who }} · {{ fmtDateTime(a.at) }}</div>
            </div>
          </div>
        </section>
      </div>

      <aside class="bo-col-side">
        <section class="bo-card bo-pad">
          <h2 class="bo-h2" style="margin-bottom: 8px">Configuration</h2>
          <div class="bo-kv"><div>Target type</div><div>{{ TARGET_LABEL[promo.target] }}</div></div>
          <div class="bo-kv"><div>Applies to</div><div>{{ APPLIES_TO[promo.target] }}</div></div>
          <div class="bo-kv"><div>Discount</div><div>{{ MODE_LABEL[promo.mode] }} · {{ discountLabel(promo) }}</div></div>
          <div class="bo-kv"><div>Currency</div><div>{{ promo.currency }}</div></div>
          <div class="bo-kv">
            <div>{{ promo.target === 'RENEWAL' ? 'Eligible plans' : 'Eligible scope' }}</div>
            <div class="bo-rowflex" style="gap: 6px"><span v-for="s in promo.scope" :key="s" class="bo-tag">{{ s }}</span></div>
          </div>
          <div class="bo-kv"><div>Starts</div><div>{{ fmtDateTime(promo.start) }}</div></div>
          <div class="bo-kv"><div>Ends</div><div>{{ fmtDateTime(promo.end) }}</div></div>
          <div class="bo-kv"><div>Per workspace</div><div>One successful use</div></div>
          <div class="bo-kv"><div>Total cap</div><div>{{ promo.cap ? promo.cap.toLocaleString('en-US') + ' redemptions' : 'Unlimited' }}</div></div>
          <div v-if="promo.manual" class="bo-kv"><div>Deactivated</div><div>{{ fmtDateTime(promo.manual.at) }} by {{ promo.manual.by }} — {{ promo.manual.reason }}</div></div>
          <div v-if="totals.uses" class="bo-banner warn note" style="margin-top: 12px; font-size: 13px">
            Discount terms are locked after the first successful redemption. Create a new promo code for new economics.
          </div>
        </section>

        <section class="bo-card bo-pad">
          <h2 class="bo-h2" style="margin-bottom: 8px">Stripe</h2>
          <div class="bo-kv"><div>Sync status</div><div><span class="bo-pill" :class="SYNC_TONE[promo.sync]">{{ promo.sync }}</span></div></div>
          <div class="bo-kv"><div>Coupon ref</div><div class="bo-mono" style="font-weight: 500">{{ promo.stripe ? promo.stripe.coupon : '—' }}</div></div>
          <div class="bo-kv"><div>Promotion ref</div><div class="bo-mono" style="font-weight: 500">{{ promo.stripe ? promo.stripe.promotion : '—' }}</div></div>
          <div class="bo-hint" style="margin-top: 8px">References only. No Stripe keys or card data are stored on the promo record.</div>
        </section>
      </aside>
    </div>
  </div>
</template>
