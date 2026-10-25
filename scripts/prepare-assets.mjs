import './prepare-course.mjs'
import { cp, mkdir, rm, readFile, writeFile, access } from 'node:fs/promises'
import { createHash } from 'node:crypto'
await rm('book/public/lab', { recursive: true, force: true })
await mkdir('book/public/lab/linkshelf', { recursive: true })
await cp('cases/A-linkshelf/solution', 'book/public/lab/linkshelf/solution', { recursive: true })
await cp('cases/A-linkshelf/extended', 'book/public/lab/linkshelf/extended', { recursive: true })
for (const part of ['starter', 'solution', 'shared']) {
  await cp(`cases/D-phantom-delete/${part}`, `book/public/lab/phantom-delete/${part}`, { recursive: true })
}
for (const directory of ['diagrams', 'screenshots']) {
  await rm(`book/public/${directory}`, { recursive: true, force: true })
  await cp(`assets/${directory}`, `book/public/${directory}`, { recursive: true })
}
await rm('book/public/downloads', { recursive: true, force: true })
const downloads = []
let hasManifest = false
try { await access('exports/manifest.json'); hasManifest = true } catch { /* Export can be produced separately. */ }
if (hasManifest) {
  const manifest = JSON.parse(await readFile('exports/manifest.json', 'utf8'))
  const hash = bytes => createHash('sha256').update(bytes).digest('hex')
  for (const source of manifest.sourceFiles) {
    if (hash(await readFile(source.path)) !== source.sha256) throw new Error(`电子书源稿已变化，请重新 export:book：${source.path}`)
  }
  await mkdir('book/public/downloads', { recursive: true })
  for (const format of ['pdf', 'epub']) {
    const file = `codex-mastery.${format}`
    const meta = manifest.artifacts[file]
    if (!meta || hash(await readFile(`exports/${file}`)) !== meta.sha256) throw new Error(`电子书校验不符：${file}`)
    await cp(`exports/${file}`, `book/public/downloads/${file}`)
    downloads.push({ format: format.toUpperCase(), file, size: meta.size, pages: meta.pages || null })
  }
}
await writeFile('book/.vitepress/downloads.generated.ts', `// Generated from the verified export manifest.\nexport const downloads = ${JSON.stringify(downloads)}\n`)
console.log(`Prepared diagrams, screenshots, static cases and ${downloads.length} verified ebook downloads.`)
