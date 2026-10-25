# 视觉源文件与真实截图

视觉语言：深蓝 `#0B101C`、珊瑚橙 `#FF815D`、冷青 `#7BC9DC`；路径、分叉、反馈回路与证据节点。字体使用系统字体栈，不分发商业字体。所有 SVG 为项目原创代码绘制，可编辑文本、箭头和颜色，未调用付费图像 API。

## 图解与封面

- `diagrams/agent-loop.svg`：第 1 章，区分意图、模型决策、工具操作、实际成果与反馈。
- `diagrams/storage-path.svg`：第 3 章，新增/删除产生新列表，保存成功后更新界面，刷新重新读取；故障分支为漏写存储。
- `diagrams/cover.svg`：可编辑封面，明确标注 Vol.01 阅读预览，不代表 28 章完整出版物。
- `book/public/brand/mark.svg`：原创品牌标记，意图路径与证据节点。

## 真实截图

2026-10-25，Codex 内置浏览器实际访问本机运行的参考成品与构建站点，使用浏览器截图接口保存 PNG。未生成或伪造软件界面。

| 文件 | 真实来源 | 状态与用途 |
| --- | --- | --- |
| `screenshots/linkshelf-desktop.png` | `http://localhost:4174/solution/`，1440px 桌面断点 | 添加“示例网站”后，保留一条样本；第 3 章和首页引用 |
| `screenshots/site-desktop.png` | `/codex-mastery/` 构建预览，1440px | 首页桌面布局；核对侧栏关闭后的最终版本 |
| `screenshots/site-mobile.png` | 同一构建预览，390×844 | 手机首页与主视觉 |
| `screenshots/reading-mobile.png` | 第 1 章，390×844 | 明亮主题的手机正文与折叠导航 |

样本仅包含 `example.com` / `example.org`，没有用户私人资料。截图证明当时界面，不证明全部平台/浏览器均可用。行为验收范围见 `artifacts/browser-verification.md`。

构建脚本将图解和截图复制到 `book/public/`；原件在本目录维护。
