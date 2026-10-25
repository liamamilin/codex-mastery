<script setup lang="ts">
import { withBase } from 'vitepress'
import { downloads } from '../../downloads.generated'
const size = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`
</script>
<template>
  <section class="download-shelf" aria-label="电子书下载">
    <img :src="withBase('/diagrams/cover.svg')" alt="驾驭 Codex 完整首版封面：从基础使用到复杂任务掌控" width="1200" height="1800" loading="lazy">
    <div><span class="eyebrow">TAKE THE FIELD GUIDE WITH YOU</span><h3>一套正文，多种读法。</h3><p>导读、28 章与术语附录来自同一份 Markdown。离线版将互动题转为纸面练习；需要运行的案例仍使用仓库源码。</p><div v-if="downloads.length" class="ebook-links"><a v-for="item in downloads" :key="item.file" :href="withBase(`/downloads/${item.file}`)" download><span>{{ item.format }} <b>↓</b></span><small>{{ size(item.size) }}{{ item.pages ? ` · ${item.pages} 页` : ' · 可调整字号' }}</small></a></div><p v-else class="ebook-pending">电子书正在生成与验收，文件可用后开放下载。</p><small class="ebook-note">中文字体许可与导出方法随源码提供。浏览器本地学习记录不写入电子书。</small></div>
  </section>
</template>
