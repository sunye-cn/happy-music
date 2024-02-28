import {ref,computed} from 'vue'

export default function useShortcut(props,groupRef) {
  //定义锚点的高度18
  const ANCHOR_HEIGHT = 18
  const scrollRef = ref(null)

  const shortcutList = computed(() => {
    return props.data.map((group) => {
      return group.title
    })
  })

  //  console.log(shortcutList);

  //用来保留用的
  const touch = {}

  function onShortcutTouchStart(e) {
    const anchorIndex = parseInt(e.target.dataset.index)
    //拿到第一次纵坐标，第一根手指touches[0]
    touch.y1 = e.touches[0].pageY
    touch.anchorIndex = anchorIndex

    scrollTo(anchorIndex)
    // console.log("start" ,touch.anchorIndex);
  }

  function onShortcutTouchMove(e) {
    //第二次纵坐标
    touch.y2 = e.touches[0].pageY
    //两个纵坐标做差，touch.y2 - touch.y1得到距离，得用距离除以锚点的高度ANCHOR_HEIGHT，得出偏移了几个身位。
    // ANCHOR_HEIGHT是固定值，或0即：| 0，可以看作正数向下取整的简略写法
    const delta = (touch.y2 - touch.y1) / ANCHOR_HEIGHT | 0
    //目标索引anchorIndex
    const anchorIndex = touch.anchorIndex + delta
    
    scrollTo(anchorIndex)
    //  console.log("end" ,anchorIndex);
  }

  function scrollTo(index) {
    if (isNaN(index)) {
      return
    }
    index = Math.max(0, Math.min(shortcutList.value.length - 1, index))
    const targetEl = groupRef.value.children[index]
    
    const scroll = scrollRef.value.scroll

    scroll.scrollToElement(targetEl, 0)
    // console.log(targetEl, scroll)
  }

  return {
    shortcutList,
    scrollRef,
    onShortcutTouchStart,
    onShortcutTouchMove
  }
}