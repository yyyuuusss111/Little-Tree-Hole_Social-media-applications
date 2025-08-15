// @ts-check
// 目前的dev就是本机,非dev就是vercel
global.isDev = process.env.NODE_ENV === 'development'

// 确保在加载其他模块之前加载环境变量
require('dotenv').config()

const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const routes = require('./routes')
const en = require('./locales/en')
const zh = require('./locales/zh')

// 初始化本地服务
const localAuth = require('./services/local-auth')
const localStorage = require('./services/local-storage')

global.i18n = {
  en,
  zh
}

// 将本地服务添加到全局对象
global.localAuth = localAuth
global.localStorage = localStorage

const app = express()
const PORT = process.env.PORT || 13000

// 中间件设置
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(cookieParser())

// 会话中间件
app.use(async (req, res, next) => {
  // 从cookie中获取会话ID
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id']
  
  if (sessionId) {
    try {
      // 验证会话
      const user = await localAuth.verifySession(sessionId)
      if (user) {
        req.user = user
        req.sessionId = sessionId
      }
    } catch (error) {
      console.error('会话验证失败:', error)
    }
  }
  next()
})

// 路由
app.use('/', routes)

module.exports = app // vercel的@vercel/node需要, 且不需要listen

if (global.isDev) {
  // 调试用
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`)
    console.log('使用本地存储模式')
    console.log('环境变量检查完成')
  })
}
