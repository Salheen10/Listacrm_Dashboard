<script setup>
import { useAppStore } from '../store'
import KpiCard from '../components/KpiCard.vue'

const store = useAppStore()
</script>

<template>
  <div class="addons">
    <section class="kpi-grid">
      <KpiCard title="Add-on Revenue" value="$96.8K" trend="+16.1%" icon="✦" />
      <KpiCard title="Attach Rate" value="41%" trend="+5.4%" icon="%" />
      <KpiCard title="IDX Active" value="151" trend="+9.8%" icon="IDX" />
      <KpiCard title="Purchased Not Activated" value="72" trend="+7.0%" icon="!" trendType="down" />
    </section>
    <section class="content-grid">
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Add-on Funnel</div><div class="panel-subtitle">Viewed → setup started → paid → activated → renewed.</div></div></div>
        <div class="panel-body">
           <div class="bar-chart">
            <div class="bar-row" v-for="addon in store.addonFunnel" :key="addon.name">
              <div class="bar-name">{{ addon.name }}</div>
              <div class="bar-track"><div class="bar-fill" :class="addon.color" :style="{ width: addon.value + '%' }"></div></div>
              <div class="bar-value">{{ addon.value }}%</div>
            </div>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Add-on Propensity Score</div><div class="panel-subtitle">Suggested upsell based on usage behavior.</div></div></div>
        <div class="panel-body">
          <div class="insight-list">
            <div class="insight"><strong>IDX Opportunity</strong><p>64 workspaces have active listings but no IDX website. Recommend IDX add-on.</p></div>
            <div class="insight"><strong>Marketing Automation Opportunity</strong><p>88 workspaces have high lead volume and low follow-up consistency.</p></div>
            <div class="insight"><strong>Social Suite Opportunity</strong><p>32 teams show campaign activity but no social ads integration.</p></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
