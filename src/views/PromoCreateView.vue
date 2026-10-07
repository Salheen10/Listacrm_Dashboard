<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePromoStore, scopeItems, discountOf, discountLabel, TARGET_LABEL, MODE_LABEL } from '../store/promos'
import { usd, fmtDateTime } from '../utils/format'

const route = useRoute()
const router = useRouter()
const store = usePromoStore()

const blank = () => ({
  id: null, code: '', name: '', label: '', desc: '',
  target: 'PLAN', mode: 'PERCENTAGE', value: '', currency: 'USD',
  scope: [], capMode: 'unlimited', cap: '',
  startDate: '2026-05-05', startTime: '00:00', endDate: '', endTime: '23:59', tz: 'UTC'
})

// Continue a saved draft when opened with ?draft=<id>
const draft = route.query.draft ? store.byId(route.query.draft) : null
const form = reactive(draft && draft.form ? { ...draft.form, scope: [...draft.form.scope] } : blank())

const step = ref(1)
const errors = ref({})
const syncing = ref(false)
const previewItem = ref('')

const STEPS = [
  { n: 1, title: 'Basic info & discount', sub: 'Promo details and discount value' },
  { n: 2, title: 'Eligibility & validity', sub: 'Plans, add-ons and time window' },
  { n: 3, title: 'Review & create', sub: 'Confirm and sync with Stripe' }
]
const TARGETS = [['PLAN', 'Plan'], ['ADD_ON', 'Add-on'], ['RENEWAL', 'Renewal']]
const MODES = [['PERCENTAGE', 'Percentage'], ['FIXED_AMOUNT', 'Fixed amount'], ['FULL_DISCOUNT', 'Full discount']]

const items = computed(() => scopeItems(form.target))
const scopeNoun = computed(() => (form.target === 'ADD_ON' ? 'add-on' : 'plan'))
const startAt = computed(() => (form.startDate && form.startTime ? `${form.startDate}T${form.startTime}` : ''))
const endAt = computed(() => (form.endDate && form.endTime ? `${form.endDate}T${form.endTime}` : ''))

const onCode = e => {
  form.code = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 24)
  e.target.value = form.code
}
const setTarget = t => { if (form.target !== t) { form.target = t; form.scope = []; previewItem.value = '' } }
const setMode = m => { form.mode = m; if (m === 'FULL_DISCOUNT') form.value = '' }
const toggleScope = id => { form.scope = form.scope.includes(id) ? form.scope.filter(s => s !== id) : [...form.scope, id] }

const validate = n => {
  const e = {}
  if (n === 1) {
    if (!form.code) e.code = 'Enter a promo code.'
    else if (store.isCodeTaken(form.code, form.id)) e.code = 'This promo code already exists. Use a different code.'
    if (!form.name.trim()) e.name = 'Enter an internal display name.'
    if (!form.label.trim()) e.label = 'Enter the customer-facing label.'
    const v = Number(form.value)
    if (form.mode === 'PERCENTAGE' && !(v > 0 && v <= 100)) e.value = 'Enter a percentage greater than 0 and up to 100.'
    if (form.mode === 'FIXED_AMOUNT' && !(v > 0)) e.value = 'Enter a fixed amount greater than 0.'
  }
  if (n === 2) {
    if (!form.scope.length) e.scope = `Select at least one eligible ${scopeNoun.value}.`
    if (form.capMode === 'cap' && !(Number.isInteger(Number(form.cap)) && Number(form.cap) >= 1)) e.cap = 'Enter a whole number of 1 or more.'
    if (!startAt.value) e.start = 'Set a start date and time.'
    if (!endAt.value) e.end = 'Set an end date and time.'
    else if (startAt.value && endAt.value <= startAt.value) e.end = 'The promo end date must be later than the start date.'
  }
  return e
}
const hasErrors = e => Object.keys(e).length > 0

