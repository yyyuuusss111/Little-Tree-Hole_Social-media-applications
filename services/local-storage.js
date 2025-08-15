const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

/**
 * 本地数据存储服务
 * 实现帖子、评论的本地存储，数据存储在JSON文件中
 */
class LocalStorageService {
  constructor() {
    this.dataDir = path.join(__dirname, '../data')
    this.postsFile = path.join(this.dataDir, 'posts.json')
    this.commentsFile = path.join(this.dataDir, 'comments.json')
    
    this.ensureDataDirectory()
    this.loadData()
  }

  /**
   * 确保数据目录存在
   */
  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true })
    }
  }

  /**
   * 加载数据
   */
  loadData() {
    try {
      // 加载帖子数据
      if (fs.existsSync(this.postsFile)) {
        const data = fs.readFileSync(this.postsFile, 'utf8')
        this.posts = JSON.parse(data)
      } else {
        this.posts = []
        this.savePosts()
      }

      // 加载评论数据
      if (fs.existsSync(this.commentsFile)) {
        const data = fs.readFileSync(this.commentsFile, 'utf8')
        this.comments = JSON.parse(data)
      } else {
        this.comments = []
        this.saveComments()
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      this.posts = []
      this.comments = []
    }
  }

  /**
   * 保存帖子数据
   */
  savePosts() {
    try {
      fs.writeFileSync(this.postsFile, JSON.stringify(this.posts, null, 2))
    } catch (error) {
      console.error('保存帖子数据失败:', error)
    }
  }

  /**
   * 保存评论数据
   */
  saveComments() {
    try {
      fs.writeFileSync(this.commentsFile, JSON.stringify(this.comments, null, 2))
    } catch (error) {
      console.error('保存评论数据失败:', error)
    }
  }

  /**
   * 生成ID
   */
  generateId() {
    return crypto.randomBytes(16).toString('hex')
  }

  // ==================== 帖子相关操作 ====================

  /**
   * 创建帖子
   */
  async createPost(content, authorId, images = []) {
    const post = {
      id: this.generateId(),
      content,
      authorId,
      images,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.posts.unshift(post) // 添加到开头
    this.savePosts()

    return post
  }

  /**
   * 获取帖子列表
   */
  async getPosts(page = 1, limit = 10, authorId = null) {
    let filteredPosts = this.posts

    // 如果指定了作者，过滤帖子
    if (authorId) {
      filteredPosts = this.posts.filter(post => post.authorId === authorId)
    }

    // 分页
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedPosts = filteredPosts.slice(start, end)

    return {
      posts: paginatedPosts,
      total: filteredPosts.length,
      page,
      limit,
      hasMore: end < filteredPosts.length
    }
  }

  /**
   * 获取单个帖子
   */
  async getPostById(postId) {
    return this.posts.find(post => post.id === postId) || null
  }

  /**
   * 更新帖子
   */
  async updatePost(postId, updates) {
    const postIndex = this.posts.findIndex(post => post.id === postId)
    if (postIndex === -1) {
      throw new Error('帖子不存在')
    }

    this.posts[postIndex] = {
      ...this.posts[postIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.savePosts()
    return this.posts[postIndex]
  }

  /**
   * 删除帖子
   */
  async deletePost(postId) {
    const postIndex = this.posts.findIndex(post => post.id === postId)
    if (postIndex === -1) {
      throw new Error('帖子不存在')
    }

    // 删除帖子
    this.posts.splice(postIndex, 1)
    this.savePosts()

    // 删除相关评论
    this.comments = this.comments.filter(comment => comment.postId !== postId)
    this.saveComments()

    return true
  }

  // ==================== 评论相关操作 ====================

  /**
   * 创建评论
   */
  async createComment(content, postId, authorId) {
    const comment = {
      id: this.generateId(),
      content,
      postId,
      authorId,
      createdAt: new Date().toISOString()
    }

    this.comments.push(comment)
    this.saveComments()

    // 更新帖子评论数
    const postIndex = this.posts.findIndex(post => post.id === postId)
    if (postIndex !== -1) {
      this.posts[postIndex].commentCount = this.comments.filter(c => c.postId === postId).length
      this.savePosts()
    }

    return comment
  }

  /**
   * 获取帖子评论
   */
  async getComments(postId, page = 1, limit = 10) {
    const postComments = this.comments.filter(comment => comment.postId === postId)
    
    // 按时间排序
    postComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

    // 分页
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedComments = postComments.slice(start, end)

    return {
      comments: paginatedComments,
      total: postComments.length,
      page,
      limit,
      hasMore: end < postComments.length
    }
  }

  /**
   * 更新评论
   */
  async updateComment(commentId, updates) {
    const commentIndex = this.comments.findIndex(comment => comment.id === commentId)
    if (commentIndex === -1) {
      throw new Error('评论不存在')
    }

    this.comments[commentIndex] = {
      ...this.comments[commentIndex],
      ...updates
    }

    this.saveComments()
    return this.comments[commentIndex]
  }

  /**
   * 删除评论
   */
  async deleteComment(commentId) {
    const commentIndex = this.comments.findIndex(comment => comment.id === commentId)
    if (commentIndex === -1) {
      throw new Error('评论不存在')
    }

    const comment = this.comments[commentIndex]
    this.comments.splice(commentIndex, 1)
    this.saveComments()

    // 更新帖子评论数
    const postIndex = this.posts.findIndex(post => post.id === comment.postId)
    if (postIndex !== -1) {
      this.posts[postIndex].commentCount = this.comments.filter(c => c.postId === comment.postId).length
      this.savePosts()
    }

    return true
  }

  // ==================== 统计和工具方法 ====================

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalPosts: this.posts.length,
      totalComments: this.comments.length,
      totalAuthors: new Set(this.posts.map(p => p.authorId)).size,
      totalCommenters: new Set(this.comments.map(c => c.authorId)).size
    }
  }

  /**
   * 搜索帖子
   */
  async searchPosts(query, page = 1, limit = 10) {
    const searchResults = this.posts.filter(post => 
      post.content.toLowerCase().includes(query.toLowerCase())
    )

    const start = (page - 1) * limit
    const end = start + limit
    const paginatedResults = searchResults.slice(start, end)

    return {
      posts: paginatedResults,
      total: searchResults.length,
      page,
      limit,
      hasMore: end < searchResults.length
    }
  }

  /**
   * 获取热门帖子（按评论数排序）
   */
  async getPopularPosts(limit = 10) {
    const sortedPosts = [...this.posts].sort((a, b) => b.commentCount - a.commentCount)
    return sortedPosts.slice(0, limit)
  }

  /**
   * 备份数据
   */
  async backupData() {
    const backupDir = path.join(this.dataDir, 'backup')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    // 备份帖子数据
    const postsBackup = path.join(backupDir, `posts-${timestamp}.json`)
    fs.writeFileSync(postsBackup, JSON.stringify(this.posts, null, 2))

    // 备份评论数据
    const commentsBackup = path.join(backupDir, `comments-${timestamp}.json`)
    fs.writeFileSync(commentsBackup, JSON.stringify(this.comments, null, 2))

    return {
      postsBackup,
      commentsBackup,
      timestamp
    }
  }

  /**
   * 清理旧数据
   */
  async cleanupOldData(daysToKeep = 30) {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
    
    // 清理旧帖子
    const oldPostsCount = this.posts.length
    this.posts = this.posts.filter(post => new Date(post.createdAt) > cutoffDate)
    
    // 清理旧评论
    const oldCommentsCount = this.comments.length
    this.comments = this.comments.filter(comment => new Date(comment.createdAt) > cutoffDate)
    
    this.savePosts()
    this.saveComments()

    return {
      removedPosts: oldPostsCount - this.posts.length,
      removedComments: oldCommentsCount - this.comments.length
    }
  }
}

// 创建单例实例
const localStorage = new LocalStorageService()

module.exports = localStorage
