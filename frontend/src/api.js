import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Projects API
export const projectsAPI = {
  getAll: () => apiClient.get('/api/projects'),
  create: (data) => apiClient.post('/api/projects', data),
  delete: (id) => apiClient.delete(`/api/projects/${id}`),
}

// Tasks API
export const tasksAPI = {
  getByProject: (projectId) => apiClient.get(`/api/projects/${projectId}/tasks`),
  create: (data) => apiClient.post('/api/tasks', data),
  update: (id, data) => apiClient.put(`/api/tasks/${id}`, data),
  delete: (id) => apiClient.delete(`/api/tasks/${id}`),
}

// Statuses API
export const statusesAPI = {
  getAll: () => apiClient.get('/api/statuses'),
}

export default apiClient