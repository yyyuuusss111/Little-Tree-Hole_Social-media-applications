<template>
  <div class="min-h-screen py-20">
    <div class="max-w-4xl mx-auto px-4">
      <div v-if="postsStore.isLoading && postsStore.posts.length === 0" class="text-center py-20">
        <div class="loading loading-spinner loading-lg"></div>
        <p class="mt-4 text-base-content/60">加载中...</p>
      </div>
      
      <div v-else-if="postsStore.posts.length === 0" class="text-center py-20">
        <p class="text-base-content/60">还没有帖子，快来发布第一条吧！</p>
        <router-link v-if="userStore.isLoggedIn" to="/create-post" class="btn btn-primary mt-4">
          发布帖子
        </router-link>
      </div>
      
      <div v-else class="space-y-6">
        <div v-for="post in postsStore.posts" :key="post.id" class="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow" @click="goToPostDetail(post.id)">
          <div class="card-body">
            <div class="flex items-center space-x-2 mb-4">
              <div class="avatar">
                <div class="w-10 rounded-full">
                  <img :src="post.author?.avatar || '/images/avatar.png'" :alt="post.author?.username" />
                </div>
              </div>
              <div>
                <div class="font-semibold">{{ post.author?.username }}</div>
                <div class="text-sm text-base-content/60">{{ formatDate(post.createdAt) }}</div>
              </div>
            </div>
            
            <p class="text-lg mb-4">{{ post.content }}</p>
            
            <div v-if="post.images && post.images.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div v-for="(image, index) in post.images" :key="index" 
                   class="aspect-square overflow-hidden rounded-lg cursor-zoom-in"
                   @click="onPreviewImage(post.images!, index)">
                <img :src="image.url" :alt="`图片 ${index + 1}`"
                     class="w-full h-full object-cover hover:scale-105 transition-transform" />
              </div>
            </div>
            
            <div class="flex justify-between items-center">
              <div class="flex items-center space-x-4">
                <button 
                  @click.stop="toggleLike(post)" 
                  class="btn btn-ghost btn-sm gap-2"
                  :class="{ 'text-red-500': post.isLiked }"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{{ post.likeCount || 0 }}</span>
                </button>
                <button 
                  @click.stop="showComments(post)" 
                  class="btn btn-ghost btn-sm gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{{ post.commentCount || 0 }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 无限滚动加载指示器 -->
        <div v-if="postsStore.isLoadingMore" class="text-center py-8">
          <div class="loading loading-spinner loading-lg"></div>
          <p class="mt-4 text-base-content/60">加载更多内容...</p>
        </div>
        
        <!-- 没有更多内容的提示 -->
        <div v-else-if="!postsStore.hasMore && postsStore.posts.length > 0" class="text-center py-8">
          <p class="text-base-content/60">已经到底啦，没有更多内容了</p>
        </div>
        
        <!-- 无限滚动触发元素 -->
        <div 
          v-if="postsStore.hasMore && !postsStore.isLoadingMore" 
          ref="loadMoreTrigger" 
          class="h-4"
        ></div>
      </div>
    </div>
    
    <!-- 浮动发布按钮 -->
    <router-link 
      v-if="userStore.isLoggedIn" 
      to="/create-post" 
      class="btn btn-primary btn-circle fixed bottom-8 right-8 shadow-lg"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </router-link>

    <!-- 评论模态框 -->
    <div v-if="showCommentModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">发表评论</h3>
        <div class="form-control">
          <textarea 
            v-model="commentContent"
            class="textarea textarea-bordered h-24"
            placeholder="写下你的评论..."
            :disabled="isSubmittingComment"
          ></textarea>
        </div>
        <div class="modal-action">
          <button 
            @click="showCommentModal = false" 
            class="btn btn-outline"
            :disabled="isSubmittingComment"
          >
            取消
          </button>
          <button 
            @click="submitComment" 
            class="btn btn-primary"
            :disabled="!commentContent.trim() || isSubmittingComment"
          >
            <span v-if="isSubmittingComment" class="loading loading-spinner loading-sm"></span>
            {{ isSubmittingComment ? '发送中...' : '发送' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '../stores/posts'
import { useUserStore } from '../stores/user'
import { websocketService } from '../services/websocket'
import type { Image, Post } from '../types'

const router = useRouter()
const postsStore = usePostsStore()
const userStore = useUserStore()

const selectedPost = ref<Post | null>(null)
const showCommentModal = ref(false)
const commentContent = ref('')
const isSubmittingComment = ref(false)
const loadMoreTrigger = ref<HTMLElement>()
let observer: IntersectionObserver | null = null

onMounted(() => {
  postsStore.fetchPosts()
  setupInfiniteScroll()
  
  // 连接WebSocket
  if (userStore.isLoggedIn) {
    websocketService.connect()
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  
  // 断开WebSocket连接
  websocketService.disconnect()
})

// 设置无限滚动
const setupInfiniteScroll = () => {
  if (!loadMoreTrigger.value) return
  
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && postsStore.hasMore && !postsStore.isLoadingMore) {
        postsStore.loadMore()
      }
    },
    {
      rootMargin: '100px', // 提前100px触发加载
      threshold: 0.1
    }
  )
  
  observer.observe(loadMoreTrigger.value)
}

