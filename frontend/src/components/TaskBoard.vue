<template>
  <div class="task-board p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">{{ store.selectedProject?.name }}</h2>
        <p class="text-sm text-gray-500 mt-1">{{ store.tasks.length }} tarefas no total</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
      >
        + Nova Tarefa
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="status in store.statuses"
        :key="status.slug"
        class="kanban-column bg-gray-50 rounded-lg p-4"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-700 flex items-center">
            <span
              :class="[
                'w-3 h-3 rounded-full mr-2',
                status.color || 'bg-gray-400'
              ]"
            ></span>
            {{ status.name }}
          </h3>
          <span class="text-sm text-gray-500 bg-white px-2 py-1 rounded">
            {{ store.tasksByStatus[status.slug]?.length || 0 }}
          </span>
        </div>

        <Draggable
          :list="store.tasksByStatus[status.slug] || []"
          :group="{ name: 'tasks' }"
          item-key="id"
          class="space-y-3 min-h-[200px]"
          @change="handleDragChange($event, status.slug)"
        >
          <template #item="{ element }">
            <TaskCard :task="element" />
          </template>
        </Draggable>
      </div>
    </div>

    <!-- Modal de criar tarefa -->
    <CreateTaskModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleTaskCreated"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import Draggable from 'vuedraggable'
import TaskCard from './TaskCard.vue'
import CreateTaskModal from './CreateTaskModal.vue'

const store = useTaskStore()
const showCreateModal = ref(false)

async function handleDragChange(event, newStatus) {
  if (event.added) {
    const task = event.added.element
    await store.updateTask(task.id, { status: newStatus })
  }
}

function handleTaskCreated() {
  showCreateModal.value = false
}
</script>

<style scoped>
.kanban-column {
  min-height: 500px;
}
</style>
