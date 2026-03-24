<template>
  <Teleport to="body">
    <div class="overlay" @click.self="$emit('close')" data-testid="modal-overlay">
      <div class="modal" data-testid="create-task-modal">
        <div class="modal-header">
          <h2>new task</h2>
          <button class="btn-close" @click="$emit('close')">✕</button>
        </div>

        <div class="modal-body">
          <div class="field">
            <label>title <span class="required">*</span></label>
            <input
              v-model="form.title"
              placeholder="What needs to be done?"
              @keyup.enter="submit"
              data-testid="task-title-input"
              autofocus
            />
          </div>

          <div class="field">
            <label>description</label>
            <textarea
              v-model="form.description"
              placeholder="Add some context..."
              rows="3"
              data-testid="task-description-input"
            />
          </div>

          <div class="field">
            <label>priority</label>
            <div class="priority-options">
              <button
                v-for="p in priorities"
                :key="p.value"
                class="priority-opt"
                :class="[`opt-${p.value.toLowerCase()}`, { selected: form.priority === p.value }]"
                @click="form.priority = p.value"
                :data-testid="`priority-${p.value.toLowerCase()}`"
              >
                {{ p.label }}
              </button>
            </div>
          </div>

          <p class="error" v-if="error">{{ error }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="$emit('close')">cancel</button>
          <button class="btn-submit" @click="submit" :disabled="loading" data-testid="submit-task-btn">
            <span v-if="!loading">create task</span>
            <span v-else>creating...</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close', 'created'])

const priorities = [
  { value: 'Low', label: 'low' },
  { value: 'Medium', label: 'medium' },
  { value: 'High', label: 'high' },
]

const form = ref({ title: '', description: '', priority: 'Medium' })
const error = ref('')
const loading = ref(false)

async function submit() {
  if (!form.value.title.trim()) {
    error.value = 'Title is required'
    return
  }
  error.value = ''
  loading.value = true
  try {
    emit('created', { ...form.value })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  width: min(480px, 90vw);
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  font-family: 'Syne', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: -0.02em;
}

.btn-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  transition: color 0.15s;
}

.btn-close:hover { color: var(--text); }

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field { display: flex; flex-direction: column; gap: 7px; }

label {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.required { color: var(--red); }

input, textarea {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 12px;
  color: var(--text);
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  transition: border-color 0.15s;
  resize: none;
  outline: none;
}

input:focus, textarea:focus {
  border-color: var(--accent);
}

.priority-options {
  display: flex;
  gap: 8px;
}

.priority-opt {
  flex: 1;
  padding: 8px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.opt-low.selected { background: var(--green-dim); border-color: var(--green); color: var(--green); }
.opt-medium.selected { background: var(--amber-dim); border-color: var(--amber); color: var(--amber); }
.opt-high.selected { background: var(--red-dim); border-color: var(--red); color: var(--red); }
.priority-opt:not(.selected):hover { border-color: var(--text-muted); color: var(--text); }

.error {
  font-size: 12px;
  color: var(--red);
  background: var(--red-dim);
  padding: 8px 12px;
  border-radius: var(--radius);
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  justify-content: flex-end;
}

.btn-cancel, .btn-submit {
  padding: 9px 20px;
  border-radius: var(--radius);
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid;
}

.btn-cancel {
  background: transparent;
  border-color: var(--border);
  color: var(--text-muted);
}

.btn-cancel:hover { border-color: var(--text-muted); color: var(--text); }

.btn-submit {
  background: var(--accent);
  border-color: var(--accent);
  color: #000;
  font-weight: 500;
}

.btn-submit:hover { background: #d4eb3a; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
