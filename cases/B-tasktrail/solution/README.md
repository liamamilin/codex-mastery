# TaskTrail

一个离线任务清单，使用 Python 3.9 或更新版本与标准库。没有 pip 依赖。

在这个目录运行（macOS / Linux）：

```sh
python3 -B tasktrail.py --data sample.json list
python3 -B tasktrail.py --data scratch.json add "整理学习记录"
python3 -B tasktrail.py --data scratch.json done 1
python3 -B tasktrail.py --data scratch.json list --status done
python3 -B -m unittest discover -s tests -v
```

Windows PowerShell 将 `python3` 换成 `py -3`；没有 Python Launcher 但 `python --version` 返回 Python 3 时可用 `python`。

`--data` 必须放在子命令前。相对数据路径以终端当前目录为起点。`sample.json` 是样本，自己的任务请用另一个文件。列表中的 `[ ]` 代表未完成，`[x]` 代表已完成。

这是参考成品，增加了 `list --status open|done|all`。默认 `all` 保持原来的全部列表；筛选不会修改数据。不存在的状态由参数解析拒绝，退出码为 2。先完成 starter 的调查与修改，再打开这里对照。
