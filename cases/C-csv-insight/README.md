# 案例 C · CSV Insight：离线数据汇总与独立核对

这是人工构造的学习数据，不是真实业务记录。用它训练“看输入 → 说明口径 → 生成摘要 → 独立核对 → 解释限制”。没有数据库、在线模型调用或网络服务；报告不会从几列数字推断增长原因。

## 条件与文件

使用 Python 3.9 或更新版本、标准库即可，无需 pip 或 API Key。

| 文件 | 用途 |
| --- | --- |
| `input/activity.csv` | 24 条人工数据，多个日期、3 个渠道；包含 1 条完全重复、2 条空值记录。 |
| `input/probe.csv` | 第 11 章的小实验输入，只有 4 条记录，便于手算。 |
| `report.py` | 读取单个 CSV，生成 Markdown 总数、渠道表与数据质量说明。 |
| `verify_totals.py` | 不导入 `report.py`，用另一条统计路径核对总数、渠道与质量计数。 |
| `tests/test_report.py` | 标准库 unittest，测试在系统临时目录中执行，不改样本。 |
| `output/summary.md` | 从提供的完整样本实际生成的参考报告，可重新构建。 |

要自己修改，先把整个 `cases/C-csv-insight` 复制到一个尚不存在的独立目录，如 `my-csv-insight`；不要把个人唯一一份 CSV 当作练习输入，也不要覆盖同名旧练习。

## 运行

下面所有命令均在**案例根目录**执行，即同时包含 `report.py`、`input/` 与 `tests/` 的那一层。相对路径以终端当前目录为起点。

```sh
# macOS / Linux
python3 --version
python3 -B report.py --input input/activity.csv --output output/summary.md
python3 -B verify_totals.py --input input/activity.csv --report output/summary.md
python3 -B -m unittest discover -s tests -v
```

```powershell
# Windows PowerShell；需 Python Launcher
py -3 --version
py -3 -B report.py --input input/activity.csv --output output/summary.md
py -3 -B verify_totals.py --input input/activity.csv --report output/summary.md
py -3 -B -m unittest discover -s tests -v
```

若没有 `py`、但 `python --version` 返回 Python 3，可用 `python` 替代 `py -3`。`-B` 避免生成字节码缓存，不禁止报告写入。用普通编辑器打开 `output/summary.md`，或在支持 Markdown 的编辑器中预览；本案例不启动网页服务器。

## 明确的数据策略

输入表头必须且只能包含 `date,channel,visits,signups` 四列，顺序可以变化。文本采用 UTF-8，可带 BOM。字段去首尾空格后处理：

- 任一必需字段为空：排除整条记录，报告原 CSV 行号与空字段；不把空数值猜成 0。
- 四字段在日期文本、渠道文本、整数值上完全相同：只计第一条，报告重复行及第一次出现的行号。
- 同日同渠道但数值不同：保留两条；没有数据定义支持把它们当成重复。
- 渠道区分大小写；不推测 `Search` 与 `search` 是否同义。
- 日期必须是有效 `YYYY-MM-DD`；数值必须是非负整数；注册数大于访问数、列数错误、损坏 CSV 或表头缺失时，整次生成失败，返回 2，已有报告保留。
- 空白物理行由 CSV 读取器忽略，不计为输入记录。没有可计入记录时拒绝生成。

这是**本案例的约定**，不代表所有业务都应当这样清洗。真实项目遇到空值和重复，需要先确认数据含义与来源，不能为了得到好看的总数自行改变口径。

## 应当观察到的结果

完整样本：24 条输入 = 21 条计入 + 2 条空值排除 + 1 条完全重复排除。

| 渠道 | 访问数 | 注册数 |
| --- | ---: | ---: |
| community | 495 | 36 |
| newsletter | 630 | 127 |
| search | 1030 | 104 |
| 总计 | 2155 | 267 |

报告列出排除第 23 行（重复第 2 行）、第 24 行（`visits` 空值）、第 25 行（`signups` 空值）。行号包含表头。总数只针对计入记录；日期范围也只针对这些记录，不据此声称完整覆盖所有日期。

小实验：`python3 -B report.py --input input/probe.csv --output output/probe-summary.md` 应得到访问 18、注册 3，计入 2、空值 1、重复 1。对应独立核对将 `--input` 与 `--report` 换成这两个路径即可。

## 验证与失败恢复

同一输入重复生成应得到相同字节，不加入每次变化的时间戳。测试把一条**非重复**的 `newsletter,80,16` 改为 `newsletter,87,16`，应让总访问从 2155 变为 2162，注册仍为 267。若改的是重复对中的一条，会同时改变去重关系，不再是单纯的 +7 实验。

坏输入时不覆盖旧报告，不代表旧报告对应新的输入。看到错误要停止把旧文件当作本次成功结果，先修正输入或口径，再运行与核对。输入和输出不能指向同一个文件。报告先在内存中完整生成，再写临时文件替换目标；这降低单次失败留下半截报告的机会，不等于永久备份或多进程事务。

独立核对脚本从 CSV 另行求和，验证报告的正文总数、质量计数、可见渠道表与核对 JSON；它不证明输入记录来自真实业务，也不决定业务口径。实际执行结果保存在 `verification.md`。

未在 Windows / Linux 本机运行；不声称已进行浏览器实测、模型自动分析或读者独立操作验收。
