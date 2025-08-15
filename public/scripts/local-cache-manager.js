/**
 * 本地缓存管理器
 * 管理本地存储的缓存数据，替代旧的AppStorage和LC.Cache
 */

const LocalCacheManager = {
  // 缓存键名
  KEYS: {
    USER: 'currentUser',
    POSTS: 'cachedPosts',
    COMMENTS: 'cachedComments',
    TEMP_DATA: 'tempData',
    APP_DATA: 'appData'
  },

  /**
   * 获取缓存统计信息
   */
  async getStats() {
    try {
      const stats = {
        user: false,
        postsCount: 0,
        commentsCount: 0,
        tempDataCount: 0
      }

      // 检查用户缓存
      const userData = localStorage.getItem(this.KEYS.USER)
      stats.user = !!userData

      // 从服务器获取实际的帖子数量
      try {
        const postsResponse = await fetch('/api/local/posts?page=1&limit=1000')
        if (postsResponse.ok) {
          const postsData = await postsResponse.json()
          if (postsData.success) {
            stats.postsCount = postsData.total || 0
          }
        }
      } catch (e) {
        console.log('获取帖子统计失败，使用默认值')
      }

      // 从服务器获取实际的评论数量
      try {
        // 获取所有帖子的评论总数
        const postsResponse = await fetch('/api/local/posts?page=1&limit=1000')
        if (postsResponse.ok) {
          const postsData = await postsResponse.json()
          if (postsData.success && postsData.posts) {
            let totalComments = 0
            for (const post of postsData.posts) {
              totalComments += post.commentCount || 0
            }
            stats.commentsCount = totalComments
          }
        }
      } catch (e) {
        console.log('获取评论统计失败，使用默认值')
      }

      // 检查临时数据
      const tempData = localStorage.getItem(this.KEYS.TEMP_DATA)
      if (tempData) {
        try {
          const temp = JSON.parse(tempData)
          stats.tempDataCount = Object.keys(temp).length
        } catch (e) {
          stats.tempDataCount = 0
        }
      }

      return stats
    } catch (error) {
      console.error('获取缓存统计失败:', error)
      return {
        user: false,
        postsCount: 0,
        commentsCount: 0,
        tempDataCount: 0
      }
    }
  },

  /**
   * 清除用户缓存
   */
  clearUser() {
    localStorage.removeItem(this.KEYS.USER)
    console.log('用户缓存已清除')
  },

  /**
   * 清除帖子缓存
   */
  clearPosts() {
    localStorage.removeItem(this.KEYS.POSTS)
    console.log('帖子缓存已清除')
  },

  /**
   * 清除评论缓存
   */
  clearComments() {
    localStorage.removeItem(this.KEYS.COMMENTS)
    console.log('评论缓存已清除')
  },

  /**
   * 清除临时数据
   */
  clearTempData() {
    localStorage.removeItem(this.KEYS.TEMP_DATA)
    console.log('临时数据已清除')
  },

  /**
   * 清除所有缓存
   */
  clearAll() {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    console.log('所有缓存已清除')
  },

  /**
   * 获取localStorage使用情况
   */
  getLocalStorageInfo() {
    try {
      const info = {
        size: '0 KB',
        lastUpdateTime: '无数据',
        status: '无缓存'
      }

      // 计算所有缓存数据的总大小
      let totalSize = 0
      let hasData = false
      let latestTimestamp = 0

      Object.values(this.KEYS).forEach(key => {
        const data = localStorage.getItem(key)
        if (data) {
          hasData = true
          totalSize += new Blob([data]).size
          
          // 尝试解析时间戳
          try {
            const parsed = JSON.parse(data)
            if (parsed.timestamp && parsed.timestamp > latestTimestamp) {
              latestTimestamp = parsed.timestamp
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      })

      if (hasData) {
        info.size = `${(totalSize / 1024).toFixed(2)} KB`
        info.lastUpdateTime = latestTimestamp > 0 
          ? new Date(latestTimestamp).toLocaleString() 
          : '未知'
        info.status = '正常'
      }

      return info
    } catch (error) {
      console.error('获取localStorage信息失败:', error)
      return {
        size: '获取失败',
        lastUpdateTime: '获取失败',
        status: '异常'
      }
    }
  },

  /**
   * 获取缓存的帖子数据
   */
  getCachedPosts() {
    try {
      const data = localStorage.getItem(this.KEYS.POSTS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('获取缓存的帖子数据失败:', error)
      return []
    }
  },

  /**
   * 获取缓存的评论数据
   */
  getCachedComments() {
    try {
      const data = localStorage.getItem(this.KEYS.COMMENTS)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('获取缓存的评论数据失败:', error)
      return {}
    }
  },

  /**
   * 获取临时数据
   */
  getTempData() {
    try {
      const data = localStorage.getItem(this.KEYS.TEMP_DATA)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('获取临时数据失败:', error)
      return {}
    }
  }
}

// 导出到全局
window.LocalCacheManager = LocalCacheManager
