<template>
  <div class="min-h-screen py-20">
    <div class="max-w-md mx-auto px-4">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl font-bold mb-6">登录</h2>
          
          <form @submit.prevent="onSubmit">
            <div class="form-control w-full">
              <label class="label">
                <span class="label-text">邮箱</span>
              </label>
              <input 
                type="email" 
                v-model="form.email" 
                class="input input-bordered w-full" 
                placeholder="请输入邮箱"
                required
                :disabled="isSubmitting"
              />
            </div>
            
            <div class="form-control w-full mt-4">
              <label class="label">
                <span class="label-text">密码</span>
              </label>
              <input 
                type="password" 
                v-model="form.password" 
                class="input input-bordered w-full" 
                placeholder="请输入密码"
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
                登录
              </button>
            </div>
          </form>
          
          <div class="divider">或者</div>
          
          <div class="text-center">
            <router-link to="/register" class="btn btn-outline w-full">
              注册新账户
            </router-link>
          </div>
          
          <div class="text-center mt-4">
            <router-link to="/forgot-password" class="link link-primary">
              忘记密码？
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const form = reactive({
  email: '',
  password: ''
})

const isSubmitting = ref(false)

const onSubmit = async () => {
  isSubmitting.value = true
  
  try {
    console.log('尝试登录:', form)
    const result = await userStore.login(form)
    console.log('登录结果:', result)
    
    if (result.success) {
      alert('登录成功')
      
      // 跳转到原来的页面或首页
      const redirectTo = route.query.redirect as string || '/'
      router.push(redirectTo)
    } else {
      alert(result.error || '登录失败')
    }
  } catch (error) {
    console.error('登录异常:', error)
    alert('登录失败')
  } finally {
    isSubmitting.value = false
  }
}
</script>
