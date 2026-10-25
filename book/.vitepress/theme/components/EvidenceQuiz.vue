<script setup lang="ts">
import { ref } from 'vue'
const selected = ref<number | null>(null)
const options = ['“我已经检查过，应该没问题。”', '工具返回显示：执行了测试命令，退出码为 0，并附具体测试结果。', '它列出三个准备检查的文件。']
const feedback = ['这是一项陈述。继续追问运行了什么、得到什么结果；语气确定不增加证据。', '这条包含实际工具执行的信息。仍需判断测试覆盖了什么；它并不能证明所有功能都通过。', '这说明接下来的行动计划。先核实文件是否真的被读取，以及读到的内容能支持什么判断。']
</script>
<template><section class="evidence-quiz"><span class="eyebrow">TRY IT / 证据判断</span><h3>哪一条提供了“已经行动”的证据？</h3><p>以下均为教学示例，不是本次执行日志。</p><div class="quiz-options"><button v-for="(o, i) in options" :key="o" @click="selected = i" :aria-pressed="selected === i" :class="{ chosen: selected === i }"><span>{{ ['A', 'B', 'C'][i] }}</span>{{ o }}</button></div><div v-if="selected !== null" class="quiz-feedback" aria-live="polite"><strong>{{ selected === 1 ? '判断有据。' : '再区分一下承诺与观察。' }}</strong><p>{{ feedback[selected] }}</p></div><button class="reset-button" @click="selected = null">重置练习 ↺</button></section></template>
