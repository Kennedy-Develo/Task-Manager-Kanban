<template>
  <div class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="modal-content bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-xl font-bold text-gray-800 mb-4">Novo Projeto</h3>

      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Nome do Projeto <span class="text-red-500">*</span>
          </label>
          <input
            v-model="projectName"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Website Institucional"
          />
        </div>

        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ error }}
        </div>

        <div class="flex gap-3 justify-end">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? 'Criando...' : 'Criar Projeto' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'

const emit = defineEmits(['close', 'created'])
const store = useTaskStore()

const projectName = ref('')
const loading = ref(false)
const error = ref(null)

async function handleSubmit() {
  try {
    loading.value = true
    error.value = null
    await store.createProject(projectName.value)
    emit('created')
  } catch (err) {
    error.value = 'Erro ao criar projeto. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>