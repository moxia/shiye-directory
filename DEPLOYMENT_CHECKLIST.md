# 拾页 SHIYE 上线检查清单

使用本清单逐项验证真实 Supabase 项目与 Vercel 部署。勾选前请保留证据（截图、请求响应或日志）。本地 demo 模式通过测试不能替代云端 RLS、Auth、Storage 和缓存验证。

## 1. 发布前代码检查

- [ ] 使用 Node.js 22.x。
- [ ] `npm ci` 成功，`package-lock.json` 未被本地修改覆盖。
- [ ] `npm run lint` 通过。
- [ ] `npm run typecheck` 通过。
- [ ] `npm test` 全部通过。
- [ ] `npm run build` 成功。
- [ ] 公开页面 Playwright 测试通过：`/zh`、`/en`、桌面、移动端、明暗主题。
- [ ] 仓库中没有 `.env.local`、service-role key、管理员密码、测试 token 或 Supabase 备份。
- [ ] `.env.example` 仅包含占位符。
- [ ] 已确认 `package.json` 的 `engines.node` 为 `22.x`。

## 2. Supabase 项目与数据库

- [ ] 已创建 Supabase 项目，并确认项目未处于暂停状态。
- [ ] 已在 SQL Editor 完整执行 `supabase/migrations/202611120001_initial_schema.sql`。
- [ ] 迁移执行无报错；重复执行种子前先确认不会覆盖人工维护的内容。
- [ ] 已执行 `supabase/seed.sql`，并核对 6 个分类、24 个站点和 `site_settings.id = main`。
- [ ] 已确认 `categories`、`sites`、`site_settings` 的 RLS 状态为 Enabled。
- [ ] 已确认 `reorder_categories`、`reorder_sites`、`import_catalog` 的 RPC 存在。
- [ ] 已确认 `site-icons` 桶存在、公开读取、文件上限 524288 字节，并限制为 PNG/JPEG/WebP。

## 3. 环境变量

- [ ] Vercel 已配置 `NEXT_PUBLIC_SUPABASE_URL`。
- [ ] Vercel 已配置 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。
- [ ] Vercel 已配置 `NEXT_PUBLIC_SITE_URL`，且为正式 HTTPS 域名、无尾部斜杠。
- [ ] Vercel **没有**配置 `SUPABASE_SERVICE_ROLE_KEY`。
- [ ] Vercel **没有**配置 `ADMIN_EMAIL` 与 `ADMIN_PASSWORD`。
- [ ] 本地 `.env.local` 已被 `.gitignore` 忽略。
- [ ] 自定义域名确定后已更新 `NEXT_PUBLIC_SITE_URL` 并重新部署。

## 4. Auth 与管理员

- [ ] Supabase Authentication -> Email 已关闭 “Allow new users to sign up”。
- [ ] Authentication -> URL Configuration 的 Site URL 指向正式站点。
- [ ] 已在本地运行 `npm run admin:create`，并确认输出为 Created 或 Updated administrator。
- [ ] Supabase Auth 用户详情中 `app_metadata.role` 为 `admin`；不是 `user_metadata.role`。
- [ ] 管理员邮箱已确认，密码为 8-72 位且未复用其他服务密码。
- [ ] 管理员可登录 `/zh/admin/login` 并进入 `/zh/admin`。
- [ ] 管理员登出后再次访问 `/zh/admin` 会跳转登录页。
- [ ] 创建临时普通用户（无 admin 元数据）进行测试：登录后台被拒绝，访问受保护后台路径会跳转登录。
- [ ] 部署完成后，已从本地 `.env.local` 移除 service-role key 和临时管理员密码，或转入受控密码管理器。
- [ ] 管理员 E2E 使用一次性测试项目凭据，未将生产密码用于自动化。

## 5. RLS 负向权限测试

负向测试必须使用 anon key 或普通用户 access token；不要用 service-role key，因为它会绕过 RLS。

- [ ] 匿名 `select` 只能看到可见分类、可见站点和 `site_settings`。
- [ ] 匿名直接 `insert` / `update` / `delete` 分类被拒绝。
- [ ] 匿名直接 `insert` / `update` / `delete` 站点被拒绝。
- [ ] 匿名修改 `site_settings` 被拒绝。
- [ ] 普通登录用户写分类、站点、设置被拒绝。
- [ ] 普通登录用户执行 `reorder_categories`、`reorder_sites`、`import_catalog` 被拒绝。
- [ ] 普通登录用户无法调用 `/api/admin/export`，应得到 401。
- [ ] 匿名无法上传、更新或删除 `site-icons` 对象。
- [ ] 管理员写操作成功，且公开读接口随后能看到正确结果。

## 6. 管理员 CRUD 与缓存

- [ ] 新增分类，刷新公开前台后可见。
- [ ] 编辑分类中英文名称与简介，`/zh` 和 `/en` 都显示新内容。
- [ ] 分类有站点时删除被阻止；删除站点后可删除空分类。
- [ ] 新增站点，填写中英文名称、简介、URL 与分类，保存成功。
- [ ] 编辑站点并切换分类后，排序位置正确。
- [ ] 隐藏站点后，刷新 `/zh` 与 `/en` 不再显示；重新显示后恢复。
- [ ] 隐藏分类后，其站点不再出现。
- [ ] 精选状态变更后，首页编辑精选立即正确刷新。
- [ ] 拖拽排序后前台顺序正确；键盘/按钮上移下移也可完成同样操作。
- [ ] 新增、编辑、删除、排序、显隐和设置修改均能清掉公开缓存，无需重新部署。
- [ ] 分类 slug 重复或站点 URL 重复时，界面显示可理解的错误。
- [ ] 双语文案缺失或非法 URL 被 Zod 校验拒绝。

