# NoteBlocks · 现有文本分段工具

一个 Python 3.9+ 标准库 CLI。读取一个 UTF-8 文本文件，输出段落数量与段落内容 JSON。无需安装依赖或联网。它是**毕业题起点，存在待调查的行为边界**，不是参考修复版。

在这个 `starter` 目录，或你复制出的 `my-text-lab` 中运行：

```sh
python3 -B paragraphs.py input/ordinary.txt
python3 -B -m unittest discover -s tests -v
```

Windows PowerShell 将 `python3` 换成 `py -3`。CLI 默认把 JSON 写到终端，可用 `--output result.json` 保存到自己指定的新文件；输入不改动。读取或写入失败会返回非零退出码 2 并给错误信息。请先阅读 `TASK.md` 与 `REPORT.md`，自行调查运行入口与数据路径。

两条分段基础测试只覆盖常见普通文本和空文件，另有一条 CLI 输入保护测试；**这些通过不能证明问题报告已解决**。初始命令与真实制作检查见上层案例的 `verification.md`。此目录没有隐藏收费服务，也没有完整答案。
