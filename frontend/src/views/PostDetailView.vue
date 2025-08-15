<template>
  <div class="min-h-screen bg-base-200 pt-16">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- 帖子详情 -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="loading loading-spinner loading-lg"></div>
      </div>
      
      <div v-else-if="!post" class="text-center py-20">
        <p class="text-base-content/60">帖子不存在</p>
        <router-link to="/" class="btn btn-primary mt-4">返回首页</router-link>
      </div>
      
      <div v-else class="space-y-6">
        <!-- 帖子内容 -->
        <div class="card bg-base-100 shadow-xl">
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
                  @click="toggleLike(post)" 
                  class="btn btn-ghost btn-sm gap-2"
                  :class="{ 'text-red-500': post.isLiked }"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{{ post.likeCount || 0 }}</span>
                </button>
                <div class="btn btn-ghost btn-sm gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{{ post.commentCount || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 评论区域 -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title text-lg mb-4">评论 ({{ post.commentCount || 0 }})</h3>
            
            <!-- 发表评论 -->
            <div v-if="userStore.isLoggedIn" class="mb-6">
              <div class="form-control">
                <textarea 
                  v-model="commentContent"
                  class="textarea textarea-bordered h-24"
                  placeholder="写下你的评论..."
                  :disabled="isSubmittingComment"
                ></textarea>
              </div>
              <div class="flex justify-end mt-2">
                <button 
                  @click="submitComment" 
                  class="btn btn-primary btn-sm"
                  :disabled="!commentContent.trim() || isSubmittingComment"
                >
                  <span v-if="isSubmittingComment" class="loading loading-spinner loading-sm"></span>
                  {{ isSubmittingComment ? '发送中...' : '发送评论' }}
                </button>
              </div>
            </div>
            
            <div v-else class="mb-6 text-center py-4">
              <p class="text-base-content/60 mb-2">请先登录后发表评论</p>
              <router-link to="/login" class="btn btn-primary btn-sm">去登录</router-link>
            </div>

            <!-- 评论列表 -->
            <div v-if="commentsLoading" class="flex justify-center py-8">
              <div class="loading loading-spinner loading-md"></div>
            </div>
            
            <div v-else-if="comments.length === 0" class="text-center py-8 text-base-content/60">
              <p>还没有评论，快来发表第一条评论吧！</p>
            </div>
            
            <div v-else class="space-y-4">
              <div v-for="comment in comments" :key="comment.id" class="flex space-x-3">
                <div class="avatar">
                  <div class="w-8 rounded-full">
                    <img :src="comment.author?.avatar || '/images/avatar.png'" :alt="comment.author?.username" />
                  </div>
                </div>
                <div class="flex-1">
                  <div class="bg-base-200 rounded-lg p-3">
                    <div class="flex items-center space-x-2 mb-1">
                      <span class="font-semibold text-sm">{{ comment.author?.username }}</span>
                      <span class="text-xs text-base-content/60">{{ formatDate(comment.createdAt) }}</span>
                    </div>
                    <p class="text-sm">{{ comment.content }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 加载更多评论 -->
            <div v-if="hasMoreComments && !commentsLoading" class="text-center mt-6">
              <button 
                @click="loadMoreComments" 
                class="btn btn-outline btn-sm"
                :disabled="loadingMoreComments"
              >
                <span v-if="loadingMoreComments" class="loading loading-spinner loading-sm"></span>
                加载更多评论
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { usePostsStore } from '../stores/posts'
import type { Post, Comment } from '../types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const postsStore = usePostsStore()

const post = ref<Post | null>(null)
const comments = ref<Comment[]>([])
const isLoading = ref(false)
const commentsLoading = ref(false)
const loadingMoreComments = ref(false)
const hasMoreComments = ref(true)
const commentContent = ref('')
const isSubmittingComment = ref(false)
const commentsPage = ref(1)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const onPreviewImage = (images: any[], index: number) => {
  // 图片预览功能
  console.log('预览图片:', index)
}

const toggleLike = async (post: any) => {
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }
  
  try {
    const response = await fetch(`/api/local/posts/${post.id}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    if (data.success) {
      post.isLiked = !post.isLiked
      post.likeCount = data.likeCount
    }
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

const loadPost = async () => {
  const postId = route.params.id as string
  isLoading.value = true
  
  try {
    const result = await postsStore.fetchPost(postId)
    
    if (result.success && result.data) {
      post.value = result.data
      await loadComments()
    } else {
      post.value = null
    }
  } catch (error) {
    console.error('获取帖子失败:', error)
    post.value = null
  } finally {
    isLoading.value = false
  }
}

const loadComments = async (page = 1, append = false) => {
  if (!post.value) return
  
  if (page === 1) {
    commentsLoading.value = true
  } else {
    loadingMoreComments.value = true
  }
  
  try {
    const response = await fetch(`/api/local/posts/${post.value.id}/comments?page=${page}&limit=10`)
    const data = await response.json()
    
    if (data.success) {
      if (append) {
        comments.value.push(...data.comments)
      } else {
        comments.value = data.comments
      }
      
      hasMoreComments.value = data.hasMore
      commentsPage.value = page
    }
  } catch (error) {
    console.error('获取评论失败:', error)
  } finally {
    commentsLoading.value = false
    loadingMoreComments.value = false
  }
}

const loadMoreComments = async () => {
  await loadComments(commentsPage.value + 1, true)
}

const submitComment = async () => {
  if (!post.value || !commentContent.value.trim()) return
  
  isSubmittingComment.value = true
  
  try {
    const response = await fetch('/api/local/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: commentContent.value.trim(),
        postId: post.value.id
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      // 添加新评论到列表开头
      comments.value.unshift(data.comment)
      
      // 更新帖子的评论数
      post.value.commentCount = (post.value.commentCount || 0) + 1
      
      // 清空输入框
      commentContent.value = ''
      
      alert('评论发表成功')
    } else {
      alert(data.error || '评论发表失败')
    }
  } catch (error) {
    console.error('评论发表失败:', error)
    alert('评论发表失败，请重试')
  } finally {
    isSubmittingComment.value = false
  }
}

onMounted(() => {
  loadPost()
})
</script>
