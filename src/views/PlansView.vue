<script setup>
import { useAppStore } from '../store'
import Badge from '../components/Badge.vue'
import KpiCard from '../components/KpiCard.vue'

const store = useAppStore()
</script>

<template>
  <div class="plans">
    <section class="kpi-grid">
      <KpiCard title="Most Selling Plan" value="Growth" trend="+18.7%" icon="◇" />
      <KpiCard title="Highest Revenue Plan" value="Enterprise" trend="+11.1%" icon="$" />
      <KpiCard title="Upgrade Rate" value="14.2%" trend="+2.6%" icon="↥" />
      <KpiCard title="Downgrade Rate" value="3.8%" trend="-0.8%" icon="↧" trendType="down" />
    </section>
    <section class="content-grid">
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Plan Performance Matrix</div><div class="panel-subtitle">Compare revenue, activation, churn, and add-on attach by plan.</div></div></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Plan</th><th>Accounts</th><th>MRR</th><th>Activation</th><th>Churn</th><th>Add-on Attach</th><th>Signal</th></tr></thead>
            <tbody>
              <tr v-for="row in store.planMatrix" :key="row.plan">
                <td><Badge :value="row.plan" /></td>
                <td>{{ row.accounts }}</td>
                <td>{{ row.mrr }}</td>
                <td>{{ row.activation }}</td>
                <td>{{ row.addons }}</td>
                <td><Badge :value="row.signal" /></td>
              </tr>
              <tr v-if="store.planMatrix.length === 0">
                <td colspan="7">No workspaces match the selected filters.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Upgrade Opportunities</div><div class="panel-subtitle">Accounts close to usage limits or high add-on intent.</div></div></div>
        <div class="panel-body">
          <div class="cards-list">
            <div class="queue-card"><div class="queue-top"><div class="queue-title">Green Valley Homes</div><Badge value="Growth" /></div><div class="queue-meta">9/10 seats used · 82% product adoption.</div><button class="small-btn green">Recommend Brokerage</button></div>
            <div class="queue-card"><div class="queue-top"><div class="queue-title">Elite Home Team</div><Badge value="Growth" /></div><div class="queue-meta">High lead volume, no campaigns active.</div><button class="small-btn green">Recommend Marketing Pro</button></div>
            <div class="queue-card"><div class="queue-top"><div class="queue-title">Sunset Agents</div><Badge value="Starter" /></div><div class="queue-meta">High listings, no IDX add-on.</div><button class="small-btn green">Recommend IDX Website</button></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
