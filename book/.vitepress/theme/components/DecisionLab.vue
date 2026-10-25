<script setup lang="ts">
import { useClientReady } from '../client'
const ready = useClientReady()
import { ref, computed } from 'vue'
defineProps<{ compact?: boolean }>()
const choice = ref<number | null>(null)
const memory = ref(true)
const saved = ref(true)
const fixed = ref(false)
const message = ref('起点：两份状态里都存在“示例网站”。试着删除，再刷新模型。')
const options = ['再加一次界面重绘', '检查删除前后的存储内容', '给删除操作增加延时']
const feedback = ['当前界面已经成功隐藏条目。重绘可能重复现有行为，还不能解释为什么重新读取后恢复。先确认新状态有没有写回。', '这项检查能区分“没有保存”和“保存了却读错来源”。沿删除 → 内存 → 写入 → 重新读取的路径收集证据，之后再改代码。', '只有当证据表明存在时序问题，延时才值得研究。这个模型里没有异步写入；等待不会改变保存副本。']
const memoryCount = computed(() => memory.value ? 1 : 0)
function remove() { memory.value = false; if (fixed.value) saved.value = false; message.value = fixed.value ? '已删除，并把新列表写入保存副本。现在刷新模型检查。' : '当前列表已删除；保存副本仍有旧记录。现在刷新模型检查。' }
function reload() { memory.value = saved.value; message.value = memory.value ? '记录又出现了。刷新模型从保存副本重新读取；之前只改了当前列表。' : '记录没有恢复。删除后的状态已经写回；还要在真实应用里回归检查新增。' }
function fix() { fixed.value = true; message.value = memory.value ? '保存路径已接通。它不会自动清除旧记录；请重新删除，再刷新模型。' : '保存路径已接通。旧副本仍在；请先刷新模型，再删除收藏并再次刷新模型。' }
function reset() { choice.value = null; memory.value = true; saved.value = true; fixed.value = false; message.value = '已重置。两份状态都存在“示例网站”；再次尝试删除 → 刷新模型。' }
</script>
<template><section class="decision-lab"><div class="diagnosis-question"><span class="eyebrow">DIAGNOSIS / 浏览器教学模型</span><h3>删掉的收藏，<br>刷新后又回来了。</h3><p>当前界面已更新。此时，哪一步最能帮助你判断原因？</p><div class="diagnosis-options"><button v-for="(option, i) in options" :key="option" @click="choice = i" :disabled="!ready" :aria-pressed="choice === i" :class="{ chosen: choice === i }"><span>0{{ i + 1 }}</span>{{ option }}<b>↗</b></button></div><div v-if="choice !== null" class="diagnosis-feedback" aria-live="polite"><strong>{{ choice === 1 ? '沿数据路径调查。' : '这个动作缺少区分原因的信息。' }}</strong><p>{{ feedback[choice] }}</p></div></div><div class="state-model"><div class="model-topline"><span>STATE EXPLORER</span><span>概念演示 / 不运行 Codex</span></div><div class="model-states"><div><span>01 / 当前列表</span><Transition name="state-flash" mode="out-in"><strong :key="memoryCount">{{ memoryCount }}<small> 条收藏</small></strong></Transition><p>{{ memory ? '↗ 示例网站' : '— 列表为空' }}</p></div><div class="state-bridge" :class="{ connected: fixed }"><span>{{ fixed ? '已接通' : '未写回' }}</span><b>{{ fixed ? '→' : '⇢' }}</b></div><div><span>02 / 保存副本</span><Transition name="state-flash" mode="out-in"><strong :key="saved ? 1 : 0">{{ saved ? 1 : 0 }}<small> 条收藏</small></strong></Transition><p>{{ saved ? '↗ 示例网站' : '— 列表为空' }}</p></div></div><div class="model-actions"><button @click="remove" :disabled="!ready || !memory">删除收藏</button><button @click="reload" :disabled="!ready">刷新模型 ↺</button><button @click="fix" :disabled="!ready || fixed">{{ fixed ? '✓ 已接通保存' : '接通保存路径' }}</button></div><p class="model-message" aria-live="polite">{{ message }}</p><div class="model-footer"><small>数字变化时高亮对应状态；两份数组均未写入真实收藏。</small><button @click="reset" :disabled="!ready" class="reset-button">重置 ↺</button></div></div></section></template>
