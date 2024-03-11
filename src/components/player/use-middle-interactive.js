import { ref } from 'vue'

export default function useMiddleInteractive() {
  //拖动的过程中会发生变化
  const currentShow = ref('cd')
  //cd层的动态style定义
  const middleLStyle = ref(null)
  //歌词层的动态style定义
  const middleRStyle = ref(null)

  //定义touch这个变量，是因为要在不同的函数中共享
  const touch = {}
  // 最终当前的视图
  let currentView = 'cd'

  //三个回调函数
  function onMiddleTouchStart(e) {
    //保留一开始的x的坐标
    touch.startX = e.touches[0].pageX
    //要锁定一个方向滚动
    touch.startY = e.touches[0].pageY
    // 方向锁 batterScroll提供
    touch.directionLocked = ''
  }

  //在手指拖动过程中会触发非常多次，currentShow在过程中会发生变化，currentView在过程中不会发生变化
  function onMiddleTouchMove(e) {
    // 手指在上面移动的偏移量(从右往左滑为负值)
    const deltaX = e.touches[0].pageX - touch.startX
    const deltaY = e.touches[0].pageY - touch.startY

    // 要对比绝对值大小
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // 如果没有就给它一个方向锁(v垂直h横向？)
    //是水平还是垂直取决于横坐标偏移量和纵坐标偏移量哪个大
    if (!touch.directionLocked) {
      touch.directionLocked = absDeltaX >= absDeltaY ? 'h' : 'v'
    }

    //纵向偏移设为无效
    if (touch.directionLocked === 'v') {
      return
    }

    // 往左滑偏移量(做判断)
    const left = currentView === 'cd' ? 0 : -window.innerWidth
    // 歌词列表层偏移量（从右往左滑）
    const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
    // 偏移的比例（便宜多少会发生变化）
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
      //为什么要设置为0ms？因为在onMiddleTouchEnd时把它设置为300ms，如果这里不设为0ms的话你拖动的每一个修改的状态都会有一个缓动
    }

    middleRStyle.value = {
      // 位移
      transform: `translate3d(${offsetWidth}px, 0, 0)`,
      // transitionDuration: '0ms'
    }
  }

  //松开手指时修改currentView
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

    // 动画300ms的缓动
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
