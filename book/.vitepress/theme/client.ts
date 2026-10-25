import { onMounted, ref } from 'vue'

// Static text renders first; enable controls after Vue has attached their handlers.
export function useClientReady() {
  const ready = ref(false)
  onMounted(() => { ready.value = true })
  return ready
}
