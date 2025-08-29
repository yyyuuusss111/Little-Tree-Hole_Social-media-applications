<script setup lang="ts">
import { onMounted } from 'vue'
import Header from './components/Header.vue'
import Toast from './components/Toast.vue'
import WebSocketStatus from './components/WebSocketStatus.vue'
import { useUserStore } from './stores/user'

const userStore = useUserStore()

onMounted(() => {
  // 获取用户状态
  userStore.fetchCurrentUser()
})
</script>

<template>
  <div id="app">
    <Header />
    <main>
      <router-view />
    </main>
    <Toast message="默认消息" />
    <WebSocketStatus />
  </div>
</template>

<style>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
