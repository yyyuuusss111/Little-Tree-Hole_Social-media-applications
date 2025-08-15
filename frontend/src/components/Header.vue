<template>
  <header class="navbar bg-base-100 shadow-lg fixed top-0 z-50">
    <div class="navbar-start">
      <router-link to="/" class="btn btn-ghost text-xl">Natural Idyllic</router-link>
    </div>
    
    <div class="navbar-center">
      <div class="hidden md:flex">
        <router-link to="/" class="btn btn-ghost">首页</router-link>
      </div>
    </div>
    
    <div class="navbar-end">
      <div v-if="userStore.isLoggedIn" class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img :src="userStore.currentUser?.avatar || '/images/avatar.png'" :alt="userStore.username" />
          </div>
        </div>
        <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
          <li><router-link to="/profile">个人资料</router-link></li>
          <li><router-link to="/cache-manager">缓存管理</router-link></li>
          <li><router-link to="/settings">设置</router-link></li>
          <li><a @click="logout">退出登录</a></li>
        </ul>
      </div>
      <div v-else class="flex gap-2">
        <router-link to="/login" class="btn btn-primary">登录</router-link>
        <router-link to="/register" class="btn btn-outline">注册</router-link>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const logout = () => {
  userStore.logout()
  router.push('/login')
}
</script>
