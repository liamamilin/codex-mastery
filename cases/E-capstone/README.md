# 案例 E · 独立毕业实战

这里提供两道此前正文没有逐步解答的陌生题。默认选择 E1，也可选择 E2。**只有起点，没有已完成的参考产品。**本目录不会调用 Codex、外部 API 或在线服务；真实协作由你在自己的工作副本进行。

## 选题

| 选题 | 初始材料 | 你要交付什么 |
| --- | --- | --- |
| E1 · 离线会议记录整理助手（默认） | `e1-meetings/input/` 四份合成 Markdown 纪要；任务见 `e1-meetings/TASK.md` | 可重复运行的本地整理工具、结构化结果、可追溯出处、验证与接续记录。 |
| E2 · 陌生文本工具维护 | `e2-texttool/starter/` 现有 Python CLI、含糊问题报告、样本、两条分段基础测试与一条输入保护测试 | 有证据的故障诊断、最小修复、有效回归与交付说明。 |

本案例评估目标澄清、调查、推进路线、验证、纠偏、解释和会话接续；不以提示词与参考讲义逐字相同为准。自评维度在第 28 章。不要让 Codex 读取 `teachers/` 后再把答案伪装成独立解题。

## 工作副本与前提

所有输入均为虚构教学材料，不含真实个人信息。保留原始目录，不在题面文件中删掉不方便处理的记录。使用自己的已登录 Codex；本地代码与测试只需 Python 3.9+，无需 pip、npm、数据库或 API Key。

从教材根目录开始，复制**尚不存在的新目录**；已有同名目录时换名称，不覆盖：

```sh
# macOS / Linux，二选一
cp -R cases/E-capstone/e1-meetings my-meeting-lab
cp -R cases/E-capstone/e2-texttool/starter my-text-lab
```

```powershell
# Windows PowerShell，二选一
Copy-Item -Recurse cases/E-capstone/e1-meetings my-meeting-lab
Copy-Item -Recurse cases/E-capstone/e2-texttool/starter my-text-lab
```

在自己的副本打开 Codex，先读 `TASK.md`。E1 尚无程序入口，需要自行组织实现；E2 的现有运行方式在副本 `README.md`。Windows 例子假定已安装 Python Launcher；没有 `py` 但 `python --version` 返回 Python 3 时，可用 `python` 替代 `py -3`。

## 本仓库已经验证的范围

制作验证见 `verification.md`。已核查材料和 E2 基础可运行性，**不代表毕业任务已经解决**。两条基础测试通过也不足以证明问题报告覆盖的边界正确。教师审阅重点在 `teachers/README.md`，含剧透提示但没有完整参考实现；建议独立提交后再读。
