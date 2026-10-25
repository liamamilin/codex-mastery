# Codex Mastery Lab · 接续状态

更新：2026-10-26，Asia/Shanghai。**v1.0 完整首版已制作、提交并公开部署。** 工作目录整体改名为 `codex-tutorial`，文件与Git身份已核对，继续维护现有工程。

## 已交付

- 导读、8部分28章、术语来源附录，30份Markdown为唯一正文源；已完整阅读审校，章节、前提、案例与交叉引用见 `artifacts/editorial-review.md`。
- 完整静态阅读站：品牌首页、完整课程、章节侧栏/位置/提纲/跳转、全文搜索、代码复制、明暗主题、手机布局与本地学习进度。
- 7种互动：工作循环、证据判断、诊断状态模型、实操清单、目标探索、任务说明工坊、路线选择。演示与真实Codex执行分开，支持反馈/重置；草稿仅保存在浏览器。
- A基础与标签/JSON备份增强版；B陌生Python仓库起点/参考；C离线报告与独立核对；D确定性故障/修复；E两套毕业题。E1提供输入与要求，E2保留分段缺陷；没有将未解毕业起点当成完成答案。
- 封面、7幅教学SVG、品牌标记、真实JPEG截图，原件与来源在 `assets/`；五幅新图可由代码重建。
- PDF **159页**、EPUB，与30份源稿哈希一致；包含目录、中文字体子集、教学图片与离线练习替代。已提取各文档首尾、核对EPUB结构/链接/锚/MIME并实际查看代表页；详见 `exports/verification.md`。
- 网站源码、案例代码、出版脚本、MIT/OFL许可、开发/部署/出版文档、GitHub Pages自动部署配置均入库。

## 已验证

- 重新 `npm ci --offline` 安装锁定依赖；44项案例测试通过：JavaScript28、Python16。CI亦实际运行全部通过，输出见 `artifacts/case-tests.txt` / `github-ci.json`。
- 最终子路径构建：39个HTML、1909个本地目标通过，见 `artifacts/build-check.json`。`.html`深层路径可以在Pages刷新，网站不需要后端或运行时API。
- C独立核对支持可见渠道表/质量计数篡改回归；E2输入硬链接保护通过，教学分段缺陷仍在。
- B/C/E实际CLI、独立Git恢复、重复脚本、Skill格式校验与只读GitHub返回分别见各案例及 `extensions/verification.md`。
- 真实浏览器验证D故障与修复、A标签/组合筛选/文件导入去重/导出读回/删除刷新/备份恢复/坏输入保留数据；教材搜索进入第28章、复制、进度刷新、交互反馈与重置，1440/390布局。
- 公开网址真实打开，PDF/EPUB实际HTTP下载并匹配成品SHA-256；公开增强版和故障起点实际操作，见 `artifacts/online-verification.json` 与 `browser-verification.md`。

## 发布与源码

- [公开站点](https://liamamilin.github.io/codex-mastery/) · [源码](https://github.com/liamamilin/codex-mastery)。
- 首版主体提交：`799ea01075582144453101096452b729cfc9e9f3`；远端tree `40d258b4c1a43e6c4c1c5620278864a3cde30194` 与本地完全一致。
- [Actions #4](https://github.com/liamamilin/codex-mastery/actions/runs/40212950521)：build与deploy成功；用户已启用Source=GitHub Actions，无需再次配置。
- 终端没有GitHub登录，本轮通过已授权GitHub连接创建相同文件树后更新main；fetch核对相同tree再对齐本地，没有强推或丢失文件。后续验收补记提交不改变首版教材成品。

## 已知边界

- 一次连续线上验收会话出现通用Vue水合警告；新线上会话及详细UTC本地构建重复相同功能路径未再出现。未取得稳定复现，未冒称修复；具体日志与范围已保留。若再次出现，先保留触发页/浏览器版本/动作，再以详细诊断定位，不盲改状态或时区。
- 未重新安装/登录Codex，未在Windows/WSL/Linux桌面、真实手机硬件、Safari/Firefox和所有账号入口验收；没有虚构模型成本或提速基准。
- EPUB未在独立阅读器/EPUBCheck验收；结构和内容检查不等于全部阅读器兼容。Skill未冒充所有客户端自动发现通过。旧连接文件不是实时状态。
- localStorage不是云同步或永久备份；仅操作练习样本。学完打勾是自查，不是自动能力认证。

## 维护入口

直接从现有工程继续，不重写规划：README用于安装运行；`docs/deployment.md`用于Pages；`docs/ebook.md`用于重新出版。修改正文后重跑 `npm run export:book`，再构建，来源哈希不符会报告过期成品。Markdown固定LF以便跨平台校验；不要编辑生成的 `book/public/` 或generated元数据。案例变动运行对应验证；出版版式变动再实际查看代表页。
