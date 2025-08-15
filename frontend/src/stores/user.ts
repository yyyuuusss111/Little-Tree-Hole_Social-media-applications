import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  createdAt: string
}

interface LoginForm {
  email: string
  password: string
}

interface RegisterForm {
  username: string
  email: string
  password: string
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)

  const isLoggedIn = computed(() => !!token.value && !!currentUser.value)
  const username = computed(() => currentUser.value?.username || '')

  const login = async (loginData: LoginForm) => {
    isLoading.value = true
    try {
      // 调用后端API进行登录
      const response = await fetch('/api/local/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        currentUser.value = data.user
        token.value = data.token
        localStorage.setItem('token', data.token)
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        return { success: true }
      } else {
        return { success: false, error: data.error || '登录失败' }
      }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, error: '网络错误，请重试' }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (registerData: RegisterForm) => {
    isLoading.value = true
    try {
      // 调用后端API进行注册
      const response = await fetch('/api/local/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        return { success: true }
      } else {
        return { success: false, error: data.error || '注册失败' }
      }
    } catch (error) {
      console.error('注册失败:', error)
      return { success: false, error: '网络错误，请重试' }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    currentUser.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
  }

  const fetchCurrentUser = async () => {
    if (!token.value) return false
    
    try {
      // 从localStorage恢复用户数据
      const savedUser = localStorage.getItem('currentUser')
      if (savedUser) {
        currentUser.value = JSON.parse(savedUser)
        return true
      }
      
      // 如果没有保存的用户数据，尝试从API获取
      const response = await fetch('/api/local/user', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        currentUser.value = data.user
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      logout()
      return false
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (currentUser.value) {
        Object.assign(currentUser.value, profileData)
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: '更新失败' }
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return { success: true }
    } catch (error) {
      return { success: false, error: '发送失败' }
    }
  }

  return {
    currentUser,
    token,
    isLoading,
    isLoggedIn,
    username,
    login,
    register,
    logout,
    fetchCurrentUser,
    updateProfile,
    forgotPassword
  }
})
