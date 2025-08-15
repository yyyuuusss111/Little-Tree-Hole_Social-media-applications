# 🌟 NaturalIdyllicCalmEscape - 全栈社交媒体应用

一个基于 Vue3 + Node.js 的现代化社交媒体应用，支持用户注册、发布帖子、评论互动等功能。

## 📋 项目概述

### 🎯 功能特性
- ✅ 用户认证系统（注册、登录、登出）
- ✅ 帖子发布与管理
- ✅ 评论系统
- ✅ 点赞功能
- ✅ 个人资料管理
- ✅ 缓存管理系统
- ✅ 响应式设计
- ✅ 实时数据更新

### 🏗️ 技术架构
- **前端**: Vue 3 + TypeScript + Vite + Tailwind CSS
- **后端**: Node.js + Express.js + EJS
- **数据存储**: 本地 JSON 文件
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **认证方式**: 会话认证 (Cookie)

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd NaturalIdyllicCalmEscape
```

2. **安装后端依赖**
```bash
npm install
```

3. **安装前端依赖**
```bash
cd frontend
npm install
cd ..
```

4. **启动开发服务器**

**启动后端服务器 (端口 13000)**
```bash
npm run dev
```

**启动前端开发服务器 (端口 5173)**
```bash
cd frontend
npm run dev
```

5. **访问应用**
- 前端: http://localhost:5173
- 后端: http://localhost:13000

## 📁 项目结构

```
NaturalIdyllicCalmEscape/
├── 📁 frontend/                    # Vue3 前端项目
│   ├── 📁 src/
│   │   ├── 📁 views/               # 页面组件
│   │   │   ├── HomeView.vue        # 首页
│   │   │   ├── LoginView.vue       # 登录页
│   │   │   ├── RegisterView.vue    # 注册页
│   │   │   ├── ProfileView.vue     # 个人资料页
│   │   │   ├── CreatePostView.vue  # 发布帖子页
│   │   │   ├── PostDetailView.vue  # 帖子详情页
│   │   │   ├── SettingsView.vue    # 设置页
│   │   │   ├── CacheManagerView.vue # 缓存管理页
│   │   │   └── ForgotPasswordView.vue # 忘记密码页
│   │   ├── 📁 components/          # 可复用组件
│   │   │   ├── Header.vue          # 导航栏
│   │   │   └── Toast.vue           # 提示组件
│   │   ├── 📁 stores/              # Pinia 状态管理
│   │   │   ├── user.ts             # 用户状态
│   │   │   └── posts.ts            # 帖子状态
│   │   ├── 📁 router/              # Vue Router
│   │   ├── 📁 types/               # TypeScript 类型
│   │   ├── 📁 services/            # API 服务
│   │   ├── App.vue                 # 根组件
│   │   └── main.ts                 # 入口文件
│   ├── package.json                # 前端依赖
│   ├── vite.config.ts              # Vite 配置
│   └── tailwind.config.ts          # Tailwind 配置
│
├── 📁 data/                        # 本地数据存储
│   ├── posts.json                  # 帖子数据
│   ├── comments.json               # 评论数据
│   ├── users.json                  # 用户数据
│   └── sessions.json               # 会话数据
│
├── 📁 routes/                      # 后端路由
│   ├── 📁 api/
│   │   └── local.js                # 本地 API 路由
│   ├── api.js                      # API 路由入口
│   ├── index.js                    # 主路由
│   └── page.js                     # 页面路由
│
├── 📁 services/                    # 后端服务
│   ├── local-auth.js               # 认证服务
│   ├── local-storage.js            # 存储服务
│   └── ai.js                       # AI 服务
│
├── 📁 views/                       # EJS 模板
│   ├── 📁 components/              # EJS 组件
│   ├── index.ejs                   # 首页模板
│   ├── login.ejs                   # 登录页模板
│   ├── register.ejs                # 注册页模板
│   ├── profile.ejs                 # 个人资料页模板
│   ├── settings.ejs                # 设置页模板
│   ├── forgot-password.ejs         # 忘记密码页模板
│   └── cache-manager.ejs           # 缓存管理页模板
│
├── 📁 public/                      # 静态资源
│   ├── 📁 images/                  # 图片资源
│   ├── 📁 scripts/                 # 客户端脚本
│   └── 📁 styles/                  # 样式文件
│
├── app.js                          # 后端入口文件
├── package.json                    # 后端依赖
└── README.md                       # 项目说明
```

## 🔧 开发指南

### 前端开发

#### 技术栈
- **Vue 3**: 使用 Composition API
- **TypeScript**: 类型安全
- **Vite**: 快速构建工具
- **Tailwind CSS**: 实用优先的 CSS 框架
- **DaisyUI**: Tailwind CSS 组件库
- **Pinia**: 状态管理
- **Vue Router**: 路由管理

#### 开发命令
```bash
cd frontend

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

