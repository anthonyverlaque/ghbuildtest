<template>
  <div class="task-card" :class="{ completed: task.isCompleted, [`priority-${task.priority.toLowerCase()}`]: true }" :data-testid="`task-card-${task.id}`">
    <div class="card-header">
      <span class="priority-badge" :class="`badge-${task.priority.toLowerCase()}`">
        {{ task.priority }}
      </span>
      <div class="card-actions">
        <button class="btn-icon" :class="{ active: task.isCompleted }" @click="$emit('toggle', task)" :title="task.isCompleted ? 'Mark incomplete' : 'Mark complete'" :data-testid="`toggle-${task.id}`">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>
        <button class="btn-icon btn-delete" @click="$emit('delete', task.id)" title="Delete task" :data-testid="`delete-${task.id}`">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </div>

    <h3 class="task-title" :class="{ done: task.isCompleted }">{{ task.title }}</h3>
    <p class="task-desc" v-if="task.description">{{ task.description }}</p>

    <div class="card-footer">
      <span class="task-date">{{ formatDate(task.createdAt) }}</span>
      <span class="status-chip" :class="task.isCompleted ? 'status-done' : 'status-pending'">
        {{ task.isCompleted ? 'done' : 'pending' }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({ task: Object })
defineEmits(['toggle', 'delete'])

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.task-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.task-card:hover {
  border-color: rgba(232, 255, 71, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}

.task-card.completed {
  opacity: 0.6;
  border-color: var(--border);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.priority-badge {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
}

.badge-high { background: var(--red-dim); color: var(--red); }
.badge-medium { background: var(--amber-dim); color: var(--amber); }
.badge-low { background: var(--green-dim); color: var(--green); }

.card-actions { display: flex; gap: 6px; }

.btn-icon {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.15s;
}

.btn-icon:hover { border-color: var(--accent); color: var(--accent); }
.btn-icon.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }
.btn-icon.btn-delete:hover { border-color: var(--red); color: var(--red); }

.task-title {
  font-family: 'Syne', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.4;
  transition: color 0.2s;
}

.task-title.done {
  text-decoration: line-through;
  color: var(--text-muted);
}

.task-desc {
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.5;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.task-date { font-size: 11px; color: var(--text-muted); }

.status-chip {
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 4px;
}

.status-done { background: var(--green-dim); color: var(--green); }
.status-pending { background: var(--surface-2); color: var(--text-muted); }
</style>
