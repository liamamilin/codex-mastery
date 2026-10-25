<script setup lang="ts">
import { withBase } from 'vitepress'
import { parts, published, publishedIds, publishedSummary, chapterId, partPublished } from '../../course'
import { useLearning } from '../learning'

const { completed, reset, available, ready } = useLearning()
function chapterUrl(id: number) {
  return withBase(`/${published.find(chapter => chapter.id === id)?.file}.html`)
}
</script>

<template>
  <main class="course-page home-section">
    <div class="course-heading">
      <span class="eyebrow">THE CURRICULUM / 8 PARTS · 28 CHAPTERS</span>
      <h1>一条从使用，<br>走向<span>掌控</span>的路线。</h1>
      <p>从看懂第一次行动，到独立驾驭陌生任务。<br>导读与 {{ publishedSummary() }} 已全部开放。<br>从首次成果到独立毕业，在真实任务中形成能力。</p>
      <a class="inline-link" :href="withBase('/00-导读.html')">第一次来？先读导读 ↗</a>
    </div>
    <div class="course-progress">
      <div><span>我的学习记录</span><strong>{{ completed.length }} <small>/ {{ published.length }} 已开放章节</small></strong></div>
      <div class="course-progress-track"><span :style="{ width: `${completed.length / published.length * 100}%` }"></span></div>
      <button @click="reset" class="reset-button" :disabled="!ready">清除学习记录</button>
      <small>{{ available ? '本地自查记录 · 清理浏览器数据会丢失 · 不代表自动验证' : '浏览器存储不可用，记录仅在当前页面会话保留' }}</small>
    </div>
    <div class="course-parts">
      <section v-for="(part, pi) in parts" :key="part.title" :id="`part-${pi + 1}`" class="course-part" :class="{ upcoming: partPublished(pi) === 0 }">
        <div class="part-title">
          <span class="part-number">{{ String(pi + 1).padStart(2, '0') }}</span>
          <div>
            <span class="eyebrow">PART {{ String(pi + 1).padStart(2, '0') }} / {{ partPublished(pi) ? `已开放 ${partPublished(pi)} / ${part.chapters.length} 章` : '规划中' }}</span>
            <h2>{{ part.title }}</h2><p>{{ part.subtitle }}</p>
          </div>
        </div>
        <div class="part-chapters">
          <template v-for="(title, ci) in part.chapters" :key="title">
            <a v-if="publishedIds.includes(chapterId(pi, ci))" :href="chapterUrl(chapterId(pi, ci))">
              <span class="chapter-number">{{ String(chapterId(pi, ci)).padStart(2, '0') }}</span><span>{{ title }}</span>
              <b>{{ completed.includes(chapterId(pi, ci)) ? '✓ 已完成' : '开始阅读 ↗' }}</b>
            </a>
            <div v-else class="planned-chapter"><span class="chapter-number">{{ String(chapterId(pi, ci)).padStart(2, '0') }}</span><span>{{ title }}</span><b>待开放</b></div>
          </template>
        </div>
      </section>
    </div>
  </main>
</template>
