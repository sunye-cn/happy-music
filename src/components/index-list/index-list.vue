<template>
  <scroll
    ref="scrollRef"
    class="index-list"
    :probe-type="3"
    @scroll="onScroll"
  >
    <ul ref="groupRef">
      <li
        v-for="group in data"
        :key="group.title"
        class="group"
      >
        <h2 class="title">
          {{ group.title }}
        </h2>
        <ul>
          <li
            v-for="item in group.list"
            :key="item.id"
            class="item"
            @click="onItemClick(item)"
          >
            <img
              v-lazy="item.pic"
              class="avatar"
            >
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div
      v-show="fixedTitle"
      class="fixed"
      :style="fixedStyle"
    >
      <div class="fixed-title">
        {{ fixedTitle }}
      </div>
    </div>
    <div
      class="shortcut"
      @touchstart.stop.prevent="onShortcutTouchStart"
      @touchmove.stop.prevent="onShortcutTouchMove"
      @touchend.stop.prevent
    >
      <ul>
        <li
          v-for="(item,index) in shortcutList"
          :key="item"
          class="item"
          :data-index="index"
          :class="{'current':currentIndex === index}"
        >
          {{ (item && item.length > 1) ? item[0] : item }}
        </li>
      </ul>
    </div>
  </scroll>
</template>

<script>
import Scroll from '@/components/wrap-scroll'
import useFixed from './use-fixed'
import useShortcut from './use-shortcut'

export default {
  name: 'IndexList',
  components: {Scroll},
  props: {
    data: {
      type: Array,
      default() {
        return []
      }
    }
  },
  //vue3里面要在这里写好有哪些自定义事件
  emits: ['select'],
  setup(props,{emit}) {

    const {groupRef,onScroll,fixedTitle,fixedStyle,currentIndex} = useFixed(props)
    const {shortcutList,scrollRef,onShortcutTouchStart,onShortcutTouchMove} = useShortcut(props,groupRef)

    function onItemClick(item) {
      //此参数item就是一条singer数据
      //通过emit一个自定义事件select将item派发给外面
      emit('select', item)
    }

    //称之为返回到模板中
    return {
      onItemClick,
      //fixed
      groupRef,
      onScroll,
      fixedTitle,
      fixedStyle,  
      currentIndex,
      // shortcut
      shortcutList,
      onShortcutTouchStart,
      scrollRef,
      onShortcutTouchMove
    }
  }
}
</script>

<style lang="scss" scoped>
 .index-list {
   position: relative;
   width: 100%;
   height: 100%;
   overflow: hidden;
   background: $color-background;
   .group {
     padding-bottom: 30px;
     .title {
       height: 30px;
       line-height: 30px;
       padding-left: 20px;
       font-size: $font-size-small;
       color: $color-text-l;
       background: $color-highlight-background;
     }
     .item {
       display: flex;
       align-items: center;
       padding: 20px 0 0 30px;
       .avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
       }
       .name {
          margin-left: 20px;
          color: $color-text-l;
          font-size: $font-size-medium;
       }
     }

   }
   .fixed {
     position: absolute;
     top: 0;
     left: 0;
     width: 100%;
     .fixed-title {
       height: 30px;
       line-height: 30px;
       padding-left: 20px;
       font-size: $font-size-small;
       color: $color-text-l;
       background: $color-highlight-background;
     }
   }
   .shortcut {
      position: absolute;
      right: 4px;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      padding: 20px 0;
      border-radius: 10px;
      text-align: center;
      background: $color-background-d;
      font-family: Helvetica;
      .item {
        padding: 3px;
        line-height: 1;
        color: $color-text-l;
        font-size: $font-size-small;
        &.current {
          color: $color-theme
        }
      }
    }
 }
</style>