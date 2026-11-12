# 拾页 SHIYE

拾页是一个双语、编辑精选式网站导航站，包含公开前台、单管理员后台、分类与站点管理、图标上传、JSON 导入导出，以及可直接部署到 Vercel Hobby 的生产配置。

技术栈：Next.js 16 App Router、React 19、TypeScript、Tailwind CSS 4、Supabase（PostgreSQL / Auth / Storage）、Zod、Sharp。

## 已实现功能

- 公开页面：`/zh`、`/en`，默认简体中文，支持语言与明暗主题切换。
- 搜索：即时匹配中英文名称、简介和域名；分类与关键词同步到 URL；支持 `/` 聚焦、`Esc` 清空。
- 展示：编辑精选、分类筛选、桌面侧栏、移动横向分类栏、站点图标及字母回退。
- SEO：本地化 metadata、canonical、hreflang、Open Graph、`sitemap.xml`、`robots.txt`。
- 后台：分类、站点、站点设置、数据导入导出、账号密码管理。
- 内容管理：新增、编辑、删除、显示/隐藏、精选、拖拽排序、上移/下移。
- 图标：自动读取站点根域 `/favicon.ico`、手动输入 URL，或上传 PNG/JPEG/WebP；上传后由服务端缩放为 128×128 WebP。
- 权限：Supabase RLS；匿名用户只读，只有 `app_metadata.role = admin` 的管理员可写。
- 数据迁移：`version: 1` JSON 备份/恢复，限制 2 MB、500 个站点，通过事务型 RPC 原子合并。

## 无需 Supabase 的本地预览

只需要 Node.js 22.x。未配置 Supabase 环境变量时，公开页面使用 `lib/demo-data.ts` 中的 6 个分类和 24 个站点，方便查看界面与搜索体验。

```powershell
npm install
npm run dev
```

打开 `http://localhost:3000/zh`。此模式只用于前台预览；后台登录需要真实 Supabase 项目。

## 完整 Supabase 配置

### 1. 创建项目并执行 SQL

1. 在 Supabase 创建项目，等待数据库就绪。
2. 打开 SQL Editor，先执行：
   `supabase/migrations/202611120001_initial_schema.sql`
3. 再执行：
   `supabase/seed.sql`

迁移会创建 `categories`、`sites`、`site_settings`，以及排序和导入 RPC、RLS 策略、`site-icons` Storage 桶及 Storage 策略。迁移只应执行一次；种子脚本可重复执行。

### 2. 配置本地环境变量

复制 `.env.example` 为 `.env.local`，填写：

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<8-72-character-password>
```

- `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 可进入浏览器端，但仍应从 Supabase 项目的 API 设置中复制。
- `SUPABASE_SERVICE_ROLE_KEY`、`ADMIN_EMAIL`、`ADMIN_PASSWORD` 仅用于本地一次性管理员创建脚本。
- **绝不要**把 service-role key 改成 `NEXT_PUBLIC_` 变量，也不要把它配置到 Vercel。

### 3. 禁用公开注册

在 Supabase Dashboard 的 Authentication 设置中关闭公开注册：

- Authentication -> Sign In / Providers -> Email：关闭 “Allow new users to sign up”。
- Authentication -> URL Configuration：将 Site URL 设置为最终站点地址，例如 `https://your-domain.com`。
- 如控制台提供密码最低长度或邮件确认设置，建议保持密码至少 8 位并使用已确认邮箱的管理员账号。

### 4. 创建管理员

在本地执行：

```powershell
npm run admin:create
```

脚本会用 service-role key 创建或更新指定邮箱用户，并写入：

```json
{ "role": "admin" }
```

写入位置是 Supabase Auth 的 `app_metadata`，不是用户可自行修改的 `user_metadata`。创建成功后建议从 `.env.local` 移除 `SUPABASE_SERVICE_ROLE_KEY` 和 `ADMIN_PASSWORD`，之后需要时再临时加回。不要复用生产管理员密码作为测试凭据。

### 5. 启动完整应用

```powershell
npm run dev
```

访问 `http://localhost:3000/zh`，登录入口为 `http://localhost:3000/zh/admin/login`。

## 管理与数据

后台路径：

- `/zh/admin` 或 `/en/admin`：总览
- `/zh/admin/categories`：分类管理
- `/zh/admin/sites`：站点管理
- `/zh/admin/settings`：站点文案与 SEO 设置
- `/zh/admin/data`：JSON 导入导出
- `/zh/admin/account`：修改管理员密码

