import { createRouter, createWebHistory } from 'vue-router'
import { defineAsyncComponent } from 'vue'
import { useUserStore } from '../stores/user'

// 使用defineAsyncComponent实现路由懒加载
const HomeView = defineAsyncComponent(() => import('../views/HomeView.vue'))
const LoginView = defineAsyncComponent(() => import('../views/LoginView.vue'))
const RegisterView = defineAsyncComponent(() => import('../views/RegisterView.vue'))
const ForgotPasswordView = defineAsyncComponent(() => import('../views/ForgotPasswordView.vue'))
const ProfileView = defineAsyncComponent(() => import('../views/ProfileView.vue'))
const CreatePostView = defineAsyncComponent(() => import('../views/CreatePostView.vue'))
const PostDetailView = defineAsyncComponent(() => import('../views/PostDetailView.vue'))
const CacheManagerView = defineAsyncComponent(() => import('../views/CacheManagerView.vue'))
const SettingsView = defineAsyncComponent(() => import('../views/SettingsView.vue'))

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView
    },
    {
      path: '/create-post',
      name: 'create-post',
      component: CreatePostView
    },

    {
      path: '/post/:id',
      name: 'post-detail',
      component: PostDetailView
    },
    {
      path: '/cache-manager',
      name: 'cache-manager',
      component: CacheManagerView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 需要登录的页面
  const requiresAuth = ['/profile', '/create-post', '/cache-manager', '/settings']
  
  if (requiresAuth.includes(to.path) && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    next('/')
  } else if (to.path === '/register' && userStore.isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
