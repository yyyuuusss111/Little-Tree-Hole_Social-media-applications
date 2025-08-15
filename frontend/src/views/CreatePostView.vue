<template>
  <div class="min-h-screen bg-base-200 pt-16">
    <div class="max-w-screen-md mx-auto px-4 py-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-6">发布新帖子</h2>
          
          <form @submit.prevent="submitPost" class="space-y-6">
            <!-- 内容输入 -->
            <div>
              <label class="label">
                <span class="label-text">内容</span>
                <span class="label-text-alt">{{ content.length }}/500</span>
              </label>
              <textarea
                v-model="content"
                class="textarea textarea-bordered w-full h-32 resize-none"
                placeholder="分享你的想法..."
                maxlength="500"
                :disabled="isSubmitting"
              ></textarea>
            </div>

            <!-- 图片上传 -->
            <div>
              <label class="label">
                <span class="label-text">图片 (可选，最多3张)</span>
              </label>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="(image, index) in images"
                  :key="index"
                  class="relative w-24 h-24"
                >
                  <img :src="image.url" class="w-full h-full object-cover rounded" />
                  <button
                    @click="removeImage(index)"
                    type="button"
                    class="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error"
                  >
                    ×
                  </button>
                </div>

                <div
                  v-if="images.length < 3"
                  class="w-24 h-24 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-primary"
                  @click="selectImage"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                accept="image/*"
                multiple
                @change="onImageSelected"
              />
            </div>

            <!-- 提示信息 -->
            <div class="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h3 class="font-bold">发布提示</h3>
                <div class="text-xs">
                  <p>• 请确保内容符合社区规范</p>
                  <p>• 图片大小不超过5MB</p>
                  <p>• 发布后可以编辑或删除</p>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex justify-end gap-4">
              <router-link to="/" class="btn btn-outline" :disabled="isSubmitting">
                取消
              </router-link>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="!isValid || isSubmitting"
              >
                <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                {{ isSubmitting ? '发布中...' : '发布' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { usePostsStore } from '../stores/posts'
import type { CreatePostForm } from '../types'

const router = useRouter()
const userStore = useUserStore()
const postsStore = usePostsStore()

const content = ref('')
const images = ref<{ file: File; url: string }[]>([])
const isSubmitting = ref(false)
const fileInput = ref<HTMLInputElement>()

const isValid = computed(() => content.value.trim().length > 0)

const selectImage = () => {
  fileInput.value?.click()
}

const onImageSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (!files) return
  
  for (let i = 0; i < files.length && images.value.length < 3; i++) {
    const file = files[i]
    
    // 检查文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB')
      continue
    }
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      continue
    }
    
    const url = URL.createObjectURL(file)
    images.value.push({ file, url })
  }
  
  // 清空input值，允许重复选择同一文件
  target.value = ''
}

const removeImage = (index: number) => {
  const image = images.value[index]
  URL.revokeObjectURL(image.url)
  images.value.splice(index, 1)
}

const submitPost = async () => {
  if (!isValid.value || isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    const postData: CreatePostForm = {
      content: content.value.trim(),
      images: images.value.map(img => img.file)
    }
    
    const result = await postsStore.createPost(postData)
    
    if (result.success) {
      // 清理资源
      images.value.forEach(img => URL.revokeObjectURL(img.url))
      
      // 跳转到首页
      router.push('/')
    } else {
      alert(result.error || '发布失败')
    }
  } catch (error) {
    console.error('发布失败:', error)
    alert('发布失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
  }
})
</script>
