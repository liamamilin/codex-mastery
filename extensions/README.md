# 扩展练习

这些入口服务于教材第 14、21—23 章；网页本身不调用它们。均在教材仓库根目录运行，前提为 Python 3；Git 实验另需 Git。

- `git-lab.py`：运行 `python3 extensions/git-lab.py` 建立独立临时仓库，终端只输出新路径。进入该路径，再跟第 14 章练习查看差异、取消暂存、指定恢复和提交撤销；不修改教材仓库。
- `csv-report/SKILL.md`：复用案例 C 的报告流程与独立核对，放在本仓库供阅读；没有自动安装到你的全局 Skill 目录。按第 21 章复制到自己的练习项目并验证发现范围。
- `run-csv-report.py`：串联报告与独立核对。运行 `python3 extensions/run-csv-report.py --help` 查看输入输出参数，再跟第 23 章复现相同输入的重复结果。
- `connection-evidence.json`：制作时 GitHub 只读连接返回的公开仓库字段，是历史证据文件；不是你当前环境的连接结果，也不是一个 MCP 服务。第 22 章说明如何区分连接能力、授权范围和实际返回。

已执行命令、结果与边界见 [verification.md](verification.md)。Windows 命令前缀可用 `py -3`，本项目未在 Windows 上实际验收。
