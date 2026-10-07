<script setup>
import { computed, ref } from 'vue'
import { useAppStore } from '../store'
import { usePromoStore } from '../store/promos'
import { buildOverview, buildMix, PERIODS, TENANT_TYPES, ACTIVITY } from '../data/overview'
import { PLANS } from '../data/catalog'
import { money } from '../utils/format'

const store = useAppStore()
const promos = usePromoStore()

// Plan is the app-wide filter; date range defaults to current month (MTD).
const period = ref('mtd')
const tenantType = ref('all')
const freshness = ref('10m ago')
const openHelp = ref(null)
const month = ref(11)
const mixMode = ref('all')
const mixBy = ref('tenants')
const showAllAlerts = ref(false)
const feed = ref('all')

// Card icons (24px stroke paths)
const ICONS = {
  mrr: 'M12 3v18M16 7h-6a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H8',
  arr: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  apt: 'M5 21V5h9v16M14 10h5v11M3 21h18M8 9h3M8 13h3',
  gross: 'M6 3h9l4 4v14H6zM9 12h7M9 16h7',
  arpu: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  ltv: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  churn: 'M3 12h4l3-7 4 14 3-7h4',
  t2p: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 3-5 6-5s6 2 6 5M17 5a3 3 0 0 1 0 6M21 20c0-2-1-4-3-5',
  'New workspaces': 'M5 21V5h9v16M3 21h18M17 8v6M14 11h6',
  'Lost workspaces': 'M5 21V5h9v16M3 21h18M14 11h6',
  'Total workspaces': 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 3-5 6-5s6 2 6 5M17 5a3 3 0 0 1 0 6M21 20c0-2-1-4-3-5',
  Invoices: 'M6 3h9l4 4v14H6zM9 12h7M9 16h7',
  Collected: 'M4 7c0-2 16-2 16 0v10c0 2-16 2-16 0zM4 7c0 2 16 2 16 0M4 12c0 2 16 2 16 0',
  'Paid tenants': 'M3 6h18v12H3zM3 10h18'
}
const BAR_TONE = { up: '#22a35a', down: '#e5484d', flat: '#8fb4f5' }

const MIX_MODES = [['all', 'All tenants'], ['with', 'With add-ons'], ['without', 'Without add-ons'], ['addons', 'Add-ons only']]
const MIX_BYS = [['tenants', 'By tenants'], ['mrr', 'By MRR']]

const data = computed(() =>
  buildOverview({ plan: store.filters.plan, type: tenantType.value, period: period.value }, promos.syncFailures)
)
const mix = computed(() => buildMix(data.value.rows, mixMode.value, mixBy.value))
const selected = computed(() => data.value.months[month.value])
const signed = v => (v >= 0 ? '+' : '−') + money(Math.abs(v))
const alerts = computed(() => (showAllAlerts.value ? data.value.alerts : data.value.alerts.slice(0, 4)))
const events = computed(() =>
  ACTIVITY.filter(e => (feed.value === 'all' || e.cat === feed.value) && (store.filters.plan === 'all' || !e.plan || e.plan === store.filters.plan))
)
const alertTarget = to => (typeof to === 'string' ? { name: to } : to)

const reset = () => {
  store.filters.plan = 'all'
  period.value = 'mtd'
  tenantType.value = 'all'
}
</script>

