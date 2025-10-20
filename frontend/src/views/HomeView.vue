<template>
  <div class="home-view flex h-screen pt-16">
    <!-- Sidebar com projetos -->
    <aside class="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <ProjectList />
    </aside>

    <!-- Main content - Kanban Board -->
    <main class="flex-1 overflow-auto">
      <TaskBoard v-if="store.selectedProjectId" />
      <div v-else class="flex items-center justify-center h-full text-gray-400">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Selecione um projeto</h3>
          <p class="mt-1 text-sm text-gray-500">Escolha um projeto na barra lateral ou crie um novo.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import ProjectList from '@/components/ProjectList.vue'
import TaskBoard from '@/components/TaskBoard.vue'

const store = useTaskStore()

onMounted(async () => {
  await store.loadProjects()
  await store.loadStatuses()
})
</script>