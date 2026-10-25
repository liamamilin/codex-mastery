<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useClientReady } from '../client'

const ready = useClientReady()
const selected = ref<number | null>(null)
const draft = ref('')
const status = ref('')
const checklist = ref([false, false, false, false])
const checks = ['说明要改善的具体行为', '提供相关现状或复现事实', '交代本次重要边界', '给出能够亲自检查的结果']
const key = 'codex-mastery:prompt-workshop:v1'
const count = computed(() => checklist.value.filter(Boolean).length)
const samples = [
  { label: '含糊的愿望', text: '帮我把收藏工具弄好，让它更高级。', reason: '“更高级”没有指出哪里出了问题，也没有说明什么结果值得保留。下一步可能先探索，而不是直接加功能。' },
  { label: '过度规定过程', text: '先写二十页架构，换成复杂框架，再生成五套审查表，最后才能处理保存后的输入框。', reason: '这些过程与当前的小问题缺少联系，扩大了成本和改动范围。只有环境与目标提供了理由，才值得选择相应流程。' },
  { label: '聚焦可见结果', text: '我的练习副本中，保存成功后输入框仍保留旧值。请先检查保存成功与失败的分支，只在成功后清空标题和网址；失败时保留输入并反馈。验证连续保存两条、错误输入和刷新后数据仍在，说明实际检查范围。', reason: '它给出现象、相关分支、范围和检查方法，同时把函数组织与实现细节留给 Codex。它仍然需要按自己的真实情况改写。' }
]
onMounted(() => {
  try { draft.value = localStorage.getItem(key) || '' } catch { status.value = '浏览器存储不可用；仍可在当前页面改写与复制。' }
})
function save() {
  try { localStorage.setItem(key, draft.value); status.value = '草稿已保存在当前浏览器。它没有发送给 Codex。' }
  catch { status.value = '草稿未能保存。请复制文字到自己的笔记中。' }
}
async function copy() {
  try { await navigator.clipboard.writeText(draft.value); status.value = '已复制。请检查是否符合自己的实际情况，再粘贴到 Codex。' }
  catch { status.value = '未能访问剪贴板，请在文本框中手动选择并复制。' }
}
function reset() {
  selected.value = null; draft.value = ''; checklist.value = [false, false, false, false]
  try { localStorage.removeItem(key); status.value = '练习与本地草稿已重置。' }
  catch { status.value = '本页已重置，但无法清除浏览器中的旧草稿。' }
}
</script>

<template>
  <section class="prompt-workshop practice-panel">
    <span class="eyebrow">WORKSHOP / 改写一次任务说明</span>
    <h3>同一个问题，三种说法。</h3>
    <p class="practice-note">教学情境：你的练习副本保存后没有清空输入框；参考成品已有这项行为。下面的比较不是实际 Codex 对话或效果预测。</p>
    <div class="prompt-samples"><button v-for="(sample, index) in samples" :key="sample.label" :disabled="!ready" :class="{ chosen: selected === index }" :aria-pressed="selected === index" @click="selected = index"><span>0{{ index + 1 }}</span>{{ sample.label }}</button></div>
    <div v-if="selected !== null" class="sample-analysis" aria-live="polite"><blockquote>{{ samples[selected].text }}</blockquote><p>{{ samples[selected].reason }}</p></div>
    <label class="draft-label" for="prompt-draft">用自己的话改写任务说明</label>
    <textarea id="prompt-draft" v-model="draft" :disabled="!ready" rows="6" placeholder="从实际观察开始：在哪里、做了什么、看到了什么、希望改变什么……"></textarea>
    <fieldset class="prompt-checks"><legend>自己对照，不是自动评分</legend><label v-for="(check, index) in checks" :key="check"><input type="checkbox" v-model="checklist[index]" :disabled="!ready"><span>{{ check }}</span></label></fieldset>
    <div class="draft-actions"><button @click="save" :disabled="!ready || !draft.trim()">保存本地草稿</button><button @click="copy" :disabled="!ready || !draft.trim()">复制我的说明</button><span>{{ count }} / 4 项已自查</span></div>
    <p v-if="status" class="practice-feedback" aria-live="polite">{{ status }}</p>
    <div class="practice-bottom"><small>草稿仅留在当前浏览器；自查勾选不是功能验收。清理站点数据会清除草稿。</small><button class="reset-button" :disabled="!ready" @click="reset">重置改写练习 ↺</button></div>
  </section>
</template>
