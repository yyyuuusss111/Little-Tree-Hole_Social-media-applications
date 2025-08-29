<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Vue3 API 选择策略示例</h2>
    
    <!-- Composition API 示例 -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h3 class="card-title">Composition API - 复杂逻辑复用</h3>
        <p class="text-sm text-base-content/60 mb-4">
          适用于：复杂业务逻辑、逻辑复用、TypeScript支持
        </p>
        
        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">用户名</span>
              <span class="label-text-alt">{{ usernameLength }}/20</span>
            </label>
            <input 
              v-model="username" 
              type="text" 
              class="input input-bordered"
              :class="{ 'input-error': usernameError }"
            />
            <label v-if="usernameError" class="label">
              <span class="label-text-alt text-error">{{ usernameError }}</span>
            </label>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">邮箱</span>
            </label>
            <input 
              v-model="email" 
              type="email" 
              class="input input-bordered"
              :class="{ 'input-error': emailError }"
            />
            <label v-if="emailError" class="label">
              <span class="label-text-alt text-error">{{ emailError }}</span>
            </label>
          </div>
          
          <div class="flex gap-2">
            <button 
              @click="validateForm" 
              class="btn btn-primary"
              :disabled="isValidating"
            >
              {{ isValidating ? '验证中...' : '验证表单' }}
            </button>
            <button 
              @click="resetForm" 
              class="btn btn-outline"
            >
              重置
            </button>
          </div>
          
          <div v-if="validationResult" class="alert" :class="validationResult.success ? 'alert-success' : 'alert-error'">
            <span>{{ validationResult.message }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Options API 示例 -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h3 class="card-title">Options API - 简单组件</h3>
        <p class="text-sm text-base-content/60 mb-4">
          适用于：简单组件、团队熟悉度、快速原型
        </p>
        
        <div class="space-y-4">
          <div class="stats shadow">
            <div class="stat">
              <div class="stat-title">计数器</div>
              <div class="stat-value">{{ counter }}</div>
              <div class="stat-actions">
                <button @click="increment" class="btn btn-sm btn-primary">+1</button>
                <button @click="decrement" class="btn btn-sm btn-secondary">-1</button>
              </div>
            </div>
          </div>
          
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">自动保存</span>
              <input 
                v-model="autoSave" 
                type="checkbox" 
                class="toggle toggle-primary"
              />
            </label>
          </div>
          
          <div v-if="autoSave" class="alert alert-info">
            <span>自动保存已启用，数据将每30秒自动保存</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Composition API - 复杂逻辑复用
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useFormValidation } from '../composables/useFormValidation'
import { useDebounce } from '../composables/useDebounce'

// 响应式数据
const username = ref('')
const email = ref('')
const isValidating = ref(false)
const validationResult = ref<{ success: boolean; message: string } | null>(null)

// 使用自定义组合函数
const { validateUsername, validateEmail } = useFormValidation()
const debouncedUsername = useDebounce(username, 500)

// 计算属性
const usernameLength = computed(() => username.value.length)
const usernameError = computed(() => {
  if (!username.value) return ''
  return validateUsername(username.value)
})

const emailError = computed(() => {
  if (!email.value) return ''
  return validateEmail(email.value)
})

// 监听器
watch(debouncedUsername, (newValue) => {
  if (newValue) {
    console.log('用户名变化:', newValue)
  }
})

// 方法
const validateForm = async () => {
  isValidating.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const usernameValid = !usernameError.value
    const emailValid = !emailError.value
    
    if (usernameValid && emailValid) {
      validationResult.value = {
        success: true,
        message: '表单验证通过！'
      }
    } else {
      validationResult.value = {
        success: false,
        message: '请检查表单错误'
      }
    }
  } finally {
    isValidating.value = false
  }
}

const resetForm = () => {
  username.value = ''
  email.value = ''
  validationResult.value = null
}

// 生命周期
onMounted(() => {
  console.log('Composition API 组件已挂载')
})

onUnmounted(() => {
  console.log('Composition API 组件已卸载')
})
</script>

<script lang="ts">
// Options API - 简单组件
export default {
  name: 'OptionsAPIExample',
  
  data() {
    return {
      counter: 0,
      autoSave: false,
      saveInterval: null as number | null
    }
  },
  
  computed: {
    isPositive() {
      return this.counter > 0
    }
  },
  
  watch: {
    autoSave(newValue: boolean) {
      if (newValue) {
        this.startAutoSave()
      } else {
        this.stopAutoSave()
      }
    }
  },
  
  methods: {
    increment() {
      this.counter++
    },
    
    decrement() {
      this.counter--
    },
    
    startAutoSave() {
      this.saveInterval = window.setInterval(() => {
        this.saveData()
      }, 30000)
    },
    
    stopAutoSave() {
      if (this.saveInterval) {
        clearInterval(this.saveInterval)
        this.saveInterval = null
      }
    },
    
    saveData() {
      console.log('自动保存数据:', { counter: this.counter })
    }
  },
  
  mounted() {
    console.log('Options API 组件已挂载')
  },
  
  beforeUnmount() {
    this.stopAutoSave()
    console.log('Options API 组件即将卸载')
  }
}
</script>

