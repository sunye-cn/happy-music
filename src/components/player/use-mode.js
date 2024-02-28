import { useStore } from 'vuex'
import { computed } from 'vue'
import { PLAY_MODE } from '@/assets/js/constant'

//拆成的钩子函数,这里面实现modeIcon和playMode
export default function useMode() {
  //通过useStore这个API可以从store中拿到这个数据
  const store = useStore()
  const playMode = computed(() => store.state.playMode)

  //modeIcon是根据playMode当前播放模式来决定他渲染成什么样子
  const modeIcon = computed(() => {
    // 缓存一下
    const playModeVal = playMode.value
    //三元运算符 sequence顺序播放random随机播放loop循环播放
    return playModeVal === PLAY_MODE.sequence
      ? 'icon-sequence'
      : playModeVal === PLAY_MODE.random
        ? 'icon-random'
        : 'icon-loop'
  })

  const modeText = computed(() => {
    const playModeVal = playMode.value
    return playModeVal === PLAY_MODE.sequence
      ? '顺序播放'
      : playModeVal === PLAY_MODE.random
        ? '随机播放'
        : '单曲循环'
  })

  //有了这个函数点击切换状态按钮就会有反应
  function changeMode() {
    //对3取余，就是0、1、2的值
    const mode = (playMode.value + 1) % 3
    // 提交一个action，对mode这个mutation做一个封装，实现这个action
    store.dispatch('changeMode', mode)
  }

  return {
    modeIcon,
    modeText,
    changeMode
  }
}
