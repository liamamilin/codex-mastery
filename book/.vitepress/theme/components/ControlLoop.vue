<script setup lang="ts">
import { ref } from 'vue'
const active = ref(0)
const steps = [
  ['意图', '说出想解决的麻烦', '例如：收藏的好文章散落各处，想更方便地找回来。先描述使用场景，目标可以在探索中逐渐明确。'],
  ['事实', '让它调查，而不是猜测', '给出相关目录与材料，确认现有行为、运行条件和未知项。模型的猜测要与文件、命令的结果分开。'],
  ['路线', '选择有价值的下一步', '需求模糊时先比较小样；任务明确时直接执行；技术不确定时用最小实验减少未知。'],
  ['行动', '观察真正发生的改变', '读到了哪个文件？执行了什么命令？改动落在哪里？自然语言承诺和真实工具操作需要分别看待。'],
  ['证据', '用使用行为检验结果', '新增 → 刷新 → 检查记录仍在。文件存在、服务启动与核心功能可用，提供的是不同层次的证据。'],
  ['调整', '让新事实改变原有判断', '删除后刷新又出现？先检查保存与读取路径。重复一个被证据推翻的解释，很难靠更多补丁解决。'],
  ['交付', '留下可以继续的成果', '写明如何运行、实际验证范围、仍有的限制和下一步，让自己和下一次会话都能接得上。']
]
</script>
<template><div class="control-loop"><div class="loop-top"><span>工作循环 / 点击探索</span><span>0{{ active + 1 }} / 07</span></div><div class="loop-steps" aria-label="工作循环步骤"><button v-for="(step, i) in steps" :key="step[0]" @click="active = i" :aria-pressed="active === i" :class="{ active: active === i }"><span>{{ String(i + 1).padStart(2, '0') }}</span>{{ step[0] }}<b v-if="i < 6">→</b><b v-else>↺</b></button></div><div class="loop-explanation" aria-live="polite"><span class="eyebrow">{{ steps[active][0] }} / YOUR DECISION</span><h3>{{ steps[active][1] }}</h3><p>{{ steps[active][2] }}</p></div><div class="loop-note">这是学习框架；简单任务可以直接做，无需每次填写七步表格。</div></div></template>
