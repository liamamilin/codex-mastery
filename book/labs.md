---
title: 实战实验室
description: 在真实案例里练习观察、验证与纠偏。浏览器练习和本地 Codex 运行分别说明。
---

<script setup>
import { withBase } from 'vitepress'
</script>

# 实战实验室

从第一份网页，到陌生仓库、数据汇总、故障诊断与独立毕业题。**网页案例可以直接体验，Python 案例需要在本机运行。**浏览器概念练习只训练判断；它们不会替你运行 Codex。

## A / LinkShelf · 你的第一个可验收成果

把标题和网址保存为收藏，刷新后仍能找到；删除之后再次刷新，确认它不会回来。数据只留在当前浏览器与当前站点来源中。

<div class="lab-launch"><span class="lab-id">LAB / 01</span><h3>从“做出来”到“亲手证实”</h3><p>原生 HTML / CSS / JavaScript。无需账号，无需 API Key。</p><a class="primary-button" :href="withBase('/lab/linkshelf/solution/index.html')" target="_blank" rel="noopener">打开 LinkShelf 实际案例 ↗</a></div>

线上演示使用单独的案例存储键。请使用示例数据；清理网站数据、切换浏览器、端口或设备后，收藏不保证保留。

### 在本机运行

前提：安装 Git 及 Python 3，先在操作系统终端分别运行 `git --version` 与 `python3 --version` 检查。Windows 若使用 Python Launcher，把下文 `python3` 换成 `py -3`。如果还没有这些工具，先读[第 2 章](./02-工作环境.md)。

```sh
# 操作系统终端：下载源码并进入仓库
git clone https://github.com/liamamilin/codex-mastery.git
cd codex-mastery
# 在仓库根目录启动静态服务
python3 -m http.server 4174 --bind 127.0.0.1 --directory cases/A-linkshelf
```

