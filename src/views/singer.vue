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
    // console.log(result)
  },
  methods: {
    selectSinger(singer) {
      this.selectedSinger = singer
      this.cacheSinger(singer)
      // console.log(singer)
      this.$router.push({
        path: `/singer/${singer.mid}`
      })
    },
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
