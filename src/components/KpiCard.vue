<script setup>
defineProps({
  title: String,
  value: [String, Number],
  trend: String,
  icon: String,
  trendType: {
    type: String,
    default: 'up'
  }
})
</script>

<template>
  <div class="kpi-card">
    <div class="kpi-icon">{{ icon }}</div>
    <div>
      <div class="kpi-title">{{ title }}</div>
      <div class="kpi-value">{{ value }}</div>
      <div class="kpi-trend">
        <span :class="trendType === 'down' ? 'trend-down' : 'trend-up'">{{ trend }}</span> vs previous period
      </div>
    </div>
  </div>
</template>
