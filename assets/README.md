# 视觉源文件与真实截图

视觉语言：深蓝 `#0B101C`、珊瑚橙 `#FF815D`、冷青 `#7BC9DC`；路径、分叉、反馈回路与证据节点。网站使用系统字体栈；电子书使用 Noto Sans SC 的嵌入子集，OFL 许可与固定来源记录在 `fonts/`。所有 SVG 为项目原创代码绘制，可编辑文本、箭头和颜色，未调用付费图像 API。

## 图解与封面

- `diagrams/agent-loop.svg`：第 1 章，区分意图、模型决策、工具操作、实际成果与反馈。
- `diagrams/storage-path.svg`：第 3 章，新增/删除产生新列表，保存成功后更新界面，刷新重新读取；故障分支为漏写存储。
- `diagrams/intent-experiment.svg`：第 4 章，从愿望到问题、最小观察与路线决策。
- `diagrams/context-layers.svg`：第 9 章，区分当前任务、项目约定、现状事实与接续记录。
- `diagrams/version-trail.svg`：第 14 章，工作区、暂存、提交历史与恢复后行为。
- `diagrams/tool-boundary.svg`：第 22 章，宿主授权、连接工具、实际动作与返回证据。
- `diagrams/handoff-loop.svg`：第 25 章，让下一会话找到起点与有效证据。
- `diagrams/cover.svg`：8 部分、28 章完整首版封面。图形由路径与反馈节点组成。

后新增的五张图可运行 `node scripts/draw-diagrams.mjs` 重建；其它 SVG 直接维护源文件。
- `book/public/brand/mark.svg`：原创品牌标记，意图路径与证据节点。

## 真实截图

2026-10-25—26，Codex 内置浏览器实际访问本机运行的参考成品与构建站点，使用浏览器截图接口保存原始 JPEG。未生成或伪造软件界面。

| 文件 | 真实来源 | 状态与用途 |
| --- | --- | --- |
| `screenshots/linkshelf-desktop.jpg` | `http://localhost:4174/solution/`，1440px 桌面断点 | 添加“示例网站”后，保留一条样本；第 3 章和首页引用 |
| `screenshots/site-desktop.jpg` | `/codex-mastery/` 构建预览，1440px | 首页桌面布局；核对侧栏关闭后的最终版本 |
| `screenshots/site-live.jpg` | `https://liamamilin.github.io/codex-mastery/`，1440px | 成功部署后的真实公开首页 |
| `screenshots/site-mobile.jpg` | 同一构建预览，390×844 | 手机首页与主视觉 |
| `screenshots/reading-mobile.jpg` | 第 6 章，390×844 | 完整首版明亮主题手机正文 |
| `screenshots/phantom-delete.jpg` | 故障起点，1440px | 删除后当前列表 2 条、持久化副本 3 条的真实分歧 |
| `screenshots/linkshelf-extended.jpg` | 增强版，1440px | 实际导入两条合成样本后的标签、筛选和备份入口 |

样本仅包含 `example.com` / `example.org`，没有用户私人资料。截图证明当时界面，不证明全部平台/浏览器均可用。行为验收范围见 `artifacts/browser-verification.md`。

构建脚本将图解和截图复制到 `book/public/`；原件在本目录维护。