分类存在站点时不能删除。站点图标为空时会尝试站点根域的 `/favicon.ico`；外部图标加载失败时显示中性字母标记。

### JSON 格式与限制

导出接口为 `/api/admin/export`，必须携带管理员登录会话。导入与导出使用 `version: 1`：

```json
{
  "version": 1,
  "exportedAt": "2026-11-13T00:00:00.000Z",
  "categories": [
    {
      "slug": "ai",
      "name": { "zh": "AI 与工具", "en": "AI & tools" },
      "description": { "zh": "中文简介", "en": "English description" },
      "order": 10,
      "visible": true
    }
  ],
  "sites": [
    {
      "categorySlug": "ai",
      "name": { "zh": "示例", "en": "Example" },
      "description": { "zh": "中文简介", "en": "English description" },
      "url": "https://example.com",
      "iconUrl": null,
      "order": 10,
      "visible": true,
      "featured": false
    }
  ]
}
```

导入限制为 2 MB、最多 500 个站点。分类按 `slug`、站点按规范化 URL 合并；文件中没有出现的现有记录保持不变。未知分类 slug 会使整个导入事务回滚。

JSON 只包含数据库记录和图标 URL，不包含 Supabase Storage 中的文件本身。跨项目迁移时，需要另外同步 `site-icons` 桶中的文件。

## 缓存与刷新

公开目录通过 Next.js 缓存标签 `catalog` 读取。后台保存、删除、排序、可见性切换和导入成功后，会刷新该标签及中英文公开/后台路径。正常运行时无需手动清缓存。

## 部署到 Vercel Hobby

1. 将项目推送到 GitHub/GitLab/Bitbucket，并在 Vercel 导入。
2. Framework Preset 选择 Next.js；项目 `package.json` 已声明 Node.js 22.x。
3. 在 Vercel Project Settings -> Environment Variables 添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`（必须是无尾部斜杠的正式 HTTPS 域名）
4. 不要添加 `SUPABASE_SERVICE_ROLE_KEY`、`ADMIN_EMAIL`、`ADMIN_PASSWORD`。
5. 部署后，在 Supabase Authentication -> URL Configuration 将 Site URL 和允许的重定向地址更新为 Vercel/自定义域名。
6. 自定义域名确定后更新 `NEXT_PUBLIC_SITE_URL` 并重新部署，使 canonical、Open Graph、sitemap 和 robots 使用正式域名。

也可使用 Vercel CLI 部署，但仍需在 Vercel 项目中配置上述环境变量。部署前建议在本地执行 `npm run build`。

### 免费额度与运行注意事项

- Vercel Hobby 仅适用于个人、非商业用途，并受其当时的带宽、构建和函数额度约束。
- Supabase Free 项目长期无活动可能被暂停，需要在 Supabase 控制台手动恢复。
- Supabase Free 的数据库、存储、带宽和 Auth 额度以官方当前限制为准。
- 免费方案适合个人导航站，不建议直接承载商业流量或大量并发写入。

## 质量检查

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

后台 E2E 默认跳过；如需对一次性测试 Supabase 项目执行，设置：

```powershell
$env:E2E_ADMIN_EMAIL='admin@example.com'
$env:E2E_ADMIN_PASSWORD='one-time-test-password'
npm run test:e2e
```

不要把测试管理员凭据提交到仓库或用于正式生产账号。真实 Supabase 项目上线前，应按 `DEPLOYMENT_CHECKLIST.md` 验证 RLS 负向权限、Storage、RPC、缓存刷新和管理员 CRUD。

## 目录结构

```text
app/                 页面、API、SEO 与 Server Actions
components/          公开前台和后台组件
lib/                 数据访问、校验、搜索、类型与 i18n
scripts/             管理员创建脚本
supabase/            数据库迁移与种子数据
tests/               Vitest + React Testing Library
e2e/                 Playwright 冒烟测试
```

## 已知边界

- 本期不包含访客注册、收藏、投稿、点击统计、评论或多管理员权限。
- 自动 favicon 依赖目标站点是否公开提供 `/favicon.ico`；失败时使用字母回退。
- 更换或删除上传图标时，旧 Storage 文件可能保留；当前版本不会自动清理旧文件，可在 Supabase Storage 控制台定期清理。
- 本次交付未连接真实 Vercel 或 Supabase 账号执行云端部署；云端 RLS、Auth、Storage 和缓存行为需按清单实测。
