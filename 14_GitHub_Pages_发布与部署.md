# 14｜GitHub Pages 发布规范：没有服务器也能交付精美互动教材

> 版本：2026-10-25。本文确定本项目的公开发布路径。**不是已经成功发布的证明。**使用者最终授权公开仓库与 `git push`，Codex 负责生成、检查构建与准备工作流。

## 1. 已确定的产品约束

- 公开阅读站发布到 **GitHub Pages**。GitHub Free 可从**公开仓库**免费发布项目站点；不需要租服务器。
- 源稿、代码、图片和构建配置都保存在 GitHub 仓库。GitHub Actions 构建静态内容，Pages 托管构建结果。
- 不创建自建 API 服务、服务器数据库、账号系统或站内运行 Codex 的后端；不要求云主机付费。开发时 Node/npm 本地服务只用于预览。
- 网站支持首页、28 章阅读（随着真实正文写作推进）、图片与图解、全文搜索、轻量 Vue 练习、浏览器本地存储阅读进度、静态电子书下载。
- Codex 可写代码、制作插图和测试，但**公开部署、创建远程仓库、推送远端需用户明确授权**。

## 2. 唯一正文源与推荐目录

```text
repository-root/
├── book/                              # 唯一手工维护的教材 Markdown 正文
│   ├── index.md                      # 网站首页（从真实章节与案例引流）
│   ├── 00-导读.md
│   ├── ...                           # 第 1—28 章
│   ├── .vitepress/
│   │   ├── config.mts                # VitePress 配置（含 GitHub Pages base）
│   │   ├── theme/                    # 首页与互动 Vue 组件
│   │   └── dist/                     # 构建产物（不提交）
│   └── public/                       # 静态资源与可下载 PDF/EPUB
├── cases/                             # A—E 实战案例，运行在读者的本地电脑
├── assets/                            # SVG 原图、真实截图源等设计素材
├── .github/workflows/deploy.yml      # GitHub Actions 自动部署
├── package.json
├── package-lock.json                  # 由 npm install 生成并提交，以便 npm ci
├── README.md                          # 读者入口和部署说明
└── progress.md
```

VitePress 负责从 `book/` 直接构建网站，不要另外手写一份 `site/chapters/` 再去同步正文。可为构建生成缓存，但不能创建人工维护的第二份书稿。

`deploy-template/` 是配置起点，Codex 应根据最终网站的实际结构复制/调整到项目根目录。它不是已经部署的完整教材。

## 3. 必须解决子路径 base，否则图和脚本很容易 404

对于仓库 `https://github.com/<owner>/codex-mastery-lab`：

- 预计 Pages 站点是 `https://<owner>.github.io/codex-mastery-lab/`（需仓库已成功启用并部署）。
- VitePress 生成网站所使用的 `base` 应为 `/codex-mastery-lab/`，而不是默认 `/`。
- 用户/组织主页仓库 `<owner>.github.io` 的 `base` 是 `/`。
- 配置自定义域名时，按最终站点位置调整 `SITE_BASE`；不能无条件沿用 repo 子路径。

本包的 `deploy-template/book/.vitepress/config.mts` 利用 `GITHUB_REPOSITORY` 在 GitHub Actions 中自动设置项目仓库的 base；本机 `dev` 默认 `/`，可通过 `SITE_BASE` 覆盖。如果最终仓库名称改变，不需要人工全局替换链接，但必须复核生成页面的图片、路由和下载地址。

**网站正文中的资源**：避免 `<img src="/assets/figure.svg">` 这种只在域名根目录生效的路径；Markdown 图片用相对路径或将资源放在 `book/public/` 后用 `withBase()` 等方式正确拼接。SVG、字体、Vue 组件及下载按钮都要测试。

## 4. 最小构建与发布链

1. Codex 把 `deploy-template/package.json`、`book/.vitepress/config.mts`、`.github/workflows/deploy.yml` 的有用部分复制到正式项目（并按真实结构修订），完成 `book/index.md`。
2. Codex 在项目根目录执行 `npm install`（首次安装依赖并生成 `package-lock.json`），`npm run dev` 本地预览，`npm run build` 生成 `book/.vitepress/dist`，`npm run preview` 检查打包后的网站；如果环境无法联网安装，记录障碍，不谎称通过。
3. 在本地使用 `SITE_BASE=/codex-mastery-lab/ npm run build` 模拟子路径；检查生成 HTML/静态资源、搜索和练习。**本地文件可构建并不等于已通过 GitHub Pages 线上验收**。
4. Codex 准备好 `.github/workflows/deploy.yml`：从 `main` push 或手动触发 → `npm ci` → `npm run build` → `actions/upload-pages-artifact` 上传 `book/.vitepress/dist` → `actions/deploy-pages` 发布。
5. GitHub 仓库创建后，由用户在 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。如果默认分支不是 `main`，需要同时修改工作流的分支设置。
6. 经用户同意后将文件推送到正确远端；在 **Actions** 查看构建与部署状态；打开 Pages 对外地址检查。

