# Editable Tables

## Purpose

Create reusable editable table components that allow users to view, edit, and manage tabular data with inline editing capabilities.

## Dependencies

- Nuxt 4 project
- Understanding of Vue 3 composition API
- Form validation (see [Forms & Validation](forms-validation.md))

## Step-by-Step Setup

### Step 1: Create Base Table Component

Create `components/tables/EditableTable.vue`:

```vue
<template>
  <div class="editable-table-container">
    <table class="editable-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.label }}
          </th>
          <th v-if="editable">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIndex) in rows"
          :key="row.id || rowIndex"
          :class="{ 'editing': editingRowId === row.id }"
        >
          <td v-for="column in columns" :key="column.key">
            <template v-if="editingRowId === row.id && editable">
              <input
                v-if="column.type !== 'select'"
                :type="column.type || 'text'"
                :value="editedRow[column.key]"
                @input="handleCellEdit(column.key, $event)"
                class="table-input"
              />
              <select
                v-else
                :value="editedRow[column.key]"
                @change="handleCellEdit(column.key, $event)"
                class="table-select"
              >
                <option
                  v-for="option in column.options"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </template>
            <template v-else>
              {{ formatCellValue(row[column.key], column) }}
            </template>
          </td>
          <td v-if="editable" class="actions">
            <template v-if="editingRowId === row.id">
              <button
                @click="handleSave(row.id)"
                class="btn-save"
                :disabled="saving"
              >
                Save
              </button>
              <button
                @click="handleCancel"
                class="btn-cancel"
              >
                Cancel
              </button>
            </template>
            <template v-else>
              <button
                @click="handleEdit(row)"
                class="btn-edit"
              >
                Edit
              </button>
              <button
                v-if="deletable"
                @click="handleDelete(row.id)"
                class="btn-delete"
              >
                Delete
              </button>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-if="rows.length === 0" class="empty-state">
      No data available
    </div>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  label: string
  type?: 'text' | 'number' | 'email' | 'date' | 'select'
  options?: { value: string; label: string }[]
  formatter?: (value: any) => string
}

interface Props {
  columns: Column[]
  rows: Record<string, any>[]
  editable?: boolean
  deletable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: true,
  deletable: true,
})

const emit = defineEmits<{
  (e: 'save', row: Record<string, any>): void
  (e: 'delete', id: string | number): void
}>()

const editingRowId = ref<string | number | null>(null)
const editedRow = ref<Record<string, any>>({})
const saving = ref(false)

const handleEdit = (row: Record<string, any>) => {
  editingRowId.value = row.id
  editedRow.value = { ...row }
}

const handleCellEdit = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLSelectElement
  editedRow.value[key] = target.value
}

const handleSave = async (id: string | number) => {
  saving.value = true
  try {
    await emit('save', { id, ...editedRow.value })
    editingRowId.value = null
    editedRow.value = {}
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  editingRowId.value = null
  editedRow.value = {}
}

const handleDelete = (id: string | number) => {
  if (confirm('Are you sure you want to delete this item?')) {
    emit('delete', id)
  }
}

const formatCellValue = (value: any, column: Column) => {
  if (column.formatter) {
    return column.formatter(value)
  }
  if (value === null || value === undefined) {
    return '-'
  }
  return value
}
</script>

<style scoped>
.editable-table-container {
  overflow-x: auto;
}

.editable-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.editable-table th,
.editable-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.editable-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  position: sticky;
  top: 0;
}

.editable-table tr:hover:not(.editing) {
  background-color: #f8f9fa;
}

.editable-table tr.editing {
  background-color: #e7f3ff;
}

.table-input,
.table-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.actions {
  white-space: nowrap;
}

.actions button {
  margin-right: 0.5rem;
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-edit {
  background-color: #007bff;
  color: white;
}

.btn-edit:hover {
  background-color: #0056b3;
}

.btn-save {
  background-color: #28a745;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background-color: #218838;
}

.btn-save:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background-color: #5a6268;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-delete:hover {
  background-color: #c82333;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #666;
}
</style>
```

### Step 2: Create Table with Server Sync

Create `components/tables/SyncTable.vue`:

```vue
<template>
  <div>
    <EditableTable
      :columns="columns"
      :rows="data"
      :editable="editable"
      :deletable="deletable"
      @save="handleSave"
      @delete="handleDelete"
    />
    
    <div v-if="loading" class="loading">
      Loading...
    </div>
    
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  columns: any[]
  apiEndpoint: string
  editable?: boolean
  deletable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: true,
  deletable: true,
})

const data = ref([])
const loading = ref(false)
const error = ref('')

const fetchData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch(props.apiEndpoint, {
      credentials: 'include',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    
    const result = await response.json()
    data.value = result
  } catch (err: any) {
    error.value = err.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}

const handleSave = async (row: any) => {
  try {
    const response = await fetch(`${props.apiEndpoint}/${row.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(row),
    })
    
    if (!response.ok) {
      throw new Error('Failed to save')
    }
    
    // Refresh data
    await fetchData()
  } catch (err: any) {
    error.value = err.message || 'Failed to save'
  }
}

const handleDelete = async (id: string | number) => {
  try {
    const response = await fetch(`${props.apiEndpoint}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete')
    }
    
    // Refresh data
    await fetchData()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete'
  }
}

onMounted(() => {
  fetchData()
})
</script>
```

### Step 3: Example Usage

Use in a page:

```vue
<template>
  <div>
    <h1>Centros Management</h1>
    
    <SyncTable
      :columns="columns"
      api-endpoint="/api/centros"
      :editable="true"
      :deletable="true"
    />
  </div>
</template>

<script setup lang="ts">
const columns = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
  },
  {
    key: 'createdAt',
    label: 'Created',
    formatter: (value: string) => new Date(value).toLocaleDateString(),
  },
]
</script>
```

## Configuration

### Column Configuration

Column options:
- `key`: Property key in row data
- `label`: Column header
- `type`: Input type (`text`, `number`, `email`, `date`, `select`)
- `options`: Options for select type
- `formatter`: Function to format cell value

### Table Features

- Inline editing
- Server-side sync
- Delete confirmation
- Loading states
- Error handling

## Key Files

- `components/tables/EditableTable.vue` - Base editable table
- `components/tables/SyncTable.vue` - Table with server sync

## Notes & Gotchas

- **Row IDs**: Each row must have a unique `id` property
- **Validation**: Add validation for edited values
- **Optimistic Updates**: Consider optimistic UI updates for better UX
- **Pagination**: Add pagination for large datasets
- **Sorting**: Add column sorting if needed

## Next Steps

- [Charting](charting.md) - Add data visualization
