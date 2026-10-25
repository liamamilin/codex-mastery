import { defineConfig } from 'vitepress'

// On GitHub Actions, derive the project Pages prefix from owner/repo.
// User/org site (owner.github.io) and local development both use '/'.
// SITE_BASE explicitly overrides this, e.g. SITE_BASE=/ for a custom domain.
const [owner = '', repo = ''] = (process.env.GITHUB_REPOSITORY ?? '').split('/')
const isRootPagesRepo = repo.toLowerCase() === `${owner.toLowerCase()}.github.io`
const inferredBase =
  process.env.GITHUB_ACTIONS === 'true' && repo && !isRootPagesRepo
    ? `/${repo}/`
    : '/'
const base = process.env.SITE_BASE || inferredBase

export default defineConfig({
  lang: 'zh-CN',
  title: 'Codex Mastery Lab',
  description: '驾驭 Codex：从基础使用到复杂任务掌控',
  base,
  cleanUrls: true,
  themeConfig: {
    nav: [{ text: '首页', link: '/' }],
    search: { provider: 'local' }
  }
})
