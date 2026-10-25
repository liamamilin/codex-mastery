---
title: 实战实验室
description: 在真实案例里练习观察、验证与纠偏。浏览器练习和本地 Codex 运行分别说明。
---

<script setup>
import { withBase } from 'vitepress'
</script>

# 实战实验室

这里有两种不同的练习：**可运行的真实网页案例**，以及**训练判断的浏览器概念模型**。网站不会替你运行 Codex。你可以先体验，再回到自己电脑的练习目录实践。

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

## 诊断训练 / 删除了，为什么又出现？

下面是**浏览器内教学模型**，用两份内存数组表示“当前列表”和“持久化副本”。“刷新模型”是在模型中重新读取副本，不是刷新当前网页，也没有调用 Codex。它帮助你选出最有信息量的下一步。

<DecisionLab />

真实 LinkShelf 成品已经实现删除保存。这道题刻意省略保存路径，用来解释另一种失败现象；它的结果不能作为真实应用故障诊断的证据。

## 之后会开放的案例

| 案例 | 你将练习的能力 | 当前状态 |
| --- | --- | --- |
| B · TaskTrail | 接手陌生 Python 项目，先调查再修改 | 待开发 |
| C · CSV Insight | 离线数据汇总，独立核对数值 | 待开发 |
| D · Phantom Delete | 在独立故障项目中复现、定位与修复 | 待开发；上方仅为概念模型 |
| E · 毕业实战 | 在陌生任务上独立完成与纠偏 | 待开发 |

已验证范围及后续入口保存在仓库的 [progress.md](https://github.com/liamamilin/codex-mastery/blob/main/progress.md)。
