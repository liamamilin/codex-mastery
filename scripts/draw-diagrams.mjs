// Editable SVG figures. Run with Node.js; no drawing service or API is needed.
import { writeFile } from 'node:fs/promises'
const figures = [
  { file: 'intent-experiment', id: '02', title: '把愿望变成能回答的问题', subtitle: '先检验价值，再决定要不要扩大实现。', steps: [
    ['愿望', '“收藏以后，总找不到。”', '先保留问题，不急着决定功能。'],
    ['可区分的问题', '是忘了保存，还是保存后难找？', '两种问题需要不同的下一步。'],
    ['最小可观察动作', '保存 3 条，再用标题关键词找回 1 条。', '只改变一个方向，记录能否完成。'],
    ['决定', '有帮助 → 继续；无帮助 → 重查假设。', '“不确定”也是结果：说明还缺观察。']
  ], foot: '证据是具体使用结果；功能数量不能替代问题被解决。' },
  { file: 'context-layers', id: '03', title: '上下文要让行动有依据', subtitle: '同一件事放在最合适的位置，减少重复与过期。', steps: [
    ['当前任务', '目标、允许范围、这次要验证什么', '写在当前任务说明中。'],
    ['项目约定', '长期有效的运行方式与边界', '写入项目 AGENTS.md，避免混入一次性状态。'],
    ['当前事实', '入口、实际输入、测试结果与差异', '来自读取和执行；引用具体路径。'],
    ['接续记录', '停在哪里、未解问题、下一项检查', '新会话先复核，再决定是否沿用。']
  ], foot: '文件存在 ≠ 内容已读取；历史记录 ≠ 当前状态。' },
  { file: 'version-trail', id: '05', title: '恢复之前，先辨认状态', subtitle: 'Git 中不同位置的改变，不能用同一句“撤销”处理。', steps: [
    ['工作区', '你正在编辑的文件', '先看 git diff；保留需要的修改与备份。'],
    ['暂存区', '下一次提交准备记录的变化', '看 git diff --cached；取消暂存不会删掉编辑。'],
    ['提交历史', '已经记录的版本', '看 git log；公开历史中的撤销可用新提交表达。'],
    ['恢复后的行为', '文件内容正确，还要实际运行', '确认目标恢复、旁支笔记仍在、功能未退化。']
  ], foot: '第 14 章用独立临时仓库练习；不要在教材仓库试破坏性命令。' },
  { file: 'tool-boundary', id: '07', title: '连接能力，要同时看三层', subtitle: '有工具不等于需要调用；连接成功也不代表任意动作获准。', steps: [
    ['宿主与授权', '当前客户端、账号与项目范围', '实际可见工具清单决定本次可用入口。'],
    ['连接与工具', '插件或 MCP 提供具体能力', '先确认目标、参数、读写性质与返回范围。'],
    ['任务动作', '例如：只读获取公开仓库信息', '从小范围检查开始，不把读权限推成写权限。'],
    ['可用证据', '实际返回、时间、适用边界', '旧记录可复查，但不冒充当前在线状态。']
  ], foot: '没有连接时可读本地源码继续；不要为演示工具而扩大授权。' },
  { file: 'handoff-loop', id: '08', title: '让下一次工作接得上', subtitle: '保存的不只是结论，还有取得结论的依据。', steps: [
    ['记录起点', '当前版本、输入位置与运行前提', '另一个会话应能找到同一份工作。'],
    ['保留证据', '有效命令、真实结果与失败条件', '区分已执行、未执行与仅供演示。'],
    ['留下决策', '为什么继续、换路或缩小范围', '连同没有解决的问题一起保存。'],
    ['重新确认', '读取记录 → 检查现状 → 继续行动', '有冲突时以当前事实修正旧记录。']
  ], foot: '接续成功的标准：不依赖上一段对话，也能恢复有效行动。' }
]
const xml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
for (const f of figures) {
  const cards = f.steps.map((step, i) => {
    const y = 155 + i * 143
    return `<g transform="translate(30 ${y})"><rect width="620" height="118" rx="5" fill="#151e2b" stroke="#354456"/><text x="24" y="31" fill="#ff997a" font-size="12" letter-spacing="2">0${i + 1} / ${xml(step[0])}</text><text x="24" y="62" fill="#eef3fa" font-size="19" font-weight="600">${xml(step[1])}</text><text x="24" y="93" fill="#afbed0" font-size="14">${xml(step[2])}</text></g>${i < 3 ? `<path d="M340 ${y + 119}v17m-5-5 5 5 5-5" stroke="#7bc9dc" fill="none" stroke-width="1.5"/>` : ''}`
  }).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="820" viewBox="0 0 680 820" role="img" aria-labelledby="title desc"><title id="title">${f.title}</title><desc id="desc">${f.steps.map(s => s.join('：')).join('。')}</desc><rect width="680" height="820" rx="6" fill="#0b101c"/><g font-family="'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif"><text x="30" y="37" fill="#7bc9dc" font-size="11" letter-spacing="2">CODEX MASTERY LAB / FIG. ${f.id}</text><text x="30" y="80" fill="#f2f6fc" font-size="27" font-weight="700">${f.title}</text><text x="30" y="113" fill="#afbed0" font-size="14">${f.subtitle}</text>${cards}<path d="M30 752H650" stroke="#354456"/><text x="30" y="784" fill="#7bc9dc" font-size="12">${f.foot}</text></g></svg>`
  await writeFile(`assets/diagrams/${f.file}.svg`, svg)
}
console.log(`Created ${figures.length} source SVG teaching figures.`)