const next = () => {
  const e = validate(step.value)
  errors.value = e
  if (!hasErrors(e)) step.value += 1
}
const goTo = n => {
  if (n < step.value) { errors.value = {}; step.value = n; return }
  for (let s = step.value; s < n; s++) {
    const e = validate(s)
    if (hasErrors(e)) { errors.value = e; step.value = s; return }
  }
  errors.value = {}
  step.value = n
}

const cancel = () => router.push({ name: 'promo-codes' })
const saveDraft = () => {
  if (!form.code || store.isCodeTaken(form.code, form.id)) {
    errors.value = { code: form.code ? 'This promo code already exists. Use a different code.' : 'Enter a promo code before saving a draft.' }
    step.value = 1
    return
  }
  store.saveDraft(form)
  router.push({ name: 'promo-codes' })
}
const create = async () => {
  const e1 = validate(1), e2 = validate(2)
  if (hasErrors(e1)) { errors.value = e1; step.value = 1; return }
  if (hasErrors(e2)) { errors.value = e2; step.value = 2; return }
  syncing.value = true
  const promo = await store.create(form)
  router.push({ name: 'promo-detail', params: { id: promo.id } })
}

// ---- Live preview ----
const preview = computed(() => {
  const list = items.value
  const item = list.find(i => i.id === previewItem.value) || list.find(i => form.scope.includes(i.id)) || list[0]
  const eligible = !form.scope.length || form.scope.includes(item.id)
  const discount = eligible ? discountOf(form, item.price) : 0
  const capped = form.mode === 'FIXED_AMOUNT' && Number(form.value) * 100 > item.price
  return { item, eligible, discount, final: item.price - discount, capped }
})
const badge = computed(() => discountLabel(form))
const scheduled = computed(() => startAt.value > '2026-05-04T12:00')

const checks = computed(() => {
  const e1 = validate(1), e2 = validate(2)
  return [
    { ok: !e1.code, title: 'Promo code is unique', sub: e1.code || `${form.code} is available and not in use.` },
    { ok: !e1.value, title: 'Discount value is valid', sub: e1.value || `${MODE_LABEL[form.mode]} · ${badge.value}. Never exceeds the eligible subtotal.` },
    { ok: !e2.scope, title: 'Eligible scope is configured', sub: e2.scope || `${form.scope.length} ${scopeNoun.value}${form.scope.length === 1 ? '' : 's'} selected from the catalogue.` },
    { ok: !e2.start && !e2.end, title: 'Validity dates are correct', sub: e2.start || e2.end || 'Start is before end.' },
    { ok: true, title: 'No stacking', sub: 'Only one promo code can apply to a single invoice.' },
    { ok: true, title: 'Audit logging enabled', sub: 'Creation and every redemption are recorded.' }
  ]
})
</script>

