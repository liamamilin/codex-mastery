# TaskTrail 真实验证记录

核对日期：2026-10-25。执行环境：macOS，Python 3.10.13。下列程序与测试均已实际执行；不代表读者的新会话或其它操作系统已验证。

## 起点

运行目录：`cases/B-tasktrail/starter`。

```sh
python3 -B tasktrail.py --help
python3 -B tasktrail.py --data sample.json list
python3 -B -m unittest discover -s tests -v
```

实际结果：帮助列出 `--data` 与 `list/add/done`；样本列表输出：

```text
[ ] #1 核对入口命令
[x] #2 阅读项目说明
```

测试运行 4 项，全部通过，退出码 0。检查添加后由另一进程重新列表、完成后重新读取；空白标题与未知编号返回 2 且文件不变；损坏 JSON 拒绝覆盖；列表读取不存在文件时不创建文件。

## 参考成品

运行目录：`cases/B-tasktrail/solution`。

```sh
python3 -B tasktrail.py --data sample.json list --status open
python3 -B tasktrail.py --data sample.json list --status done
python3 -B tasktrail.py --data sample.json list --status unknown
python3 -B -m unittest discover -s tests -v
```

实际结果：`open` 只输出 `[ ] #1 核对入口命令`，`done` 只输出 `[x] #2 阅读项目说明`，两条退出码均为 0。`unknown` 被 argparse 拒绝，提示允许 `open/done/all`，退出码 2。

测试运行 4 项，全部通过，退出码 0。保留原添加、完成、错误输入与损坏数据保护；筛选检查未完成、已完成、默认与 `all` 一致、未知状态拒绝，以及筛选前后 JSON 字节保持一致。所有测试数据位于 Python `TemporaryDirectory`，退出后清理，不修改样本。

终端启动时出现过 `pyenv: cannot rehash` 的环境警告，原因是当前沙箱不能写入用户的 pyenv shims；Python 程序仍执行，上述退出码与结果均真实取得。未将该警告当作 TaskTrail 功能失败。

## 官方核对与未验证范围

使用 OpenAI Docs skill 搜索后实际打开并读取 [Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)，用于第 9 章的启动发现、目录层级与重新启动说明。`progress.md` 的文件名与示例格式是教材建议，不是产品强制文件。

未在 Windows 或 Linux 本机执行；未进行读者实际的 Codex 新会话接续；没有把示意任务、示例进度文件或参考成品的通过结果当作读者独立完成证据。

## 2026-10-26 源码与证据复审

重新执行两版本的 `python3 -B -m unittest discover -s tests -v`，分别 4 项通过（合计 8）。重新列出 starter 样本，以及 solution 的 open、done、all：输出与上述记录一致；未改样本。读取、错误拒绝与存储写入在临时文件中验证，没有发现需要改动的实现问题。任务说明与当前参数、默认行为相符。
