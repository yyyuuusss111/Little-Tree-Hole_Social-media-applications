const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

/**
 * 本地用户认证服务
 * 实现用户注册、登录、登出功能，数据存储在本地JSON文件中
 */
class LocalAuthService {
  constructor() {
    this.usersFile = path.join(__dirname, '../data/users.json')
    this.sessionsFile = path.join(__dirname, '../data/sessions.json')
    this.ensureDataDirectory()
    this.loadUsers()
    this.loadSessions()
  }

  /**
   * 确保数据目录存在
   */
  ensureDataDirectory() {
    const dataDir = path.join(__dirname, '../data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
  }

  /**
   * 加载用户数据
   */
  loadUsers() {
    try {
      if (fs.existsSync(this.usersFile)) {
        const data = fs.readFileSync(this.usersFile, 'utf8')
        this.users = JSON.parse(data)
      } else {
        this.users = []
        this.saveUsers()
      }
    } catch (error) {
      console.error('加载用户数据失败:', error)
      this.users = []
    }
  }

  /**
   * 保存用户数据
   */
  saveUsers() {
    try {
      fs.writeFileSync(this.usersFile, JSON.stringify(this.users, null, 2))
    } catch (error) {
      console.error('保存用户数据失败:', error)
    }
  }

  /**
   * 加载会话数据
   */
  loadSessions() {
    try {
      if (fs.existsSync(this.sessionsFile)) {
        const data = fs.readFileSync(this.sessionsFile, 'utf8')
        this.sessions = JSON.parse(data)
      } else {
        this.sessions = {}
        this.saveSessions()
      }
    } catch (error) {
      console.error('加载会话数据失败:', error)
      this.sessions = {}
    }
  }

  /**
   * 保存会话数据
   */
  saveSessions() {
    try {
      fs.writeFileSync(this.sessionsFile, JSON.stringify(this.sessions, null, 2))
    } catch (error) {
      console.error('保存会话数据失败:', error)
    }
  }

  /**
   * 生成密码哈希
   */
  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex')
  }

  /**
   * 生成会话ID
   */
  generateSessionId() {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * 用户注册
   */
  async register(username, email, password) {
    // 检查用户名是否已存在
    if (this.users.find(user => user.username === username)) {
      throw new Error('用户名已存在')
    }

    // 检查邮箱是否已存在
    if (this.users.find(user => user.email === email)) {
      throw new Error('邮箱已被注册')
    }

    // 创建新用户
    const newUser = {
      id: crypto.randomBytes(16).toString('hex'),
      username,
      email,
      password: this.hashPassword(password),
      createdAt: new Date().toISOString(),
      isVerified: true // 本地版本默认已验证
    }

    this.users.push(newUser)
    this.saveUsers()

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = newUser
    return userInfo
  }

  /**
   * 用户登录
   */
  async login(username, password) {
    const user = this.users.find(u => 
      u.username === username || u.email === username
    )

    if (!user) {
      throw new Error('用户不存在')
    }

    if (user.password !== this.hashPassword(password)) {
      throw new Error('密码错误')
    }

    // 生成会话
    const sessionId = this.generateSessionId()
    const session = {
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7天过期
    }

    this.sessions[sessionId] = session
    this.saveSessions()

    // 返回用户信息和会话ID
    const { password: _, ...userInfo } = user
    return {
      user: userInfo,
      sessionId
    }
  }

  /**
   * 验证会话
   */
  async verifySession(sessionId) {
    const session = this.sessions[sessionId]
    
    if (!session) {
      return null
    }

    // 检查会话是否过期
    if (new Date(session.expiresAt) < new Date()) {
      delete this.sessions[sessionId]
      this.saveSessions()
      return null
    }

    // 查找用户
    const user = this.users.find(u => u.id === session.userId)
    if (!user) {
      delete this.sessions[sessionId]
      this.saveSessions()
      return null
    }

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user
    return userInfo
  }

  /**
   * 用户登出
   */
  async logout(sessionId) {
    if (this.sessions[sessionId]) {
      delete this.sessions[sessionId]
      this.saveSessions()
    }
    return true
  }

  /**
   * 获取用户信息
   */
  async getUserById(userId) {
    const user = this.users.find(u => u.id === userId)
    if (!user) {
      return null
    }
    
    const { password: _, ...userInfo } = user
    return userInfo
  }

  /**
   * 根据邮箱获取用户信息
   */
  async getUserByEmail(email) {
    const user = this.users.find(u => u.email === email)
    if (!user) {
      return null
    }
    
    const { password: _, ...userInfo } = user
    return userInfo
  }

  /**
   * 更新用户信息
   */
  async updateUser(userId, updates) {
    const userIndex = this.users.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      throw new Error('用户不存在')
    }

    // 不允许更新敏感字段
    const { password, id, createdAt, ...safeUpdates } = updates
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...safeUpdates
    }

    this.saveUsers()

    const { password: _, ...userInfo } = this.users[userIndex]
    return userInfo
  }

  /**
   * 清理过期会话
   */
  cleanupExpiredSessions() {
    const now = new Date()
    let cleaned = 0

    Object.keys(this.sessions).forEach(sessionId => {
      const session = this.sessions[sessionId]
      if (new Date(session.expiresAt) < now) {
        delete this.sessions[sessionId]
        cleaned++
      }
    })

    if (cleaned > 0) {
      this.saveSessions()
      console.log(`清理了 ${cleaned} 个过期会话`)
    }
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalUsers: this.users.length,
      activeSessions: Object.keys(this.sessions).length,
      verifiedUsers: this.users.filter(u => u.isVerified).length
    }
  }
}

// 创建单例实例
const localAuth = new LocalAuthService()

// 定期清理过期会话（每小时执行一次）
setInterval(() => {
  localAuth.cleanupExpiredSessions()
}, 60 * 60 * 1000)

module.exports = localAuth
