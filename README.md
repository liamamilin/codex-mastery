# Codex Mastery Lab · 驾驭 Codex

**从基础使用到复杂任务掌控。把模糊想法转化为可验证成果的中文实战教材。**

这是独立开源教学项目。教材、交互阅读站与可运行案例在同一仓库维护。网站是 GitHub Pages 可托管的纯静态文件，不需要服务器、数据库或运行时付费 API。

当前为 **v0.1 / 第一阶段纵向切片**：导读、第 1—3 章、术语附录、LinkShelf 案例、两幅教学图解、封面源图及三个交互练习已经制作。完整课程规划为 8 部分、28 章；第 4—28 章与其余案例、PDF/EPUB 尚未完成，详见 [progress.md](progress.md)。

## 阅读与动手

- 从 [导读](book/00-导读.md) 开始阅读，按第 1—3 章走完“观察 → 准备 → 实现与验收”。
- [完整课程任务](02_完整目录与各章任务.md) 描述后续学习终点。
- [LinkShelf 案例](cases/A-linkshelf/README.md) 提供独立起点、参考成品、测试与故障排查。
- 网页中的诊断训练明确为浏览器教学模型；真正的 Codex 在读者自己的环境中执行。

## 运行网站

前提：Node.js 22、npm；首次安装需要网络。从源码包解压后，在含 `package.json` 的仓库根目录运行：

```sh
npm ci
npm run dev
```

打开终端显示的 Local 地址，按 Ctrl+C 停止。若端口被占用，使用终端实际选择的端口。PowerShell 若拦截 npm 脚本，可使用组织允许的 `npm.cmd` 入口。

构建与预览 GitHub Pages 的实际子路径（macOS / Linux）：

```sh
npm test
SITE_BASE=/codex-mastery/ npm run build
SITE_BASE=/codex-mastery/ npm run check:build
SITE_BASE=/codex-mastery/ npm run preview
```

PowerShell 用下面方式设置相同的环境变量，然后执行相同 npm 命令：

```powershell
$env:SITE_BASE = '/codex-mastery/'
npm test
npm run build
npm run check:build
npm run preview
```

预览地址通常为 `http://localhost:4173/codex-mastery/`，以终端实际端口为准。`cleanUrls: false` 保留 `.html`，让深层章节无需服务器重写即可刷新访问。构建产物为 `book/.vitepress/dist/`。

## 单独运行案例

无需安装网站依赖。前提是 Python 3 和浏览器，在仓库根目录运行：

```sh
python3 -m http.server 4174 --bind 127.0.0.1 --directory cases/A-linkshelf
```

Windows Python Launcher 用户将 `python3` 换成 `py -3`。打开 `http://localhost:4174/solution/`，Ctrl+C 停止服务。跟练入口位于 `starter/`；请复制到自己的新目录，不要覆盖参考成品。

## 验证记录

2026-10-25，在 macOS、Node 22.21.1、Python 3.10.13、Codex CLI 0.154.0 环境制作。实际执行过构建、子路径资源检查和 10 项案例逻辑测试。浏览器实测包括新增、刷新保存、指定删除、错误网址、搜索与 JSON 下载；教材搜索、复制、进度、清单、练习反馈和重置也经过实际操作。手机 390px 与桌面 1440px 有真实截图。

完整证据范围、平台未验项和发布状态见 [progress.md](progress.md) 与 [浏览器验收记录](artifacts/browser-verification.md)。CLI 安装/登录与 Windows 路径按官方文档核对，不冒充本机执行。

## 发布到 GitHub Pages

工作流 `.github/workflows/deploy.yml` 从 `main` 自动安装锁定依赖、测试、构建、检查路径并部署。仓库 **Settings → Pages → Source** 需要设置为 **GitHub Actions**。默认从仓库名推断 base；自定义域名可设置仓库变量 `SITE_BASE=/`。

目标仓库：[liamamilin/codex-mastery](https://github.com/liamamilin/codex-mastery)。目标网址为 `https://liamamilin.github.io/codex-mastery/`；是否已成功上线以 [progress.md](progress.md) 中的实际记录为准。详见 [部署文档](docs/deployment.md)。

## 目录与维护

```text
book/*.md                  唯一人工编辑的教材正文
book/.vitepress/           网站配置、主题与 Vue 练习
cases/A-linkshelf/         独立案例起点、参考成品、测试
assets/                    可编辑 SVG 与真实截图原件
scripts/                   静态资产准备、构建结果检查
artifacts/                 真实验证范围与构建检查报告
docs/deployment.md         开发、部署与排障
progress.md                当前状态与明确续写入口
```

`prepare-assets.mjs` 在开发/构建前从 `assets/` 与 `cases/` 生成 `book/public/` 中的资源副本；不要人工编辑这些副本。资料包 `00_…14_…` 保留为项目基础资料，不是正式书稿的第二来源。

项目原创代码、正文和图解采用 [MIT License](LICENSE)。官方产品名称属于其权利人；外链资料遵循原站许可。
