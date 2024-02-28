<template>
  <div
    v-loading="!singers.length"
    class="singer"
  >
    <index-list
      :data="singers"
      @select="selectSinger"
    />
    <router-view v-slot="{ Component }">
      <transition
        appear
        name="slide"
      >
        <component
          :is="Component"
          :data="selectedSinger"
        />
      </transition>
    </router-view>
  </div>
</template>
<script>
import {getSingerList} from '@/service/singer'
import IndexList from '@/components/index-list/index-list'
import storage from 'good-storage'
import { SINGER_KEY } from '@/assets/js/constant'

export default {
  name: 'MSinger',
  components: {
    IndexList
  },
  data() {
    return {
      singers:[],
      selectedSinger: null
    }
  },
  async created() {
    const result = await getSingerList()
    this.singers = result.singers
  },
  methods: {
    selectSinger(singer) {
      //将singer赋值给定义好的响应式数据
      //再将此响应式数据selectedSinger传递给上面的路由组件
      this.selectedSinger = singer
      //在这里执行cacheSinger，先缓存再转跳二级路由
      this.cacheSinger(singer)      
      //路由跳转
      //渲染singer-detail push路由的时候利用storage做一个存储
      this.$router.push({
        //用路径跳转
        path: `/singer/${singer.mid}`
      })
    },
    //存储需要一个key，把它存为一个常量，放在constant.js中
    // constant.js中存一些共享的常量
    //在这里缓存singer
    cacheSinger(singer) {
      storage.session.set(SINGER_KEY, singer)
    }
  }
}
</script>
<style lang="scss" scoped>
 .singer {
   position: fixed;
   width: 100%;
   top:88px;
   bottom: 0;
 }
</style>
