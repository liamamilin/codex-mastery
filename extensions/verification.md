# 本地复用示例的验证记录

日期：2026-10-25。环境：macOS 26.6.2，Python 3.10.13，Node.js v22.21.1，Git 2.54.0，Codex CLI 0.154.0。本文件记录实际执行范围，不替代读者自己的操作结果。

## Git 练习

运行 `python3 -B extensions/git-lab.py`，生成独立系统临时仓库。实际执行 `status --short`、指定 README 的 `diff`、`add`、`diff --cached`、`restore --staged`、备份后 `restore --source=HEAD --worktree -- README.md`、分开提交笔记与 README、`revert --no-edit HEAD`、`log --oneline -4`。

结果：取消暂存未丢文件内容；恢复 README 后另一份笔记保留；撤销产生新的提交，原提交仍在历史，笔记仍保留。未修改教材仓库的历史、未改全局 Git 身份、未设置远端或推送。临时目录仅是本次执行位置，不作为教材固定路径。

## CSV Skill 与脚本

`extensions/csv-report/SKILL.md` 使用 skill-creator 的 `quick_validate.py` 实际验证，返回 `Skill is valid!`。按照该文件指引定位案例、读 README、生成报告、独立核对与重复比较。此技能保存在 `extensions/`，未安装到全局或项目自动发现目录；没有证明某个新会话会自动选中它。

`extensions/run-csv-report.py` 使用当前 Python 运行已有 `report.py` 和 `verify_totals.py`，不使用 shell 字符串执行命令。以 `cases/C-csv-insight/input/activity.csv` 为输入，在系统临时目录实际连续生成并核对两次：计入 21 条，访问 2155，注册 267，空值排除 2 条，重复排除 1 条。两次字节一致，SHA-256：

```text
1f324ecf2250998285cd71b57aeda07cd67ce1281c3d386485b9c41c03b11c12
```

第二份输入 `input/probe.csv` 实际生成并独立核对：访问 18、注册 3，计入 2 条、空值 1 条、重复 1 条。另造非法数值 `no-number` 的临时 CSV 后运行包装脚本，退出码 2，原有报告字节保留，未进入独立核对成功路径。这些任务没有修改原始样本或案例源码。

## 连接与当期入口

通过本制作环境的 GitHub 插件实际只读调用 `get_repo(repository_full_name="liamamilin/codex-mastery")`，返回全名、默认分支 `main`、可见性 `public`、非归档状态。只保留上述公开字段于 `connection-evidence.json`；不推断读者已连接或所有访问权限都成立。

实际执行 `codex review --help`、`codex mcp --help`、`codex mcp list`、`codex exec --help`。帮助确认相应入口；CLI 配置列表与桌面工具目录不是同一视图，不能仅凭其中一方推出另一方可用工具。没有新增连接、修改用户配置或运行额外模型审查、付费基准。

官方事实按对应章节链接核对于上述日期。Windows / Linux 手动流程、Skill 自动发现、新的模型运行与定时任务均未执行。

## 2026-10-26 源码与验证复审

B starter 4 项、B solution 4 项、C 5 项、D 9 项、E2 3 项，合计 **25 项自动测试实际通过，0 失败、0 跳过**。E2 的 3 项含原有两条分段 baseline 与一条输入保护；毕业题缺陷保留，mixed 样本仍输出 2 段，未宣称已解决。E1 四份材料重新以 UTF-8 读取，行数仍为 17/16/14/17，没有生成答案。

本轮修正两个真实问题：C 独立校验原先会漏过可见渠道表被改错，现同时检查可见表与质量计数，并以篡改回归证明拒绝；E2 输出的输入硬链接原先可绕过同路径检查，现拒绝相同文件身份，原始输入保持不变。两项缺陷均先在临时副本实际复现，再修改与验证；未触及毕业题分段算法。

包装脚本在新临时目录重跑两次，生成与增强后的独立核对均通过，字节相同，SHA-256 仍为上文值。Skill 格式再次验证通过。GitLab 示例只在临时仓库操作；GitHub 历史 JSON 重新读取仅证明文件可读，没有伪装成新增在线调用。

D 的浏览器验收由主 Agent 提供，具体行为、390 宽度与真实截图说明已加入案例 README；复审者只重新执行其逻辑测试，不冒称亲自进行浏览器观察。Windows/Linux、实际浏览器权限失败、额外模型调用仍不在本轮证据中。
