<template>
  <div
    v-loading="loading"
    class="recommend"
  >
    <scroll class="recommend-content">
      <div>
        <div class="slider-wrapper">
          <div class="slider-content">
            <slider
              v-if="sliders.length"
              :sliders="sliders"
            />
          </div>
        </div>
        <div class="recommend-list">
          <h1
            v-show="!loading"
            class="list-title"
          >
            歌单宝藏库
          </h1>
          <ul>
            <li
              v-for="item in albums"
              :key="item.id"
              class="item"
              @click="selectItem(item)"
            >
              <div class="icon">
                <img
                  v-lazy="item.pic"
                  width="60"
                  height="60"
                >
              </div>
              <div class="text">
                <h2 class="name">
                  {{ item.username }}
                </h2>
                <p class="title">
                  {{ item.title }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </scroll>
    <router-view v-slot="{ Component }">
      <transition
        appear
        name="slide"
      >
        <component
          :is="Component"
          :data="selectedAlbum"
        />
      </transition>
    </router-view>
  </div>
</template>
<script>
import { getRecommend } from '@/service/recommend'
import Slider from '@/components/base/slider/slider'
import Scroll from '@/components/wrap-scroll'
import storage from 'good-storage'
import { ALBUM_KEY } from '@/assets/js/constant'

export default {
  name: 'MRecommend',
  components: {
    Slider,
    Scroll
  },
  data() {
    return {
      sliders: [],
      albums: [],
      selectedAlbum: null
    }
  },
  computed:{
    loading() {
      return !this.sliders.length && !this.albums.length
    }
  },
  async created() { 
    const result = await getRecommend()
    this.sliders = result.sliders
    this.albums = result.albums
    // console.log(result)
  },
  methods: {
    selectItem(album) {
      this.selectedAlbum = album
      this.cacheAlbum(album)
      // 利用路由push进行跳转
      this.$router.push({
        path: `/recommend/${album.id}`
      })
    },
    // 可以在这个页面刷新，就是一个缓存机制的逻辑
    cacheAlbum(album) {
      storage.session.set(ALBUM_KEY, album)
    }
  }
}
</script>
<style lang="scss" scoped>
  .recommend { 
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
    overflow: scroll;
    .recommend-content {
      height: 100%;
      overflow: hidden;
      .slider-wrapper {
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 40%;
        overflow: hidden;
        .slider-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height:100%
        }
      }
      .recommend-list {
        .list-title {
          height: 65px;
          line-height: 65px;
          text-align: center;
          font-size: $font-size-medium;
          color: $color-theme;
        }
        .item {
          display: flex;
          box-sizing: border-box;
          align-items: center;
          padding: 0 20px 20px 20px;
          .icon {
            flex: 0 0 60px;
            width: 60px;
            padding-right: 20px;
          }
          .text {
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            line-height: 20px;
            overflow: hidden;
            font-size: $font-size-medium;
          }
          .name {
            margin-bottom: 10px;
            color: $color-text;
          }
          .title {
            color: $color-text-d;
          }
        }
      }
    }
  }
</style>
