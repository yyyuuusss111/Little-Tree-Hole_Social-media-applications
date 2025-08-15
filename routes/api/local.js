const { Router } = require('express')
const router = Router()

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: '请填写所有必填字段' })
    }

    // 检查邮箱是否已存在
    const existingUser = await global.localAuth.getUserByEmail(email)
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' })
    }

    const user = await global.localAuth.register(username, email, password)
    
    res.json({ success: true, user })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: '请填写邮箱和密码' })
    }

    const result = await global.localAuth.login(email, password)
    
    // 设置cookie
    res.cookie('sessionId', result.sessionId, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      secure: false, // 开发环境设为false
      sameSite: 'lax'
    })
    
    res.json({ success: true, user: result.user, token: result.sessionId })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// 用户登出
router.post('/logout', async (req, res) => {
  try {
    if (req.sessionId) {
      await global.localAuth.logout(req.sessionId)
    }
    
    // 清除cookie
    res.clearCookie('sessionId')
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 获取当前用户信息
router.get('/user', (req, res) => {
  if (req.user) {
    res.json({ success: true, user: req.user })
  } else {
    res.status(401).json({ error: '未登录' })
  }
})

// 获取当前用户信息 (auth/me)
router.get('/auth/me', (req, res) => {
  if (req.user) {
    res.json({ success: true, user: req.user })
  } else {
    res.status(401).json({ error: '未登录' })
  }
})

// 创建帖子
router.post('/posts', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '请先登录' })
    }

    const { content, images = [] } = req.body
    
    if (!content) {
      return res.status(400).json({ error: '请填写帖子内容' })
    }

    const post = await global.localStorage.createPost(content, req.user.id, images)
    
    // 获取作者信息
    const author = await global.localAuth.getUserById(post.authorId)
    const postWithAuthor = {
      ...post,
      author: author ? {
        id: author.id,
        username: author.username,
        email: author.email
      } : {
        id: 'unknown',
        username: '未知用户',
        email: 'unknown@example.com'
      }
    }
    
    res.json({ success: true, post: postWithAuthor })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 获取帖子列表
router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10, authorId } = req.query
    
    const result = await global.localStorage.getPosts(parseInt(page), parseInt(limit), authorId)
    
    // 为每个帖子添加作者信息
    const postsWithAuthors = await Promise.all(
      result.posts.map(async (post) => {
        const author = await global.localAuth.getUserById(post.authorId)
        return {
          ...post,
          author: author ? {
            id: author.id,
            username: author.username,
            email: author.email
          } : {
            id: 'unknown',
            username: '未知用户',
            email: 'unknown@example.com'
          }
        }
      })
    )
    
    res.json({
      success: true,
      posts: postsWithAuthors,
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 获取单个帖子
router.get('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params
    
    const post = await global.localStorage.getPostById(postId)
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' })
    }
    
    // 获取作者信息
    const author = await global.localAuth.getUserById(post.authorId)
    const postWithAuthor = {
      ...post,
      author: author ? {
        id: author.id,
        username: author.username,
        email: author.email
      } : {
        id: 'unknown',
        username: '未知用户',
        email: 'unknown@example.com'
      }
    }
    
    res.json({ success: true, post: postWithAuthor })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 更新帖子
router.put('/posts/:postId', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '请先登录' })
    }

    const { postId } = req.params
    const { content, images = [] } = req.body
    
    if (!content) {
      return res.status(400).json({ error: '请填写帖子内容' })
    }

    const post = await global.localStorage.getPostById(postId)
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' })
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ error: '无权限编辑此帖子' })
    }

    const updatedPost = await global.localStorage.updatePost(postId, { content, images })
    
    // 获取作者信息
    const author = await global.localAuth.getUserById(updatedPost.authorId)
    const postWithAuthor = {
      ...updatedPost,
      author: author ? {
        id: author.id,
        username: author.username,
        email: author.email
      } : {
        id: 'unknown',
        username: '未知用户',
        email: 'unknown@example.com'
      }
    }
    
    res.json({ success: true, post: postWithAuthor })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 删除帖子
router.delete('/posts/:postId', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '请先登录' })
    }

    const { postId } = req.params
    
    const post = await global.localStorage.getPostById(postId)
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' })
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ error: '无权限删除此帖子' })
    }

    await global.localStorage.deletePost(postId)
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 点赞帖子
router.post('/posts/:postId/like', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '请先登录' })
    }

    const { postId } = req.params
    
    // 这里可以实现点赞逻辑
    // 暂时返回成功
    res.json({ success: true, likeCount: 1 })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 创建评论
router.post('/comments', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '请先登录' })
    }

    const { content, postId } = req.body
    
    if (!content || !postId) {
      return res.status(400).json({ error: '请填写评论内容和帖子ID' })
    }

    const comment = await global.localStorage.createComment(content, postId, req.user.id)
    
    // 获取作者信息
    const author = await global.localAuth.getUserById(comment.authorId)
    const commentWithAuthor = {
      ...comment,
      author: author ? {
        id: author.id,
        username: author.username,
        email: author.email
      } : {
        id: 'unknown',
        username: '未知用户',
        email: 'unknown@example.com'
      }
    }
    
    res.json({ success: true, comment: commentWithAuthor })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 获取帖子评论
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params
    const { page = 1, limit = 10 } = req.query
    
    const result = await global.localStorage.getComments(postId, parseInt(page), parseInt(limit))
    
    // 为每个评论添加作者信息
    const commentsWithAuthors = await Promise.all(
      result.comments.map(async (comment) => {
        const author = await global.localAuth.getUserById(comment.authorId)
        return {
          ...comment,
          author: author ? {
            id: author.id,
            username: author.username,
            email: author.email
          } : {
            id: 'unknown',
            username: '未知用户',
            email: 'unknown@example.com'
          }
        }
      })
    )
    
    res.json({
      success: true,
      comments: commentsWithAuthors,
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 获取统计信息
router.get('/stats', (req, res) => {
  try {
    const authStats = global.localAuth.getStats()
    const storageStats = global.localStorage.getStats()
    
    res.json({
      success: true,
      stats: {
        users: authStats,
        posts: storageStats
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
