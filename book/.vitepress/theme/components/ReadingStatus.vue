<script setup lang="ts">
import { useData, withBase } from 'vitepress'
import { computed } from 'vue'
import { useLearning } from '../learning'
import { publishedIds, parts } from '../../course'
defineProps<{ position: string }>()
const { frontmatter } = useData()
const { completed, toggle, available, ready } = useLearning()
const id = computed(() => Number(frontmatter.value.chapter))
const isChapter = computed(() => publishedIds.includes(id.value))
</script>
<template>
  <div v-if="isChapter && position === 'before'" class="chapter-opening">
    <div class="chapter-kicker"><span>FIELD GUIDE / PART {{ String(frontmatter.part).padStart(2, '0') }}</span><span>{{ frontmatter.duration }} · 含动手操作</span></div>
    <div class="chapter-position"><div><span>{{ parts[Number(frontmatter.part) - 1]?.title }}</span><div class="part-path" aria-label="当前章节在八部分课程中的位置"><a v-for="(part, index) in parts" :key="part.title" :href="withBase(`/curriculum.html#part-${index + 1}`)" :aria-label="`第 ${index + 1} 部分：${part.title}`" :aria-current="Number(frontmatter.part) === index + 1 ? 'step' : undefined" :class="{ current: Number(frontmatter.part) === index + 1, past: Number(frontmatter.part) > index + 1 }"></a></div></div><b aria-hidden="true">{{ String(id).padStart(2, '0') }}<small>/ 28</small></b></div>
  </div>
  <section v-if="isChapter && position === 'after'" class="reading-finish" aria-label="学习进度">
    <div><span class="eyebrow">LEARNING RECORD</span><h2>把读过，变成做过。</h2><p>完成本章练习后，再留下你的学习记录。</p></div>
    <button class="primary-button" @click="toggle(id)" :disabled="!ready" :aria-pressed="completed.includes(id)">{{ completed.includes(id) ? '✓ 已完成本章 · 点击撤销' : '标记本章已完成 →' }}</button>
    <small>{{ available ? '这是你的自查记录，仅保存在当前浏览器；清理浏览器数据会丢失。' : '浏览器存储不可用，记录仅在本次页面访问中保留。' }}</small>
  </section>
</template>
