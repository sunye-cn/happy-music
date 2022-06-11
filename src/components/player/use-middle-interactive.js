import { ref } from 'vue'

export default function useMiddleInteractive() {
  const currentShow = ref('cd')
  const middleLStyle = ref(null)
  const middleRStyle = ref(null)

  const touch = {}
  // 最终当前路由
  let currentView = 'cd'

  function onMiddleTouchStart(e) {
    touch.startX = e.touches[0].pageX
    touch.startY = e.touches[0].pageY
    // 方向锁 batterScroll提供
    touch.directionLocked = ''
  }

  function onMiddleTouchMove(e) {
    // 手指在上面移动的偏移量(从右往左滑为负值)
    const deltaX = e.touches[0].pageX - touch.startX
    const deltaY = e.touches[0].pageY - touch.startY

    // 要对比绝对值大小
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // 如果没有就给它一个方向锁(v垂直h横向？)
    if (!touch.directionLocked) {
      touch.directionLocked = absDeltaX >= absDeltaY ? 'h' : 'v'
    }

    if (touch.directionLocked === 'v') {
      return
    }

    // 往左滑偏移量(做判断)
    const left = currentView === 'cd' ? 0 : -window.innerWidth
    // 歌词列表层偏移量
    const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
    // 偏移的比例
    touch.percent = Math.abs(offsetWidth / window.innerWidth)

    // 判断手指滑动多少改变页面
    if (currentView === 'cd') {
      if (touch.percent > 0.2) {
        currentShow.value = 'lyric'
      } else {
        currentShow.value = 'cd'
      }
    } else {
      if (touch.percent < 0.8) {
        currentShow.value = 'cd'
      } else {
        currentShow.value = 'lyric'
      }
    }

    middleLStyle.value = {
      // 修改透明度
      opacity: 1 - touch.percent,
      // transitionDuration: '0ms'不设置也没有问题，默认为0ms,如果设置不能不加单位
    }

    middleRStyle.value = {
      // 位移
      transform: `translate3d(${offsetWidth}px, 0, 0)`,
      // transitionDuration: '0ms'
    }
  }

  function onMiddleTouchEnd() {
    // 偏移量
    let offsetWidth
    // 透明度
    let opacity
    // 两种极端状态(手指偏移到cd或者lyric层)
    if (currentShow.value === 'cd') {
      currentView = 'cd'
      offsetWidth = 0
      opacity = 1
    } else {
      currentView = 'lyric'
      offsetWidth = -window.innerWidth
      opacity = 0
    }

    // 动画
    const duration = 300
    middleLStyle.value = {
      opacity,
      transitionDuration: `${duration}ms`
    }

    middleRStyle.value = {
      transform: `translate3d(${offsetWidth}px, 0, 0)`,
      transitionDuration: `${duration}ms`
    }
  }

  return {
    currentShow,
    middleLStyle,
    middleRStyle,
    onMiddleTouchStart,
    onMiddleTouchMove,
    onMiddleTouchEnd
  }
}
