// Pinia 状态管理模块划分策略
import { createPinia } from 'pinia'
import { markRaw } from 'vue'
import type { Router } from 'vue-router'

// 创建 Pinia 实例
const pinia = createPinia()

// 插件：注入 router 到所有 store
pinia.use(({ store }) => {
  store.router = markRaw(useRouter())
})

// 插件：持久化存储
pinia.use(({ store }) => {
  // 从 localStorage 恢复状态
  const savedState = localStorage.getItem(`${store.$id}-state`)
  if (savedState) {
    store.$patch(JSON.parse(savedState))
  }
  
  // 监听状态变化并保存
  store.$subscribe((mutation, state) => {
    localStorage.setItem(`${store.$id}-state`, JSON.stringify(state))
  })
})

export default pinia

// 状态管理模块划分策略
export interface StoreModule {
  // 用户相关状态
  user: {
    currentUser: User | null
    token: string | null
    isLoggedIn: boolean
    permissions: string[]
    preferences: UserPreferences
  }
  
  // 内容管理状态
  content: {
    posts: Post[]
    comments: Comment[]
    drafts: Draft[]
    media: Media[]
    categories: Category[]
  }
  
  // UI 状态
  ui: {
    theme: 'light' | 'dark' | 'auto'
    sidebar: {
      isOpen: boolean
      activeTab: string
    }
    modals: {
      [key: string]: boolean
    }
    notifications: Notification[]
    loading: {
      [key: string]: boolean
    }
  }
  
  // 缓存状态
  cache: {
    data: Map<string, any>
    timestamps: Map<string, number>
    maxAge: number
  }
  
  // 版本管理状态
  version: {
    currentVersion: string
    availableVersions: VersionInfo[]
    compatibility: VersionCompatibility
    migrations: MigrationVersion[]
  }
}

// 类型定义
interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'moderator'
  createdAt: string
}

interface UserPreferences {
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends'
    showEmail: boolean
    showLocation: boolean
  }
}

interface Post {
  id: string
  title: string
  content: string
  author: User
  category: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  viewCount: number
  likeCount: number
  commentCount: number
}

interface Comment {
  id: string
  content: string
  author: User
  postId: string
  parentId?: string
  createdAt: string
  updatedAt: string
  likeCount: number
}

interface Draft {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  lastSaved: string
  autoSave: boolean
}

interface Media {
  id: string
  type: 'image' | 'video' | 'audio' | 'document'
  url: string
  filename: string
  size: number
  mimeType: string
  uploadedBy: string
  uploadedAt: string
}

interface Category {
  id: string
  name: string
  description: string
  color: string
  icon: string
  postCount: number
}

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  action?: {
    label: string
    url: string
  }
}

interface VersionInfo {
  version: string
  type: 'major' | 'minor' | 'patch'
  releaseDate: string
  changelog: string[]
  isStable: boolean
  requiresMigration: boolean
}

interface VersionCompatibility {
  minVersion: string
  maxVersion: string
  recommendedVersion: string
  breakingChanges: string[]
}

interface MigrationVersion {
  fromVersion: string
  toVersion: string
  migrationScript: string
  rollbackSupported: boolean
}

