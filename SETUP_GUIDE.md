# 项目设置指南

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量

复制 `env.example` 文件为 `.env`：
```bash
cp env.example .env
```

然后编辑 `.env` 文件，配置必要的环境变量：

#### 必需配置（LeanCloud）
```env
# 开发环境 LeanCloud 配置
LEANCLOUD_APP_ID_DEV=你的开发环境AppID
LEANCLOUD_APP_KEY_DEV=你的开发环境AppKey
LEANCLOUD_SERVER_URL_DEV=你的开发环境服务器URL
LEANCLOUD_APP_MASTER_KEY_DEV=你的开发环境MasterKey

# 生产环境 LeanCloud 配置
LEANCLOUD_APP_ID=你的生产环境AppID
LEANCLOUD_APP_KEY=你的生产环境AppKey
LEANCLOUD_APP_MASTER_KEY=你的生产环境MasterKey
```

#### 可选配置（OpenAI）
如果你需要AI内容审核功能，可以配置OpenAI：
```env
# 开发环境 OpenAI 配置（可选）
OPENAI_API_KEY_PROXY=你的OpenAI API Key
OPENAI_BASE_URL_PROXY=你的OpenAI代理地址

# 生产环境 OpenAI 配置（可选）
OPENAI_API_KEY=你的OpenAI API Key
```

**注意**：如果不配置OpenAI，系统会自动使用简单的关键词检查作为降级方案。

### 3. 启动开发服务器
```bash
npm run dev
```

服务器将在 `http://localhost:13000` 启动。

## 功能说明

### 数据存储功能
- ✅ 用户登录状态持久化
- ✅ 帖子数据内存存储 + localStorage备份
- ✅ 评论数据内存存储 + localStorage备份
- ✅ 页面刷新后数据自动恢复

### 管理页面
- 缓存管理：`http://localhost:13000/cache-manager`
- 存储测试：`http://localhost:13000/storage-test`

## 常见问题

### Q: 启动时报错 "OPENAI_API_KEY environment variable is missing"
**A**: 这是正常的，因为OpenAI配置是可选的。系统会自动使用降级的内容检查方案。

### Q: 如何获取LeanCloud配置？
**A**: 
1. 访问 [LeanCloud官网](https://leancloud.cn/)
2. 创建应用
3. 在应用设置中找到AppID、AppKey等信息

### Q: 如何配置OpenAI？
**A**:
1. 访问 [OpenAI官网](https://platform.openai.com/)
2. 创建API Key
3. 将API Key添加到 `.env` 文件中

### Q: 页面刷新后数据丢失？
**A**: 检查浏览器是否支持localStorage，或者查看控制台是否有错误信息。

## 开发说明

### 项目结构
```
├── public/scripts/          # 前端脚本
│   ├── storage-manager.js   # 存储管理器
│   └── leancloud.js        # LeanCloud操作封装
├── views/                   # 页面模板
├── routes/                  # 路由配置
├── services/               # 后端服务
└── locales/                # 国际化文件
```

### 技术栈
- **后端**: Node.js + Express
- **前端**: Alpine.js + Tailwind CSS
- **数据库**: LeanCloud
- **AI服务**: OpenAI (可选)

## 部署

### Vercel部署
项目已配置 `vercel.json`，可以直接部署到Vercel：

1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 配置环境变量
4. 部署

### 其他平台
确保配置了正确的环境变量，特别是生产环境的LeanCloud配置。
