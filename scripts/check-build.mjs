import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = path.resolve(root, process.env.BUILD_DIR || 'book/.vitepress/dist')
const reportPath = path.resolve(root, process.env.BUILD_CHECK_REPORT || 'artifacts/build-check.json')
const [owner = '', repo = ''] = (process.env.GITHUB_REPOSITORY || '').split('/')
const inferred = repo && repo.toLowerCase() !== `${owner.toLowerCase()}.github.io` ? `/${repo}/` : '/'
const baseInput = process.env.SITE_BASE || (process.env.GITHUB_ACTIONS === 'true' ? inferred : '/')
const base = `/${baseInput.split('/').filter(Boolean).join('/')}${baseInput === '/' ? '' : '/'}`
const origin = 'https://build-check.invalid'
const errors = []
const pages = []
let checked = 0
let skipped = 0

// Generated VitePress HTML is the input; script contents and comments cannot contain links.
function references(html) {
  const markup = html.replace(/<!--[\s\S]*?-->/g, '').replace(/(<script\b[^>]*>)[\s\S]*?<\/script\s*>/gi, '$1</script>')
  const found = []
  const tags = /<(a|img|script|link)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi
  for (const tag of markup.matchAll(tags)) {
    const name = tag[1].toLowerCase()
    const attribute = name === 'a' || name === 'link' ? 'href' : 'src'
    const attributes = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g
    for (const item of tag[2].matchAll(attributes)) {
      if (item[1].toLowerCase() === attribute) {
        found.push({ tag: name, attribute, value: decodeEntities(item[2] ?? item[3] ?? item[4] ?? '') })
        break
      }
    }
  }
  return found
}

function decodeEntities(value) {
  const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, code) => {
    if (!code.startsWith('#')) return named[code.toLowerCase()] ?? entity
    const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
    return point <= 0x10ffff ? String.fromCodePoint(point) : entity
  })
}

async function filesIn(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...await filesIn(absolute))
    else if (entry.isFile()) result.push(absolute)
  }
  return result
}

async function isFile(candidate) {
  try { return (await stat(candidate)).isFile() } catch { return false }
}

async function checkReference(page, reference) {
  const value = reference.value.trim()
  // External URLs, fragments and client-side search do not map to generated files.
  if (!value || value.startsWith('#') || value.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(value)) {
    skipped++
    return
  }
  checked++
  const context = { page, tag: reference.tag, attribute: reference.attribute, url: value }
  let pathname
  try {
    const address = new URL(value, `${origin}${base}${page}`)
    pathname = decodeURIComponent(address.pathname)
  } catch {
    errors.push({ ...context, reason: 'invalid-url' })
    return
  }
  const baseRoot = base === '/' ? '/' : base.slice(0, -1)
  if (pathname !== baseRoot && !pathname.startsWith(base)) {
    errors.push({ ...context, reason: 'outside-site-base', expectedBase: base })
    return
  }
  const relative = pathname === baseRoot ? '' : pathname.slice(base.length)
  const exact = path.resolve(dist, relative)
  if (exact !== dist && !exact.startsWith(`${dist}${path.sep}`)) {
    errors.push({ ...context, reason: 'outside-build-directory' })
    return
  }
  const candidates = [exact]
  if (reference.tag === 'a') {
    if (!path.extname(relative)) candidates.push(`${exact}.html`)
    candidates.push(path.join(exact, 'index.html'))
  }
  for (const candidate of candidates) if (await isFile(candidate)) return
  errors.push({ ...context, reason: 'missing-file', tried: candidates.map(file => path.relative(dist, file)) })
}

try {
  const files = await filesIn(dist)
  for (const file of files.filter(file => file.endsWith('.html')).sort()) {
    const page = path.relative(dist, file).split(path.sep).join('/')
    pages.push(page)
    for (const reference of references(await readFile(file, 'utf8'))) await checkReference(page, reference)
  }
  if (!pages.length) errors.push({ reason: 'no-html-pages', directory: path.relative(root, dist) })
} catch (error) {
  errors.push({ reason: 'cannot-read-build', message: error.message })
}

const report = {
  checkedAt: new Date().toISOString(),
  buildDirectory: path.relative(root, dist),
  siteBase: base,
  pages: pages.length,
  checkedReferences: checked,
  skippedReferences: skipped,
  errors,
  passed: errors.length === 0,
  scope: 'Static a[href], img[src], script[src] and link[href] targets only; excludes fragments, external URLs, dynamic imports and browser behavior.'
}
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)
if (errors.length) {
  for (const error of errors) console.error(`${error.page || '(build)'}: ${error.reason}${error.url ? ` ${error.url}` : ''}`)
  console.error(`Build check failed with ${errors.length} error(s). See ${path.relative(root, reportPath)}.`)
  process.exitCode = 1
} else {
  console.log(`Build check passed: ${pages.length} HTML pages, ${checked} local targets (${base}).`)
}
