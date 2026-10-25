# 开发、构建与 GitHub Pages 发布

教材正文只编辑 `book/*.md`。VitePress 从这些文件生成纯静态网页；练习和进度在读者的浏览器中运行，案例代码在读者本地执行。公开阅读站无需服务器或运行时 API。

## 本地运行

安装 Node.js 22 和 npm 后，在仓库根目录执行：

```sh
npm ci
npm run dev
```

开发服务器地址以终端实际输出为准。正式发布前使用与目标仓库相同的子路径构建：

```sh
npm test
SITE_BASE=/codex-mastery/ npm run build
SITE_BASE=/codex-mastery/ node scripts/check-build.mjs
SITE_BASE=/codex-mastery/ npm run preview
```

预览时打开终端端口下的 `/codex-mastery/`，例如 `http://localhost:4173/codex-mastery/`（若预览端口不同，使用实际端口）。直接打开磁盘中的 HTML 不能替代 HTTP 预览。

构建产物位于 `book/.vitepress/dist/`。路径检查脚本扫描生成 HTML 中 `a[href]`、`img[src]`、`script[src]` 和 `link[href]` 的本地目标，处理 `.html` 页面和目录首页，检查是否意外跳出了站点 base，发现问题返回非零退出码，并写入 `artifacts/build-check.json`。脚本不请求外部链接，不验证页内锚点、搜索运行、动态导入或浏览器交互；这些仍需实际浏览器检查。测试其他输出目录时可设置 `BUILD_DIR`；设置 `BUILD_CHECK_REPORT` 可改变报告文件位置。

## 目标仓库与路径

项目仓库为 [liamamilin/codex-mastery](https://github.com/liamamilin/codex-mastery)。成功部署后的项目站地址应为 [Codex Mastery Lab](https://liamamilin.github.io/codex-mastery/)，只有部署工作流成功和实际 HTTP 检查通过后，才能声称已上线。

GitHub Actions 中默认从 `GITHUB_REPOSITORY` 推断项目子路径（当前为 `/codex-mastery/`），用户或组织根站点使用 `/`。本机默认 `/`，子路径预览需显式设置 `SITE_BASE`。使用自定义域名时，在 GitHub 仓库 **Settings → Secrets and variables → Actions → Variables** 新建仓库变量 `SITE_BASE`，值为 `/` 或实际子路径。构建和检查必须使用同一个 base。图片、导航、代码资源和下载链接都要在这个路径下验证。

## 自动部署

1. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。这是仓库设置，提交工作流文件本身不会证明已经完成这一步。
2. 将已验证的源文件、`package-lock.json` 和 `.github/workflows/deploy.yml` 提交到 `main`。每次 `main` push 自动执行部署，也可以从 Actions 手动运行。
3. `build` job 使用 Node.js 22 执行 `npm ci`、案例测试、静态构建和链接检查，只上传 `book/.vitepress/dist/`。任何一步失败都会阻止发布。
4. `deploy` job 依赖 `build`，使用 `github-pages` 环境发布上传的静态产物，并将真正的部署地址记录在该环境中。
5. 打开 Actions 确认两个 job 成功，再访问页面，刷新一篇深层章节，检查搜索、图片、代码复制、练习反馈/重置、明暗主题及手机菜单。仅有本地成功构建不足以证明线上成功。

构建任务只授予 `contents: read`；发布任务授予 `pages: write` 和 `id-token: write`。无需自建 PAT 或在仓库保存密钥。组织策略、Actions 禁用、Pages 设置或 `github-pages` 环境保护规则可能阻止部署；此时应按真实错误修正相应仓库设置，不应跳过测试。

## Action 版本与官方依据

2026-10-25 实施时直接核对官方 release 页面，工作流采用以下主版本。官方 README 或文档中的示例可能滞后，应以 release 记录和对应 action 的输入要求为准。

| Action | 采用主版本 | 核对到的正式版本 |
| --- | --- | --- |
| `actions/checkout` | `v7` | [v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) |
| `actions/setup-node` | `v7` | [v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0) |
| `actions/configure-pages` | `v6` | [v6.0.0](https://github.com/actions/configure-pages/releases/tag/v6.0.0) |
| `actions/upload-pages-artifact` | `v5` | [v5.0.0](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0) |
| `actions/deploy-pages` | `v5` | [v5.0.1](https://github.com/actions/deploy-pages/releases/tag/v5.0.1) |

GitHub 官方说明了 [Pages 自定义工作流、权限与产物要求](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)；VitePress 官方说明了 [GitHub Pages 部署和 base](https://vitepress.dev/guide/deploy#github-pages)。GitHub Free 支持公开仓库的 Pages；若仓库改为私有，需要核实账号方案是否支持。

## 常见故障

| 现象 | 排查与恢复 |
| --- | --- |
| `npm ci` 失败 | 检查 Node 版本、锁文件是否存在并与 `package.json` 一起提交。修复依赖后重新安装和构建。 |
| 根页可打开，图片或子页 404 | 核对实际 URL、`SITE_BASE` 和 HTML 中资源前缀；重新执行子路径构建与链接检查。 |
| Pages 配置或发布失败 | 查看失败 step 的原始错误，确认 Source 为 GitHub Actions、发布任务权限和环境保护规则。 |
| 发布后仍看到旧内容 | 先确认本次 commit 的部署完成，再刷新或使用无痕窗口，核对请求到的资源文件。 |
| 搜索或交互按钮无响应 | 打开浏览器控制台和 Network，确认 JavaScript 成功加载；静态链接检查不能验证事件逻辑。 |
| PDF/EPUB 下载 404 | 仅在真实文件已生成并进入 `book/public/` 后启用入口，检查实际生成目录和带 base 的 URL。 |