### GitHub Actions 的权限和输出目录

- Workflow `permissions` 至少需要 `contents: read`、`pages: write`、`id-token: write`。
- 发布任务应关联 `github-pages` 环境；若使用部署保护规则，按 GitHub UI 配置。
- 使用 `npm ci` 必须已将与 `package.json` 匹配的 `package-lock.json` 提交。
- 构建内容为 `book/.vitepress/dist`，不能误传源码目录。
- 部署 Action 的版本应在真正实施时再次查官方发布状态；模板是写作当日核对的一个可用起点。

## 5. 如何让站点丰富而不引入服务器

| 功能 | 实现方式 | 注意 |
|---|---|---|
| 在线阅读与全文搜索 | VitePress 静态生成 + 本地搜索 | 搜索索引随构建发布 |
| 响应式排版与高质量视觉 | 自定义主题、Vue、CSS、SVG | 手机可读，键盘可用 |
| 诊断分支、题目选择与重置 | Vue 在浏览器运行 | 不要做“能点但无反馈”的摆设 |
| 学习进度 | `localStorage` | 仅当前浏览器、清理数据会丢失 |
| PDF / EPUB | 本地或 CI 预先生成，放入 `book/public/downloads/` | 不存在文件就不显示下载按钮 |
| 视频或音频演示 | 静态文件或适当外链 | 注意 GitHub Pages 大文件限制与版权 |
| GitHub 源码练习 | 代码仓库中的 `cases/` | 真正 Codex 执行在读者的本地环境 |
| 用户账号/多端同步/在线代理 | 默认**不提供** | 需要外部服务，不在本项目范围 |

静态站点是为了降低维护成本，**不是降低视觉或交互质量**。精美封面、分部动画、SVG 动态路径、可操作练习、真实截图都不需要自己运行服务器。

## 6. 发布前与上线后的真实检查

**本地必须验证**：

- `npm run build` 无错误并生成合理文件；`npm run preview` 能打开；`npm ci` 从锁文件可复现安装（网络允许时）。
- 使用 `SITE_BASE=/codex-mastery-lab/` 构建测试；首页、已完成的章节链接、图片/字体、代码复制、全文搜索及互动练习可操作。
- 无对不存在章节的“已上线”链接；尚未完成正文/案例需要明确标示。
- `book/public/downloads/` 中只有真实可打开的文件才有下载链接。
- 仓库无密钥、API token、无权发布的图片或敏感数据。

**正式上线后才能验证**：

- Actions 构建和部署两个 job 成功；环境 URL 与预期一致。
- 通过实际 `https://<owner>.github.io/<repo>/` 测试手机和桌面导航、深层章节链接、搜索、图片、交互重置、缓存刷新、可下载文件。
- 站点不向用户误称 PDF/EPUB 或 28 章已完成；内容数量与真实文件一致。

## 7. 失败时优先检查什么

| 症状 | 首先检查 |
|---|---|
| 根页能开、子页/图片 404 | VitePress `base`；硬编码 `/xxx` 路径；内部链接是否有前缀 |
| GitHub Actions `npm ci` 报错 | 有无提交 `package-lock.json`，它与 `package.json` 是否一致 |
| Pages 显示 404 | Pages Source 是否选 GitHub Actions、工作流是否已部署、仓库/URL 是否正确 |
| 部署失败或缺少权限 | workflow `pages: write`、`id-token: write`、environment、仓库 Pages 设置 |
| 首页能读但交互失效 | 浏览器 JS 控制台错误、资源加载路径、客户端状态与构建兼容性 |
| 电子书下载失败 | 静态文件是否确实已生成并进入发布目录、链接是否带正确 base |

不要因为一次 404 就切换平台或增加后端。先看构建日志和实际部署路径的证据。

## 8. 参考资料（交给 Codex 实施前再次核对）

- GitHub Pages 官方发布源说明：<https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>
- VitePress 官方部署指南：<https://vitepress.dev/guide/deploy>
- VitePress 配置参考：<https://vitepress.dev/reference/site-config>

**完成条件**：最终可以只靠一个 GitHub 仓库和 GitHub Pages 展示教材与互动练习；不必自建服务器。Codex 在此之前先完成静态构建与真实页面，公开部署留给用户明确授权。
