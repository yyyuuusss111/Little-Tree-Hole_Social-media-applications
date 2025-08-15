little-tree-hole - 全栈社交媒体应用

一个基于 Vue3 + Node.js 的现代化社交媒体应用，支持用户注册、发布帖子、评论互动等功能。

项目概述

功能特性
✅ 用户认证系统（注册、登录、登出）
✅ 帖子发布与管理
✅ 评论系统
✅ 点赞功能
✅ 个人资料管理
✅ 缓存管理系统
✅ 响应式设计
✅ 实时数据更新

技术架构
前端: Vue 3 + TypeScript + Vite + Tailwind CSS
后端: Node.js + Express.js + EJS
数据存储: 本地 JSON 文件
状态管理: Pinia
路由管理: Vue Router 4
认证方式: 会话认证 (Cookie)

快速开始

环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd NaturalIdyllicCalmEscape
```

2. 安装后端依赖
```bash
npm install
```

3. 安装前端依赖
```bash
cd frontend
npm install
cd ..
```

4. 启动开发服务器

启动开发服务器
```bash
npm run dev
```

项目结构

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


---

**注意**: 这是一个开发中的项目，可能存在一些功能不完善的地方。如果您发现任何问题或有改进建议，欢迎提交 Issue 或 Pull Request。
