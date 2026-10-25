# TaskTrail 工作约定（复制到自己工作副本的 AGENTS.md）

- 这是离线 Python 标准库 CLI，不增加第三方依赖或在线服务。
- 入口是 tasktrail.py；--data 明确指定数据路径，示例数据 sample.json 不用于写入练习。
- 改动后运行 python3 -B -m unittest discover -s tests -v；Windows 用 py -3 替代 python3。
- 测试写入系统临时目录。手工检查使用自己的 scratch.json，不覆盖已有任务文件。
- 交付写明实际命令、结果与未验证范围；继续工作前阅读 progress.md，并核对实际文件。
