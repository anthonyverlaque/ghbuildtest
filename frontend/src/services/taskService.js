import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

export const taskService = {
  getAll: () => api.get('/tasks').then(r => r.data),
  getById: (id) => api.get(`/tasks/${id}`).then(r => r.data),
  create: (task) => api.post('/tasks', task).then(r => r.data),
  update: (id, task) => api.put(`/tasks/${id}`, task).then(r => r.data),
  delete: (id) => api.delete(`/tasks/${id}`),
}