## 7. 图标与 Storage

- [ ] 图标 URL 为空时，站点尝试加载根域 `/favicon.ico`。
- [ ] 外部 favicon 失败时显示中性字母图标，不产生破图。
- [ ] 手动图标 URL 可正常显示。
- [ ] 上传 PNG、JPEG、WebP 成功，Storage 中对象为 `image/webp`。
- [ ] 下载上传后的图片，确认尺寸为 128×128。
- [ ] 上传超过 512 KB 的文件被拒绝。
- [ ] 上传非 PNG/JPEG/WebP 文件被拒绝。
- [ ] 伪造 MIME 的非法图片被服务端 Sharp 校验拒绝。
- [ ] 图标更换或清除后，前台显示新图标或正确回退。
- [ ] 已检查 Storage 是否有无引用旧文件；当前版本不会自动清理，需要时手动删除。

## 8. 导入与导出

- [ ] 管理员导出得到 `version: 1` JSON，包含顺序、双语文案、分类 slug、URL、图标 URL 和状态。
- [ ] 导出响应的 `cache-control` 为 `private, no-store`。
- [ ] 未登录请求 `/api/admin/export` 返回 401。
- [ ] 导入合法 JSON 后，分类与站点按 slug / 规范化 URL 合并。
- [ ] 导入文件未包含的现有记录保持不变。
- [ ] 未知分类 slug 导致整次导入失败，数据库没有部分写入。
- [ ] 超过 2 MB 的 JSON 被拒绝。
- [ ] 超过 500 个站点的 JSON 被拒绝。
- [ ] 非 JSON、错误 `version`、缺少双语字段等非法文件被拒绝。
- [ ] 已记录：JSON 不包含 Storage 图标文件，跨项目迁移需单独复制 `site-icons` 桶。

## 9. 公开页面、SEO 与可访问性

- [ ] `/` 根据语言偏好重定向到 `/zh` 或 `/en`。
- [ ] `/zh` 与 `/en` 页面完整，语言切换保留当前路径、筛选和锚点。
- [ ] 搜索匹配中英文名称、简介和域名；清除筛选与空状态正常。
- [ ] `/` 聚焦搜索框，`Esc` 清空搜索；Tab 焦点可见。
- [ ] 分类筛选和关键词同步到查询参数，刷新后状态保留。
- [ ] 明暗主题选择持久化，首次加载无明显闪烁。
- [ ] 减少动画偏好下无强制动画。
- [ ] 390、1024、1440 宽度无横向滚动，移动分类栏与后台导航可用。
- [ ] 键盘可完成语言、主题、分类、站点链接和后台主要操作。
- [ ] 页面 `lang`、标题、描述、canonical、hreflang 与 Open Graph 正确。
- [ ] `/sitemap.xml` 与 `/robots.txt` 可访问，并指向正式域名。
- [ ] 站点总数、精选列表和分类分组与数据库一致。
- [ ] 404 页面与无效 locale 行为符合预期。
- [ ] 使用浏览器 Lighthouse 或人工检查颜色对比度达到 WCAG AA。

## 10. Vercel 部署

- [ ] 项目已推送至 Git 仓库，未提交本地构建产物或依赖目录。
- [ ] Vercel Framework Preset 识别为 Next.js。
- [ ] 构建使用 Node.js 22.x。
- [ ] Production 环境变量已配置且无 service-role key。
- [ ] 首次部署成功，构建日志无错误。
- [ ] 自定义域名与 HTTPS 证书正常。
- [ ] 更新 `NEXT_PUBLIC_SITE_URL` 后已重新部署。
- [ ] Supabase Auth URL Configuration 与正式域名一致。
- [ ] Vercel 函数区域、Supabase 项目和主要用户区域之间的延迟可接受。
- [ ] 已确认 Vercel Hobby 使用性质符合个人、非商业要求。

## 11. 上线后冒烟测试

- [ ] 使用无痕窗口访问正式域名，确认首页不是 demo 数据或构建时占位内容。
- [ ] 从正式域名登录后台，完成一次新增/编辑/隐藏/删除测试数据。
- [ ] 在第二个浏览器窗口刷新公开页面，确认缓存已刷新。
- [ ] 上传一张正式图标，确认公开页面加载。
- [ ] 下载一次正式备份并保存到受控存储。
- [ ] 以匿名用户尝试写入，确认数据库返回 401/403 而非成功。
- [ ] 查看 Vercel Runtime Logs 与 Supabase Logs，确认无认证或 RLS 异常。
- [ ] 记录管理员恢复流程：Supabase 暂停时恢复项目、重新发送 magic link 或重置密码、重新部署回滚版本。

## 12. 免费额度与运维提醒

- [ ] 已记录 Supabase Free 项目长期无活动可能暂停，需登录控制台恢复。
- [ ] 已记录 Vercel Hobby 与 Supabase Free 的当前配额并非永久保证。
- [ ] 已设置日历或在 Supabase 控制台启用必要的项目活跃提醒。
- [ ] 定期清理无引用 Storage 图标，避免占用免费存储额度。
- [ ] 定期导出 JSON 备份，并清楚备份不包含 Storage 文件。
- [ ] 如需迁移项目，先复制数据库/Storage，再更新环境变量并重新验证 RLS。

## 13. 签收记录

- 验证日期：
- 验证人：
- Vercel 生产 URL：
- Supabase 项目：
- 构建版本/提交：
- 公开页截图：
- 后台 CRUD 证据：
- RLS 负向测试证据：
- 备份文件位置：
- 遗留问题：
