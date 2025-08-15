<template>
  <div class="min-h-screen bg-base-200 pt-16">
    <div class="max-w-screen-md mx-auto px-4 py-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-6">设置</h2>
          
          <div class="space-y-6">
            <!-- 用户信息 -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">用户信息</h3>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text">用户名</span>
                </label>
                <input 
                  v-model="form.username" 
                  type="text" 
                  class="input input-bordered" 
                  placeholder="用户名"
                  :disabled="isLoading"
                />
              </div>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text">邮箱</span>
                </label>
                <input 
                  v-model="form.email" 
                  type="email" 
                  class="input input-bordered" 
                  placeholder="邮箱"
                  :disabled="isLoading"
                />
              </div>
            </div>

            <!-- 更改密码 -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">更改密码</h3>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text">当前密码</span>
                </label>
                <input 
                  v-model="form.currentPassword" 
                  type="password" 
                  class="input input-bordered" 
                  placeholder="当前密码"
                  :disabled="isLoading"
                />
              </div>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text">新密码</span>
                </label>
                <input 
                  v-model="form.newPassword" 
                  type="password" 
                  class="input input-bordered" 
                  placeholder="新密码"
                  :disabled="isLoading"
                />
              </div>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text">确认新密码</span>
                </label>
                <input 
                  v-model="form.confirmPassword" 
                  type="password" 
                  class="input input-bordered" 
                  placeholder="确认新密码"
                  :disabled="isLoading"
                />
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex justify-end gap-4">
              <button 
                @click="saveSettings" 
                class="btn btn-primary"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
                {{ isLoading ? '保存中...' : '保存设置' }}
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
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const form = ref({
  username: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const isLoading = ref(false)

const saveSettings = async () => {
  if (!userStore.currentUser) return
  
  isLoading.value = true
  
  try {
    // 验证密码
    if (form.value.newPassword && form.value.newPassword !== form.value.confirmPassword) {
      alert('新密码和确认密码不匹配')
      return
    }
    
    // 构建更新数据
    const updateData: any = {
      username: form.value.username,
      email: form.value.email
    }
    
    if (form.value.newPassword) {
      updateData.currentPassword = form.value.currentPassword
      updateData.newPassword = form.value.newPassword
    }
    
    const result = await userStore.updateProfile(updateData)
    
    if (result.success) {
      alert('设置保存成功')
      // 清空密码字段
      form.value.currentPassword = ''
      form.value.newPassword = ''
      form.value.confirmPassword = ''
    } else {
      alert(result.error || '保存失败')
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    alert('保存失败，请重试')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  // 填充表单数据
  if (userStore.currentUser) {
    form.value.username = userStore.currentUser.username
    form.value.email = userStore.currentUser.email
  }
})
</script>
