<template>
  <div class="flex h-screen bg-base-200">
    <!-- 左侧元素列表 -->
    <div class="w-64 bg-base-100 shadow-lg border-r border-base-300">
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-4">元素库</h3>
        
        <!-- 元素分类 -->
        <div class="space-y-4">
          <div v-for="category in elementCategories" :key="category.id" class="space-y-2">
            <h4 class="text-sm font-medium text-base-content/70">{{ category.name }}</h4>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="element in category.elements"
                :key="element.id"
                class="p-3 border border-base-300 rounded-lg cursor-pointer hover:bg-base-200 transition-colors"
                :class="{ 'ring-2 ring-primary': selectedElement?.id === element.id }"
                @click="selectElement(element)"
                @dragstart="onDragStart($event, element)"
                draggable="true"
              >
                <div class="text-center">
                  <div class="text-2xl mb-1">{{ element.icon }}</div>
                  <div class="text-xs">{{ element.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间画布区域 -->
    <div class="flex-1 flex flex-col">
      <!-- 工具栏 -->
      <div class="h-16 bg-base-100 border-b border-base-300 flex items-center px-4 space-x-4">
        <button 
          @click="undo" 
          class="btn btn-sm btn-outline"
          :disabled="!canUndo"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          撤销
        </button>
        
        <button 
          @click="redo" 
          class="btn btn-sm btn-outline"
          :disabled="!canRedo"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
          重做
        </button>
        
        <div class="divider divider-horizontal"></div>
        
        <button 
          @click="saveCanvas" 
          class="btn btn-sm btn-primary"
          :disabled="isSaving"
        >
          <span v-if="isSaving" class="loading loading-spinner loading-sm"></span>
          {{ isSaving ? '保存中...' : '保存' }}
        </button>
        
        <button 
          @click="exportCanvas" 
          class="btn btn-sm btn-outline"
        >
          导出
        </button>
      </div>

      <!-- 画布容器 -->
      <div 
        ref="canvasContainer"
        class="flex-1 bg-white relative overflow-hidden"
        @drop="onDrop"
        @dragover.prevent
        @click="deselectElement"
      >
        <!-- 画布网格背景 -->
        <div class="absolute inset-0 opacity-10">
          <svg class="w-full h-full">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" stroke-width="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <!-- 画布元素 -->
        <div
          v-for="element in canvasElements"
          :key="element.id"
          class="absolute cursor-move select-none"
          :style="getElementStyle(element)"
          :class="{ 'ring-2 ring-primary ring-offset-2': selectedElement?.id === element.id }"
          @click.stop="selectElement(element)"
          @mousedown="startDrag($event, element)"
        >
          <!-- 元素内容 -->
          <div class="relative">
            <div class="text-4xl">{{ element.icon }}</div>
            <div class="text-xs text-center mt-1">{{ element.name }}</div>
            
            <!-- 选中时的控制点 -->
            <div v-if="selectedElement?.id === element.id" class="absolute -top-2 -right-2">
              <button 
                @click.stop="deleteElement(element.id)"
                class="btn btn-xs btn-error btn-circle"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- 选择框 -->
        <div 
          v-if="selectionBox"
          class="absolute border-2 border-primary bg-primary/10 pointer-events-none"
          :style="selectionBoxStyle"
        ></div>
      </div>
    </div>

    <!-- 右侧属性面板 -->
    <div class="w-80 bg-base-100 shadow-lg border-l border-base-300">
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-4">属性</h3>
        
        <div v-if="selectedElement" class="space-y-4">
          <!-- 元素基本信息 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">元素名称</span>
            </label>
            <input 
              v-model="selectedElement.name" 
              type="text" 
              class="input input-bordered input-sm"
              @input="updateElement(selectedElement)"
            />
          </div>

          <!-- 位置和大小 -->
          <div class="grid grid-cols-2 gap-2">
            <div class="form-control">
              <label class="label">
                <span class="label-text">X 坐标</span>
              </label>
              <input 
                v-model.number="selectedElement.x" 
                type="number" 
                class="input input-bordered input-sm"
                @input="updateElement(selectedElement)"
              />
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">Y 坐标</span>
              </label>
              <input 
                v-model.number="selectedElement.y" 
                type="number" 
                class="input input-bordered input-sm"
                @input="updateElement(selectedElement)"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="form-control">
              <label class="label">
                <span class="label-text">宽度</span>
              </label>
              <input 
                v-model.number="selectedElement.width" 
                type="number" 
                class="input input-bordered input-sm"
                @input="updateElement(selectedElement)"
              />
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">高度</span>
              </label>
              <input 
                v-model.number="selectedElement.height" 
                type="number" 
                class="input input-bordered input-sm"
                @input="updateElement(selectedElement)"
              />
            </div>
          </div>

          <!-- 样式属性 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">字体大小</span>
            </label>
            <input 
              v-model.number="selectedElement.fontSize" 
              type="number" 
              class="input input-bordered input-sm"
              @input="updateElement(selectedElement)"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">颜色</span>
            </label>
            <input 
              v-model="selectedElement.color" 
              type="color" 
              class="input input-bordered input-sm h-10"
              @input="updateElement(selectedElement)"
            />
          </div>

          <!-- 层级控制 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">层级</span>
            </label>
            <div class="flex space-x-2">
              <button 
                @click="moveElementUp(selectedElement.id)"
                class="btn btn-sm btn-outline"
                :disabled="!canMoveUp(selectedElement.id)"
              >
                上移
              </button>
              <button 
                @click="moveElementDown(selectedElement.id)"
                class="btn btn-sm btn-outline"
                :disabled="!canMoveDown(selectedElement.id)"
              >
                下移
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center text-base-content/60 py-8">
          选择一个元素来编辑属性
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useCanvasStore } from '../stores/canvas'

// 类型定义
interface CanvasElement {
  id: string
  type: string
  name: string
  icon: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  color: string
  zIndex: number
  properties: Record<string, any>
}

interface ElementCategory {
  id: string
  name: string
  elements: CanvasElement[]
}

interface SelectionBox {
  startX: number
  startY: number
  endX: number
  endY: number
}

// 响应式数据
const canvasStore = useCanvasStore()
const canvasContainer = ref<HTMLElement>()
const selectedElement = ref<CanvasElement | null>(null)
const isDragging = ref(false)
const dragStartPos = reactive({ x: 0, y: 0 })
const selectionBox = ref<SelectionBox | null>(null)
const isSaving = ref(false)

// 元素分类数据
const elementCategories = ref<ElementCategory[]>([
  {
    id: 'basic',
    name: '基础元素',
    elements: [
      { id: 'text', type: 'text', name: '文本', icon: 'T', x: 0, y: 0, width: 100, height: 50, fontSize: 16, color: '#000000', zIndex: 1, properties: {} },
      { id: 'image', type: 'image', name: '图片', icon: '🖼️', x: 0, y: 0, width: 100, height: 100, fontSize: 16, color: '#000000', zIndex: 1, properties: {} },
      { id: 'shape', type: 'shape', name: '形状', icon: '⬜', x: 0, y: 0, width: 100, height: 100, fontSize: 16, color: '#000000', zIndex: 1, properties: {} }
    ]
  },
  {
    id: 'media',
    name: '媒体元素',
    elements: [
      { id: 'video', type: 'video', name: '视频', icon: '🎥', x: 0, y: 0, width: 200, height: 150, fontSize: 16, color: '#000000', zIndex: 1, properties: {} },
      { id: 'audio', type: 'audio', name: '音频', icon: '🎵', x: 0, y: 0, width: 100, height: 50, fontSize: 16, color: '#000000', zIndex: 1, properties: {} }
    ]
  }
])

// 计算属性
const canvasElements = computed(() => canvasStore.elements)
const canUndo = computed(() => canvasStore.canUndo)
const canRedo = computed(() => canvasStore.canRedo)

const selectionBoxStyle = computed(() => {
  if (!selectionBox.value) return {}
  
  const { startX, startY, endX, endY } = selectionBox.value
  const left = Math.min(startX, endX)
  const top = Math.min(startY, endY)
  const width = Math.abs(endX - startX)
  const height = Math.abs(endY - startY)
  
  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`
  }
})

// 方法
const selectElement = (element: CanvasElement) => {
  selectedElement.value = element
  // 触发自定义事件通知父组件
  emit('element-selected', element)
}

const deselectElement = () => {
  selectedElement.value = null
  emit('element-deselected')
}

const updateElement = (element: CanvasElement) => {
  canvasStore.updateElement(element)
  emit('element-updated', element)
}

const deleteElement = (elementId: string) => {
  canvasStore.deleteElement(elementId)
  if (selectedElement.value?.id === elementId) {
    selectedElement.value = null
  }
  emit('element-deleted', elementId)
}

const onDragStart = (event: DragEvent, element: CanvasElement) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(element))
    event.dataTransfer.effectAllowed = 'copy'
  }
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  
  if (!event.dataTransfer) return
  
  const elementData = event.dataTransfer.getData('application/json')
  if (!elementData) return
  
  const element = JSON.parse(elementData)
  const rect = canvasContainer.value?.getBoundingClientRect()
  
  if (rect) {
    const newElement: CanvasElement = {
      ...element,
      id: `element_${Date.now()}`,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
    
    canvasStore.addElement(newElement)
    selectElement(newElement)
    emit('element-added', newElement)
  }
}

const startDrag = (event: MouseEvent, element: CanvasElement) => {
  if (event.button !== 0) return // 只处理左键
  
  isDragging.value = true
  dragStartPos.x = event.clientX - element.x
  dragStartPos.y = event.clientY - element.y
  
  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return
    
    const rect = canvasContainer.value?.getBoundingClientRect()
    if (rect) {
      element.x = e.clientX - dragStartPos.x
      element.y = e.clientY - dragStartPos.y
      updateElement(element)
    }
  }
  
  const onMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const getElementStyle = (element: CanvasElement) => {
  return {
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    fontSize: `${element.fontSize}px`,
    color: element.color,
    zIndex: element.zIndex
  }
}

const moveElementUp = (elementId: string) => {
  canvasStore.moveElementUp(elementId)
}

const moveElementDown = (elementId: string) => {
  canvasStore.moveElementDown(elementId)
}

const canMoveUp = (elementId: string) => {
  return canvasStore.canMoveElementUp(elementId)
}

const canMoveDown = (elementId: string) => {
  return canvasStore.canMoveElementDown(elementId)
}

const undo = () => {
  canvasStore.undo()
}

const redo = () => {
  canvasStore.redo()
}

const saveCanvas = async () => {
  isSaving.value = true
  try {
    await canvasStore.saveCanvas()
    emit('canvas-saved')
  } catch (error) {
    console.error('保存失败:', error)
    emit('save-error', error)
  } finally {
    isSaving.value = false
  }
}

const exportCanvas = () => {
  const data = canvasStore.exportCanvas()
  emit('canvas-exported', data)
}

// 事件发射
const emit = defineEmits<{
  'element-selected': [element: CanvasElement]
  'element-deselected': []
  'element-updated': [element: CanvasElement]
  'element-deleted': [elementId: string]
  'element-added': [element: CanvasElement]
  'canvas-saved': []
  'save-error': [error: any]
  'canvas-exported': [data: any]
}>()

// 监听画布变化，同步到左侧列表
watch(canvasElements, (newElements) => {
  // 更新左侧列表中的元素状态
  elementCategories.value.forEach(category => {
    category.elements.forEach(element => {
      const canvasElement = newElements.find(e => e.type === element.type)
      if (canvasElement) {
        element.properties = canvasElement.properties
      }
    })
  })
}, { deep: true })

// 生命周期
onMounted(() => {
  // 初始化画布
  canvasStore.initializeCanvas()
})

onUnmounted(() => {
  // 清理资源
  canvasStore.cleanup()
})
</script>

<style scoped>
.canvas-container {
  background-image: 
    linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>

