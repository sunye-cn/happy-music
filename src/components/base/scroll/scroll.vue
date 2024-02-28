<template>
  <div ref="rootRef">
    <slot />
  </div>
</template>

<script>
import useScroll from './use-scroll'
import {ref} from 'vue'
  export default {
    name:'MScroll',
    props:{
      click:{
        type:Boolean,
        default:true
      },
      // 根据betterScoll官网来看要配置一个probeType
      probeType: {
        type: Number,
        default: 0
      }
    },
    emits:['scroll'],
    setup(props, {emit}) {
      const rootRef = ref(null)
      const scroll = useScroll(rootRef,props,emit)

      return {
        rootRef,
        scroll
      }
    }
  }
</script>
