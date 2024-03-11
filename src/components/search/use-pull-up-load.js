import BScroll from '@better-scroll/core'
import PullUp from '@better-scroll/pull-up'
//ObserveDOM让它能去监听DOM变化自动刷新
import ObserveDOM from '@better-scroll/observe-dom'
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

//注册插件（一个插件重复注册没有问题）
BScroll.use(PullUp)
BScroll.use(ObserveDOM)

export default function usePullUpLoad(requestData, preventPullUpLoad) {
  //定义scroll对象最终实例化betterScroll用的
  const scroll = ref(null)
  //在suggest根节点中设置一个ref就是rootRef
  const rootRef = ref(null)
  //定义一个新变量用作标志位，这个标志位就是用来控制过程是不是正在拉取以及拉取结束，就是为了最后实现loading图案所用的
  const isPullUpLoad = ref(false)

  //什么时候去new这个betterScorll呢，就是Mounted之后
  onMounted(() => {
    //做scroll的实例化
    const scrollVal = scroll.value = new BScroll(rootRef.value, {
      //这样就实现了上拉加载的能力
      pullUpLoad: true,
      //用来观测它的变化，并自动刷新
      observeDOM: true,
      //允许列表点击
      click: true
    })

    //实例化之后就去监听pullingUp这个事件，上拉加载之后就会派发这个事件，这个事件对应一个回调函数pullingUpHandler
    scrollVal.on('pullingUp', pullingUpHandler)

    //回调函数，内部会做一些异步的请求
    async function pullingUpHandler() {
      if (preventPullUpLoad.value) {
        scrollVal.finishPullUp()
        return
      }
      //首先
      isPullUpLoad.value = true
      //对于这个模块而言，我们不知道异步请求实现逻辑是怎么样的，
      //所以将这个逻辑它作为参数从外部传进来，外部比如suggest组件它是知道怎么去发送这个请求怎么实现请求逻辑，
      //但是对于这个插件来说对于这个钩子函数而言是不知道具体细节的
      //所以直接当作参数传进来，直接执行它
      await requestData()
      //请求结束就执行finishPullUp
      scrollVal.finishPullUp()
      scrollVal.refresh()
      isPullUpLoad.value = false
    }
  })

  //onMounted这个组件卸载的时候做一些清理工作
  onUnmounted(() => {
    scroll.value.destroy()
  })

  onActivated(() => {
    scroll.value.enable()
    scroll.value.refresh()
  })

  onDeactivated(() => {
    scroll.value.disable()
  })

  return {
    scroll,
    rootRef,
    isPullUpLoad
  }
}
