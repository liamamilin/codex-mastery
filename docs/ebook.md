# 从同一份正文生成 PDF 与 EPUB

导出入口是 `node scripts/export-book.mjs`。它按编号读取 `book/00-*.md`、第 1—28 章及 `book/附录-术语与来源.md`，不会另外维护出版稿。网页首页、目录和下载说明不混入教材正文。

## 安装与生成

需要项目锁定的 Node 依赖，以及 Python 3.10 或更新版本。建议在独立虚拟环境安装出版依赖：

```sh
# macOS / Linux；在仓库根目录
npm ci
python3 -m venv .venv-publishing
.venv-publishing/bin/python -m pip install -r requirements-export.txt
PUBLISH_PYTHON=.venv-publishing/bin/python node scripts/export-book.mjs
```

```powershell
# Windows PowerShell；在仓库根目录
npm ci
py -3 -m venv .venv-publishing
.\.venv-publishing\Scripts\python.exe -m pip install -r requirements-export.txt
$env:PUBLISH_PYTHON = ".venv-publishing/Scripts/python.exe"
node scripts/export-book.mjs
```

系统已经有依赖时可以直接运行，默认使用 `python3`；也可通过 `PUBLISH_PYTHON` 指定环境中的解释器。`PUBLISH_DATE=YYYY-MM-DD` 可固定版本日期，默认按 Asia/Shanghai 的当天生成。Windows 设置环境变量使用 `$env:PUBLISH_DATE = "YYYY-MM-DD"`。

字体依据 `assets/fonts/source.json` 的固定上游 commit、URL 和 SHA-256 下载到 `.cache/publishing/`，已有文件仍会检查哈希。默认字体是 Noto Sans SC，许可文本在 `assets/fonts/OFL.txt`。不需要付费、账号或 API Key。离线生成可预先放置对应原字体，或用 `PUBLISH_FONT` 指向字节哈希一致的本地文件；不可随便换成另一字体却跳过校验。

第一次下载需要网络；没有网络且无缓存时会真实失败，不生成“成功”记录。原始可变字体不应提交到仓库；导出会按本书字符生成常规与粗体子集，嵌入成品。临时字体、转换图片、输入 JSON 和页面预览都位于 `tmp/publishing/`。

## 产物与内容边界

- `exports/codex-mastery.pdf`：A5 中文排版、品牌封面、可跳转目录、章节书签、页码、代码和表格。
- `exports/codex-mastery.epub`：EPUB 3，含导航目录、30 份来源文档、字体和教学图片。
- `exports/manifest.json`：源稿与产物的 SHA-256、大小、PDF 页数和验证摘要。
- `exports/validation.json`：文字提取、EPUB XML/本地链接等具体检查结果。

PDF 里的内部章节链接转为公开阅读站地址；EPUB 章节链接转为对应 XHTML。站点目录、实验室等未纳入书内的页面链接保留在线地址。SVG 在 PDF 中保留矢量；EPUB 使用带中文的清晰 PNG 兼容阅读器，并收录原 SVG 文件。真实截图继续使用原截图。

所有 Vue 教学组件都有明确文字替代：工作循环、证据判断、验收清单、意图探索、任务说明改写、路线选择及故障状态模型。离线版不运行 Codex、网站搜索、复制按钮或浏览器学习进度；参考反馈直接展开。命令和正文保留，代码为适应 A5 版心可能换行，复制执行优先使用网站代码块或 Markdown 源文件。

## 验证与续作

脚本确认导读与 1—28 章连续存在，任何未知 Vue 组件会报错，避免静默丢内容。生成后用 pypdf 提取中文并检查全部章节标题；用 zipfile 与 XML 解析器检查 EPUB 容器、全部 XHTML、章节数量及本地文件目标。字体源文件与每份原始 Markdown 都按原始字节做 SHA-256。

`exports/manifest.json` 的主要结构：

```json
{
  "version": 1,
  "sourceFiles": [{ "path": "book/00-导读.md", "sha256": "原文件字节的SHA256" }],
  "artifacts": {
    "codex-mastery.pdf": { "sha256": "...", "size": 123, "pages": 123 },
    "codex-mastery.epub": { "sha256": "...", "size": 123 }
  },
  "validation": {}
}
```

源稿有任何更新都应重新导出；不能只把旧电子书复制到网站。网页下载入口由网站整合脚本根据真实文件和上述来源哈希启用。已有电子书并不证明它对应当前正文。

文字提取不足以证明排版。每次明显版式更新后，应打开 `tmp/publishing/rendered/` 的封面、目录、正文、图解、代码与表格样页，看中文缺字、重叠、裁切与分页。脚本会生成代表性页图，可用 pypdfium2 额外渲染指定页。当前环境如没有真正的 EPUB 阅读器或 EPUBCheck，只能声明 ZIP/XML/链接与内容完整性检查，不能声称所有阅读器显示都已验收。

制作环境与最终视觉抽查记录见 `exports/verification.md`。Windows 安装流程未在本机实测；遇到差异先记录解释器、依赖版本和实际错误，不替换为虚构通过结果。