在浏览器打开 [http://127.0.0.1:4174/solution/](http://127.0.0.1:4174/solution/)。回到终端按 **Ctrl+C** 停止服务。`starter/` 保存起始任务，`solution/` 是可对照的参考实现；读者生成的界面可以不同，以行为验收为准。

### 用这条路径检查结果

1. 保存“示例网站”，网址填 `https://example.com`；观察列表多出一条。
2. 刷新页面，确认这条收藏仍在。
3. 输入 `javascript:alert(1)`，确认无法保存且有明确提示。
4. 删除“示例网站”，刷新后确认它没有恢复。

[开始第 3 章的完整操作](./03-第一次成果.md) · [查看案例源码与说明](https://github.com/liamamilin/codex-mastery/tree/main/cases/A-linkshelf)

## A2 / A3 · 标签与 JSON 备份

完成基础版后，再进入独立增强版：保存时可写标签，标签筛选与关键词一起生效；导出的 JSON 可重新合并导入。相同标准化网址保留已有标题与标签，反馈新增与跳过数量；坏格式或危险协议会整批拒绝。它使用独立存储键，不覆盖基础版数据。

<div class="lab-pair"><a class="primary-button" :href="withBase('/lab/linkshelf/extended/index.html')" target="_blank" rel="noopener">打开标签与备份增强版 ↗</a></div>

可以先下载页面中的两条合成样本备份，导入后再次导入，确认第二次新增 0 条、跳过 2 条。再导出、删除一条并刷新，用刚才的备份恢复它。**导入会真实保存到当前浏览器**，请在练习数据上操作；先保留自己的备份。导入前校验、写入失败保持原状态等边界见源码与测试。

![真实增强版界面：可选标签、组合筛选与独立备份入口](./public/screenshots/linkshelf-extended.jpg)

本机沿用上方服务，访问 `http://localhost:4174/extended/`。这是后续能力对照，不改变第 3 章使用的基础参考成品。

## 诊断训练 / 删除了，为什么又出现？

下面是**浏览器内教学模型**，用两份内存数组表示“当前列表”和“持久化副本”。“刷新模型”是在模型中重新读取副本，不是刷新当前网页，也没有调用 Codex。它帮助你选出最有信息量的下一步。

<DecisionLab />

真实 LinkShelf 成品已经实现删除保存。这道题刻意省略保存路径，用来解释另一种失败现象；它的结果不能作为真实应用故障诊断的证据。

## B / TaskTrail · 接手陌生仓库

先找入口、数据文件和测试，再为已有 Python 命令行任务清单增加状态筛选。`starter/` 保留原始行为，`solution/` 提供对照实现。所有读写都显式指定数据文件，避免误用自己的清单。

```sh
# 仓库根目录，Python 3；将数据写到临时练习文件
python3 cases/B-tasktrail/solution/tasktrail.py --data tmp/tasktrail.json add "核对验收证据"
python3 cases/B-tasktrail/solution/tasktrail.py --data tmp/tasktrail.json list --status open
```

你应看到新增任务，以及仅未完成任务的列表。这里的命令执行真实 Python；不会调用模型。先复制 starter 再让 Codex 调查，别先把参考答案当作自己的调查结果。

[从第 7 章开始](./07-陌生代码.md) · [完整前提、命令与源码](https://github.com/liamamilin/codex-mastery/tree/main/cases/B-tasktrail)

## C / CSV Insight · 用独立核对建立信心

对人工构造的活动数据生成 Markdown 报告。明确空值和重复的处理口径，再用另一个核对程序计算总计。它不是在线数据服务，也不包含私人业务数据。

```sh
# 仓库根目录，Python 3；无需第三方 Python 包
python3 cases/C-csv-insight/report.py --input cases/C-csv-insight/input/activity.csv --output tmp/activity-summary.md
python3 cases/C-csv-insight/verify_totals.py --input cases/C-csv-insight/input/activity.csv --report tmp/activity-summary.md
```

预期：24 条输入中计入 21 条，访问 **2155**，注册 **267**；2 条含空值、1 条完全重复被排除，并留下来源行号。数字符合这份样本的约定，不代表所有 CSV 都应该采用相同口径。

[用第 11 章做最小实验](./11-最小实验.md) · [数据、源码与验证说明](https://github.com/liamamilin/codex-mastery/tree/main/cases/C-csv-insight)

## D / Phantom Delete · 亲手复现幽灵删除

这是独立的真实故障项目：起点删除记录后，界面减少一条，存储仍保留旧记录；**直接刷新**，记录重新出现。参考修复版补齐持久化。两版各用自己的存储键，与 LinkShelf 隔离。

<div class="lab-launch diagnostic"><span class="lab-id">LAB / 04 · REAL BUG</span><h3>在同一动作中，比较两层状态。</h3><p>先删除一条 → 点“检查持久化” → 直接刷新。删除后先新增会保存整个列表，掩盖这次故障。</p><div class="lab-pair"><a class="primary-button" :href="withBase('/lab/phantom-delete/starter/index.html')" target="_blank" rel="noopener">打开故障起点 ↗</a><a class="secondary-button" :href="withBase('/lab/phantom-delete/solution/index.html')" target="_blank" rel="noopener">对照参考修复 ↗</a></div><p class="lab-scope">浏览器页面真实读写当前来源的 localStorage；没有后台或 Codex 调用。“恢复初始样本”会确认后覆盖当前版本的练习记录。</p></div>

本机运行：在仓库根目录执行下列命令，打开 `http://127.0.0.1:4176/starter/` 或 `/solution/`，Ctrl+C 停止。

```sh
python3 -m http.server 4176 --bind 127.0.0.1 --directory cases/D-phantom-delete
```

[第 17 章定位错误层次](./17-错误层次.md) · [第 18 章停止无效修补](./18-停止无效修补.md) · [源码与验证](https://github.com/liamamilin/codex-mastery/tree/main/cases/D-phantom-delete)

## E / 毕业实战 · 在陌生任务上独立完成

两条路线任选其一：从四份有歧义的会议纪要整理可追溯行动项，或调查一个文本分段工具的真实边界缺陷。你需要自己提出完成标准、取得证据、必要时改变方向。

- **E1 会议纪要**：真实可读的合成输入包含缺失负责人、缺失日期、同名、取消与变更。未知信息要保留，不能凭空补全。
- **E2 文本工具**：可运行起点带有 2 项会通过的基础测试，但没有覆盖全部分段边界。先读故障报告，复现，再补充能区分根因的检查。

毕业题提供起点和教师审阅重点，**不提供完整参考解法**；“现有测试通过”不等于你已毕业。

[第 28 章任务与完成状态](./28-毕业实战.md) · [毕业题材料](https://github.com/liamamilin/codex-mastery/tree/main/cases/E-capstone)

## 一次运行现有案例测试

在仓库根目录执行，前提为 Node.js 22、Python 3.9+。它会检查 A/D 的 JavaScript 逻辑，以及 B/C/E2 的 Python 行为。它不会替你完成浏览器验收，也不会修掉毕业题故意保留的缺陷。

```sh
npm test
```

[查看真实验证边界](https://github.com/liamamilin/codex-mastery/blob/main/progress.md) · [Skill、脚本与连接练习源码](https://github.com/liamamilin/codex-mastery/tree/main/extensions)
