<script setup lang="ts">
import { computed, ref } from 'vue'
import { useClientReady } from '../client'

const ready = useClientReady()
const selected = ref<number | null>(null)
const outcome = ref<number | null>(null)
const directions = [
  { title: '快速收藏', problem: '看到好链接，却嫌保存步骤麻烦。', experiment: '在 LinkShelf 中连续保存三条示例网址，记下每次在哪一步停顿。先观察输入与保存，不增加分类。', evidence: '能否连续保存？保存成功后能否马上录入下一条？哪一步仍有负担？', next: '可以只尝试缩短一个输入步骤，再观察是否减少停顿。' },
  { title: '快速找回', problem: '收藏了很多，下次却找不到。', experiment: '保存三条标题不同的链接，用一段标题、一个网址域名和一个不存在的词分别搜索，再清空搜索。', evidence: '匹配是否符合预期？能否回到全部记录？你实际找回资料的步骤是否减少？', next: '可以先比较“改好标题”和“增加分类”两条路线，选择更值得检验的一项。' },
  { title: '定期回顾', problem: '收藏过的内容，再也没有打开。', experiment: '现有工具没有提醒功能。先把三条收藏当作今天的回顾清单，手动逐条打开，观察自己是否愿意回看。', evidence: '是没有提醒，还是内容已经没有价值？这次手动回顾有没有带来帮助？', next: '先验证固定回顾的价值，再决定是否需要提醒；当前程序不会自动通知你。' }
]
const current = computed(() => selected.value === null ? null : directions[selected.value])
const outcomes = ['有帮助，值得继续', '没有解决我的麻烦', '证据还不够']
const feedback = computed(() => {
  if (outcome.value === 0) return '先写下有帮助的具体操作，再决定一个最小改进。功能能运行与它值得继续开发，需要分别判断。'
  if (outcome.value === 1) return '把没解决的时刻说清楚，回到候选方向。保留已经可用的文件，无需立即推倒重来。'
  if (outcome.value === 2) return '选一个最能减少未知的观察。例如再换三条更接近日常使用的样本，而不是立刻添加全部功能。'
  return ''
})
function choose(index: number) { selected.value = index; outcome.value = null }
function reset() { selected.value = null; outcome.value = null }
</script>

<template>
  <section class="intent-explorer practice-panel">
    <span class="eyebrow">EXPLORE / 先找到值得做的事</span>
    <h3>你最想减少哪一种麻烦？</h3>
    <p class="practice-note">这是本地教学练习，不调用 Codex；真实试验请在 LinkShelf 或自己的练习副本中完成。</p>
    <div class="intent-choices">
      <button v-for="(direction, index) in directions" :key="direction.title" :disabled="!ready" :aria-pressed="selected === index" :class="{ chosen: selected === index }" @click="choose(index)">
        <span class="eyebrow">0{{ index + 1 }}</span><strong>{{ direction.title }}</strong><span>{{ direction.problem }}</span>
      </button>
    </div>
    <div v-if="current" class="experiment-card" aria-live="polite">
      <span class="eyebrow">ONE SMALL EXPERIMENT</span><h4>{{ current.title }} · 最小尝试</h4>
      <p>{{ current.experiment }}</p><dl><dt>要观察的证据</dt><dd>{{ current.evidence }}</dd><dt>一个候选下一步</dt><dd>{{ current.next }}</dd></dl>
      <fieldset><legend>亲自试过后，你会怎么判断？</legend><button v-for="(label, index) in outcomes" :key="label" :aria-pressed="outcome === index" :class="{ chosen: outcome === index }" @click="outcome = index">{{ label }}</button></fieldset>
      <p v-if="feedback" class="practice-feedback" aria-live="polite">{{ feedback }}</p>
    </div>
    <div class="practice-bottom"><small>选择不是标准答案；试验结果需要你亲自观察。刷新页面会重置。</small><button class="reset-button" :disabled="!ready" @click="reset">重置探索 ↺</button></div>
  </section>
</template>
