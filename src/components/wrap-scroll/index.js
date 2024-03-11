//引入h渲染函数
import { h, mergeProps, withCtx, renderSlot, ref, computed, watch, nextTick } from 'vue'
//因为是基于基础的scroll组建的封装
import Scroll from '@/components/base/scroll/scroll'
import { useStore } from 'vuex'

export default {
  name: 'wrap-scroll',
  props: Scroll.props,
  emits: Scroll.emits,
  //vue3和vue2的render是不一样的
  render(ctx) {
    // h是vue中的渲染函数相当于vue2的createElement或createConport函数，ctx是上下文实例
    //渲染scroll实例，第一个就是scroll对象
    return h(Scroll, mergeProps({
      ref: 'scrollRef'
    }, ctx.$props, {
      onScroll: (e) => {
        //派发一个scroll事件，传出去
        ctx.$emit('scroll', e)
      }
    }), {
      //slot插槽部分
      default: withCtx(() => {
        //withCtx是保证上下文是正确的
        // renderSlot也是辅助函数
        return [renderSlot(ctx.$slots, 'default')]
      })
    })
  },
  setup() {
    const scrollRef = ref(null)
    const scroll = computed(() => {
      return scrollRef.value.scroll
    })

    const store = useStore()
    const playlist = computed(() => store.state.playlist)

    watch(playlist, async () => {
      await nextTick()
      scroll.value.refresh()
    })

    return {
      scrollRef,
      scroll
    }
  }
}
