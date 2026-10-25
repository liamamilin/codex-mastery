export const parts = [
  { title: '认识你的执行搭档', subtitle: '看懂行动，建立环境，拿到第一次成果', chapters: ['Codex 不只是聊天窗口', '建立可操作的工作环境', '第一次从指令走到可见成果'] },
  { title: '把想法变成工作', subtitle: '从模糊愿望，走向可以检验的任务', chapters: ['当你还不知道自己真正想要什么', '把期望转成可验证的完成状态', '给 Codex 的任务说明怎么写'] },
  { title: '上下文与现状调查', subtitle: '先认识事实，再改变现状', chapters: ['接手一份你不熟悉的代码', '提供信息，不等于堆满信息', '项目约定与会话接续'] },
  { title: '决定怎样推进', subtitle: '调查、实验与执行，各有恰当的时机', chapters: ['什么时候直接做，什么时候先研究', '用最小实验处理关键不确定性', '把较大任务分成有价值的里程碑', '如何读懂进度并在途中介入'] },
  { title: '让成果经得起检查', subtitle: '让改变可追踪，让交付有证据', chapters: ['变化范围、版本和回退', '从“程序启动”到“功能真的可用”', '代码审查、解释和交付'] },
  { title: '当 Codex 做错了怎么办', subtitle: '停止盲目修补，用事实找回方向', chapters: ['识别错误发生在什么层次', '停止无效修补，重新检查假设', '换路线、降范围与及时止损', '他说完成了，但你怎么确定？'] },
  { title: '扩展与复用 Codex 的能力', subtitle: '按需连接工具，让有效方法留下来', chapters: ['让有价值的方法成为 Skill', 'MCP 与插件，让工具进入工作流', '把重复操作变成脚本与自动化', '模型、推理强度、时间和成本'] },
  { title: '长任务、协作与真正的掌控', subtitle: '从一次完成，走向独立掌控陌生任务', chapters: ['跨会话、跨阶段推进一个项目', '什么时候值得使用多个 Agent', '把一次成功变成下一次更容易成功', '毕业实战——在陌生任务上独立驾驭 Codex'] }
]
import { published, availableCases } from './published.generated'
export { published, availableCases }
export const publishedIds = published.map(chapter => chapter.id)
export const edition = 'v1.0'
export function chapterId(partIndex: number, index: number) {
  return parts.slice(0, partIndex).reduce((sum, part) => sum + part.chapters.length, 0) + index + 1
}
export function partPublished(partIndex: number) {
  return parts[partIndex].chapters.filter((_, index) => publishedIds.includes(chapterId(partIndex, index))).length
}
export function publishedSummary() {
  const ranges: number[][] = []
  for (const id of publishedIds) {
    const last = ranges[ranges.length - 1]
    if (last && last[last.length - 1] + 1 === id) last.push(id)
    else ranges.push([id])
  }
  return `第 ${ranges.map(range => range.length === 1 ? range[0] : `${range[0]}—${range[range.length - 1]}`).join('、')} 章`
}