<template>
  <div class="bo-page">
    <div class="bo-crumbs">Billing / <RouterLink :to="{ name: 'promo-codes' }">Promo Codes</RouterLink> / <strong>Create promo code</strong></div>

    <div class="bo-between" style="align-items: flex-end">
      <div>
        <h1 class="bo-h1">Create promo code</h1>
        <div class="bo-sub">Configure a controlled discount for plans, add-ons or renewals and sync it with Stripe.</div>
      </div>
      <div class="bo-rowflex">
        <button class="bo-btn" :disabled="syncing" @click="cancel">Cancel</button>
        <button class="bo-btn" :disabled="syncing" @click="saveDraft">Save draft</button>
        <button v-if="step > 1" class="bo-btn" :disabled="syncing" @click="goTo(step - 1)">Back</button>
        <button v-if="step < 3" class="bo-btn pri" @click="next">Continue →</button>
        <button v-else class="bo-btn pri" :disabled="syncing" @click="create">{{ syncing ? 'Syncing with Stripe…' : 'Create promo code →' }}</button>
      </div>
    </div>

    <nav class="bo-steps" aria-label="Steps">
      <button v-for="s in STEPS" :key="s.n" class="bo-step" :class="{ on: step === s.n, done: step > s.n }" :aria-current="step === s.n ? 'step' : undefined" :disabled="syncing" @click="goTo(s.n)">
        <span class="bo-step-n">{{ step > s.n ? '✓' : s.n }}</span>
        <span>
          <span class="bo-step-t" style="display: block">{{ s.title }}</span>
          <span class="bo-hint">{{ s.sub }}</span>
        </span>
      </button>
    </nav>

    <div class="bo-split">
      <div class="main">
        <!-- STEP 1 -->
        <template v-if="step === 1">
          <section class="bo-card bo-pad bo-stack">
            <div class="bo-sechead">
              <div class="bo-secnum">1</div>
              <div><h2 class="bo-h2">Promo identity</h2><div class="bo-hint">Define the code and how it appears to customers.</div></div>
            </div>
            <div class="bo-fields">
              <div>
                <label class="bo-lbl" for="pc-code">Promo code <span class="req">*</span></label>
                <input id="pc-code" class="bo-in bo-mono" :class="{ err: errors.code }" :value="form.code" placeholder="SUMMER26" autocomplete="off" @input="onCode" />
                <div v-if="errors.code" class="bo-err">{{ errors.code }}</div>
                <div v-else class="bo-hint" style="margin-top: 4px">Uppercase letters, numbers and hyphens. Must be unique.</div>
              </div>
              <div>
                <label class="bo-lbl" for="pc-name">Internal display name <span class="req">*</span></label>
                <input id="pc-name" v-model="form.name" class="bo-in" :class="{ err: errors.name }" placeholder="Summer 2026 Campaign" />
                <div v-if="errors.name" class="bo-err">{{ errors.name }}</div>
                <div v-else class="bo-hint" style="margin-top: 4px">Only operators see this name.</div>
              </div>
              <div>
                <label class="bo-lbl" for="pc-label">Customer-facing label <span class="req">*</span></label>
                <input id="pc-label" v-model="form.label" class="bo-in" :class="{ err: errors.label }" placeholder="Summer Special – 20% Off" />
                <div v-if="errors.label" class="bo-err">{{ errors.label }}</div>
                <div v-else class="bo-hint" style="margin-top: 4px">Shown at checkout and on the invoice.</div>
              </div>
              <div>
                <label class="bo-lbl" for="pc-desc">Description / campaign notes</label>
                <textarea id="pc-desc" v-model="form.desc" class="bo-in" maxlength="500" placeholder="Who is this for and why? No secrets."></textarea>
                <div class="bo-hint bo-num">{{ form.desc.length }}/500</div>
              </div>
            </div>
          </section>

          <section class="bo-card bo-pad bo-stack">
            <div class="bo-sechead">
              <div class="bo-secnum">2</div>
              <div><h2 class="bo-h2">Discount setup</h2><div class="bo-hint">What the discount applies to and how much it takes off.</div></div>
            </div>
            <div class="bo-fields">
              <div>
                <span class="bo-lbl">Target type <span class="req">*</span></span>
                <div class="bo-segs" role="group" aria-label="Target type">
                  <button v-for="[id, label] in TARGETS" :key="id" class="bo-seg" :class="{ on: form.target === id }" :aria-pressed="form.target === id" @click="setTarget(id)">{{ label }}</button>
                </div>
                <div class="bo-hint" style="margin-top: 4px">
                  {{ form.target === 'PLAN' ? 'Discounts the base plan line only.' : form.target === 'ADD_ON' ? 'Discounts the selected add-on line only.' : 'Applied at the next renewal charge and revalidated at that time.' }}
                </div>
              </div>
              <div>
                <span class="bo-lbl">Discount mode <span class="req">*</span></span>
                <div class="bo-segs" role="group" aria-label="Discount mode">
                  <button v-for="[id, label] in MODES" :key="id" class="bo-seg" :class="{ on: form.mode === id }" :aria-pressed="form.mode === id" @click="setMode(id)">{{ label }}</button>
                </div>
                <div class="bo-hint" style="margin-top: 4px">
                  {{ form.mode === 'FULL_DISCOUNT' ? '100% off the eligible subtotal. An invoice is still created as evidence.' : 'Calculated on the eligible pre-tax subtotal.' }}
                </div>
              </div>
              <div v-if="form.mode !== 'FULL_DISCOUNT'">
                <label class="bo-lbl" for="pc-value">Discount value <span class="req">*</span></label>
                <div class="bo-affix">
                  <input id="pc-value" v-model="form.value" class="bo-in" :class="{ err: errors.value }" type="number" min="0" :max="form.mode === 'PERCENTAGE' ? 100 : undefined" step="any" :placeholder="form.mode === 'PERCENTAGE' ? '20' : '50.00'" />
                  <span>{{ form.mode === 'PERCENTAGE' ? '%' : form.currency }}</span>
                </div>
                <div v-if="errors.value" class="bo-err">{{ errors.value }}</div>
                <div v-else class="bo-hint" style="margin-top: 4px">{{ form.mode === 'PERCENTAGE' ? 'Greater than 0 and up to 100.' : 'Capped at the eligible subtotal — never a negative charge.' }}</div>
              </div>
              <div>
                <label class="bo-lbl" for="pc-currency">Currency</label>
                <select id="pc-currency" v-model="form.currency" class="bo-in" :disabled="form.mode !== 'FIXED_AMOUNT'">
                  <option>USD</option>
                </select>
                <div class="bo-hint" style="margin-top: 4px">Used for fixed-amount discounts. Billing currency is USD.</div>
              </div>
            </div>
          </section>

          <section class="bo-card bo-pad bo-stack">
            <div class="bo-between">
              <div class="bo-sechead">
                <div class="bo-secnum">3</div>
                <div><h2 class="bo-h2">Live behavior preview</h2><div class="bo-hint">How the discount appears to a customer at checkout.</div></div>
              </div>
              <div class="bo-rowflex">
                <label class="bo-hint" for="pc-preview">Preview for</label>
                <select id="pc-preview" v-model="previewItem" class="bo-in" style="width: 220px">
                  <option value="">{{ preview.item.id }} (default)</option>
                  <option v-for="i in items" :key="i.id" :value="i.id">{{ i.id }} — {{ usd(i.price) }}/mo</option>
                </select>
              </div>
            </div>
            <div class="bo-fields">
              <div class="bo-card bo-pad">
                <strong>Checkout preview</strong>
                <div class="bo-kv" style="margin-top: 8px"><div>{{ preview.item.id }} (monthly)</div><div class="bo-num">{{ usd(preview.item.price) }}</div></div>
                <div class="bo-kv"><div>Promo code ({{ form.code || '—' }})</div><div class="bo-num" style="color: var(--bo-good)">−{{ usd(preview.discount) }}</div></div>
                <div class="bo-kv"><div style="color: var(--bo-text); font-weight: 700">Total (USD)</div><div class="bo-num" style="font-weight: 700">{{ usd(preview.final) }}</div></div>
                <div v-if="!preview.eligible" class="bo-err">{{ preview.item.id }} is outside the eligible scope, so the code would be rejected for this purchase.</div>
                <div v-if="preview.capped" class="bo-hint" style="margin-top: 6px">The fixed amount is larger than this price, so the discount is capped at the subtotal.</div>
              </div>
              <div class="bo-card bo-pad" style="background: var(--bo-primary-soft); border-color: #c9dbfb">
                <strong>Rules that always apply</strong>
                <ul style="margin: 8px 0 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px">
                  <li>One promo code per invoice. Codes do not stack.</li>
                  <li>Each workspace can successfully redeem a code once.</li>
                  <li>Validating a code never consumes it; a failed payment does not either.</li>
                  <li>The discount applies to eligible line items only, before tax.</li>
                </ul>
              </div>
            </div>
          </section>
        </template>

        <!-- STEP 2 -->
        <template v-if="step === 2">
          <section class="bo-card bo-pad bo-stack">
            <div class="bo-sechead">
              <div class="bo-secnum">1</div>
              <div>
                <h2 class="bo-h2">Eligible {{ scopeNoun }}s</h2>
                <div class="bo-hint">
                  {{ form.target === 'RENEWAL' ? 'Renewals of these plans can use the code.' : `This ${TARGET_LABEL[form.target].toLowerCase()} promo can be redeemed on the selected ${scopeNoun}s only.` }}
                  Change the target type in step 1.
                </div>
              </div>
            </div>
            <div class="bo-rowflex" role="group" :aria-label="`Eligible ${scopeNoun}s`">
              <button v-for="i in items" :key="i.id" class="bo-chip" :class="{ on: form.scope.includes(i.id) }" :aria-pressed="form.scope.includes(i.id)" @click="toggleScope(i.id)">
                {{ form.scope.includes(i.id) ? '✓' : '+' }} {{ i.id }} <span class="bo-hint">{{ usd(i.price) }}/mo</span>
              </button>
            </div>
            <div v-if="errors.scope" class="bo-err">{{ errors.scope }}</div>
            <div v-else class="bo-hint">Scope is required. A promo with no selected {{ scopeNoun }} cannot be created.</div>
          </section>

          <section class="bo-card bo-pad bo-stack">
            <div class="bo-sechead">
              <div class="bo-secnum">2</div>
              <div><h2 class="bo-h2">Redemption rules</h2><div class="bo-hint">Limits on how the code can be used.</div></div>
            </div>
            <div class="bo-fields">
              <div>
                <span class="bo-lbl">Total redemption limit</span>
                <div class="bo-segs" role="group" aria-label="Total redemption limit">
                  <button class="bo-seg" :class="{ on: form.capMode === 'unlimited' }" :aria-pressed="form.capMode === 'unlimited'" @click="form.capMode = 'unlimited'">Unlimited</button>
                  <button class="bo-seg" :class="{ on: form.capMode === 'cap' }" :aria-pressed="form.capMode === 'cap'" @click="form.capMode = 'cap'">Total usage limit</button>
                </div>
              </div>
              <div v-if="form.capMode === 'cap'">
                <label class="bo-lbl" for="pc-cap">Total redemption cap <span class="req">*</span></label>
                <input id="pc-cap" v-model="form.cap" class="bo-in" :class="{ err: errors.cap }" type="number" min="1" step="1" placeholder="1000" />
                <div v-if="errors.cap" class="bo-err">{{ errors.cap }}</div>
                <div v-else class="bo-hint" style="margin-top: 4px">Maximum successful redemptions across all workspaces.</div>
              </div>
            </div>
            <div class="bo-banner note" style="font-size: 13px">
              <div><strong>One per workspace is always on.</strong> It is keyed by workspace, not by user or email, and only a finalized invoice counts as a use.</div>
            </div>
          </section>

          <section class="bo-card bo-pad bo-stack">
            <div class="bo-sechead">
              <div class="bo-secnum">3</div>
              <div><h2 class="bo-h2">Validity window</h2><div class="bo-hint">When the code becomes active and when it expires. All times are UTC.</div></div>
            </div>
            <div class="bo-fields">
              <div>
                <span class="bo-lbl">Start date &amp; time <span class="req">*</span></span>
                <div class="bo-rowflex" style="flex-wrap: nowrap">
                  <input v-model="form.startDate" class="bo-in" :class="{ err: errors.start }" type="date" aria-label="Start date" />
                  <input v-model="form.startTime" class="bo-in" :class="{ err: errors.start }" type="time" aria-label="Start time" style="width: 130px" />
                </div>
                <div v-if="errors.start" class="bo-err">{{ errors.start }}</div>
                <div v-else class="bo-hint" style="margin-top: 4px">A future start creates the code as Scheduled.</div>
              </div>
              <div>
                <span class="bo-lbl">End date &amp; time <span class="req">*</span></span>
                <div class="bo-rowflex" style="flex-wrap: nowrap">
                  <input v-model="form.endDate" class="bo-in" :class="{ err: errors.end }" type="date" aria-label="End date" />
                  <input v-model="form.endTime" class="bo-in" :class="{ err: errors.end }" type="time" aria-label="End time" style="width: 130px" />
                </div>
                <div v-if="errors.end" class="bo-err">{{ errors.end }}</div>
                <div v-else class="bo-hint" style="margin-top: 4px">The code expires automatically at this time.</div>
              </div>
            </div>
            <div v-if="form.target === 'RENEWAL'" class="bo-banner warn note" style="font-size: 13px">
              <div>Renewal promos are revalidated at the actual renewal charge. If the code ends before a workspace's renewal date, the customer is told it will not apply.</div>
            </div>
          </section>
        </template>

        <!-- STEP 3 -->
        <template v-if="step === 3">
          <section class="bo-card bo-pad">
            <div class="bo-between" style="margin-bottom: 8px">
              <div class="bo-sechead"><div class="bo-secnum">1</div><div><h2 class="bo-h2">Promo overview</h2><div class="bo-hint">Identity and customer-facing text.</div></div></div>
              <button class="bo-link" :disabled="syncing" @click="goTo(1)">Edit</button>
            </div>
            <div class="bo-kv"><div>Promo code</div><div class="bo-mono">{{ form.code }}</div></div>
            <div class="bo-kv"><div>Internal display name</div><div>{{ form.name }}</div></div>
            <div class="bo-kv"><div>Customer-facing label</div><div>{{ form.label }}</div></div>
            <div class="bo-kv"><div>Description</div><div style="font-weight: 400">{{ form.desc || '—' }}</div></div>
          </section>

          <section class="bo-card bo-pad">
            <div class="bo-between" style="margin-bottom: 8px">
              <div class="bo-sechead"><div class="bo-secnum">2</div><div><h2 class="bo-h2">Discount &amp; scope</h2><div class="bo-hint">What is discounted and by how much.</div></div></div>
              <button class="bo-link" :disabled="syncing" @click="goTo(1)">Edit</button>
            </div>
            <div class="bo-kv"><div>Target type</div><div>{{ TARGET_LABEL[form.target] }}</div></div>
            <div class="bo-kv"><div>Discount</div><div>{{ MODE_LABEL[form.mode] }} · {{ badge }}</div></div>
            <div class="bo-kv"><div>Currency</div><div>{{ form.currency }}</div></div>
            <div class="bo-kv">
              <div>Eligible {{ scopeNoun }}s</div>
              <div class="bo-rowflex" style="gap: 6px"><span v-for="s in form.scope" :key="s" class="bo-tag">{{ s }}</span></div>
            </div>
          </section>

          <section class="bo-card bo-pad">
            <div class="bo-between" style="margin-bottom: 8px">
              <div class="bo-sechead"><div class="bo-secnum">3</div><div><h2 class="bo-h2">Validity &amp; redemption rules</h2><div class="bo-hint">When and how often the code can be used.</div></div></div>
              <button class="bo-link" :disabled="syncing" @click="goTo(2)">Edit</button>
            </div>
            <div class="bo-kv"><div>Starts</div><div>{{ fmtDateTime(startAt) }}</div></div>
            <div class="bo-kv"><div>Ends</div><div>{{ fmtDateTime(endAt) }}</div></div>
            <div class="bo-kv"><div>Per workspace</div><div>One successful use</div></div>
            <div class="bo-kv"><div>Total cap</div><div>{{ form.capMode === 'cap' ? Number(form.cap).toLocaleString('en-US') + ' redemptions' : 'Unlimited' }}</div></div>
            <div class="bo-kv"><div>Status after creation</div><div><span class="bo-pill" :class="scheduled ? 'info' : 'ok'">{{ scheduled ? 'Scheduled' : 'Active' }}</span></div></div>
          </section>

          <section class="bo-card bo-pad bo-stack">
            <div class="bo-sechead"><div class="bo-secnum">4</div><div><h2 class="bo-h2">Pre-flight checks</h2><div class="bo-hint">Re-run on the server when you create the code.</div></div></div>
            <div class="bo-fields" style="gap: 10px">
              <div v-for="c in checks" :key="c.title" class="bo-check" :class="{ fail: !c.ok }">
                <span class="bo-check-mark">{{ c.ok ? '✓' : '!' }}</span>
                <div><div style="font-weight: 600">{{ c.title }}</div><div class="bo-hint">{{ c.sub }}</div></div>
              </div>
            </div>
          </section>
        </template>
      </div>

      <!-- SUMMARY -->
      <aside class="side">
        <div v-if="step === 3" class="bo-banner note" style="font-size: 13px">
          <div>This discount only applies to subscription charges. It does not affect CRM activation, IDX access or MLS requirements.</div>
        </div>

        <section class="bo-card bo-pad bo-stack">
          <div class="bo-between" style="align-items: center">
            <h2 class="bo-h2">Promo code summary</h2>
            <span class="bo-pill">Draft</span>
          </div>
          <div class="bo-promo-badge">
            <svg class="bo-ic" viewBox="0 0 24 24" aria-hidden="true" style="width: 28px; height: 28px; color: var(--bo-good)"><path d="M3 12V4h8l10 10-8 8zM8 8h.01" /></svg>
            <div style="min-width: 0">
              <div class="bo-mono" style="font-size: 17px">{{ form.code || 'Code not set' }}</div>
              <div class="bo-hint">{{ form.label || 'Customer label not set' }}</div>
            </div>
            <span class="off">{{ badge }}</span>
          </div>

          <div>
            <div class="bo-between" style="align-items: center"><strong>Discount details</strong><button v-if="step !== 1" class="bo-link" :disabled="syncing" @click="goTo(1)">Edit</button></div>
            <div class="bo-kv"><div>Internal name</div><div>{{ form.name || '—' }}</div></div>
            <div class="bo-kv"><div>Target type</div><div>{{ TARGET_LABEL[form.target] }}</div></div>
            <div class="bo-kv"><div>Discount mode</div><div>{{ MODE_LABEL[form.mode] }}</div></div>
            <div class="bo-kv"><div>Discount value</div><div>{{ badge }}</div></div>
          </div>

          <div>
            <div class="bo-between" style="align-items: center"><strong>Scope &amp; validity</strong><button v-if="step !== 2" class="bo-link" :disabled="syncing" @click="goTo(2)">Edit</button></div>
            <div class="bo-kv">
              <div>Eligible {{ scopeNoun }}s</div>
              <div v-if="form.scope.length" class="bo-rowflex" style="gap: 6px"><span v-for="s in form.scope" :key="s" class="bo-tag">{{ s }}</span></div>
              <div v-else>Not selected</div>
            </div>
            <div class="bo-kv"><div>Per workspace</div><div>One use</div></div>
            <div class="bo-kv"><div>Total cap</div><div>{{ form.capMode === 'cap' && form.cap ? form.cap : 'Unlimited' }}</div></div>
            <div class="bo-kv"><div>Starts</div><div>{{ startAt ? fmtDateTime(startAt) : '—' }}</div></div>
            <div class="bo-kv"><div>Ends</div><div>{{ endAt ? fmtDateTime(endAt) : '—' }}</div></div>
          </div>

          <div>
            <strong>Example billing preview</strong>
            <div class="bo-kv"><div>{{ preview.item.id }} (monthly)</div><div class="bo-num">{{ usd(preview.item.price) }}</div></div>
            <div class="bo-kv"><div>Discount</div><div class="bo-num" style="color: var(--bo-good)">−{{ usd(preview.discount) }}</div></div>
            <div class="bo-total"><span>Total (USD)</span><span>{{ usd(preview.final) }}</span></div>
          </div>
        </section>

        <section class="bo-card bo-pad">
          <strong>Stripe sync</strong>
          <div class="bo-hint" style="margin: 4px 0 10px">The coupon and promotion code are created in Stripe when you finish step 3. The code is not redeemable until that sync succeeds.</div>
          <strong>What happens next</strong>
          <ol style="margin: 6px 0 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; font-size: 13px">
            <li>The promo code is created in ListaCRM and Stripe.</li>
            <li>Creation is recorded in the audit log.</li>
            <li>Customers can redeem it inside the validity window.</li>
          </ol>
        </section>
      </aside>
    </div>
  </div>
</template>
