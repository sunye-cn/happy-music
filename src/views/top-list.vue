<template>
  <div
    v-loading="loading"
    class="top-list"
  >
    <scroll class="top-list-content">
      <ul>
        <li
          v-for="item in topList"
          :key="item.id"
          class="item"
          @click="selectItem(item)"
        >
          <div class="icon">
            <img
              v-lazy="item.pic"
              width="100"
              height="100"
            >
          </div>
          <ul class="song-list">
            <li
              v-for="(song, index) in item.songList"
              :key="song.id"
              class="song"
            >
              <span>{{ index + 1 }}. </span>
              <span>{{ song.songName }}-{{ song.singerName }}</span>
            </li>
          </ul>
        </li>
      </ul>
    </scroll>
    <router-view v-slot="{ Component }">
      <transition
        appear
        name="slide"
      >
        <component
          :is="Component"
          :data="selectedTop"
        />
      </transition>
    </router-view>
  </div>
</template>

<script>
  import Scroll from '@/components/wrap-scroll'
  import { getTopList } from '@/service/top-list'
  import { TOP_KEY } from '@/assets/js/constant'
  import storage from 'good-storage'

  export default {
    name: 'TopList',
    components: {
      Scroll
    },
    data() {
      return {
        topList: [],
        loading: true,
        selectedTop: null
      }
    },
    //获取榜单的数据，在钩子函数中获取
    async created() {
      const result = await getTopList()
      this.topList = result.topList
      this.loading = false
    },
    methods: {
      selectItem(top) {
        this.selectedTop = top
        this.cacheTop(top)
        //跳转到二级路由
        this.$router.push({
          path: `/top-list/${top.id}`
        })
      },
      //刷新用的缓存
      cacheTop(top) {
        storage.session.set(TOP_KEY, top)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .top-list {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
    .top-list-content {
      height: 100%;
      overflow: hidden;
      .item {
        display: flex;
        margin: 0 20px;
        padding-top: 20px;
        height: 100px;
        &:last-child {
          padding-bottom: 20px;
        }
        .icon {
          flex: 0 0 100px;
          width: 100px;
          height: 100px;
        }
        .song-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 20px;
          height: 100px;
          overflow: hidden;
          background: $color-highlight-background;
          color: $color-text-d;
          font-size: $font-size-small;
          .song {
            @include no-wrap();
            line-height: 26px;
          }
        }
      }
    }
  }
</style>
