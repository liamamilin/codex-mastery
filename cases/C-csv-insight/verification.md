# CSV Insight 真实执行记录

日期：2026-10-25。环境：macOS，Python 3.10.13。运行目录：`cases/C-csv-insight`。

实际执行：

```sh
python3 -B report.py --input input/activity.csv --output output/summary.md
python3 -B verify_totals.py --input input/activity.csv --report output/summary.md
python3 -B -m unittest discover -s tests -v
```

报告命令返回 0，实际输出：

```text
已生成 output/summary.md：计入 21 条，访问 2155，注册 267；排除空值 2 条、重复 1 条。
```

独立核对命令返回 0，实际输出：

```text
独立核对通过：访问 2155，注册 267；计入 21 条，空值 2 条，重复 1 条。
```

4 个 unittest 全部通过，退出码 0，实际覆盖：

1. 已知总数、渠道数值、空值与重复行号；调用不导入报告模块的独立核对脚本。
2. 相同输入重复运行时输出字节一致；修改一条非重复记录的访问数 +7 后，实际总数 2162，注册仍为 267。
3. 将一处合法数字改为 `eighty` 后返回 2，原报告字节保持不变。
4. 输入输出同一路径、表头缺列都返回 2，输入或旧报告保持原样。

测试使用系统临时目录；没有把故意构造的错误变成 CI 整体失败。提供的 `output/summary.md` 是实际运行产生的报告，不是模型手填结果。

小实验也已实际执行 `python3 -B report.py --input input/probe.csv --output output/probe-summary.md`，以及 `python3 -B verify_totals.py --input input/probe.csv --report output/probe-summary.md`。两条均返回 0，得到计入 2、访问 18、注册 3、空值 1、重复 1；对应报告已实际生成。

终端启动出现过 pyenv 无法写入 shims 的环境警告；Python 命令仍实际执行并取得以上结果。未在 Windows/Linux 本机执行，未作浏览器检查，没有调用 Codex 自动运行数据分析，未把示意对话写成执行日志。

## 2026-10-26 独立校验复审与修正

发现原校验只验证核对 JSON 与正文两项总数：实际在临时报告将 search 渠道表中的访问 1030 改为 9999，原校验仍退出 0。这是验证覆盖缺口，不是报告统计已知算错。

修正 `verify_totals.py`：仍不导入 `report.py`，从 CSV 的独立记录与列求和路径派生各渠道数据，再同时核对读者看到的渠道表、输入/计入/排除计数与总数。加入一项篡改回归（渠道表、空值计数两个分支），确保机器 JSON 正确但可见报告被改错时返回 2。

实际重跑 unittest，当前 **5 项全部通过**。完整报告独立核对仍为 2155/267，小样本为 18/3，质量计数保持原记录。没有重写输入或报告口径。人工渠道表、机器数值与独立求和互相对照；业务原始数据的真实性仍不在这些测试证明中。
