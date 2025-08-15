const { Router } = require('express')
const pageRoutes = require('./page')
const apiRoutes = require('./api')
const localApiRoutes = require('./api/local')

const router = Router()

// 本地API路由
router.use('/api/local', localApiRoutes)

// API 路由
router.use('/api', apiRoutes)

// 页面路由
router.use('/', pageRoutes)

module.exports = router