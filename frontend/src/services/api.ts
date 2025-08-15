import axios from 'axios'
import type { 
  ApiResponse, 
  User, 
  Post, 
  Comment, 
  LoginForm, 
  RegisterForm, 
  CreatePostForm, 
  CreateCommentForm,
  Pagination 
} from '@/types'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除token并跳转到登录页
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 用户相关API
export const userApi = {
  // 登录
  login: (data: LoginForm): Promise<ApiResponse<{ token: string; user: User }>> => {
    return api.post('/auth/login', data)
  },

  // 注册
  register: (data: RegisterForm): Promise<ApiResponse<{ token: string; user: User }>> => {
    return api.post('/auth/register', data)
  },

  // 获取当前用户信息
  getCurrentUser: (): Promise<ApiResponse<User>> => {
    return api.get('/auth/me')
  },

  // 更新用户信息
  updateProfile: (data: Partial<User>): Promise<ApiResponse<User>> => {
    return api.put('/auth/profile', data)
  },

  // 忘记密码
  forgotPassword: (email: string): Promise<ApiResponse> => {
    return api.post('/auth/forgot-password', { email })
  }
}

// 帖子相关API
export const postApi = {
  // 获取帖子列表
  getPosts: (page = 1, limit = 10): Promise<ApiResponse<{ posts: Post[]; pagination: Pagination }>> => {
    return api.get(`/posts?page=${page}&limit=${limit}`)
  },

  // 获取单个帖子
  getPost: (id: string): Promise<ApiResponse<Post>> => {
    return api.get(`/posts/${id}`)
  },

  // 创建帖子
  createPost: (data: CreatePostForm): Promise<ApiResponse<Post>> => {
    const formData = new FormData()
    formData.append('content', data.content)
    data.images.forEach((image) => {
      formData.append('images', image)
    })
    
    return api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 删除帖子
  deletePost: (id: string): Promise<ApiResponse> => {
    return api.delete(`/posts/${id}`)
  }
}

// 评论相关API
export const commentApi = {
  // 获取帖子评论
  getComments: (postId: string, page = 1, limit = 20): Promise<ApiResponse<{ comments: Comment[]; pagination: Pagination }>> => {
    return api.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`)
  },

  // 创建评论
  createComment: (data: CreateCommentForm): Promise<ApiResponse<Comment>> => {
    return api.post('/comments', data)
  },

  // 删除评论
  deleteComment: (id: string): Promise<ApiResponse> => {
    return api.delete(`/comments/${id}`)
  }
}

// 文件上传API
export const uploadApi = {
  // 上传图片
  uploadImage: (file: File): Promise<ApiResponse<{ url: string; filename: string }>> => {
    const formData = new FormData()
    formData.append('image', file)
    
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default api
