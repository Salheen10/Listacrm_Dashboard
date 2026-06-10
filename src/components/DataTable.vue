<script setup>
import { ref, computed, watch } from 'vue'
import Badge from './Badge.vue'

const props = defineProps({
  columns: Array,
  rows: Array,
  perPage: {
    type: Number,
    default: 8
  }
})

const money = (n) => typeof n === 'number' ? "$" + n.toLocaleString() : n

const isMenuOpen = ref(null)
const currentPage = ref(1)

const toggleMenu = (index) => {
  isMenuOpen.value = isMenuOpen.value === index ? null : index
}

const totalPages = computed(() => Math.ceil(props.rows.length / props.perPage))

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * props.perPage
  const end = start + props.perPage
  return props.rows.slice(start, end)
})

const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }

watch(() => props.rows, () => {
  currentPage.value = 1
})
</script>



<template>
  <div class="table-wrap">
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key || col">{{ col.label || col }}</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in paginatedRows" :key="i">
          <td v-for="col in columns" :key="col.key">
            <template v-if="col.type === 'workspace'">
              <strong>{{ row[col.key] }}</strong><br><span class="queue-meta">{{ row.owner }}</span>
            </template>
            <template v-else-if="col.type === 'badge'">
              <Badge :value="row[col.key]" />
            </template>
            <template v-else-if="col.type === 'money'">
              {{ money(row[col.key]) }}
            </template>
            <template v-else-if="col.type === 'health'">
              <strong>{{ row[col.key] }}</strong>/100
            </template>
            <template v-else>
              <strong v-if="col.strong">{{ row[col.key] }}</strong>
              <span v-else>{{ row[col.key] }}</span>
            </template>
          </td>
          <td>
            <div class="action-menu">
              <button class="kebab" @click="toggleMenu(i)">⋮</button>
              <div class="dropdown" v-show="isMenuOpen === i" style="display: block;">
                <button @click="isMenuOpen = null">View</button>
                <button @click="isMenuOpen = null">Assign Owner</button>
                <button @click="isMenuOpen = null">Send Reminder</button>
                <button class="danger" @click="isMenuOpen = null">Mark Risk</button>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div class="pagination" v-if="totalPages > 1">
      <div class="pagination-info">Showing {{ (currentPage - 1) * perPage + 1 }} to {{ Math.min(currentPage * perPage, rows.length) }} of {{ rows.length }} entries</div>
      <div class="pagination-controls">
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <span class="page-num">Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  font-size: 13px;
  color: #6b7280;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pagination-controls button {
  background: white;
  border: 1px solid #d1d5db;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
}
.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-num {
  font-weight: 500;
  color: #111827;
}
</style>
