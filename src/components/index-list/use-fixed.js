import {ref, watch,computed,nextTick} from 'vue'

export default function useFixed(props) {
  //title层高度
  const TITLE_HEIGHT = 30
  //ref是vue暴露的响应式API，而且一定是要返回出去的，所以下面return groupRef
  //groupRef就是左侧容器的DOM
  const groupRef = ref(null)
  //每个组的高度区间
  const listHeights =ref([])
  const scrollY = ref(0)
  //当前显示标题时定义的当前下标
  const currentIndex = ref(0)
  //当前组的下一个组距离容器顶部的距离distance
  const distance = ref(0)

  //通过这个索引currentIndex.value我们就可以知道当前组是什么，当前组的标题又是什么
  const fixedTitle = computed(() => {
    //拉上去或者拉下来时不需要title
    if( scrollY.value < 0) {
      return ''
    }
    //获知当前组
    const currentGroup = props.data[currentIndex.value]
    //获取当前组的标题
    return currentGroup ? currentGroup.title : ''
  })

  const fixedStyle = computed(()=> {
    const distanceVal = distance.value
    const diff = (distanceVal > 0 && distanceVal < TITLE_HEIGHT) ? distanceVal - TITLE_HEIGHT : 0
    return {
      transform: `translate3d(0,${diff}px,0)`
    }
  })

  watch(() => props.data, async () => {
    await nextTick()
    calculate()
  })

  //然后watch这个滚动位置，来判断y值落在哪个滚动区间内
  watch(scrollY,(newY) => {
    const listHeightsVal = listHeights.value
    for(let i=0; i<listHeightsVal.length-1; i++) {
      const heightTop = listHeightsVal[i]
      const heightBottom = listHeightsVal[i+1]
      //落在哪个区间说明这个区间就是当前的区间，我们就可以拿到这个索引currentIndex.value
      if(newY>=heightTop && newY<heightBottom) {
        currentIndex.value = i
        // console.log("currentIndex",currentIndex.value);
        distance.value = heightBottom - newY
        break
      }
    }
  })

  function calculate() {
    //求解列表高度
    const list = groupRef.value.children
    //首先获得左侧组的区间高度listHeightsVal
    const listHeightsVal = listHeights.value
    let height = 0

    listHeightsVal.length = 0
    listHeightsVal.push(height)

    for(let i=0 ; i<list.length; i++) {
      height += list[i].clientHeight
      listHeightsVal.push(height)
    }
  }
  //然后通过监听滚动事件拿到实时滚动位置scrollY.value
  function onScroll(pos) {
    // console.log(pos)
    scrollY.value = -pos.y
   // scrollY.value+=0.5
  }

  return {
    groupRef,
    onScroll,
    fixedTitle,
    fixedStyle,
    currentIndex
  }
}