import { useStore } from 'vuex'
import { computed, ref, watch } from 'vue'

export default function useCd() {
  const cdRef = ref(null)
  const cdImageRef = ref(null)

  const store = useStore()
  const playing = computed(() => store.state.playing)

  // 暂停时cd暂停
  const cdCls = computed(() => {
    return playing.value ? 'playing' : ''
  })

  // 拿到ref就可以观测playing状态的变化，同步旋转角度，为了让歌曲暂停时(!newPlaying)cd不会恢复初始位置
  watch(playing, (newPlaying) => {
    if (!newPlaying) {
      syncTransform(cdRef.value, cdImageRef.value)
    }
  })

  function syncTransform(wrapper, inner) {
    // 外层
    const wrapperTransform = getComputedStyle(wrapper).transform
    // 内层(动态计算getComputedStyle)
    const innerTransform = getComputedStyle(inner).transform
    // 因为外层也在转，内外层角度叠加(角度叠加用concat)要算进来
    wrapper.style.transform = wrapperTransform === 'none' ? innerTransform : innerTransform.concat(' ', wrapperTransform)
  }

  return {
    cdCls,
    cdRef,
    cdImageRef
  }
}
