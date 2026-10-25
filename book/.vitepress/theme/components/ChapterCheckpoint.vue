<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
const checks = ['我保存了一条标题和网址正确的收藏。', '我刷新了页面，看到收藏仍然存在。', '我试过无效网址，看到清楚的错误提示。', '我删除了收藏，再刷新确认它没有回来。']
const checked = ref<boolean[]>(checks.map(() => false))
const persistent = ref(true)
onMounted(() => { try { const value = JSON.parse(localStorage.getItem('codex-mastery:checklist:a1') || '[]'); if (Array.isArray(value)) checked.value = checks.map((_, i) => value[i] === true) } catch { persistent.value = false } })
const count = computed(() => checked.value.filter(Boolean).length)
function save() { try { localStorage.setItem('codex-mastery:checklist:a1', JSON.stringify(checked.value)) } catch { persistent.value = false } }
function reset() { checked.value = checks.map(() => false); save() }
</script>
<template><section class="chapter-checkpoint"><span class="eyebrow">HANDS-ON / 我的验收记录</span><h3>亲自操作后，逐项确认。</h3><p>勾选是你的自查，不会自动检测真实程序。</p><label v-for="(check, i) in checks" :key="check"><input type="checkbox" v-model="checked[i]" @change="save"/><span>{{ check }}</span></label><div class="checkpoint-bottom"><strong aria-live="polite">{{ count }} / 4 {{ count === 4 ? '已记录 · 试着向别人解释验证过程' : '已记录' }}</strong><button class="reset-button" @click="reset">重置清单 ↺</button></div><small>{{ persistent ? '仅保存在当前浏览器，清理网站数据会丢失。' : '存储不可用，记录仅在本次页面访问中保留。' }}</small></section></template>
