<template>
  <transition name="mini">
    <div
      v-show="!fullScreen"
      class="mini-player"
      @click="showNormalPlayer"
    >
      <div class="cd-wrapper">
        <div
          ref="cdRef"
          class="cd"
        >
          <img
            ref="cdImageRef"
            :src="currentSong.pic"
            width="40"
            height="40"
            :class="cdCls"
          >
        </div>
      </div>
      <div
        ref="sliderWrapperRef"
        class="slider-wrapper"
      >
        <div class="slider-group">
          <div
            v-for="song in playlist"
            :key="song.id"
            class="slider-page"
          >
            <h2 class="name">
              {{ song.name }}
            </h2>
            <p class="desc">
              {{ song.singer }}
            </p>
          </div>
        </div>
      </div>
      
      <div class="control">
        <progress-circle
          :radius="32"
          :progress="progress"
        >
          <i
            class="icon-mini"
            :class="miniPlayIcon"
            @click.stop="togglePlay"
          />
        </progress-circle>
      </div>
      <div
        class="control"
        @click.stop="showPlaylist"
      >
        <i class="icon-playlist" />
      </div>
      <Playlist ref="playlistRef" />
    </div>
  </transition>
</template>

<script>
  import { useStore } from 'vuex'
  import { computed, ref } from 'vue'
  import useCd from './use-cd'
  import useMiniSlider from './use-mini-slider'
  import ProgressCircle from './progress-circle'
  import Playlist from './playlist'

  export default {
    name: 'MiniPlayer',
    components: {
      Playlist,
      ProgressCircle
    },
    props: {
      // 进度条
      progress: {
        type: Number,
        default: 0
      },
      togglePlay: Function
    },
    //compersationAPI
    setup() {
      const playlistRef = ref(null)

      const store = useStore()
      //fullScreen为false时显示mini-player
      const fullScreen = computed(() => store.state.fullScreen)
      const currentSong = computed(() => store.getters.currentSong)
      const playing = computed(() => store.state.playing)
      const playlist = computed(() => store.state.playlist)

      const { cdCls, cdRef, cdImageRef } = useCd()
      const { sliderWrapperRef } = useMiniSlider()

      const miniPlayIcon = computed(() => {
        return playing.value ? 'icon-pause-mini' : 'icon-play-mini'
      })

      // 点击mini播放器可以展开歌曲
      function showNormalPlayer() {
        store.commit('setFullScreen', true)
      }

      function showPlaylist() {
        playlistRef.value.show()
      }

      return {
        playlistRef,
        fullScreen,
        currentSong,
        playlist,
        miniPlayIcon,
        showNormalPlayer,
        showPlaylist,
        // cd
        cdCls,
        cdRef,
        cdImageRef,
        // mini-slider
        sliderWrapperRef
      }
    }
  }
</script>

<style lang="scss" scoped>
  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: $color-highlight-background;
    .cd-wrapper {
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      padding: 0 10px 0 20px;
      .cd {
        height: 100%;
        width: 100%;
        img {
          border-radius: 50%;
          &.playing {
            animation: rotate 10s linear infinite;
          }
          &.pause {
            animation-play-state: paused;
          }
        }
      }
    }
    .slider-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;
      .slider-group {
        position: relative;
        overflow: hidden;
        white-space: nowrap;
        .slider-page {
          display: inline-block;
          width: 100%;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          .name {
            margin-bottom: 2px;
            @include no-wrap();
            font-size: $font-size-medium;
            color: $color-text;
          }
          .desc {
            @include no-wrap();
            font-size: $font-size-small;
            color: $color-text-d;
          }
        }
      }
    }
    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;
      .icon-playlist {
        position: relative;
        top: -2px;
        font-size: 28px;
        color: $color-theme-d;
      }
      .icon-mini {
        position: absolute;
        left: 0;
        top: 0;
        color: $color-theme-d;
        font-size: 32px;
      }
    }
    &.mini-enter-active, &.mini-leave-active {
      transition: all 0.6s cubic-bezier(0.45, 0, 0.55, 1);
    }
    &.mini-enter-from, &.mini-leave-to {
      //缓动效果：出现时透明度是0，会渐变成1.transform有一个y轴100%的位移，就是说有一个从下往上冒的交互效果
      opacity: 0;
      transform: translate3d(0, 100%, 0)
    }
  }
</style>