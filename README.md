# AI球策

基于 Next.js + Supabase + OpenAI 的智能足球投注策略 Web 应用。

## 功能

- **首页**：今日资金、今日建议、今日风险
- **投注记录**：添加、修改、删除投注
- **资产**：本金管理、ROI、收益曲线
- **AI 复盘**：根据投注记录生成智能复盘
- **AI 聊天**：咨询投注策略（如「1000本金今天怎么买？」）

## 技术栈

- Next.js 15 (App Router)
- Tailwind CSS
- shadcn/ui
- Supabase (数据库)
- OpenAI (AI 功能)
- Recharts (图表)
- Vercel (部署)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

填写以下变量：

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 |
| `OPENAI_API_KEY` | OpenAI API 密钥 |
| `NEXT_PUBLIC_DEFAULT_USER_ID` | 默认用户 ID（可选） |

### 3. 初始化数据库

1. 登录 [Supabase](https://supabase.com) 创建项目
2. 进入 SQL Editor
3. 执行 `supabase/schema.sql` 中的脚本

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 在 Environment Variables 中配置所有 `.env.example` 中的变量
4. 点击 Deploy

或使用 Vercel CLI：

```bash
npx vercel
```

## 项目结构

```
src/
├── app/                  # 页面与 API 路由
│   ├── page.tsx          # 首页
│   ├── bets/             # 投注记录
│   ├── assets/           # 资产
│   ├── review/           # AI 复盘
│   ├── chat/             # AI 聊天
│   └── api/              # API 路由
├── components/           # UI 组件
│   ├── ui/               # shadcn/ui 基础组件
│   ├── bets/             # 投注相关
│   ├── assets/           # 资产相关
│   ├── chat/             # 聊天相关
│   └── layout/           # 布局
├── lib/                  # 工具库
│   ├── supabase/         # Supabase 客户端
│   ├── ai/               # OpenAI 集成
│   └── stats.ts          # 统计计算
└── types/                # TypeScript 类型
```

## 注意事项

- 投注有风险，本应用仅供策略分析参考
- AI 建议不构成投注建议，请理性决策
- 生产环境建议启用 Supabase Auth 并收紧 RLS 策略
