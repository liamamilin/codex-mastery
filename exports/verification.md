# 电子书出版验收记录

验收日期：2026-10-26（Asia/Shanghai）。唯一正文来源为 `book/00-导读.md`、第 01—28 章及附录，共 30 份 Markdown。最终导出已包含真实界面截图 `.jpg` 后缀修正，以及第 10 章路线练习的离线替代内容。

## 成品

| 文件 | 大小（字节） | 页数 | SHA-256 |
| --- | ---: | ---: | --- |
| `codex-mastery.pdf` | 1,001,115 | 159 | `4264d1847b31ea494484926f77dab0815de0e5c18146de5890ef27dcde191b3c` |
| `codex-mastery.epub` | 1,753,816 | 随阅读器重排 | `00857c425851a3ef9b6da71a81c9f5ade6a51d7d017ae5f4d9700337878bb202` |

`manifest.json` 的 `sourceFiles` 记录原 Markdown 文件字节的 SHA-256；本次已逐一与磁盘 30 份源稿复核一致。成品大小与 SHA-256 也重新读取文件核对一致。`validation.json` 保存逐章正文范围与机器检查结果。

## 实际执行

项目根目录执行：

```sh
PUBLISH_DATE=2026-10-26 \
PUBLISH_PYTHON=/Users/milin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 \
PYTHONPATH=/private/tmp/codex-mastery-publish-packages \
node scripts/export-book.mjs
```

本机导出解释器为 Python 3.12.14；使用 reportlab 4.4.9, pypdf 6.10.0, pypdfium2 5.14.0, fonttools 4.60.1, svglib 1.6.0。通用安装、字体下载与哈希校验、环境变量及 Windows 用法见 `docs/ebook.md`；上述绝对路径仅记录本次实际环境，构建脚本不依赖该路径。

PDF skill 的 `mark_artifact_operation_started.mjs --operation-kind create --expected-output-count 1 --output-format pdf` 已在第一次 PDF authoring 命令前成功执行一次；后续修订与验收没有重复执行。

## 检查结果

- PDF 可读取 159 页，抽取 106,808 个文本字符；导读、28 章与附录的实际正文起止片段全部通过检查。检查对象是每章书签对应正文页区间，包含正文开头与末尾，不仅查找目录标题。
- 扫描 109,867 个 PDF 字符边界框，页边界之外为 0。该项只判断字符是否越出页面，不能替代视觉检查。
- 使用 Poppler 将封面、目录、正文、代码、表格、截图与图解代表页渲染为 PNG，并实际查看。抽查包括第 1、3、5、12、24 页及多幅图解所在页；最后一轮资源修正后复查第 24、101、152 页，截图图注、跨页表格、附录表头与正文均可读，无可见截断。渲染文件保存在 `tmp/publishing/`，不作为正式成品提交。
- 五幅新增教学 SVG 均逐张查看中文及底部说明，未发现越界：意图与实验、上下文分层、版本轨迹、工具边界、长期接续。图解内容在电子书中保留，EPUB 同时携带 SVG 源图。
- EPUB 含 58 个 ZIP 条目；`mimetype`、XML、局部链接与锚点、重复 ID、30 份章节文档完整性通过检查；PNG/JPEG 内容签名与 MIME 后缀一致。包含中文子集字体及 OFL 授权文本。
- 交互组件均转换为明确标注的离线练习与反馈，不声称电子书中能执行浏览器交互或真实 Codex 操作。

## 验证边界

本次在 macOS 实际执行。未运行 EPUBCheck、实体阅读器或独立 EPUB 阅读应用的渲染测试；没有把 ZIP/XML 检查描述为阅读器验收。未在 Windows 运行导出。PDF 为代表页视觉抽查与全文件结构/文本边界检查，没有声称人工逐页审读全部 159 页。
