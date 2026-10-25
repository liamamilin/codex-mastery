import { ref, onMounted, onUnmounted } from 'vue'
const completed = ref<number[]>([])
const available = ref(true)
const key = 'codex-mastery:learning:v1'
function read() {
  try { const value = JSON.parse(localStorage.getItem(key) || '[]'); completed.value = Array.isArray(value) ? value.filter(id => [1, 2, 3].includes(id)) : [] }
  catch { available.value = false }
}
export function useLearning() {
  const sync = (event: StorageEvent) => { if (event.key === key || event.key === null) read() }
  onMounted(() => { read(); window.addEventListener('storage', sync) })
  onUnmounted(() => { window.removeEventListener('storage', sync) })
  function toggle(id: number) {
    read()
    if (![1, 2, 3].includes(id)) return
    completed.value = completed.value.includes(id) ? completed.value.filter(n => n !== id) : [...completed.value, id]
    try { localStorage.setItem(key, JSON.stringify(completed.value)) } catch { available.value = false }
  }
  function reset() { completed.value = []; try { localStorage.removeItem(key) } catch { available.value = false } }
  return { completed, available, toggle, reset }
}
