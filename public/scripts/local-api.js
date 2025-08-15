/**
 * 本地API交互封装
 * 替代LeanCloud操作，使用本地存储服务
 */

const LocalAPI = {
  // 基础配置
  baseURL: '/api/local',
  
  // 通用请求方法
  async request(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 包含cookies
    }
    
    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      }
    }
    
    try {
      const response = await fetch(this.baseURL + url, finalOptions)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '请求失败')
      }
      
      return data
    } catch (error) {
      console.error('API请求失败:', error)
      throw error
    }
  },

  // 用户相关操作
  User: {
    // 用户登录
    async login(username, password) {
      const data = await LocalAPI.request('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      })
      
      // 保存用户信息到localStorage
      if (data.success && data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user))
      }
      
      return data
    },

    // 用户注册
    async register(username, email, password) {
      const data = await LocalAPI.request('/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
      })
      
      return data
    },

    // 用户登出
    async logout() {
      const data = await LocalAPI.request('/logout', {
        method: 'POST'
      })
      
      // 清除本地存储的用户信息
      localStorage.removeItem('currentUser')
      
      return data
    },

    // 获取当前用户信息
    async getCurrentUser() {
      try {
        const data = await LocalAPI.request('/user')
        if (data.success && data.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user))
          return data.user
        }
        return null
      } catch (error) {
        // 如果获取失败，尝试从localStorage获取
        const cachedUser = localStorage.getItem('currentUser')
        return cachedUser ? JSON.parse(cachedUser) : null
      }
    },

    // 检查是否已登录
    isLoggedIn() {
      const user = localStorage.getItem('currentUser')
      return !!user
    }
  },

  // 帖子相关操作
  Post: {
    // 获取帖子列表
    async getList(options = {}) {
      const { page = 1, limit = 10, authorId } = options
      const params = new URLSearchParams({ page, limit })
      if (authorId) params.append('authorId', authorId)
      
      const data = await LocalAPI.request(`/posts?${params}`)
      return data
    },

    // 获取单个帖子
    async getById(postId) {
      const data = await LocalAPI.request(`/posts/${postId}`)
      return data
    },

    // 创建帖子
    async create(content, images = []) {
      const data = await LocalAPI.request('/posts', {
        method: 'POST',
        body: JSON.stringify({ content, images })
      })
      
      return data
    },

    // 更新帖子
    async update(postId, updates) {
      const data = await LocalAPI.request(`/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
      
      return data
    },

    // 删除帖子
    async delete(postId) {
      const data = await LocalAPI.request(`/posts/${postId}`, {
        method: 'DELETE'
      })
      
      return data
    }
  },

  // 评论相关操作
  Comment: {
    // 获取帖子评论
    async getList(postId, options = {}) {
      const { page = 1, limit = 10 } = options
      const params = new URLSearchParams({ page, limit })
      
      const data = await LocalAPI.request(`/posts/${postId}/comments?${params}`)
      return data
    },

    // 创建评论
    async create(content, postId) {
      const data = await LocalAPI.request('/comments', {
        method: 'POST',
        body: JSON.stringify({ content, postId })
      })
      
      return data
    },

    // 更新评论
    async update(commentId, updates) {
      const data = await LocalAPI.request(`/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
      
      return data
    },

    // 删除评论
    async delete(commentId) {
      const data = await LocalAPI.request(`/comments/${commentId}`, {
        method: 'DELETE'
      })
      
      return data
    }
  },

  // 统计信息
  Stats: {
    // 获取统计信息
    async get() {
      const data = await LocalAPI.request('/stats')
      return data
    }
  }
}

// 导出到全局
window.LocalAPI = LocalAPI
