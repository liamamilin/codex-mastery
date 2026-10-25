import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

function testFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name)
    return entry.isDirectory() ? testFiles(file) : entry.name.endsWith('.test.mjs') ? [file] : []
  })
}
function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' })
  if (result.error) {
    console.error(`无法运行 ${command}：${result.error.message}。开发验收需要 Node.js 22 与 Python 3.9+。`)
    process.exit(1)
  }
  if (result.status !== 0) process.exit(result.status || 1)
}

run(process.execPath, ['--test', '--test-reporter=spec', ...testFiles('cases')])
const python = process.env.PYTHON || (process.platform === 'win32' ? 'py' : 'python3')
const prefix = !process.env.PYTHON && process.platform === 'win32' ? ['-3'] : []
for (const variant of ['starter', 'solution']) {
  run(python, [...prefix, '-B', '-m', 'unittest', 'discover', '-s', `cases/B-tasktrail/${variant}/tests`, '-v'])
}
for (const directory of ['cases/C-csv-insight/tests', 'cases/E-capstone/e2-texttool/starter/tests']) {
  run(python, [...prefix, '-B', '-m', 'unittest', 'discover', '-s', directory, '-v'])
}
