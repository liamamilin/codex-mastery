# TaskTrail

一个离线任务清单，使用 Python 3.9 或更新版本与标准库。没有 pip 依赖。

在这个目录运行（macOS / Linux）：

```sh
python3 -B tasktrail.py --data sample.json list
python3 -B tasktrail.py --data scratch.json add "整理学习记录"
python3 -B tasktrail.py --data scratch.json done 1
python3 -B -m unittest discover -s tests -v
```

Windows PowerShell 将 `python3` 换成 `py -3`；没有 Python Launcher 但 `python --version` 返回 Python 3 时可用 `python`。

`--data` 必须放在子命令前。相对数据路径以终端当前目录为起点。`sample.json` 是样本，自己的任务请用另一个文件。列表中的 `[ ]` 代表未完成，`[x]` 代表已完成。此说明仅覆盖常用命令，完整参数请运行 `python3 -B tasktrail.py --help`；项目的其它行为请结合实现和测试确认。
