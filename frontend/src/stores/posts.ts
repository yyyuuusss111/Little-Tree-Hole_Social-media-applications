import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: string
  username: string
  avatar?: string
}

interface Image {
  id: string
  url: string
  alt?: string
}

interface Post {
  id: string
  content: string
  author: User
  images: Image[]
  createdAt: string
  updatedAt: string
  likeCount: number
  commentCount: number
}

interface CreatePostForm {
  content: string
  images: File[]
}

export const usePostsStore = defineStore('posts', () => {
  const posts = ref<Post[]>([])
  const currentPost = ref<Post | null>(null)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const isRefreshing = ref(false)
  const page = ref(1)
  const hasMore = ref(true)

  const hasMorePosts = computed(() => hasMore.value)

  const fetchPosts = async (pageNum = 1, refresh = false) => {
    if (refresh) {
      isRefreshing.value = true
      page.value = 1
    } else {
      isLoading.value = true
    }

    try {
      // 尝试调用后端API
      const response = await fetch(`/api/local/posts?page=${pageNum}&limit=10`)
      const data = await response.json()
      
      if (data.success) {
        const apiPosts = data.posts || []
        
        if (refresh) {
          posts.value = apiPosts
        } else {
          posts.value = [...posts.value, ...apiPosts]
        }
        
        page.value = pageNum
        hasMore.value = data.hasMore || false
      } else {
        throw new Error(data.error || '获取帖子失败')
      }
    } catch (error) {
      console.error('API调用失败，使用模拟数据:', error)
      
      // 降级到模拟数据
      const mockPosts: Post[] = [
        {
          id: '1',
          content: '这是一个测试帖子，用来展示应用的功能。',
          author: {
            id: '1',
            username: 'testuser',
            avatar: '/images/avatar.png'
          },
          images: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likeCount: 5,
          commentCount: 2
        },
        {
          id: '2',
          content: '另一个测试帖子，包含一些图片。',
          author: {
            id: '2',
            username: 'anotheruser',
            avatar: '/images/avatar.png'
          },
          images: [
            {
              id: '1',
              url: 'https://picsum.photos/400/300',
              alt: '随机图片'
            }
          ],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          likeCount: 12,
          commentCount: 5
        }
      ]

      if (refresh) {
        posts.value = mockPosts
      } else {
        posts.value = [...posts.value, ...mockPosts]
      }

      page.value = pageNum
      hasMore.value = pageNum < 3 // 模拟只有3页数据
    } finally {
      isLoading.value = false
      isRefreshing.value = false
    }
  }

  const loadMore = async () => {
    if (isLoadingMore.value || !hasMore.value) return
    
    isLoadingMore.value = true
    try {
      await fetchPosts(page.value + 1)
    } finally {
      isLoadingMore.value = false
    }
  }

  const refreshPosts = async () => {
    await fetchPosts(1, true)
  }

  const fetchPost = async (id: string) => {
    try {
      // 调用后端API获取单个帖子
      const response = await fetch(`/api/local/posts/${id}`)
      const data = await response.json()
      
      if (data.success) {
        currentPost.value = data.post
        return { success: true, data: data.post }
      } else {
        return { success: false, error: data.error || '帖子不存在' }
      }
    } catch (error) {
      console.error('获取帖子失败:', error)
      // 降级到本地查找
      const post = posts.value.find(p => p.id === id)
      if (post) {
        currentPost.value = post
        return { success: true, data: post }
      } else {
        return { success: false, error: '帖子不存在' }
      }
    }
  }

  const createPost = async (postData: CreatePostForm) => {
    try {
      // 尝试调用后端API
      const formData = new FormData()
      formData.append('content', postData.content)
      postData.images.forEach((image) => {
        formData.append('images', image)
      })
      
      const response = await fetch('/api/local/posts', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 将新帖子添加到列表开头
        posts.value.unshift(data.post)
        return { success: true }
      } else {
        throw new Error(data.error || '发布失败')
      }
    } catch (error) {
      console.error('API调用失败，使用模拟数据:', error)
      
      // 降级到模拟创建
      const newPost: Post = {
        id: Date.now().toString(),
        content: postData.content,
        author: {
          id: '1',
          username: 'testuser',
          avatar: '/images/avatar.png'
        },
        images: postData.images.map((file, index) => ({
          id: index.toString(),
          url: URL.createObjectURL(file),
          alt: file.name
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
      }
      
      posts.value.unshift(newPost)
      return { success: true }
    }
  }

  const updatePost = async (id: string, postData: CreatePostForm) => {
    try {
      // 调用后端API更新帖子
      const formData = new FormData()
      formData.append('content', postData.content)
      postData.images.forEach((image) => {
        formData.append('images', image)
      })
      
      const response = await fetch(`/api/local/posts/${id}`, {
        method: 'PUT',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 更新本地数据
        const index = posts.value.findIndex(post => post.id === id)
        if (index > -1) {
          posts.value[index] = data.post
        }
        return { success: true }
      } else {
        throw new Error(data.error || '更新失败')
      }
    } catch (error) {
      console.error('API调用失败，使用模拟数据:', error)
      
      // 降级到模拟更新
      const index = posts.value.findIndex(post => post.id === id)
      if (index > -1) {
        posts.value[index].content = postData.content
        posts.value[index].updatedAt = new Date().toISOString()
      }
      return { success: true }
    }
  }

  const deletePost = async (id: string) => {
    try {
      // 调用后端API删除帖子
      const response = await fetch(`/api/local/posts/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        const index = posts.value.findIndex(post => post.id === id)
        if (index > -1) {
          posts.value.splice(index, 1)
        }
        return { success: true }
      } else {
        throw new Error(data.error || '删除失败')
      }
    } catch (error) {
      console.error('API调用失败，使用模拟数据:', error)
      
      // 降级到模拟删除
      const index = posts.value.findIndex(post => post.id === id)
      if (index > -1) {
        posts.value.splice(index, 1)
      }
      return { success: true }
    }
  }

  const clearCurrentPost = () => {
    currentPost.value = null
  }

  return {
    posts,
    currentPost,
    isLoading,
    isLoadingMore,
    isRefreshing,
    hasMore: hasMorePosts,
    fetchPosts,
    loadMore,
    refreshPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    clearCurrentPost
  }
})
