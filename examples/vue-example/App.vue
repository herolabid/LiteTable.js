<template>
  <div class="app">
    <h1>🚀 LiteTable.js - Vue Example</h1>
    <p class="subtitle">
      Lightweight, performant, framework-agnostic table library
    </p>

    <div class="controls">
      <!-- Search -->
      <div class="search-box">
        <input
          v-model="searchValue"
          type="search"
          placeholder="Search users..."
          class="search-input"
          @input="debouncedSearch(searchValue)"
        />
      </div>

      <!-- Column toggles -->
      <div class="column-toggles">
        <span>Columns: </span>
        <label
          v-for="col in columns"
          :key="col.id"
          class="checkbox-label"
        >
          <input
            type="checkbox"
            :checked="!table.hiddenColumns.value.has(col.id)"
            @change="table.toggleColumn(col.id)"
          />
          {{ col.header }}
        </label>
      </div>

      <!-- Reset -->
      <button @click="table.reset" class="btn-reset">
        Reset
      </button>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="lite-table">
        <thead>
          <tr>
            <th
              v-for="column in table.visibleColumns.value"
              :key="column.id"
              :style="{
                width: column.width,
                textAlign: column.align || 'left',
              }"
              :class="{ sortable: column.sortable }"
              @click="column.sortable && table.sortBy(column.id)"
            >
              {{ column.header }}
              <span v-if="column.sortable" class="sort-icon">
                {{ getSortIcon(column.id) }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="table.rows.value.length === 0">
            <td :colspan="table.visibleColumns.value.length" class="no-data">
              No users found
            </td>
          </tr>
          <tr v-else v-for="row in table.rows.value" :key="row.id">
            <td
              v-for="column in table.visibleColumns.value"
              :key="column.id"
              :style="{ textAlign: column.align || 'left' }"
            >
              <template v-if="column.id === 'status'">
                <span :class="`status-badge status-${row[column.id]}`">
                  {{ row[column.id] }}
                </span>
              </template>
              <template v-else-if="column.id === 'joinedAt'">
                {{ formatDate(row.joinedAt) }}
              </template>
              <template v-else>
                {{ row[column.id] }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="table.paginationState.value" class="pagination">
      <div class="pagination-info">
        Showing {{ table.paginationState.value.startIndex + 1 }} to
        {{ table.paginationState.value.endIndex }} of
        {{ table.paginationState.value.totalRows }} users
      </div>

      <div class="pagination-controls">
        <button
          @click="table.prevPage"
          :disabled="!table.paginationState.value.hasPrevPage"
          class="btn-page"
        >
          Previous
        </button>

        <span class="page-indicator">
          Page {{ table.paginationState.value.page }} of
          {{ table.paginationState.value.totalPages }}
        </span>

        <button
          @click="table.nextPage"
          :disabled="!table.paginationState.value.hasNextPage"
          class="btn-page"
        >
          Next
        </button>
      </div>

      <div class="page-size">
        <label>
          Rows per page:
          <select
            :value="table.paginationState.value.pageSize"
            @change="
              table.setPageSize(Number(($event.target as HTMLSelectElement).value))
            "
            class="select-page-size"
          >
            <option
              v-for="size in table.paginationState.value.pageSizeOptions"
              :key="size"
              :value="size"
            >
              {{ size }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats">
      <div class="stat-item">
        <strong>Sort:</strong>
        {{
          table.sortState.value.columnId
            ? `${table.sortState.value.columnId} (${table.sortState.value.direction})`
            : 'None'
        }}
      </div>
      <div class="stat-item">
        <strong>Search:</strong> {{ table.searchTerm.value || 'None' }}
      </div>
      <div class="stat-item">
        <strong>Filtered rows:</strong> {{ table.allRows.value.length }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLiteTable, useDebouncedSearch } from '@litetable/vue'
import type { Column } from '@litetable/vue'
import './App.css'

// Sample data type
interface User {
  id: number
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  joinedAt: Date
}

// Sample data
const sampleUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'active',
    joinedAt: new Date('2024-01-15'),
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'active',
    joinedAt: new Date('2024-02-20'),
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'User',
    status: 'inactive',
    joinedAt: new Date('2024-03-10'),
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice@example.com',
    role: 'Editor',
    status: 'active',
    joinedAt: new Date('2024-01-05'),
  },
  {
    id: 5,
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'User',
    status: 'active',
    joinedAt: new Date('2024-04-12'),
  },
]

const data = ref<User[]>(sampleUsers)

// Define columns
const columns: Column<User>[] = [
  {
    id: 'id',
    header: 'ID',
    sortable: true,
    width: '60px',
    align: 'center',
  },
  {
    id: 'name',
    header: 'Name',
    sortable: true,
    filterable: true,
  },
  {
    id: 'email',
    header: 'Email',
    sortable: true,
    filterable: true,
  },
  {
    id: 'role',
    header: 'Role',
    sortable: true,
    filterable: true,
  },
  {
    id: 'status',
    header: 'Status',
    sortable: true,
  },
  {
    id: 'joinedAt',
    header: 'Joined',
    sortable: true,
  },
]

// Initialize table with pagination
const table = useLiteTable<User>({
  data: data.value,
  columns,
  pagination: {
    page: 1,
    pageSize: 3,
    pageSizeOptions: [3, 5, 10],
  },
  searchable: true,
})

// Debounced search
const [searchValue, debouncedSearch] = useDebouncedSearch(table.search, 300)

// Helper functions
const getSortIcon = (columnId: string): string => {
  if (table.sortState.value.columnId !== columnId) return '⇅'
  return table.sortState.value.direction === 'asc' ? '↑' : '↓'
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString()
}
</script>

<style scoped>
@import './App.css';
</style>
