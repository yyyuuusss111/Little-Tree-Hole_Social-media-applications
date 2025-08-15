<template>
  <div class="min-h-screen py-20">
    <div class="max-w-md mx-auto px-4">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl font-bold mb-6">注册</h2>
          
          <form @submit.prevent="onSubmit">
            <div class="form-control w-full">
              <label class="label">
                <span class="label-text">用户名</span>
              </label>
              <input 
                type="text" 
                v-model="form.username" 
                class="input input-bordered w-full" 
                placeholder="请输入用户名"
                required
                :disabled="isSubmitting"
              />
            </div>
            
            <div class="form-control w-full mt-4">
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
            
            <div class="form-control w-full mt-4">
              <label class="label">
                <span class="label-text">确认密码</span>
              </label>
              <input 
                type="password" 
                v-model="form.confirmPassword" 
                class="input input-bordered w-full" 
                placeholder="请再次输入密码"
                required
                :disabled="isSubmitting"
              />
            </div>
            
            <div class="form-control mt-6">
              <button 
                type="submit" 
                class="btn btn-primary w-full" 
                :disabled="isSubmitting || !isPasswordMatch"
              >
                <span v-if="isSubmitting" class="loading loading-spinner"></span>
                注册
              </button>
            </div>
          </form>
          
          <div class="divider">或者</div>
          
          <div class="text-center">
            <router-link to="/login" class="btn btn-outline w-full">
              已有账户？去登录
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const isSubmitting = ref(false)

const isPasswordMatch = computed(() => {
  return form.password === form.confirmPassword && form.password.length >= 6
})

const onSubmit = async () => {
  if (!isPasswordMatch.value) {
    alert('密码不匹配或长度不足6位')
    return
  }
  
  isSubmitting.value = true
  
  try {
    console.log('尝试注册:', { username: form.username, email: form.email })
    const result = await userStore.register({
      username: form.username,
      email: form.email,
      password: form.password
    })
    console.log('注册结果:', result)
    
    if (result.success) {
      alert('注册成功')
      router.push('/login')
    } else {
      alert(result.error || '注册失败')
    }
  } catch (error) {
    console.error('注册异常:', error)
    alert('注册失败')
  } finally {
    isSubmitting.value = false
  }
}
</script>
