# AI球策

基于 Next.js + Supabase Auth + DeepSeek 的智能足球投注策略 SaaS 应用。

## 功能

### 认证系统（Supabase Auth）
- 邮箱验证码登录
- 邮箱密码登录 / 注册
- Google 登录
- 微信登录（需配置开放平台）
- Session 自动刷新、刷新页面保持登录

### 业务功能
- **首页**（游客可访问）：今日资金、今日建议、今日风险
- **投注记录**（需登录）：添加 / 修改 / 删除
- **资产**（需登录）：本金、ROI、收益曲线
- **AI复盘**（需登录）：智能复盘报告
- **AI聊天**（需登录）：投注策略咨询
- **个人中心**（需登录）：头像、昵称、会员等级、累计统计

## 技术栈

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase Auth + PostgreSQL + RLS
- DeepSeek AI
- Vercel 部署

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key（微信登录需要） |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 |
| `WECHAT_APP_ID` | 微信开放平台 AppID（可选） |
| `WECHAT_APP_SECRET` | 微信开放平台 Secret（可选） |

### 3. 初始化数据库

在 Supabase SQL Editor 执行：

1. 新项目：先执行 `supabase/schema.sql`
2. 然后执行 `supabase/migration-auth.sql`（认证升级 + RLS）

### 4. 配置 Supabase Auth

在 Supabase Dashboard → **Authentication** → **Providers**：

1. **Email**：开启，启用 Confirm email（可选）
2. **Google**：开启，填入 Google OAuth Client ID / Secret
3. **URL Configuration**：
   - Site URL: `https://ai-qiuce.vercel.app`
   - Redirect URLs 添加：
     - `http://localhost:3000/auth/callback`
     - `https://ai-qiuce.vercel.app/auth/callback`

### 5. 配置微信登录（可选）

1. 在[微信开放平台](https://open.weixin.qq.com/)创建网站应用
2. 授权回调域设为：`ai-qiuce.vercel.app`
3. 在 Vercel 配置 `WECHAT_APP_ID` 和 `WECHAT_APP_SECRET`
4. 在 Vercel 配置 `SUPABASE_SERVICE_ROLE_KEY`

### 6. 启动

```bash
npm run dev
```

## 路由权限

| 路由 | 权限 |
|------|------|
| `/` | 游客可访问 |
| `/login` | 公开 |
| `/bets` `/assets` `/review` `/chat` `/profile` | 需登录，未登录跳转 `/login` |

## 部署到 Vercel

确保所有环境变量已配置，推送代码后自动部署。

```bash
git push origin main
```

## 项目结构

```
src/
├── app/
│   ├── login/           # 登录页
│   ├── profile/         # 个人中心
│   ├── auth/callback/   # OAuth 回调
│   └── api/auth/wechat/ # 微信登录
├── components/auth/     # 认证组件
├── lib/supabase/
│   ├── browser.ts       # 客户端 Supabase
│   ├── server.ts        # 服务端 Supabase
│   ├── middleware.ts    # Session 中间件
│   ├── admin.ts         # Admin 客户端
│   └── data.ts          # 数据操作
└── middleware.ts        # 路由保护
```