<template>
  <div class="bo-page">
    <div class="bo-between" style="align-items: flex-end">
      <div style="flex: 1 1 300px">
        <h1 class="bo-h1">Executive overview</h1>
        <div class="bo-sub">
          Commercial and operational health · <strong style="color: var(--bo-text)">{{ data.period.range }}</strong> · {{ data.period.cmp }}
        </div>
      </div>
      <div class="bo-rowflex" style="align-items: flex-end">
        <div style="width: 150px">
          <label class="bo-hint" for="ov-plan" style="font-weight: 600">Plan</label>
          <select id="ov-plan" v-model="store.filters.plan" class="bo-in">
            <option value="all">All plans</option>
            <option v-for="p in PLANS" :key="p.id" :value="p.id">{{ p.id }}</option>
          </select>
        </div>
        <div style="width: 190px">
          <label class="bo-hint" for="ov-period" style="font-weight: 600">Date range</label>
          <select id="ov-period" v-model="period" class="bo-in">
            <option v-for="(p, id) in PERIODS" :key="id" :value="id">{{ p.label }}</option>
          </select>
        </div>
        <div style="width: 170px">
          <label class="bo-hint" for="ov-type" style="font-weight: 600">Tenant type</label>
          <select id="ov-type" v-model="tenantType" class="bo-in">
            <option v-for="t in TENANT_TYPES" :key="t.id" :value="t.id">{{ t.label }}</option>
          </select>
        </div>
        <button class="bo-btn" @click="reset">Reset</button>
        <button class="bo-btn" @click="freshness = 'just now'">
          <svg class="bo-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2 6M20 4v7h-7" /></svg>
          Updated {{ freshness }}
        </button>
      </div>
    </div>

    <div v-if="data.empty" class="bo-banner warn">
      <div><strong>No paid tenants match these filters.</strong> Zero values below are real results for this combination, not missing data.</div>
      <button class="bo-btn" @click="reset">Reset filters</button>
    </div>

    <section class="bo-grid-kpi" aria-label="Revenue and unit economics">
      <div v-for="k in data.kpis" :key="k.id" class="bo-card bo-kpi">
        <div class="bo-between" style="align-items: flex-start; flex-wrap: nowrap">
          <div class="bo-kpi-label">{{ k.label }}</div>
          <button class="bo-kpi-icon" :title="`How ${k.label} is calculated`" :aria-label="`How ${k.label} is calculated`" :aria-expanded="openHelp === k.id" @click="openHelp = openHelp === k.id ? null : k.id">
            <svg class="bo-ic" viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS[k.id]" /></svg>
          </button>
        </div>
        <div class="bo-between" style="align-items: flex-end; flex-wrap: nowrap">
          <div style="min-width: 0">
            <div class="bo-delta" :class="k.delta.tone">{{ k.delta.text }}</div>
            <div class="bo-kpi-value">{{ k.value }}</div>
            <div class="bo-hint">{{ k.sub }}</div>
          </div>
          <svg class="bo-spark" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient :id="`spark-${k.id}`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" :stop-color="k.color" stop-opacity="0.28" />
                <stop offset="1" :stop-color="k.color" stop-opacity="0" />
              </linearGradient>
            </defs>
            <polygon :points="`0,40 ${k.points} 100,40`" :fill="`url(#spark-${k.id})`" />
            <polyline :points="k.points" fill="none" :stroke="k.color" stroke-width="2" vector-effect="non-scaling-stroke" />
          </svg>
        </div>
        <div v-if="openHelp === k.id" class="bo-help">{{ k.help }}</div>
      </div>
    </section>

    <section class="bo-grid-mini" aria-label="Workspace growth and billing activity">
      <div v-for="k in data.minis" :key="k.label" class="bo-card bo-kpi">
        <div class="bo-between" style="align-items: flex-start; flex-wrap: nowrap">
          <div class="bo-kpi-label">{{ k.label }}</div>
          <svg class="bo-ic" viewBox="0 0 24 24" aria-hidden="true" style="color: var(--bo-muted)"><path :d="ICONS[k.label]" /></svg>
        </div>
        <div class="bo-between" style="align-items: flex-end; flex-wrap: nowrap">
          <div style="min-width: 0">
            <div class="bo-delta" :class="k.delta.tone">{{ k.delta.text }}</div>
            <div class="bo-kpi-value sm">{{ k.value }}</div>
            <div class="bo-hint">{{ k.sub }}</div>
          </div>
          <div class="bo-minibars" aria-hidden="true">
            <i v-for="(h, i) in k.bars" :key="i" :style="{ height: h + '%', background: BAR_TONE[k.delta.tone], opacity: 0.35 + i * 0.13 }"></i>
          </div>
        </div>
      </div>
    </section>

    <div class="bo-grid-2">
      <section class="bo-card bo-pad bo-stack">
        <div>
          <h2 class="bo-h2">MRR movement · rolling 12 months</h2>
          <div class="bo-hint">The line is total MRR. Bars show what moved it: gains above the axis, losses below. Select a month for exact figures.</div>
        </div>
        <div class="bo-readout">
          <div><span class="bo-hint">{{ selected.label }} · Total MRR</span><strong>{{ money(selected.total) }}</strong></div>
          <div><span class="bo-hint"><i class="bo-sw" style="background: #1a66f0"></i>New</span><strong>+{{ money(selected.n) }}</strong></div>
          <div><span class="bo-hint"><i class="bo-sw" style="background: #8db8ff"></i>Expansion</span><strong>+{{ money(selected.e) }}</strong></div>
          <div><span class="bo-hint"><i class="bo-sw" style="background: #f2b46a"></i>Contraction</span><strong>−{{ money(selected.c) }}</strong></div>
          <div><span class="bo-hint"><i class="bo-sw" style="background: #b3430b"></i>Churn</span><strong>−{{ money(selected.h) }}</strong></div>
          <div><span class="bo-hint">Net change</span><strong>{{ signed(selected.net) }}</strong></div>
        </div>
        <div class="bo-chart">
          <div class="bo-chart-cols">
            <button
              v-for="(m, i) in data.months"
              :key="m.label"
              class="bo-mcol"
              :class="{ on: month === i }"
              :aria-pressed="month === i"
              :aria-label="`${m.label}, total MRR ${money(m.total)}, net change ${signed(m.net)}`"
              @click="month = i"
              @mouseenter="month = i"
            >
              <div class="bo-mcol-line"><div class="bo-mdot" :style="{ top: `calc(${m.y}% - 4px)` }"></div></div>
              <div class="bo-mcol-pos">
                <div :style="{ height: m.e * data.chart.unit + 'px', background: '#8db8ff', borderRadius: '3px 3px 0 0' }"></div>
                <div :style="{ height: m.n * data.chart.unit + 'px', background: '#1a66f0' }"></div>
              </div>
              <div style="height: 1px; background: #64748b"></div>
              <div :style="{ height: data.chart.negHeight + 'px' }">
                <div :style="{ height: m.c * data.chart.unit + 'px', background: '#f2b46a' }"></div>
                <div :style="{ height: m.h * data.chart.unit + 'px', background: '#b3430b', borderRadius: '0 0 3px 3px' }"></div>
              </div>
              <div class="bo-mlabel">{{ m.short }}</div>
            </button>
          </div>
          <svg class="bo-chart-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline :points="data.chart.linePoints" fill="none" stroke="#0f172a" stroke-width="2" vector-effect="non-scaling-stroke" />
          </svg>
        </div>
      </section>

      <section class="bo-card bo-pad bo-stack">
        <div class="bo-between">
          <div>
            <h2 class="bo-h2">Plan mix</h2>
            <div class="bo-hint">{{ mix.summary }}</div>
          </div>
          <div class="bo-segs compact" role="group" aria-label="Chart basis">
            <button v-for="[id, label] in MIX_BYS" :key="id" class="bo-seg" :class="{ on: mixBy === id }" :aria-pressed="mixBy === id" @click="mixBy = id">{{ label }}</button>
          </div>
        </div>
        <div class="bo-segs compact" role="group" aria-label="Economics view">
          <button v-for="[id, label] in MIX_MODES" :key="id" class="bo-seg" :class="{ on: mixMode === id }" :aria-pressed="mixMode === id" @click="mixMode = id">{{ label }}</button>
        </div>
        <div class="bo-rowflex" style="gap: 20px">
          <div class="bo-donut" :style="{ background: mix.donut }" role="img" :aria-label="mix.summary">
            <div class="bo-donut-hole">
              <div style="font-size: 20px; font-weight: 700">{{ mix.center }}</div>
              <div class="bo-hint">{{ mix.centerLabel }}</div>
            </div>
          </div>
          <div class="bo-tablewrap" style="flex: 1 1 300px">
            <table class="bo-table">
              <thead>
                <tr><th>Plan</th><th class="bo-num">Tenants</th><th class="bo-num">{{ mix.pctHead }}</th><th class="bo-num">{{ mix.mrrHead }}</th></tr>
              </thead>
              <tbody>
                <tr v-for="r in mix.rows" :key="r.name">
                  <td style="font-weight: 600"><i class="bo-dot" :style="{ background: r.color }"></i>{{ r.name }}</td>
                  <td class="bo-num">{{ r.tenants }}</td>
                  <td class="bo-num">{{ r.pct }}</td>
                  <td class="bo-num">{{ r.mrr }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr><td>Total</td><td class="bo-num">{{ mix.total.tenants }}</td><td class="bo-num">{{ mix.total.pct }}</td><td class="bo-num">{{ mix.total.mrr }}</td></tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div class="bo-hint">{{ mix.note }}</div>
      </section>
    </div>

    <div class="bo-grid-3">
      <section class="bo-card bo-pad bo-stack">
        <div>
          <h2 class="bo-h2">Add-on attach</h2>
          <div class="bo-hint">Share of eligible paid tenants with the add-on active. Eligibility follows plan entitlements.</div>
        </div>
        <div v-for="a in data.addons" :key="a.name" style="display: flex; flex-direction: column; gap: 6px">
          <div class="bo-between" style="align-items: baseline">
            <strong>{{ a.name }}</strong>
            <div><strong>{{ a.rate }}</strong> <span class="bo-hint">· {{ a.count }}</span></div>
          </div>
          <div class="bo-bar"><div :style="{ width: a.width + '%' }"></div></div>
          <div class="bo-hint">{{ a.mrr }} add-on MRR · {{ a.eligible }}</div>
        </div>
      </section>

      <section class="bo-card bo-pad">
        <div class="bo-between" style="align-items: center; margin-bottom: 8px">
          <h2 class="bo-h2">Alerts<span class="bo-count">{{ data.alerts.length }}</span></h2>
          <button v-if="data.alerts.length > 4" class="bo-btn sm" @click="showAllAlerts = !showAllAlerts">{{ showAllAlerts ? 'Show fewer' : 'View all' }}</button>
        </div>
        <div v-for="a in alerts" :key="a.title + a.detail" class="bo-item">
          <div class="bo-sev" :class="a.sev">{{ a.sev }}</div>
          <div style="flex: 1; min-width: 0">
            <div style="font-weight: 600">{{ a.title }}</div>
            <div class="bo-hint">{{ a.detail }}</div>
            <RouterLink class="bo-link" :to="alertTarget(a.to)">{{ a.cta }}</RouterLink>
          </div>
          <div class="bo-hint" style="flex: none">{{ a.age }}</div>
        </div>
        <div v-if="!data.alerts.length" class="bo-empty">No active alerts for these filters.</div>
        <div class="bo-hint" style="border-top: 1px solid #edf0f5; padding-top: 10px">
          IDX / MLS alerts are monitor-only. Operators cannot approve or publish on a customer's behalf.
        </div>
      </section>

      <section class="bo-card bo-pad">
        <div class="bo-between" style="align-items: center; margin-bottom: 8px">
          <h2 class="bo-h2">Live activity</h2>
          <select v-model="feed" class="bo-in" aria-label="Filter events" style="width: 150px; min-height: 34px; padding: 4px 10px">
            <option value="all">All events</option>
            <option value="Billing">Billing</option>
            <option value="Workspace">Workspaces</option>
            <option value="Verification">Verification</option>
            <option value="Operator">Operators</option>
          </select>
        </div>
        <div v-for="e in events" :key="e.title + e.detail" class="bo-item">
          <div class="bo-sev">{{ e.cat }}</div>
          <div style="flex: 1; min-width: 0">
            <div style="font-weight: 600">{{ e.title }}</div>
            <div class="bo-hint">{{ e.detail }}</div>
          </div>
          <div class="bo-hint" style="flex: none">{{ e.age }}</div>
        </div>
        <div v-if="!events.length" class="bo-empty">No events of this type for the selected plan.</div>
      </section>
    </div>
  </div>
</template>
