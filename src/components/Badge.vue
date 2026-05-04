<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: [String, Number]
})

const badgeClass = computed(() => {
  const v = String(props.value)
  if (["Active","Paid","Healthy","Success","Verified","Approved","Low","Completed","First Value"].includes(v)) return "green"
  if (["Open","Pending","Needs Attention","Medium","Enterprise","Brokerage"].includes(v)) return "orange"
  if (["At Risk","Failed","Overdue","Suspended","Payment Failed","Critical","High"].includes(v)) return "red"
  if (["Growth","Starter","Info"].includes(v)) return "blue"
  if (["Contract Required","Not Purchased"].includes(v)) return "purple"
  return "gray"
})
</script>

<template>
  <span class="badge" :class="badgeClass">{{ value }}</span>
</template>
