<script setup lang="ts">
import { computed, ref } from 'vue'
import { useClientReady } from '../client'
const ready = useClientReady()
const scenario = ref(0)
const answer = ref('')
const scenes = [
  { name: '需求还模糊', story: '“帮我把收藏工具做得更好用。”还不知道用户在哪一步受阻。', best: 'explore', why: '“更好用”还没有可观察含义。先问最近一次找链接的过程，再决定改什么。', prompt: '先不要改代码。请帮我区分保存、找回和整理三个方向，选一个能通过实际动作判断的小问题。' },
  { name: '关键行为不确定', story: 'CSV 中重复行和空值怎么处理尚未确定，直接汇总可能算出不同数字。', best: 'probe', why: '先用四行样本检验口径，能以很小代价发现假设冲突。', prompt: '先用 probe.csv 做最小实验，列出每行计入或排除的原因，独立核对总计，确认口径后再处理完整数据。' },
  { name: '边界已经明确', story: 'TaskTrail 起点已读过，命令和测试都能运行；这次只增加按 open/done 筛选。', best: 'execute', why: '目标、入口和检查已经明确，可以实施小改动，并用正反例验证。', prompt: '按已确认的接口增加状态筛选，保持原命令默认行为。修改后运行原测试，再验证 open、done、空结果与非法状态。' },
  { name: '补丁没有改变结果', story: '删除后刷新仍恢复记录。刷新 UI、增加等待都没有改变这一现象。', best: 'verify', why: '旧假设没有解释结果。先比较删除后内存与存储，再决定是否修改持久化路径。', prompt: '暂停增加 UI 补丁。记录删除后两层数据，追踪刷新实际读取的位置，用一个能区分根因的检查再决定修改。' }
]
const options = [ ['explore', '先探索问题'], ['probe', '先做最小实验'], ['execute', '直接实施并验证'], ['verify', '先查证当前假设'] ]
const current = computed(() => scenes[scenario.value])
function chooseScene(index: number) { scenario.value = index; answer.value = '' }
function reset() { scenario.value = 0; answer.value = '' }
</script>
<template>
  <section class="practice-panel route-chooser" aria-label="工作路线选择练习">
    <span class="eyebrow">ROUTE LAB / 教学情境 · 不调用 Codex</span>
    <h3>现在，哪一步最能减少不确定性？</h3>
    <p class="practice-note">同一个工具可以走不同路线。选择情境，再给出你此刻的下一步。</p>
    <div class="route-scenes" aria-label="选择情境"><button v-for="(scene, index) in scenes" :key="scene.name" :disabled="!ready" :aria-pressed="scenario === index" :class="{ chosen: scenario === index }" @click="chooseScene(index)">{{ String(index + 1).padStart(2, '0') }} / {{ scene.name }}</button></div>
    <div class="experiment-card"><p class="route-story">{{ current.story }}</p><fieldset><legend>你的下一步</legend><button v-for="option in options" :key="option[0]" :disabled="!ready" :aria-pressed="answer === option[0]" :class="{ chosen: answer === option[0] }" @click="answer = option[0]">{{ option[1] }}</button></fieldset>
      <div v-if="answer" role="status" aria-live="polite"><p class="practice-feedback"><strong>{{ answer === current.best ? '这个情境下，理由充分。' : '这条路线也可能有用，但先看还缺什么。' }}</strong> {{ current.why }}</p><p class="route-prompt"><span>可以带到自己工作中的示例指令</span>{{ current.prompt }}</p></div>
    </div>
    <div class="practice-bottom"><small>反馈基于题目给定事实；不是对真实项目的自动诊断。</small><button class="reset-button" :disabled="!ready" @click="reset">重置练习 ↺</button></div>
  </section>
</template>
