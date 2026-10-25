import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import MarkdownIt from 'markdown-it'
import matter from 'gray-matter'

const root = fileURLToPath(new URL('..', import.meta.url))
const bookDir = path.join(root, 'book')
const temporary = path.join(root, 'tmp/publishing')
await mkdir(temporary, { recursive: true })
const site = 'https://liamamilin.github.io/codex-mastery/'
const offline = {
  ControlLoop: '### 离线练习：沿工作循环判断\n\n按“意图 → 事实 → 路线 → 行动 → 证据 → 调整 → 交付”检查自己的任务。每一步写一条已知事实或下一项动作；简单任务无需逐项填表。网页交互不在电子书中运行。',
  EvidenceQuiz: '### 离线练习：证据判断\n\n哪一项证明已行动？A.“我检查过，应该没问题。” B.工具返回实际测试命令、退出码和具体结果。C.准备检查三个文件。\n\n参考反馈：B 提供执行证据，仍需检查测试覆盖；A 是陈述，C 是计划。这些是教学情境，不是真实执行日志。',
  ChapterCheckpoint: '### 离线自查：完成亲手验收\n\n在纸上勾选：保存一条正确收藏；刷新后仍存在；错误网址被拒绝；删除后刷新不恢复。勾选是读者自查，不会自动检测程序，也不会同步网站学习记录。',
  IntentExplorer: '### 离线练习：选择一个方向\n\n比较快速收藏、快速找回、定期回顾三种方向。分别用三条样本尝试连续保存、标题/域名/无匹配搜索、手动逐条回顾。记录是否有帮助、是否没解决麻烦、是否证据不足，再选择一个最小改进。现有工具不会自动提醒；这些是建议试验，不是已经执行的结果。',
  PromptWorkshop: '### 离线练习：改写一次任务说明\n\n比较“帮我弄得更高级”“先写二十页架构再换框架”和“只在保存成功后清空，失败时保留输入，并检查连续保存与刷新”。用自己的实际观察重写第三项，检查是否交代行为、现状、边界和结果。写在自己的笔记中；电子书不提供本地草稿存储、复制按钮或自动评分。',
  DecisionLab: '### 离线练习：删除后为什么恢复\n\n用纸画两份状态：当前列表与保存副本。先只从当前列表删除，再模拟刷新、从保存副本读取。比较“再重绘”“检查存储”“增加延时”。参考反馈：检查存储最能区分原因；之后把删除结果写回，再模拟刷新。这个模型不运行 Codex，也不修改真实收藏。',
  RouteChooser: '### 离线练习：给四种情境选择路线\n\n1. 需求仍模糊：先探索，比较“快速收藏、找回、回顾”三个方向。示例任务：“请用三条样本帮我比较使用场景，再选一个最小尝试。”\n\n2. CSV 口径未知：先用四行实验；它能区分空值和重复的处理。示例任务：“先约定口径，用可手算输入比较结果，不扩大到完整报告。”\n\n3. TaskTrail 边界明确：直接实施并验证。示例任务：“增加 list --status open|done|all，保留原有数据和默认列表，用两种状态样本检查。”\n\n4. 删除修补反复失败：先查证假设。示例任务：“停止增加重绘与延时，沿删除、保存、读取追踪，先选一个区分原因的检查。”\n\n在纸上先选再解释理由。这些是教学情境，不是实际 Codex 会话或自动评分。',
}
const md = new MarkdownIt({ html: true, xhtmlOut: true, linkify: false })
const names = (await readdir(bookDir)).filter(name => /^(?:[0-2]\d)-.*\.md$/.test(name)).sort()
const numbered = names.map(name => Number(name.slice(0, 2)))
if (numbered.join(',') !== Array.from({ length: 29 }, (_, i) => i).join(',')) throw new Error('Expected introduction and exactly chapters 01-28')
names.push('附录-术语与来源.md')
const nameMap = new Map(names.map((name, i) => [name, `chapter-${String(i).padStart(2, '0')}.xhtml`]))
const assets = new Map()
let headingCounter = 0
md.renderer.rules.heading_open = (tokens, index, options, env, self) => {
  const next = tokens[index + 1]
  const slug = String(next?.content || `heading-${headingCounter++}`).toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-')
  tokens[index].attrSet('id', slug)
  return self.renderToken(tokens, index, options)
}
const originalImage = md.renderer.rules.image
md.renderer.rules.image = (tokens, index, options, env, self) => {
  const source = tokens[index].attrGet('src')
  if (source && !/^[a-z]+:|^\/\//i.test(source)) {
    let absolute = path.resolve(bookDir, source)
    const publicRelative = path.relative(path.join(bookDir, 'public'), absolute)
    const canonical = path.join(root, 'assets', publicRelative)
    if (!publicRelative.startsWith('..') && existsSync(canonical)) absolute = canonical
    const id = crypto.createHash('sha256').update(absolute).digest('hex').slice(0, 12)
    const extension = path.extname(absolute).toLowerCase()
    const asset = { id, source: absolute, name: `asset-${id}${extension === '.svg' ? '.png' : extension}`, originalExtension: extension }
    assets.set(absolute, asset)
    tokens[index].attrSet('src', `../assets/${asset.name}`)
  }
  return originalImage(tokens, index, options, env, self)
}
const originalLink = md.renderer.rules.link_open || ((tokens, index, options, env, self) => self.renderToken(tokens, index, options))
md.renderer.rules.link_open = (tokens, index, options, env, self) => {
  const href = tokens[index].attrGet('href') || ''
  if (href.startsWith('./')) {
    const [file, fragment] = href.split('#')
    const decoded = decodeURIComponent(file.slice(2))
    tokens[index].attrSet('href', nameMap.has(decoded) ? `${nameMap.get(decoded)}${fragment ? `#${fragment}` : ''}` : `${site}${encodeURI(decoded.replace(/\.md$/, '.html'))}${fragment ? `#${fragment}` : ''}`)
  }
  return originalLink(tokens, index, options, env, self)
}
const chapters = []
for (let i = 0; i < names.length; i++) {
  const file = names[i]
  const raw = await readFile(path.join(bookDir, file), 'utf8')
  const parsed = matter(raw)
  const h1 = (parsed.content.match(/^# (.+)$/m)?.[1] || parsed.data.title).replace(/[\u2010-\u2015]/g, '-')
  let content = parsed.content.replace(/<([A-Z][A-Za-z]+)\s*\/>/g, (_, component) => {
    if (!offline[component]) throw new Error(`No offline replacement for ${component}`)
    return `\n\n> 离线版说明：以下为网页互动的文字替代。\n\n${offline[component]}\n\n`
  })
  content = content.replace(/<details>/g, '<section class="feedback">').replace(/<\/details>/g, '</section>').replace(/<summary>(.*?)<\/summary>/g, '<h4>参考反馈（离线展开）</h4>')
  content = content.replace(/[\u2010-\u2015]/g, '-')
  if (/<script|<style|^<[A-Z]/m.test(content.replace(/```[\s\S]*?```/g, ''))) throw new Error(`Unexpected dynamic HTML in ${file}`)
  const html = md.render(content)
  chapters.push({ file, id: `chapter-${i}`, href: nameMap.get(file), title: h1, part: parsed.data.part || '', html, sourceSha256: crypto.createHash('sha256').update(raw).digest('hex') })
}
const now = new Date()
const dateParts = Object.fromEntries(new Intl.DateTimeFormat('en', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).map(item => [item.type, item.value]))
const date = process.env.PUBLISH_DATE || `${dateParts.year}-${dateParts.month}-${dateParts.day}`
const payload = { title: '驾驭 Codex：从基础使用到复杂任务掌控', brand: 'Codex Mastery Lab', date, site, root, chapters, assets: [...assets.values()], cover: path.join(root, 'assets/diagrams/cover.svg'), fontSource: path.join(root, 'assets/fonts/source.json') }
const input = path.join(temporary, 'book.json')
await writeFile(input, `${JSON.stringify(payload, null, 2)}\n`)
const python = process.env.PUBLISH_PYTHON || 'python3'
const result = spawnSync(python, [path.join(root, 'scripts/render-book.py'), '--input', input], { cwd: root, env: process.env, stdio: 'inherit' })
if (result.error) throw result.error
process.exitCode = result.status ?? 1
