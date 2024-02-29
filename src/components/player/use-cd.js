// 获取当前的playing状态
import { useStore } from 'vuex'
import { computed, ref, watch } from 'vue'

export default function useCd() {
  //定义两个ref
  const cdRef = ref(null)
  const cdImageRef = ref(null)

  //拿到store和playing状态
  const store = useStore()
  const playing = computed(() => store.state.playing)

  // 暂停时cd暂停，通过playing状态来计算样式
  const cdCls = computed(() => {
    return playing.value ? 'playing' : ''
  })

  // 拿到ref就可以观测playing状态的变化，同步旋转角度，为了让歌曲暂停时(!newPlaying)cd不会恢复初始位置
  watch(playing, (newPlaying) => {
    if (!newPlaying) {
      syncTransform(cdRef.value, cdImageRef.value)
    }
  })

  //同步旋转角度
  //利用浏览器的getComputedStyle来获取一个实时DOM样式
  function syncTransform(wrapper, inner) {
    // 外层 最开始也可能有一个角度偏移
    const wrapperTransform = getComputedStyle(wrapper).transform
    // 内层图片的一个旋转角度，因为要把外层容器的角度同步跟内层的角度一样的
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
