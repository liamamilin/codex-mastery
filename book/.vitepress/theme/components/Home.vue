<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { published } from '../../course'
import { useLearning } from '../learning'
import ControlLoop from './ControlLoop.vue'
import DecisionLab from './DecisionLab.vue'
const { completed } = useLearning()
const next = computed(() => published.find(c => !completed.value.includes(c.id)))
</script>

<template>
  <main class="lab-home">
    <section class="hero-section">
      <div class="hero-grid">
        <div class="hero-copy">
          <div class="hero-eyebrow"><span class="live-dot"></span> 中文实战教材 <span>/</span> OPEN SOURCE FIELD GUIDE</div>
          <h1>不只是使用。<br>学会<span class="coral-word">驾驭 Codex<span class="word-dot">.</span></span></h1>
          <p class="hero-description">把模糊想法变成可验证的成果。<br>理解它的行动，保留你的判断，<br class="mobile-break">在失败时找回方向。</p>
          <div class="hero-actions"><a class="primary-button" :href="withBase('/00-导读.html')">开始学习 <span>↗</span></a><a class="text-button" :href="withBase('/labs.html#诊断训练-删除了-为什么又出现')">体验纠偏训练 <span>→</span></a></div>
          <div class="hero-edition"><span>VOL. 01</span> 导读与第 1—3 章已开放 <span class="edition-divider">/</span> 持续制作中</div>
        </div>
        <div class="hero-visual" aria-label="协作控制回路：从意图，经行动到证据，由判断回到下一步">
          <div class="visual-topline"><span>THE HUMAN–AGENT LOOP</span><span class="visual-cross">+</span></div>
          <svg class="hero-circuit" viewBox="0 0 520 410" role="img" aria-labelledby="hero-circuit-title">
            <title id="hero-circuit-title">人保留判断，Codex 执行行动，实际结果提供反馈</title>
            <defs><pattern id="hero-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#2d394b"/></pattern><marker id="hero-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="none" stroke="#7bc9dc"/></marker></defs>
            <rect width="520" height="410" fill="url(#hero-dots)"/>
            <path d="M118 140 V90 Q118 66 142 66 H378 Q402 66 402 90 V138" class="circuit-line"/>
            <path d="M402 253 V304 Q402 328 378 328 H142 Q118 328 118 304 V255" class="circuit-line"/>
            <path d="M224 198 H293" class="circuit-line"/>
            <circle cx="118" cy="198" r="66" fill="#151e2b" stroke="#ff815d" stroke-width="1.5"/>
            <circle cx="118" cy="198" r="77" fill="none" stroke="#ff815d" stroke-opacity=".18"/>
            <text x="118" y="182" text-anchor="middle" class="circuit-en">YOU</text><text x="118" y="214" text-anchor="middle" class="circuit-cn">意图 · 判断</text>
            <rect x="300" y="140" width="204" height="114" rx="4" fill="#151e2b" stroke="#45566c"/>
            <text x="402" y="183" text-anchor="middle" class="circuit-en teal">CODEX</text><text x="402" y="215" text-anchor="middle" class="circuit-cn">调查 · 执行</text>
            <rect x="223" y="50" width="82" height="32" fill="#0e1522"/><text x="264" y="71" text-anchor="middle" class="circuit-label">明确任务</text>
            <rect x="209" y="311" width="111" height="32" fill="#0e1522"/><text x="264" y="333" text-anchor="middle" class="circuit-label">观察真实结果</text>
            <text x="260" y="187" text-anchor="middle" class="circuit-small">工具</text>
            <circle cx="402" cy="66" r="4" fill="#7bc9dc"/><circle cx="118" cy="328" r="5" fill="#ff815d"/>
            <path d="M402 94 V131 M165 328 H150 M274 198 H290" fill="none" stroke="#7bc9dc" marker-end="url(#hero-arrow)"/>
            <text x="26" y="391" class="circuit-foot">CONTROL ≠ MORE INSTRUCTIONS</text><text x="494" y="391" text-anchor="end" class="circuit-foot">FIG. 001</text>
          </svg>
          <div class="visual-bottomline"><span class="live-dot teal-dot"></span><span>关键不是一次成功，而是知道下一步。</span></div>
        </div>
      </div>
      <div class="hero-stats"><div><strong>08</strong><span>递进学习部分</span></div><div><strong>28</strong><span>章完整课程规划</span></div><div><strong>03</strong><span>章正文已开放</span></div><div><strong>01</strong><span>个可运行案例</span></div><a :href="withBase('/curriculum.html')">查看完整路线 <span>↗</span></a></div>
    </section>

    <section class="home-section start-section">
      <div class="section-heading"><div><span class="eyebrow">01 / START WITH ACTION</span><h2>第一次掌控，从这里开始。</h2></div><p>读一章，做一件事。<br>让每一步都有看得见的结果。</p></div>
      <div v-if="completed.length" class="resume-strip"><span>学习记录 {{ completed.length }} / 3</span><a :href="withBase(next ? `/${next.file}.html` : '/labs.html')">{{ next ? `继续第 ${next.id} 章` : '进入实战实验室' }} →</a></div>
      <div class="chapter-cards"><a v-for="c in published" :key="c.id" :href="withBase(`/${c.file}.html`)" class="chapter-card"><div class="card-top"><span>CHAPTER {{ String(c.id).padStart(2, '0') }}</span><span>{{ completed.includes(c.id) ? '✓ 已完成' : c.duration }}</span></div><div class="chapter-glyph" :class="`glyph-${c.id}`"><span></span><span></span><span></span></div><h3>{{ c.label }}</h3><p>{{ c.skill }}</p><div class="card-bottom"><span>正文 + 动手练习</span><span>↗</span></div></a></div>
    </section>

    <section class="method-section"><div class="home-section method-inner"><div class="method-intro"><span class="eyebrow">02 / THE WAY OF WORKING</span><h2>你掌握的，<br>是一整套工作方法。</h2><p>Codex 负责执行。你学会确认事实、选择路线、判断证据，并在需要时改变方向。</p><a :href="withBase('/curriculum.html')" class="inline-link">探索 8 部分学习路线 ↗</a></div><ControlLoop /></div></section>

    <section class="home-section case-section"><div class="section-heading"><div><span class="eyebrow">03 / BUILD SOMETHING REAL</span><h2>一套能亲手运行的实验室。</h2></div><a class="inline-link" :href="withBase('/labs.html')">进入实验室 ↗</a></div><div class="case-showcase"><div class="case-copy"><span class="case-tag">CASE A · 已开放</span><h3>LinkShelf<span>你的个人链接收藏架</span></h3><p>保存一条链接，看见它留在列表里。刷新页面，确认它仍然存在。你将亲自走完从任务到验收的第一个闭环。</p><div class="tech-tags"><span>原生 JavaScript</span><span>浏览器本地存储</span><span>无需 API Key</span></div><a class="primary-button" :href="withBase('/lab/linkshelf/solution/index.html')" target="_blank" rel="noopener">打开真实案例 ↗</a><small>真实网页应用；Codex 操作在你自己的电脑完成。</small></div><a class="case-preview" :href="withBase('/lab/linkshelf/solution/index.html')" target="_blank" rel="noopener"><div class="preview-toolbar"><span></span><span></span><span></span><b>LINKSHELF / LOCAL FIRST</b></div><img :src="withBase('/screenshots/linkshelf-desktop.png')" alt="真实 LinkShelf 案例截图：收藏表单和已保存的示例网站" loading="lazy" width="1200" height="800"/></a></div></section>

    <section class="training-section"><div class="home-section"><div class="section-heading"><div><span class="eyebrow">04 / THINK, THEN REPAIR</span><h2>失败，也是你要学会的部分。</h2></div><p>先看现象，再找证据。<br>试试这道可以重置的诊断练习。</p></div><DecisionLab compact /></div></section>

    <section class="home-section last-section"><span class="eyebrow">YOUR NEXT MOVE</span><h2>把第一条指令，<br>变成第一个真实成果。</h2><a class="primary-button" :href="withBase('/00-导读.html')">翻开导读 →</a><p>独立开源中文教学项目 · 第一阶段 v0.1<br>PDF / EPUB 将在生成与验收后开放。</p></section>
  </main>
</template>
