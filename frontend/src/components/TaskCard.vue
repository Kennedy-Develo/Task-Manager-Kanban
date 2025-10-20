<template>
  <div class="task-card bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-move">
    <div class="flex items-start justify-between">
      <h4 class="font-medium text-gray-800">{{ task.titulo }}</h4>
      <button
        @click="handleDelete"
        class="text-red-500 hover:text-red-700 ml-2"
        title="Deletar tarefa"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <p v-if="task.descricao" class="text-sm text-gray-600 mt-2">
      {{ task.descricao }}
    </p>
  </div>
</template>

<script setup>
import { useTaskStore } from '@/stores/taskStore'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const store = useTaskStore()

function handleDelete() {
  if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
    store.deleteTask(props.task.id)
  }
}
</script>