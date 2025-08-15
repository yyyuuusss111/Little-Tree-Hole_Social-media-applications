<template>
  <div class="min-h-screen py-20">
    <div class="max-w-md mx-auto px-4">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl font-bold mb-6">忘记密码</h2>
          
          <form @submit.prevent="onSubmit">
            <div class="form-control w-full">
              <label class="label">
                <span class="label-text">邮箱</span>
              </label>
              <input 
                type="email" 
                v-model="email" 
                class="input input-bordered w-full" 
                placeholder="请输入注册邮箱"
                required
                :disabled="isSubmitting"
              />
            </div>
            
            <div class="form-control mt-6">
              <button 
                type="submit" 
                class="btn btn-primary w-full" 
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="loading loading-spinner"></span>
                发送重置链接
              </button>
            </div>
          </form>
          
          <div class="divider">或者</div>
          
          <div class="text-center">
            <router-link to="/login" class="btn btn-outline w-full">
              返回登录
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const email = ref('')
const isSubmitting = ref(false)

const onSubmit = async () => {
  isSubmitting.value = true
  
  try {
    const result = await userStore.forgotPassword(email.value)
    
    if (result.success) {
      // @ts-ignore
      window.$toast.success('重置链接已发送到您的邮箱')
    } else {
      // @ts-ignore
      window.$toast.error(result.error || '发送失败')
    }
  } catch (error) {
    // @ts-ignore
    window.$toast.error('发送失败')
  } finally {
    isSubmitting.value = false
  }
}
</script>
