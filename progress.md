# Codex Mastery Lab · 当前进度

更新：2026-10-25，Asia/Shanghai。**第一阶段纵向切片已制作；完整 28 章产品尚未完成。**

## 已落盘的成果

- `book/00-导读.md`，第 1—3 章完整正文，以及 `附录-术语与来源.md`，合计约 9,500 汉字。章节有前提、操作、解释、失败分支、练习和参考反馈。
- VitePress 1.6.4 + Vue 静态站：品牌首页、8 部分/28 章完整路线、阅读侧栏与提纲、章节跳转、本地全文搜索、代码复制、明暗主题、手机布局。
- 三种练习：第 1 章证据判断、可探索的七步工作循环、诊断状态模型；另有第 3 章本地验收清单与手动学习进度。
- `cases/A-linkshelf/`：独立 starter、TASK.md、可运行 solution；新增/列表/刷新保存/指定删除/错误反馈，以及关键词搜索与 JSON 导出。此阶段没有导入。
- 两幅可编辑教学 SVG、程序化封面 SVG、原创品牌标记、实际案例和网站截图。`assets/` 为原件，构建脚本生成公开资源副本。
- GitHub Pages 工作流、锁文件、安装开发说明、路径检查脚本与真实验证记录。网站运行不需要后端或付费 API。

## 真实验证

- `npm ci --offline` 从锁文件重新安装成功；最终 `SITE_BASE=/codex-mastery/ npm run build` 成功；11 个 HTML 页面（包括独立案例），225 个本地目标检查通过。最终构建检查结果保存为 `artifacts/build-check.json`。
- `npm test`：10/10 通过，包含持久化、指定删除、错误协议、坏存储、配额/权限失败、搜索与导出格式。
- 实际浏览器验证：新增 → 刷新 → 删除 → 刷新，非法网址、搜索、JSON 下载并读回，指定删除不影响另一条。
- 实际浏览器验证：中文搜索与段落导航、深层章节刷新、图片加载、代码复制、学习记录/验收清单的保存与重置、三个诊断分支、键盘作答、手机目录。
- 1440px 桌面与 390px 手机断点截图，详见 `assets/README.md`；详细操作和边界见 `artifacts/browser-verification.md`。
- 官方产品事实按 2026-10-25 文档核对；Codex CLI 0.154.0 的版本/帮助实际查询。没有声称本机重新安装、登录或 Windows 实测完成。

## 远端与发布

用户已明确授权提交与 GitHub Pages 公开访问。源码已提交到 [liamamilin/codex-mastery](https://github.com/liamamilin/codex-mastery)，主体提交为 `330488fc5bbcea349b2ed0d057d5440d04bddcbb`。终端没有 GitHub 登录，直接 push 失败；改用已授权 GitHub 连接创建同一文件树，核对 tree SHA 与本地一致后，将本地分支对齐并跟踪 origin/main，没有丢失文件。

[Actions 运行 #1](https://github.com/liamamilin/codex-mastery/actions/runs/40206290710) 的 build job 成功：安装、测试、构建、路径检查与产物上传全部通过。deploy job 在 Configure GitHub Pages 失败，明确错误为 Pages 尚未启用 / Source 未设为 GitHub Actions，返回 Not Found。浏览器 GitHub 未登录，连接器无仓库 Pages 设置接口，已请求用户完成一次设置：Settings → Pages → Source → GitHub Actions。用户随后完成设置，重新运行失败 job 后，Configure GitHub Pages 与 Deploy to GitHub Pages 均成功（成功 deploy job `121209138246`）。详见 `artifacts/github-ci.json`。

**网站已上线并实际打开验收：[Codex Mastery Lab](https://liamamilin.github.io/codex-mastery/)**。线上已确认首页、中文搜索、深层章节刷新、图解与案例截图加载、学习记录刷新保留、LinkShelf 新增→刷新→指定删除→刷新，以及手机目录与诊断模型反馈。真实线上截图为 `assets/screenshots/site-live.png`。第 4—28 章等未完成范围保持不变，未把首次切片上线视为全书完成。

## 尚未完成

- 第 4—28 章、案例 B/C/D/E；完整 8 部分主题视觉随正文扩展。
- 案例 A2 的标签、A3 导入；现有搜索与导出只是部分后续能力。
- PDF、EPUB 未生成与验收；网站明确显示待制作，没有伪下载入口。
- 真实设备、多浏览器和 Windows 安装验收；暂以官方文档与本机有限环境为边界。

## 下一次直接从这里继续

先读本文件与 `AGENTS.md`，运行 `npm ci`、`npm test` 和子路径构建，确认起点；不要重新规划或重写前三章。

1. 写 `book/04-模糊意图.md`、`05-完成状态.md`、`06-任务说明.md`，参照 `07A_章节样稿_从模糊想法开始.md` 的深度，围绕现有 LinkShelf 的真实行为组织正文。
2. 尽快创建独立 `cases/D-phantom-delete/` 的可复现故障与修复对照，再写第 18 章。当前网页诊断仅是教学模型，不能充当案例 D 已运行的证据。
3. 开放新章节时更新 `book/.vitepress/course.ts` 的 published 数据及 sidebar，移除首页、资源页、导读中的旧数量；学习进度目前限定 1—3，需随开放范围扩展。
4. 继续 B 陌生仓库、C CSV 汇总、E 独立毕业题，按目录推进；毕业题不提前泄露完整解法。
5. 全书稳定后从同一套 Markdown 生成 PDF/EPUB；生成并打开验证后再启用下载。

安装、预览、Windows 环境变量与发布命令见 `README.md` 和 `docs/deployment.md`。`book/public/lab`、`diagrams`、`screenshots` 是自动生成目录，原件在 `cases/`、`assets/`，不要双份维护。
