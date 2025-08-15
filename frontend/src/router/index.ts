import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import ProfileView from '../views/ProfileView.vue'
import CreatePostView from '../views/CreatePostView.vue'
import PostDetailView from '../views/PostDetailView.vue'
import CacheManagerView from '../views/CacheManagerView.vue'
import SettingsView from '../views/SettingsView.vue'

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
