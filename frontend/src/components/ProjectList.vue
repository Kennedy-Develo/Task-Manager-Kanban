<template>
  <div class="project-list p-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800">Projetos</h2>
      <button
        @click="showModal = true"
        class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
      >
        + Novo
      </button>
    </div>

    <ul class="space-y-2">
      <li
        v-for="project in store.projects"
        :key="project.id"
        :class="[
          'p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition relative',
          store.selectedProjectId === project.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'bg-white'
        ]"
      >
        <div @click="selectProject(project.id)">
          <div class="font-medium pr-8">{{ project.name }}</div>
          <div class="text-xs text-gray-500 mt-1">
            {{ project.tasks_count || 0 }} tarefas
          </div>
        </div>
        <button
          @click.stop="confirmDeleteProject(project)"
          class="absolute top-3 right-3 text-red-500 hover:text-red-700"
          title="Deletar projeto"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </li>
    </ul>

    <CreateProjectModal
      v-if="showModal"
      @close="showModal = false"
      @created="handleProjectCreated"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import CreateProjectModal from './CreateProjectModal.vue'

const store = useTaskStore()
const showModal = ref(false)

function selectProject(projectId) {
  store.loadTasks(projectId)
}

function handleProjectCreated() {
  showModal.value = false
}

function confirmDeleteProject(project) {
  if (confirm(`Tem certeza que deseja deletar o projeto "${project.name}"? Todas as tarefas serão perdidas.`)) {
    store.deleteProject(project.id)
  }
}
</script>
