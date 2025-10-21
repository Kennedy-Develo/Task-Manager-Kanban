import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { projectsAPI, tasksAPI, statusesAPI } from '@/api'

export const useTaskStore = defineStore('task', () => {
  // State
  const projects = ref([])
  const selectedProjectId = ref(null)
  const tasks = ref([])
  const statuses = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const selectedProject = computed(() =>
    projects.value.find(p => p.id === selectedProjectId.value)
  )

  const tasksByStatus = computed(() => {
    const grouped = {}
    statuses.value.forEach(status => {
      grouped[status.slug] = tasks.value.filter(task => task.status === status.slug)
    })
    return grouped
  })

  // Actions
  async function loadProjects() {
    try {
      loading.value = true
      error.value = null
      const response = await projectsAPI.getAll()
      projects.value = response.data
    } catch (err) {
      error.value = 'Erro ao carregar projetos'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createProject(name) {
    try {
      loading.value = true
      error.value = null
      const response = await projectsAPI.create({ name })
      const projectWithCount = { ...response.data, tasks_count: 0 }
      projects.value.push(projectWithCount)
      return projectWithCount
    } catch (err) {
      error.value = 'Erro ao criar projeto'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteProject(projectId) {
    try {
      loading.value = true
      error.value = null
      await projectsAPI.delete(projectId)
      projects.value = projects.value.filter(p => p.id !== projectId)

      if (selectedProjectId.value === projectId) {
        selectedProjectId.value = null
        tasks.value = []
      }
    } catch (err) {
      error.value = 'Erro ao deletar projeto'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadTasks(projectId) {
    try {
      loading.value = true
      error.value = null
      selectedProjectId.value = projectId
      const response = await tasksAPI.getByProject(projectId)
      tasks.value = response.data

      // Atualizar contador do projeto
      const project = projects.value.find(p => p.id === projectId)
      if (project) {
        project.tasks_count = response.data.length
      }
    } catch (err) {
      error.value = 'Erro ao carregar tarefas'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createTask(taskData) {
    try {
      loading.value = true
      error.value = null

      const defaultStatus = statuses.value.length > 0 ? statuses.value[0].slug : undefined

      const response = await tasksAPI.create({
        ...taskData,
        project_id: selectedProjectId.value,
        status: taskData.status || defaultStatus
      })
      tasks.value.push(response.data)

      // Atualizar contador do projeto
      const project = projects.value.find(p => p.id === selectedProjectId.value)
      if (project) {
        project.tasks_count = (project.tasks_count || 0) + 1
      }

      return response.data
    } catch (err) {
      error.value = 'Erro ao criar tarefa'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTask(taskId, updates) {
    try {
      loading.value = true
      error.value = null
      const response = await tasksAPI.update(taskId, updates)
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = 'Erro ao atualizar tarefa'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTask(taskId) {
    try {
      loading.value = true
      error.value = null
      await tasksAPI.delete(taskId)
      tasks.value = tasks.value.filter(t => t.id !== taskId)

      // Atualizar contador do projeto
      const project = projects.value.find(p => p.id === selectedProjectId.value)
      if (project && project.tasks_count > 0) {
        project.tasks_count -= 1
      }
    } catch (err) {
      error.value = 'Erro ao deletar tarefa'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadStatuses() {
    try {
      loading.value = true
      error.value = null
      const response = await statusesAPI.getAll()
      statuses.value = response.data
    } catch (err) {
      error.value = 'Erro ao carregar statuses'
      console.error('Failed to load statuses from API:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    projects,
    selectedProjectId,
    selectedProject,
    tasks,
    statuses,
    tasksByStatus,
    loading,
    error,
    // Actions
    loadProjects,
    createProject,
    deleteProject,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    loadStatuses
  }
})