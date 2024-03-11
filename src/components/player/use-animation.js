import { ref } from 'vue'
import animations from 'create-keyframe-animation'

//实现cd的飞入动画 包括两部分：进入动画和离开动画
export default function useAnimation() {
  const cdWrapperRef = ref(null)
  // 设置标志位
  let entering = false
  let leaving = false

  //定义几个钩子函数：enter、afterEnter、leave、afterLeave
  //el指的是normal-player这个层
  //done函数，通过js去做的动画，vue不知道什么时候动画结束，就需要你来告诉它
  function enter(el, done) {
    if (leaving) {
      afterLeave()
    }
    entering = true
    // 获取位置和缩放
    const { x, y, scale } = getPosAndScale()

    //定义animation，这个过渡效果是一个对象
    const animation = {
      //一开始
      0: {
        transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      },
      //最终状态
      100: {
        transform: 'translate3d(0, 0, 0) scale(1)'
      }
    }

    // 通过registerAnimation注册一个动画
    animations.registerAnimation({
      name: 'move',
      //animation对象
      animation,
      // 预设
      presets: {
        // 整个时长ms
        duration: 600,
        // 缓动效果
        easing: 'cubic-bezier(0.45, 0, 0.55, 1)'
      }
    })

    //只有调用了done函数了才能进入afterEnter函数
    animations.runAnimation(cdWrapperRef.value, 'move', done)
  }

  //这个函数里面做一些清理操作
  function afterEnter() {
    entering = false
    animations.unregisterAnimation('move')
    cdWrapperRef.value.style.animation = ''
  }

  //leave就不用animation就用transition来做
  //大cd到小cd位置的偏移
  function leave(el, done) {
    if (entering) {
      afterEnter()
    }
    leaving = true
    //获取位置和缩放
    const { x, y, scale } = getPosAndScale()
    //拿到对应的DOM
    const cdWrapperEl = cdWrapperRef.value

    cdWrapperEl.style.transition = 'all .6s cubic-bezier(0.45, 0, 0.55, 1)'
    cdWrapperEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
    //绑定一个transitionend事件来知道动画的结束，这个事件的回调函数next
    cdWrapperEl.addEventListener('transitionend', next)

    //定义回调函数next
    function next() {
      // 动画结束后解绑transitionend事件
      cdWrapperEl.removeEventListener('transitionend', next)
      done()
    }
  }

  //做一些清理操作，就是把transition、transform置为空
  function afterLeave() {
    leaving = false
    //先拿到element
    const cdWrapperEl = cdWrapperRef.value

    cdWrapperEl.style.transition = ''
    cdWrapperEl.style.transform = ''
  }

  // 算出偏移量以及缩放比例
  function getPosAndScale() {
    // 小cd宽度
    const targetWidth = 40
    //小cd距离左边
    const paddingLeft = 40
    //小cd距离底部
    const paddingBottom = 30
    //大cd的上边距离顶部的距离
    const paddingTop = 80
    // 大cd的宽度就是屏幕宽度的80%
    const width = window.innerWidth * 0.8

    // x坐标偏移量就是1/2屏幕宽度减去小cd距离左边的宽度，往左偏移横坐标为负值
    const x = -(window.innerWidth / 2 - paddingLeft)
    // y坐标偏移量就是整个屏幕的高度减去大cd边距离顶部的距离再减去大cd的半径再减去小cd距离底部的距离，往下偏移纵坐标是正值
    const y = window.innerHeight - paddingTop - width / 2 - paddingBottom

    // 缩放(小圆半径/大圆半径)
    const scale = targetWidth / width

    return {
      x,
      y,
      scale
    }
  }

  return {
    cdWrapperRef,
    enter,
    afterEnter,
    leave,
    afterLeave
  }
}
