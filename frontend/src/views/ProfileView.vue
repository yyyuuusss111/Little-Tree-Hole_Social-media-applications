<template>
  <div class="min-h-screen bg-base-200 pt-16">
    <div class="max-w-screen-md mx-auto px-4 py-8">
      <!-- 用户信息卡片 -->
      <div class="card bg-base-100 shadow-xl mb-8">
        <div class="card-body">
          <div class="flex items-center gap-4">
            <div class="avatar placeholder">
              <div class="bg-neutral text-neutral-content rounded-full w-16">
                <span class="text-xl">{{ userStore.username.charAt(0).toUpperCase() }}</span>
              </div>
            </div>
            <div>
              <h2 class="card-title text-2xl">{{ userStore.username }}</h2>
              <p class="text-base-content/70">{{ userStore.currentUser?.email }}</p>
              <p class="text-sm text-base-content/50">
                注册时间: {{ formatDate(userStore.currentUser?.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签页 -->
      <div class="tabs mb-4">
        <a class="tab tab-bordered tab-active">我的帖子</a>
      </div>

      <!-- 帖子列表 -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <span class="loading loading-dots loading-lg"></span>
      </div>

      <div v-else-if="posts.length === 0" class="text-center py-8 text-base-content/70">
        <div class="mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p>还没有发布过帖子</p>
        <router-link to="/create-post" class="btn btn-primary mt-4">发布第一个帖子</router-link>
      </div>

      <div v-else class="space-y-4">
        <div v-for="post in posts" :key="post.id" class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <p class="text-base-content/70">{{ post.content }}</p>
            <div class="card-actions justify-between items-center mt-4">
              <div class="flex items-center space-x-4 text-sm text-base-content/60">
                <span>{{ formatDate(post.createdAt) }}</span>
                <span>{{ post.commentCount || 0 }} 条评论</span>
              </div>
              <div class="flex gap-2">
                <button @click="deletePost(post.id)" class="btn btn-sm btn-error">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore && !isLoading" class="text-center mt-8">
        <button @click="loadMore" :disabled="isLoadingMore" class="btn btn-outline">
          <span v-if="isLoadingMore" class="loading loading-spinner loading-sm"></span>
          加载更多
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { usePostsStore } from '../stores/posts'
import { useRouter } from 'vue-router'
import type { Post } from '../types'

const userStore = useUserStore()
const postsStore = usePostsStore()
const router = useRouter()

const posts = ref<Post[]>([])
const isLoading = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const page = ref(1)

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const loadPosts = async (pageNum = 1, refresh = false) => {
  if (refresh) {
    page.value = 1
    posts.value = []
  }
  
  isLoading.value = true
  try {
    // 调用API获取当前用户的帖子
    const response = await fetch(`/api/local/posts?page=${pageNum}&limit=10&authorId=${userStore.currentUser?.id}`)
    const data = await response.json()
    
    if (data.success) {
      const apiPosts = data.posts || []
      
      if (refresh) {
        posts.value = apiPosts
      } else {
        posts.value.push(...apiPosts)
      }
      
      hasMore.value = data.hasMore || false
    } else {
      console.error('获取帖子失败:', data.error)
    }
  } catch (error) {
    console.error('获取帖子失败:', error)
    // 降级到模拟数据
    const mockPosts: Post[] = [
      {
        id: '1',
        content: '这是我的第一个帖子',
        author: {
          id: userStore.currentUser?.id || '1',
          username: userStore.username,
          avatar: userStore.currentUser?.avatar || '/images/avatar.png'
        },
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 2
      }
    ]
    
    if (refresh) {
      posts.value = mockPosts
    } else {
      posts.value.push(...mockPosts)
    }
    
    hasMore.value = false // 模拟只有一页数据
  } finally {
    isLoading.value = false
  }
}

const loadMore = async () => {
  if (isLoadingMore.value || !hasMore.value) return
  
  isLoadingMore.value = true
  page.value++
  await loadPosts(page.value)
  isLoadingMore.value = false
}

const deletePost = async (postId: string) => {
  if (!confirm('确定要删除这个帖子吗？')) return
  
  try {
    await postsStore.deletePost(postId)
    posts.value = posts.value.filter(p => p.id !== postId)
  } catch (error) {
    console.error('删除帖子失败:', error)
  }
}

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  await loadPosts(1, true)
})
</script>
