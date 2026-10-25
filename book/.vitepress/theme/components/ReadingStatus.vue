<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
import { useLearning } from '../learning'
defineProps<{ position: string }>()
const { frontmatter } = useData()
const { completed, toggle, available } = useLearning()
const id = computed(() => Number(frontmatter.value.chapter))
const isChapter = computed(() => [1, 2, 3].includes(id.value))
</script>
<template>
  <div v-if="isChapter && position === 'before'" class="chapter-kicker"><span>FIELD GUIDE / PART 01</span><span>{{ frontmatter.duration }} · 含动手操作</span></div>
  <section v-if="isChapter && position === 'after'" class="reading-finish" aria-label="学习进度">
    <div><span class="eyebrow">LEARNING RECORD</span><h2>把读过，变成做过。</h2><p>完成本章练习后，再留下你的学习记录。</p></div>
    <button class="primary-button" @click="toggle(id)" :aria-pressed="completed.includes(id)">{{ completed.includes(id) ? '✓ 已完成本章 · 点击撤销' : '标记本章已完成 →' }}</button>
    <small>{{ available ? '这是你的自查记录，仅保存在当前浏览器；清理浏览器数据会丢失。' : '浏览器存储不可用，记录仅在本次页面访问中保留。' }}</small>
  </section>
</template>