const goToPostDetail = (postId: string) => {
  router.push(`/post/${postId}`)
}

const onPreviewImage = (images: Image[], index: number) => {
  // 图片预览功能
  console.log('预览图片:', index)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const toggleLike = async (post: Post) => {
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }
  
  try {
    // 先更新本地状态，提供即时反馈
    const newIsLiked = !post.isLiked
    post.isLiked = newIsLiked
    post.likeCount = newIsLiked ? (post.likeCount || 0) + 1 : (post.likeCount || 1) - 1
    
    // 发送WebSocket消息
    websocketService.sendLike(post.id, newIsLiked)
    
    // 同时调用API确保数据一致性
    const response = await fetch(`/api/local/posts/${post.id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await response.json()
    
    if (data.success) {
      // 使用服务器返回的数据更新状态
      post.isLiked = data.isLiked
      post.likeCount = data.likeCount
    } else {
      // 如果API调用失败，回滚本地状态
      post.isLiked = !newIsLiked
      post.likeCount = newIsLiked ? (post.likeCount || 1) - 1 : (post.likeCount || 0) + 1
      alert('点赞失败，请重试')
    }
  } catch (error) {
    console.error('点赞失败:', error)
    // 回滚本地状态
    post.isLiked = !post.isLiked
    post.likeCount = post.isLiked ? (post.likeCount || 0) + 1 : (post.likeCount || 1) - 1
    alert('点赞失败，请重试')
  }
}

const showComments = (post: Post) => {
  selectedPost.value = post
  showCommentModal.value = true
}

const submitComment = async () => {
  if (!selectedPost.value || !commentContent.value.trim()) return
  
  isSubmittingComment.value = true
  
  try {
    // 先更新本地状态
    const post = postsStore.posts.find(p => p.id === selectedPost.value?.id)
    if (post) {
      post.commentCount = (post.commentCount || 0) + 1
    }
    
    // 发送WebSocket消息
    websocketService.sendComment(selectedPost.value.id, commentContent.value.trim())
    
    // 调用API
    const response = await fetch('/api/local/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: commentContent.value.trim(),
        postId: selectedPost.value.id
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      showCommentModal.value = false
      commentContent.value = ''
      selectedPost.value = null
      alert('评论发表成功')
    } else {
      // 如果API调用失败，回滚本地状态
      if (post) {
        post.commentCount = (post.commentCount || 1) - 1
      }
      alert(data.error || '评论发表失败')
    }
  } catch (error) {
    console.error('评论发表失败:', error)
    // 回滚本地状态
    const post = postsStore.posts.find(p => p.id === selectedPost.value?.id)
    if (post) {
      post.commentCount = (post.commentCount || 1) - 1
    }
    alert('评论发表失败，请重试')
  } finally {
    isSubmittingComment.value = false
  }
}
</script>

