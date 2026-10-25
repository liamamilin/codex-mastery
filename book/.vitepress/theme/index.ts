import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import Home from './components/Home.vue'
import CourseMap from './components/CourseMap.vue'
import ControlLoop from './components/ControlLoop.vue'
import EvidenceQuiz from './components/EvidenceQuiz.vue'
import DecisionLab from './components/DecisionLab.vue'
import ChapterCheckpoint from './components/ChapterCheckpoint.vue'
import ReadingStatus from './components/ReadingStatus.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, { 'doc-before': () => h(ReadingStatus, { position: 'before' }), 'doc-after': () => h(ReadingStatus, { position: 'after' }) }),
  enhanceApp({ app }) {
    for (const [name, component] of Object.entries({ LabHome: Home, CourseMap, ControlLoop, EvidenceQuiz, DecisionLab, ChapterCheckpoint })) app.component(name, component)
  }
}
