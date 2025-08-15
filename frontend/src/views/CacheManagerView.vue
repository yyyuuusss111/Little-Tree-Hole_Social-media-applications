<template>
  <div class="min-h-screen bg-base-200 pt-16">
    <div class="max-w-screen-md mx-auto px-4 py-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-6">缓存管理</h2>
          
          <div class="space-y-6">
            <!-- 缓存统计 -->
            <div class="stats stats-vertical lg:stats-horizontal shadow">
              <div class="stat">
                <div class="stat-title">用户状态</div>
                <div class="stat-value">{{ stats.user ? '已缓存' : '未缓存' }}</div>
                <div class="stat-desc">{{ stats.user ? '用户信息已保存' : '用户信息未保存' }}</div>
              </div>
              
              <div class="stat">
                <div class="stat-title">帖子缓存</div>
                <div class="stat-value">{{ stats.postsCount }}</div>
                <div class="stat-desc">条帖子数据</div>
              </div>
              
              <div class="stat">
                <div class="stat-title">评论缓存</div>
                <div class="stat-value">{{ stats.commentsCount }}</div>
                <div class="stat-desc">个帖子的评论</div>
              </div>
              
              <div class="stat">
                <div class="stat-title">临时数据</div>
                <div class="stat-value">{{ stats.tempDataCount }}</div>
                <div class="stat-desc">条临时数据</div>
              </div>
            </div>

            <!-- 缓存操作 -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">缓存操作</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button @click="clearPosts" class="btn btn-outline btn-warning" :disabled="isLoading">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  清除帖子缓存
                </button>
                
                <button @click="clearComments" class="btn btn-outline btn-warning" :disabled="isLoading">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  清除评论缓存
                </button>
                
                <button @click="clearTempData" class="btn btn-outline btn-warning" :disabled="isLoading">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  清除临时数据
                </button>
                
                <button @click="clearAll" class="btn btn-outline btn-error" :disabled="isLoading">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  清除所有缓存
                </button>
              </div>
            </div>

            <!-- 存储信息 -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">存储信息</h3>
              
              <div class="overflow-x-auto">
                <table class="table table-zebra">
                  <tbody>
                    <tr>
                      <td>本地存储大小</td>
                      <td>{{ localStorageSize }}</td>
                    </tr>
                    <tr>
                      <td>最后更新时间</td>
                      <td>{{ lastUpdateTime }}</td>
                    </tr>
                    <tr>
                      <td>缓存状态</td>
                      <td>
                        <div class="badge" :class="cacheStatus === '正常' ? 'badge-success' : 'badge-error'">
                          {{ cacheStatus }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 说明 -->
            <div class="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h3 class="font-bold">缓存说明</h3>
                <div class="text-xs">
                  <p>• 缓存数据会保存在浏览器本地，提升页面加载速度</p>
                  <p>• 清除缓存后，下次访问需要重新从服务器加载数据</p>
                  <p>• 缓存数据会在24小时后自动过期</p>
                  <p>• 页面刷新或关闭时会自动保存缓存数据</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { usePostsStore } from '../stores/posts'

const userStore = useUserStore()
const postsStore = usePostsStore()

const stats = ref({
  user: false,
  postsCount: 0,
  commentsCount: 0,
  tempDataCount: 0
})

const localStorageSize = ref('0 KB')
const lastUpdateTime = ref('未知')
const cacheStatus = ref('正常')
const isLoading = ref(false)

const updateStats = async () => {
  try {
    // 检查用户缓存
    stats.value.user = !!userStore.currentUser
    
    // 获取帖子数量
    stats.value.postsCount = postsStore.posts.length
    
    // 计算评论总数
    stats.value.commentsCount = postsStore.posts.reduce((total, post) => total + (post.commentCount || 0), 0)
    
    // 检查临时数据
    const tempData = localStorage.getItem('tempData')
    if (tempData) {
      try {
        const temp = JSON.parse(tempData)
        stats.value.tempDataCount = Object.keys(temp).length
      } catch {
        stats.value.tempDataCount = 0
      }
    } else {
      stats.value.tempDataCount = 0
    }
  } catch (error) {
    console.error('获取统计信息失败:', error)
  }
}

const updateLocalStorageInfo = () => {
  try {
    // 计算localStorage大小
    let totalSize = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += key.length + value.length
        }
      }
    }
    
    localStorageSize.value = totalSize > 1024 ? `${(totalSize / 1024).toFixed(1)} KB` : `${totalSize} B`
    
    // 获取最后更新时间
    const lastUpdate = localStorage.getItem('lastUpdate')
    lastUpdateTime.value = lastUpdate ? new Date(parseInt(lastUpdate)).toLocaleString('zh-CN') : '未知'
    
    // 检查缓存状态
    cacheStatus.value = totalSize > 5 * 1024 * 1024 ? '过大' : '正常'
  } catch (error) {
    console.error('获取localStorage信息失败:', error)
    localStorageSize.value = '获取失败'
    lastUpdateTime.value = '获取失败'
    cacheStatus.value = '异常'
  }
}

const clearPosts = async () => {
  if (!confirm('确定要清除帖子缓存吗？')) return
  
  isLoading.value = true
  try {
    postsStore.posts = []
    localStorage.removeItem('posts')
    await updateStats()
    updateLocalStorageInfo()
    alert('帖子缓存已清除')
  } finally {
    isLoading.value = false
  }
}

const clearComments = async () => {
  if (!confirm('确定要清除评论缓存吗？')) return
  
  isLoading.value = true
  try {
    localStorage.removeItem('comments')
    await updateStats()
    updateLocalStorageInfo()
    alert('评论缓存已清除')
  } finally {
    isLoading.value = false
  }
}

const clearTempData = async () => {
  if (!confirm('确定要清除临时数据吗？')) return
  
  isLoading.value = true
  try {
    localStorage.removeItem('tempData')
    await updateStats()
    updateLocalStorageInfo()
    alert('临时数据已清除')
  } finally {
    isLoading.value = false
  }
}

const clearAll = async () => {
  if (!confirm('确定要清除所有缓存吗？这将清除所有本地存储的数据。')) return
  
  isLoading.value = true
  try {
    localStorage.clear()
    postsStore.posts = []
    userStore.logout()
    await updateStats()
    updateLocalStorageInfo()
    alert('所有缓存已清除')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await updateStats()
  updateLocalStorageInfo()
  
  // 定期更新统计信息
  setInterval(async () => {
    await updateStats()
    updateLocalStorageInfo()
  }, 5000)
})
</script>
