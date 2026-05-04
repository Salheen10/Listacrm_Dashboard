<script setup>
import { ref } from 'vue'
import Badge from './Badge.vue'

defineProps({
  columns: Array,
  rows: Array
})

const money = (n) => typeof n === 'number' ? "$" + n.toLocaleString() : n

const isMenuOpen = ref(null)

const toggleMenu = (index) => {
  isMenuOpen.value = isMenuOpen.value === index ? null : index
}
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
        <tr v-for="(row, i) in rows" :key="i">
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
  </div>
</template>
