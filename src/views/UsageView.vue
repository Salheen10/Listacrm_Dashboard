<script setup>
import KpiCard from '../components/KpiCard.vue'
</script>

<template>
  <div class="usage">
    <section class="kpi-grid">
      <KpiCard title="DAU" value="3,842" trend="+8.3%" icon="▤" />
      <KpiCard title="WAU" value="9,705" trend="+10.9%" icon="▤" />
      <KpiCard title="MAU" value="18,440" trend="+12.6%" icon="▤" />
      <KpiCard title="DAU/MAU Stickiness" value="20.8%" trend="+1.9%" icon="%" />
    </section>
    <section class="content-grid">
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Module Adoption</div><div class="panel-subtitle">Which core modules create product stickiness and retention.</div></div></div>
        <div class="panel-body">
           <div class="bar-chart">
            <div class="bar-row"><div class="bar-name">Leads</div><div class="bar-track"><div class="bar-fill green" style="width:86%"></div></div><div class="bar-value">86%</div></div>
            <div class="bar-row"><div class="bar-name">Tasks</div><div class="bar-track"><div class="bar-fill green" style="width:79%"></div></div><div class="bar-value">79%</div></div>
            <div class="bar-row"><div class="bar-name">Deals</div><div class="bar-track"><div class="bar-fill blue" style="width:62%"></div></div><div class="bar-value">62%</div></div>
            <div class="bar-row"><div class="bar-name">Listings</div><div class="bar-track"><div class="bar-fill orange" style="width:58%"></div></div><div class="bar-value">58%</div></div>
            <div class="bar-row"><div class="bar-name">Reports</div><div class="bar-track"><div class="bar-fill purple" style="width:34%"></div></div><div class="bar-value">34%</div></div>
            <div class="bar-row"><div class="bar-name">Microsite</div><div class="bar-track"><div class="bar-fill red" style="width:21%"></div></div><div class="bar-value">21%</div></div>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">First Value Distribution</div><div class="panel-subtitle">First record type created after CRM workspace activation.</div></div></div>
        <div class="panel-body">
           <div class="bar-chart">
            <div class="bar-row"><div class="bar-name">Lead</div><div class="bar-track"><div class="bar-fill green" style="width:48%"></div></div><div class="bar-value">48%</div></div>
            <div class="bar-row"><div class="bar-name">Task</div><div class="bar-track"><div class="bar-fill blue" style="width:24%"></div></div><div class="bar-value">24%</div></div>
            <div class="bar-row"><div class="bar-name">Listing</div><div class="bar-track"><div class="bar-fill orange" style="width:18%"></div></div><div class="bar-value">18%</div></div>
            <div class="bar-row"><div class="bar-name">Deal</div><div class="bar-track"><div class="bar-fill purple" style="width:10%"></div></div><div class="bar-value">10%</div></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
