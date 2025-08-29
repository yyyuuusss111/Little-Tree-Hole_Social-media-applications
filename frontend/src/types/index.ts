// 基础类型定义
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  createdAt: string
}

export interface Post {
  id: string
  content: string
  author: User
  images: Image[]
  createdAt: string
  updatedAt: string
  likeCount: number
  commentCount: number
  isLiked?: boolean // 添加点赞状态
}

export interface Comment {
  id: string
  content: string
  author: User
  postId: string
  createdAt: string
  updatedAt: string
}

export interface Image {
  id: string
  url: string
  alt?: string
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 表单类型
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  username: string
  email: string
  password: string
}

export interface CreatePostForm {
  content: string
  images: File[]
}

export interface CreateCommentForm {
  content: string
  postId: string
}
