import { readFile, readdir, writeFile, access } from 'node:fs/promises'
import matter from 'gray-matter'

const published = []
for (const file of await readdir('book')) {
  if (!/^\d{2}-.+\.md$/.test(file)) continue
  const { data } = matter(await readFile(`book/${file}`, 'utf8'))
  if (!Number.isInteger(data.chapter) || data.chapter === 0) continue
  published.push({
    id: data.chapter,
    file: file.slice(0, -3),
    label: String(data.title).replace(/^第\s*\d+\s*章\s*[·：:]?\s*/, ''),
    skill: data.skill || data.description || data.title,
    duration: data.duration || '含动手操作'
  })
}
published.sort((a, b) => a.id - b.id)
if (new Set(published.map(chapter => chapter.id)).size !== published.length) throw new Error('教材存在重复章节编号')
let availableCases = 0
for (const name of ['A-linkshelf', 'B-tasktrail', 'C-csv-insight', 'D-phantom-delete', 'E-capstone']) {
  try { await access(`cases/${name}/README.md`); availableCases++ } catch { /* Not yet published. */ }
}
await writeFile('book/.vitepress/published.generated.ts', `// Generated from book frontmatter; edit the Markdown sources instead.\nexport const published = ${JSON.stringify(published, null, 2)}\nexport const availableCases = ${availableCases}\n`)
console.log(`Prepared ${published.length} chapter entries from Markdown.`)
