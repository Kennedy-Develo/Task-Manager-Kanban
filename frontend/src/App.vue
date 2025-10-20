<template>
  <div id="app">
    <header class="bg-blue-600 text-white shadow-lg">
      <div class="container mx-auto px-4 py-4">
        <h1 class="text-2xl font-bold">Task Manager - Kanban Board</h1>
      </div>
    </header>
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style scoped>
header {
  position: sticky;
  top: 0;
  z-index: 100;
}
</style>