// Store 模块划分最佳实践
export const createStoreModules = () => {
  return {
    // 1. 用户状态模块 - 认证和用户信息
    user: {
      // 核心用户数据
      currentUser: null as User | null,
      token: null as string | null,
      
      // 计算属性
      get isLoggedIn() {
        return !!this.currentUser && !!this.token
      },
      
      get hasPermission() {
        return (permission: string) => {
          return this.currentUser?.permissions?.includes(permission) || false
        }
      },
      
      // 方法
      async login(credentials: { email: string; password: string }) {
        // 登录逻辑
      },
      
      async logout() {
        // 登出逻辑
      },
      
      async updateProfile(profile: Partial<User>) {
        // 更新用户资料
      }
    },
    
    // 2. 内容状态模块 - 帖子和评论管理
    content: {
      // 数据
      posts: [] as Post[],
      comments: [] as Comment[],
      drafts: [] as Draft[],
      
      // 计算属性
      get publishedPosts() {
        return this.posts.filter(post => post.status === 'published')
      },
      
      get userDrafts() {
        return this.drafts.filter(draft => draft.authorId === this.user.currentUser?.id)
      },
      
      // 方法
      async fetchPosts(filters?: any) {
        // 获取帖子列表
      },
      
      async createPost(postData: Partial<Post>) {
        // 创建帖子
      },
      
      async updatePost(id: string, updates: Partial<Post>) {
        // 更新帖子
      },
      
      async deletePost(id: string) {
        // 删除帖子
      }
    },
    
    // 3. UI 状态模块 - 界面状态管理
    ui: {
      // 主题设置
      theme: 'auto' as 'light' | 'dark' | 'auto',
      
      // 侧边栏状态
      sidebar: {
        isOpen: false,
        activeTab: 'home'
      },
      
      // 模态框状态
      modals: {} as Record<string, boolean>,
      
      // 通知
      notifications: [] as Notification[],
      
      // 加载状态
      loading: {} as Record<string, boolean>,
      
      // 方法
      toggleSidebar() {
        this.sidebar.isOpen = !this.sidebar.isOpen
      },
      
      openModal(modalId: string) {
        this.modals[modalId] = true
      },
      
      closeModal(modalId: string) {
        this.modals[modalId] = false
      },
      
      addNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          read: false
        }
        this.notifications.unshift(newNotification)
      },
      
      markNotificationAsRead(id: string) {
        const notification = this.notifications.find(n => n.id === id)
        if (notification) {
          notification.read = true
        }
      },
      
      setLoading(key: string, isLoading: boolean) {
        this.loading[key] = isLoading
      }
    },
    
    // 4. 缓存状态模块 - 数据缓存管理
    cache: {
      data: new Map<string, any>(),
      timestamps: new Map<string, number>(),
      maxAge: 5 * 60 * 1000, // 5分钟
      
      // 方法
      set(key: string, value: any) {
        this.data.set(key, value)
        this.timestamps.set(key, Date.now())
      },
      
      get(key: string) {
        const timestamp = this.timestamps.get(key)
        if (!timestamp) return null
        
        const age = Date.now() - timestamp
        if (age > this.maxAge) {
          this.delete(key)
          return null
        }
        
        return this.data.get(key)
      },
      
      delete(key: string) {
        this.data.delete(key)
        this.timestamps.delete(key)
      },
      
      clear() {
        this.data.clear()
        this.timestamps.clear()
      },
      
      getStats() {
        return {
          size: this.data.size,
          maxAge: this.maxAge,
          oldestEntry: Math.min(...Array.from(this.timestamps.values())),
          newestEntry: Math.max(...Array.from(this.timestamps.values()))
        }
      }
    },
    
    // 5. 版本管理状态模块 - 版本控制和兼容性
    version: {
      currentVersion: '1.0.0',
      availableVersions: [] as VersionInfo[],
      compatibility: {
        minVersion: '1.0.0',
        maxVersion: '2.0.0',
        recommendedVersion: '1.5.0',
        breakingChanges: []
      } as VersionCompatibility,
      migrations: [] as MigrationVersion[],
      
      // 方法
      checkCompatibility(version: string) {
        const current = this.parseVersion(this.currentVersion)
        const target = this.parseVersion(version)
        
        return {
          compatible: target.major === current.major,
          requiresMigration: target.major > current.major,
          breakingChanges: this.getBreakingChanges(current, target)
        }
      },
      
      parseVersion(version: string) {
        const [major, minor, patch] = version.split('.').map(Number)
        return { major, minor, patch }
      },
      
      getBreakingChanges(current: any, target: any) {
        // 获取破坏性变更
        return []
      },
      
      async migrate(fromVersion: string, toVersion: string) {
        // 执行版本迁移
      }
    }
  }
}

// 使用示例
export const useAppStore = () => {
  const modules = createStoreModules()
  
  return {
    // 用户相关
    user: modules.user,
    
    // 内容相关
    content: modules.content,
    
    // UI 相关
    ui: modules.ui,
    
    // 缓存相关
    cache: modules.cache,
    
    // 版本相关
    version: modules.version,
    
    // 全局方法
    async initialize() {
      // 初始化所有模块
      await this.user.fetchCurrentUser()
      await this.content.fetchPosts()
      this.ui.theme = localStorage.getItem('theme') || 'auto'
    },
    
    async cleanup() {
      // 清理资源
      this.cache.clear()
      this.ui.notifications = []
    }
  }
}

