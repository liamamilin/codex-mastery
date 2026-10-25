# Codex Mastery Lab · 驾驭 Codex

**从基础使用到复杂任务掌控。把模糊想法转化为可验证成果的中文实战教材。**

[在线阅读](https://liamamilin.github.io/codex-mastery/) · [完整学习路线](https://liamamilin.github.io/codex-mastery/curriculum.html) · [实战实验室](https://liamamilin.github.io/codex-mastery/labs.html) · [电子书下载](https://liamamilin.github.io/codex-mastery/resources.html)

完整首版包含导读、8 部分 28 章与术语附录。学习路线从第一次运行成果，进入任务探索、上下文调查、实验与路线选择、版本和验收、失败纠偏、工具复用及长期协作。每章有明确能力终点、实际操作、失败分支和练习反馈。

这是独立开源教学项目。网站为 GitHub Pages 纯静态文件，无需自建服务器、数据库或运行时付费 API。真正的 Codex 在读者自己的工作环境中运行；浏览器教学模型始终标明它的边界。

## 从阅读到动手

- [导读](book/00-导读.md)：选择路线，理解命令与教学情境的区别。
- [A · LinkShelf](cases/A-linkshelf/README.md)：在浏览器保存、找回和删除链接，观察刷新后的状态。
- [B · TaskTrail](cases/B-tasktrail/README.md)：接手陌生 Python 仓库，调查入口与数据，再增加状态筛选。
- [C · CSV Insight](cases/C-csv-insight/README.md)：用人工数据生成报告，通过独立计算检查数值与统计口径。
- [D · Phantom Delete](cases/D-phantom-delete/README.md)：确定性复现删除后恢复的故障，比较起点与参考修复。
- [E · 毕业实战](cases/E-capstone/README.md)：会议纪要整理或文本工具维护，提供材料与未解起点，保留独立完成空间。
- [扩展练习](extensions/README.md)：独立 Git 实验、可复用 Skill、重复执行脚本与只读连接证据。

## 安装与运行网站

前提：Node.js 22、npm；首次安装需要网络。案例测试另需 Python 3.9+。在含 `package.json` 的仓库根目录运行：

```sh
npm ci
npm run dev
```

打开终端显示的 Local 地址，Ctrl+C 停止。端口被占用时以实际输出为准。PowerShell 若拦截 npm 脚本，可使用组织允许的 `npm.cmd`。

发布前以实际仓库子路径构建（macOS / Linux）：

```sh
npm test
SITE_BASE=/codex-mastery/ npm run build
SITE_BASE=/codex-mastery/ npm run check:build
SITE_BASE=/codex-mastery/ npm run preview
```

PowerShell 设置相同变量后运行对应 npm 命令：

```powershell
$env:SITE_BASE = '/codex-mastery/'
npm test
npm run build
npm run check:build
npm run preview
```

预览地址通常为 `http://localhost:4173/codex-mastery/`，以终端端口为准。`cleanUrls: false` 保留 `.html`，让深层章节在 Pages 刷新时无需服务器重写。构建产物在 `book/.vitepress/dist/`。重新构建后应重启预览，避免旧脚本缓存影响验收。

## 单独运行案例

网页案例只需 Python 3 与浏览器，无需网站依赖。在仓库根目录运行：

```sh
python3 -m http.server 4174 --bind 127.0.0.1 --directory cases/A-linkshelf
```

打开 `http://localhost:4174/solution/`，Ctrl+C 停止。Windows Python Launcher 用户将 `python3` 换为 `py -3`。先把 `starter/` 复制到自己的目录，再用 Codex 实践；参考成品供行为对照，不要求界面逐字相同。其它案例的前提和命令见各自 README。

## PDF 与 EPUB

成品在 [exports/](exports/)，由同一套 Markdown 自动生成。离线版把交互题转成文字练习；不包含浏览器搜索、进度或真正的模型执行。

```sh
# 先按 docs/ebook.md 安装独立 Python 出版依赖
npm run export:book
npm run build
```

[出版与验证说明](docs/ebook.md) 包含 macOS/Linux/Windows 命令、字体获取、输出校验与排版边界。字体源固定版本并校验哈希，使用 OFL 许可；无需付费账号。静态构建使用已提交的成品，不要求 CI 安装 PDF 工具；源稿变化后必须重新导出，否则构建会报告电子书过期。

## 验证范围

实际执行过案例测试、CSV 独立核对与篡改回归、独立 Git 恢复实验、重复脚本运行、子路径构建及本地资源检查。浏览器实测覆盖案例保存/删除/刷新、故障起点与修复、教材搜索/复制/进度、交互反馈/重置，以及 1440px 与 390px 布局。

[progress.md](progress.md) 记录当前完成与发布状态；[浏览器记录](artifacts/browser-verification.md)、[教材审校](artifacts/editorial-review.md)、各案例 verification 和 [电子书验证](exports/verification.md) 给出证据与未验范围。没有把 Windows 安装、所有账号入口或真实阅读器兼容性冒充本机验证。

## 自动发布

`.github/workflows/deploy.yml` 在 `main` 更新后自动安装锁定依赖、运行案例测试、构建、检查资源并部署 GitHub Pages。仓库 Source 已设为 GitHub Actions。默认由仓库名推断 base；自定义域名可设置仓库变量 `SITE_BASE=/`。

[部署与排障文档](docs/deployment.md) 说明路径、权限与验收。公开地址为 [liamamilin.github.io/codex-mastery](https://liamamilin.github.io/codex-mastery/)，版本以成功部署的 commit 为准。

## 文件与维护

```text
book/*.md                  唯一人工编辑的教材正文
book/.vitepress/           阅读站、导航与 Vue 练习
cases/                    五类案例、输入、参考实现或毕业起点
extensions/               Git、Skill、脚本与连接练习
assets/                   SVG、真实截图、字体许可与来源
exports/                  PDF、EPUB、来源哈希与验证记录
scripts/                  资产准备、测试、构建检查、电子书生成
docs/                     开发、部署与出版说明
artifacts/                实际验收与审校记录
progress.md               接续入口与已知限制
```

`prepare-assets.mjs` 从原件生成 `book/public/` 中的图解、案例和下载副本；不要双份编辑。课程元数据从章节 frontmatter 生成，开放章节、导航和进度范围随正文一致更新。原资料包 `00_…14_…` 保留作为基础资料，不是第二份正式正文。

项目原创代码、正文和图解采用 [MIT License](LICENSE)。Noto Sans SC 字体遵循 [OFL](assets/fonts/OFL.txt)。官方产品名称属于其权利人；外链资料遵循原站许可。
