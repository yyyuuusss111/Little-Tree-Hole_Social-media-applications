const { Router } = require('express')

const router = Router()

// 默认英文
router.use('/*', (req, res, next) => {
  req.locale = 'en'
  next()
})

// 注意：所有API功能已迁移到 /api/local 路由
// 这里保留空的API路由以保持兼容性

module.exports = router
