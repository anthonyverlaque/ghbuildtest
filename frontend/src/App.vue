<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="header-inner">
        <div class="logo">
          <span class="logo-mark">◈</span>
          <span class="logo-text">taskflow</span>
        </div>
        <div class="header-meta">
          <span class="api-status" :class="apiStatus" :title="`API: ${apiStatus}`">
            <span class="status-dot"></span>
            {{ apiStatus === 'online' ? 'api online' : apiStatus === 'offline' ? 'api offline' : 'checking...' }}
          </span>
          <button class="btn-new" @click="showModal = true" data-testid="new-task-btn">
            + new task
          </button>
        </div>
      </div>
    </header>

    <!-- Filters / Stats Bar -->
    <div class="stats-bar" data-testid="stats-bar">
      <div class="stats-bar-inner">
        <div class="stats">
          <span class="stat" data-testid="total-count">
            <strong>{{ tasks.length }}</strong> total
          </span>
          <span class="stat-sep">·</span>
          <span class="stat" data-testid="pending-count">
            <strong>{{ pending }}</strong> pending
          </span>
          <span class="stat-sep">·</span>
          <span class="stat">
            <strong>{{ done }}</strong> done
          </span>
        </div>
        <div class="filters">
          <button
            v-for="f in filters"
            :key="f.value"
            class="filter-btn"
            :class="{ active: activeFilter === f.value }"
            @click="activeFilter = f.value"
            :data-testid="`filter-${f.value}`"
          >
            {{ f.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main">
      <!-- Loading -->
      <div class="loading-state" v-if="loading">
        <div class="spinner"></div>
        <p>loading tasks...</p>
      </div>

      <!-- Error -->
      <div class="error-state" v-else-if="fetchError">
        <p>⚠ {{ fetchError }}</p>
        <button @click="fetchTasks">retry</button>
      </div>

      <!-- Empty -->
      <div class="empty-state" v-else-if="filteredTasks.length === 0" data-testid="empty-state">
        <p class="empty-icon">◎</p>
        <p>no tasks {{ activeFilter !== 'all' ? `with status "${activeFilter}"` : '' }}</p>
        <button class="btn-new-inline" @click="showModal = true" v-if="activeFilter === 'all'">
          create your first task →
        </button>
      </div>

      <!-- Grid -->
      <div class="task-grid" v-else data-testid="task-grid">
        <TaskCard
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          @toggle="toggleTask"
          @delete="deleteTask"
        />
      </div>
    </main>

    <!-- Modal -->
    <CreateTaskModal
      v-if="showModal"
      @close="showModal = false"
      @created="handleCreate"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { taskService } from './services/taskService'
import TaskCard from './components/TaskCard.vue'
import CreateTaskModal from './components/CreateTaskModal.vue'

const tasks = ref([])
const loading = ref(false)
const fetchError = ref('')
const showModal = ref(false)
const activeFilter = ref('all')
const apiStatus = ref('checking')

const filters = [
  { value: 'all', label: 'all' },
  { value: 'pending', label: 'pending' },
  { value: 'done', label: 'done' },
]

const filteredTasks = computed(() => {
  if (activeFilter.value === 'pending') return tasks.value.filter(t => !t.isCompleted)
  if (activeFilter.value === 'done') return tasks.value.filter(t => t.isCompleted)
  return tasks.value
})

const pending = computed(() => tasks.value.filter(t => !t.isCompleted).length)
const done = computed(() => tasks.value.filter(t => t.isCompleted).length)

async function fetchTasks() {
  loading.value = true
  fetchError.value = ''
  try {
    tasks.value = await taskService.getAll()
    apiStatus.value = 'online'
  } catch {
    fetchError.value = 'Could not reach the API. Is the backend running?'
    apiStatus.value = 'offline'
  } finally {
    loading.value = false
  }
}

async function handleCreate(data) {
  try {
    const task = await taskService.create(data)
    tasks.value.unshift(task)
    showModal.value = false
  } catch {
    fetchError.value = 'Failed to create task.'
  }
}

async function toggleTask(task) {
  try {
    const updated = await taskService.update(task.id, { isCompleted: !task.isCompleted })
    const idx = tasks.value.findIndex(t => t.id === task.id)
    if (idx !== -1) tasks.value[idx] = updated
  } catch {
    fetchError.value = 'Failed to update task.'
  }
}

async function deleteTask(id) {
  try {
    await taskService.delete(id)
    tasks.value = tasks.value.filter(t => t.id !== id)
  } catch {
    fetchError.value = 'Failed to delete task.'
  }
}

onMounted(fetchTasks)
</script>

<style scoped>
.app { min-height: 100vh; display: flex; flex-direction: column; }

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(12, 12, 15, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo { display: flex; align-items: center; gap: 10px; }

.logo-mark {
  font-size: 22px;
  color: var(--accent);
  line-height: 1;
}

.logo-text {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 20px;
  letter-spacing: -0.04em;
  color: var(--text);
}

.header-meta { display: flex; align-items: center; gap: 14px; }

.api-status {
  font-size: 11px;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text-muted);
}

.api-status.online .status-dot { background: var(--green); box-shadow: 0 0 6px var(--green); }
.api-status.offline .status-dot { background: var(--red); }

.btn-new {
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: var(--radius);
  padding: 8px 16px;
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.btn-new:hover { background: #d4eb3a; transform: scale(1.02); }

/* Stats Bar */
.stats-bar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.stats-bar-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.stats { display: flex; align-items: center; gap: 8px; }

.stat {
  font-size: 12px;
  color: var(--text-muted);
}

.stat strong { color: var(--text); }

.stat-sep { color: var(--border); }

.filters { display: flex; gap: 6px; }

.filter-btn {
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-btn:hover { border-color: var(--text-muted); color: var(--text); }
.filter-btn.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }

/* Main */
.main {
  flex: 1;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 24px;
}

/* Task Grid */
.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

/* States */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 80px 24px;
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-icon { font-size: 40px; color: var(--border); }

.btn-new-inline {
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-muted);
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-new-inline:hover { border-color: var(--accent); color: var(--accent); }

.error-state p { color: var(--red); }
.error-state button {
  background: none;
  border: 1px solid var(--red);
  border-radius: var(--radius);
  color: var(--red);
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  padding: 6px 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.error-state button:hover { background: var(--red-dim); }
</style>
