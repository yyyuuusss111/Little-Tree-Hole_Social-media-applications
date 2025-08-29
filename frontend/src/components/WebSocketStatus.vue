<template>
  <div class="websocket-status">
    <div class="flex items-center gap-2">
      <!-- 连接状态指示器 -->
      <div 
        class="w-3 h-3 rounded-full"
        :class="statusClass"
        :title="statusText"
      ></div>
      
      <!-- 状态文本 -->
      <span class="text-sm text-base-content/60">{{ statusText }}</span>
      
      <!-- 重连按钮 -->
      <button 
        v-if="status === 'disconnected'"
        @click="reconnect"
        class="btn btn-xs btn-outline"
        :disabled="isReconnecting"
      >
        <span v-if="isReconnecting" class="loading loading-spinner loading-xs"></span>
        {{ isReconnecting ? '重连中...' : '重连' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { websocketService, ConnectionStatus } from '../services/websocket'

const status = ref<ConnectionStatus>(ConnectionStatus.DISCONNECTED)
const isReconnecting = ref(false)

// 计算状态样式类
const statusClass = computed(() => {
  switch (status.value) {
    case ConnectionStatus.CONNECTED:
      return 'bg-green-500'
    case ConnectionStatus.CONNECTING:
    case ConnectionStatus.RECONNECTING:
      return 'bg-yellow-500 animate-pulse'
    case ConnectionStatus.DISCONNECTED:
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
})

// 计算状态文本
const statusText = computed(() => {
  switch (status.value) {
    case ConnectionStatus.CONNECTED:
      return '实时连接正常'
    case ConnectionStatus.CONNECTING:
      return '正在连接...'
    case ConnectionStatus.RECONNECTING:
      return '正在重连...'
    case ConnectionStatus.DISCONNECTED:
      return '连接已断开'
    default:
      return '未知状态'
  }
})

// 更新状态
const updateStatus = () => {
  status.value = websocketService.getStatus()
}

// 重连
const reconnect = async () => {
  isReconnecting.value = true
  try {
    websocketService.connect()
    // 等待连接状态更新
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    isReconnecting.value = false
  }
}

// 状态更新定时器
let statusTimer: number | null = null

onMounted(() => {
  updateStatus()
  // 每秒更新一次状态
  statusTimer = window.setInterval(updateStatus, 1000)
})

onUnmounted(() => {
  if (statusTimer) {
    clearInterval(statusTimer)
  }
})
</script>

<style scoped>
.websocket-status {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
