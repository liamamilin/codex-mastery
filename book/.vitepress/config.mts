import { defineConfig } from 'vitepress'
import { published, parts, chapterId } from './course'

const [owner = '', repo = ''] = (process.env.GITHUB_REPOSITORY || '').split('/')
const inferred = repo && repo.toLowerCase() !== `${owner.toLowerCase()}.github.io` ? `/${repo}/` : '/'
const base = process.env.SITE_BASE || (process.env.GITHUB_ACTIONS === 'true' ? inferred : '/')
if (!base.startsWith('/') || !base.endsWith('/')) throw new Error('SITE_BASE 必须以 / 开始并结束')

export default defineConfig({
  lang: 'zh-CN', title: 'Codex Mastery Lab',
  description: '驾驭 Codex：从基础使用到复杂任务掌控。把模糊想法转化为可验证成果的中文实战教材。',
  base, cleanUrls: false, lastUpdated: true,
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}brand/mark.svg` }], ['meta', { name: 'theme-color', content: '#0b101c' }]],
  markdown: { lineNumbers: true, theme: { light: 'github-light', dark: 'github-dark' } },
  themeConfig: {
    logo: '/brand/mark.svg', siteTitle: 'CODEX MASTERY LAB',
    nav: [{ text: '学习路线', link: '/curriculum' }, { text: '实战实验室', link: '/labs' }, { text: '阅读与下载', link: '/resources' }],
    sidebar: [
      { text: '从这里开始', items: [{ text: '导读 · 怎样使用这本书', link: '/00-导读' }, { text: '完整课程 · 8 部分 / 28 章', link: '/curriculum' }] },
      ...parts.flatMap((part, index) => {
        const chapters = published.filter(c => part.chapters.some((_, ci) => chapterId(index, ci) === c.id))
        return chapters.length ? [{ text: `${String(index + 1).padStart(2, '0')} / ${part.title}`, collapsed: index > 0, items: chapters.map(c => ({ text: `${String(c.id).padStart(2, '0')}  ${c.label}`, link: `/${c.file}` })) }] : []
      }),
      { text: '动手与查阅', items: [{ text: '实战实验室', link: '/labs' }, { text: '术语与官方来源', link: '/附录-术语与来源' }, { text: '阅读与下载', link: '/resources' }] }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/liamamilin/codex-mastery' }],
    search: { provider: 'local', options: { locales: { root: { translations: { button: { buttonText: '搜索教材', buttonAriaLabel: '搜索教材' }, modal: { noResultsText: '没有找到相关内容', resetButtonTitle: '清除搜索', footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' } } } } } } },
    outline: { label: '本章导航', level: [2, 3] },
    docFooter: { prev: '上一节', next: '下一节' },
    darkModeSwitchLabel: '切换明暗主题', lightModeSwitchTitle: '切换到明亮主题', darkModeSwitchTitle: '切换到深色主题',
    sidebarMenuLabel: '课程目录', returnToTopLabel: '回到顶部',
    lastUpdated: { text: '最近更新', formatOptions: { dateStyle: 'medium' } },
    footer: { message: '中文实战教材 · 开源共建 · 浏览器内练习与真实 Codex 执行分别标明', copyright: 'Codex Mastery Lab / 2026 · 独立教学项目' }
  }
})