#### 组件开发规范
- 使用 Composition API
- 组件名使用 PascalCase
- 文件名使用 PascalCase.vue
- 使用 TypeScript 类型定义

### 后端开发

#### 技术栈
- **Node.js**: JavaScript 运行时
- **Express.js**: Web 应用框架
- **EJS**: 模板引擎
- **Nodemon**: 开发时自动重启

#### 开发命令
```bash
# 启动开发服务器
npm run dev

# 启动生产服务器
npm start
```

#### API 路由
```
POST   /api/local/login          # 用户登录
POST   /api/local/register       # 用户注册
GET    /api/local/user           # 获取用户信息
GET    /api/local/posts          # 获取帖子列表
POST   /api/local/posts          # 创建帖子
PUT    /api/local/posts/:id      # 更新帖子
DELETE /api/local/posts/:id      # 删除帖子
POST   /api/local/posts/:id/like # 点赞帖子
GET    /api/local/posts/:id      # 获取单个帖子
POST   /api/local/comments       # 创建评论
GET    /api/local/posts/:id/comments # 获取帖子评论
```

## 📊 数据模型

### 用户 (User)
```typescript
{
  id: string,
  username: string,
  email: string,
  password: string, // 加密存储
  avatar?: string,
  createdAt: string
}
```

### 帖子 (Post)
```typescript
{
  id: string,
  content: string,
  author: {
    id: string,
    username: string,
    avatar?: string
  },
  images: Image[],
  createdAt: string,
  updatedAt: string,
  likeCount: number,
  commentCount: number
}
```

### 评论 (Comment)
```typescript
{
  id: string,
  content: string,
  postId: string,
  author: {
    id: string,
    username: string,
    avatar?: string
  },
  createdAt: string
}
```

## 🔐 认证系统

### 会话认证
- 使用 Cookie 存储会话 ID
- 会话有效期 7 天
- 自动清理过期会话

### 安全特性
- 密码加密存储
- 会话验证
- 路由权限控制

## 🎨 UI/UX 设计

### 设计原则
- 响应式设计
- 现代化界面
- 用户友好
- 无障碍访问

### 组件库
- DaisyUI 组件
- 自定义组件
- 图标使用 SVG

## 📱 功能模块

### 用户管理
- 用户注册
- 用户登录
- 密码重置
- 个人资料管理
- 用户设置

### 内容管理
- 发布帖子
- 编辑帖子
- 删除帖子
- 帖子详情
- 图片上传

### 社交功能
- 点赞帖子
- 发表评论
- 查看评论
- 用户互动

### 系统功能
- 缓存管理
- 数据持久化
- 错误处理
- 日志记录

## 🚀 部署指南

### 本地部署
1. 确保 Node.js 环境
2. 安装依赖
3. 配置环境变量
4. 启动服务器

### 生产部署
1. 构建前端代码
2. 配置生产环境
3. 设置数据库
4. 部署到服务器

## 🐛 故障排除

### 常见问题

#### 端口冲突
```bash
# 查看端口占用
netstat -ano | findstr :13000

# 杀死进程
taskkill /PID <进程ID> /F
```

#### 依赖安装失败
```bash
# 清除缓存
npm cache clean --force

# 重新安装
rm -rf node_modules
npm install
```

#### 前端构建失败
```bash
# 检查 TypeScript 错误
npm run type-check

# 修复依赖
npm audit fix
```

## 🤝 贡献指南

### 开发流程
1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

### 代码规范
- 使用 ESLint
- 遵循 TypeScript 规范
- 编写单元测试
- 更新文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 项目维护者: [Your Name]
- 邮箱: [your.email@example.com]
- 项目地址: [GitHub Repository URL]

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**注意**: 这是一个开发中的项目，可能存在一些功能不完善的地方。如果您发现任何问题或有改进建议，欢迎提交 Issue 或 Pull Request。
