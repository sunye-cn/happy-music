<template>
  <div
    v-show="playlist.length"
    class="player"
  >
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div
        v-show="fullScreen"
        class="normal-player"
      >
        <div class="background">
          <img :src="currentSong.pic">
        </div>
        <div class="top">
          <div
            class="back"
            @click="goBack"
          >
            <i class="icon-back" />
          </div>
          <h1 class="title">
            {{ currentSong.name }}
          </h1>
          <h2 class="subtitle">
            {{ currentSong.singer }}
          </h2>
        </div>
        <div
          class="middle"
          @touchstart.prevent="onMiddleTouchStart"
          @touchmove.prevent="onMiddleTouchMove"
          @touchend.prevent="onMiddleTouchEnd"
        >
          <div
            class="middle-l"
            :style="middleLStyle"
          >
            <div
              ref="cdWrapperRef"
              class="cd-wrapper"
            >
              <div
                ref="cdRef"
                class="cd"
              >
                <img
                  ref="cdImageRef"
                  :src="currentSong.pic"
                  class="image"
                  :class="cdCls"
                >
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">
                {{ playingLyric }}
              </div>
            </div>
          </div>
          <scroll
            ref="lyricScrollRef"
            class="middle-r"
            :style="middleRStyle"
          >
            <div class="lyric-wrapper">
              <div
                v-if="currentLyric"
                ref="lyricListRef"
              >
                <p
                  v-for="(line,index) in currentLyric.lines"
                  :key="line.num"
                  class="text"
                  :class="{'current': currentLineNum === index}"
                >
                  {{ line.txt }}
                </p>
              </div>
              <div
                v-show="pureMusicLyric"
                class="pure-music"
              >
                <p>{{ pureMusicLyric }}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span
              class="dot"
              :class="{'active':currentShow==='cd'}"
            />
            <span
              class="dot"
              :class="{'active':currentShow==='lyric'}"
            />
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{ formatTime(currentTime) }}</span>
            <div class="progress-bar-wrapper">
              <progress-bar
                ref="barRef"
                :progress="progress"
                @progress-changing="onProgressChanging"
                @progress-changed="onProgressChanged"
              />
            </div>
            <span class="time time-r">{{ formatTime(currentSong.duration) }}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i
                :class="modeIcon"
                @click="changeMode"
              />
            </div>
            <div
              class="icon i-left"
              :class="disableCls"
            >
              <i
                class="icon-prev"
                @click="prev"
              />
            </div>
            <div
              class="icon i-center"
              :class="disableCls"
            >
              <i
                :class="playIcon"
                @click="togglePlay"
              />
            </div>
            <div
              class="icon i-right"
              :class="disableCls"
            >
              <i
                class="icon-next"
                @click="next"
              />
            </div>
            <div class="icon i-right">
              <i
                :class="getFavoriteIcon(currentSong)"
                @click="toggleFavorite(currentSong)"
              />
            </div>
          </div>
        </div>
      </div>
    </transition> 
    <mini-player
      :progress="progress"
      :toggle-play="togglePlay"
    />
    <audio
      ref="audioRef"
      @pause="pause"
      @canplay="ready"
      @error="error"
      @timeupdate="updateTime"
      @ended="end"
    />
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { computed, watch, ref, nextTick } from 'vue'
import useMode from './use-mode'
import useFavorite from './use-favorite'
import useCd from './use-cd'
import useLyric from './use-lyric'
import useMiddleInteractive from './use-middle-interactive'
import useAnimation from './use-animation'
import usePlayHistory from './use-play-history'
import ProgressBar from './progress-bar'
import Scroll from '@/components/base/scroll/scroll'
import MiniPlayer from './mini-player'
import { formatTime } from '@/assets/js/util'
import { PLAY_MODE } from '@/assets/js/constant'

  export default {
    name: 'MPlayer',
    components: {
      MiniPlayer,
      ProgressBar,
      Scroll
    }, 
    
    //在启动函数setup中
    // 首先获取fullScreen、currentSong，然后把数据传递给上面的模板让模板可以正确的渲染
    //vuex提供一个API就是专门为compositionAPI提供的，就是{ useStore }
    setup() {
      // data
      const audioRef = ref(null)
      const barRef = ref(null)
      //不是说歌曲状态一更新就播放,而是要等到歌曲ready了之后播放,用ref搞成响应式初始值是false
      const songReady = ref(false)
      //当前播放时间 歌曲播放过程中变化
      const currentTime = ref(0)
      // 设置默认标志位
      let progressChanging = false

      // vuex
      //这个store可以理解为index.js中createStore返回的store实例，里面就有state、getters等这些属性
      const store = useStore()
      //因为希望它是一个响应式的，所以用computed，上面会用computed响应式API
      const fullScreen = computed(() => store.state.fullScreen)
      const currentSong = computed(() => store.getters.currentSong)
      // 要求动态绑定的class playIcon首先要获取它的playing状态
      const playing = computed(() => store.state.playing)
      //获取当前索引
      const currentIndex = computed(() => store.state.currentIndex)
      const playMode = computed(() => store.state.playMode)

      // hooks
      const { modeIcon, changeMode } = useMode()
      const { getFavoriteIcon, toggleFavorite } = useFavorite()
      const { cdCls, cdRef, cdImageRef } = useCd()
      const { currentLyric, currentLineNum, pureMusicLyric, playingLyric, lyricScrollRef, lyricListRef, playLyric, stopLyric } = useLyric({
        songReady,
        currentTime
      })
      const { currentShow, middleLStyle, middleRStyle, onMiddleTouchStart, onMiddleTouchMove, onMiddleTouchEnd } = useMiddleInteractive()
      const { cdWrapperRef, enter, afterEnter, leave, afterLeave } = useAnimation()
      const { savePlay } = usePlayHistory()

      // computed  
      //当前播放列表   
      const playlist = computed(() => store.state.playlist)

      //根据playing状态就可以计算出playIcon
      const playIcon = computed(() => {
        //根据不同的播放状态求得它的playIcon
        return playing.value ? 'icon-pause' : 'icon-play'
      })

      //歌曲的播放进度
      const progress = computed(() => {
        //已播放时间/总时间=播放进度
        return currentTime.value / currentSong.value.duration
      })

      //中途点击无效时要让他们在UI中看到,即添加一个diasble的样式
      const disableCls = computed(() => {
        return songReady.value ? '' : 'disable'
      })

      // watch currentSong的变化，通过currentSong拿到歌曲的url，再把url赋值给audio,放到src里面就行
      watch(currentSong,(newSong) => {
        //做个保护
        if(!newSong.id || !newSong.url) {
          return
        }

        //歌曲切换的时候currentTime也要置为0
        currentTime.value = 0
        //切歌的时候即歌曲发生变化的时候就将songReady置为false
        songReady.value = false
        // 定义一个ref API audioRef来拿到audio对应的DOM对象
        const audioEl = audioRef.value
        audioEl.src = newSong.url
        audioEl.play()
        store.commit('setPlayingState', true)
      })

      //watch playing数据的变化拿到newPlaying
      // 数据的变化和DOM的映射关系通过watchAPI,通过命令式的语法watch了一个数据变化,然后获取了DOM
      watch(playing, (newPlaying) => {
        //如果此时songReady是false就不播放
        if (!songReady.value) {
          return
        }
        //根据newPlaying就可以操纵audio的DOM
        const audioEl = audioRef.value
        // newPlaying播放状态是调用play方法，暂停的话就调用pause()
        if (newPlaying) {
          audioEl.play()
          playLyric()
        } else {
          audioEl.pause()
          stopLyric()
        }
      })

      watch(fullScreen, async (newFullScreen) => {
        if (newFullScreen) {
          await nextTick()
          barRef.value.setOffset(progress.value)
        }
      })

      // methods
      //点击back按钮就收缩，就是让fullScreen变成false
      function goBack() {
        //通过commit这个API提交一个mutation？
        store.commit('setFullScreen', false)
      }

      //给中间的按钮绑定的点击事件，用来来回翻转播放状态，就是提交一个数据来修改全局state中的playing状态
      function togglePlay() {
        //这个也要加一个歌曲是否ready的判断
        if (!songReady.value) {
          return
        }
        //通过commit这个API提交，'setPlayingState'的值就是playing.value取反，因为要来回切换，播放的就变成暂停
        //此时由于没有和audio联系起来，所以只会改变图形并不会暂停和播放歌曲，需要watch以下
        store.commit('setPlayingState', !playing.value)
      }
      
      //当audioRef暂停时,不修改数据数据就会乱掉,监听一个原生DOM提供的pause事件,该事件对应一个pause方法,只需要在这个方法中修改数据就可以了
      //也就是通过commit这个API提交，将'setPlayingState'的值改为false
      function pause() {
        store.commit('setPlayingState', false)

      }

      //切换到上一首歌,就是让currentIndex-1
      function prev() {
        //拿到playlist之后先获取playlist的value
        const list = playlist.value
        //边界情况考虑,列表里面就没有歌曲以及
        if (!songReady.value || !list.length) {
          return
        }

        //边界情况考虑,如果列表只有一首歌就让它循环播放
        if (list.length === 1) {
          loop()
        } else {
          let index = currentIndex.value - 1
          //边界情况,当前这个歌曲是第一首歌,就让它播放最后一首歌,index就是当前播放列表的长度-1
          if (index === -1) {
            index = list.length - 1
          }
          store.commit('setCurrentIndex', index)
          //如果是暂停的状态就让他播放
          // if(!playing.value) {
          //   store.commit('setPlayingState',true)
          // }
        }
      }

      //切换到下一首歌,就是让currentIndex+1
      function next() {
        const list = playlist.value
        if (!songReady.value || !list.length) {
          return
        }

        if (list.length === 1) {
          loop()
        } else {
          let index = currentIndex.value + 1
          //如果前进到末尾了,就让它播放第一首歌
          if (index === list.length) {
            index = 0
          }
          store.commit('setCurrentIndex', index)
        }
      }

      //循环播放当前歌曲
      function loop() {
        //获取到audio的DOM audioEl
        const audioEl = audioRef.value
        //通过DOMAPI设置当前播放歌曲时间为0,就是让他从头播放
        audioEl.currentTime = 0
        audioEl.play()
        store.commit('setPlayingState', true)
      }

      //监听canplay事件
      function ready() {
        //如果已经ready过了就不执行后面的逻辑了
        if (songReady.value) {
          return
        }
        songReady.value = true
        playLyric()
        savePlay(currentSong.value)
      }

      //如果一首歌出现问题就不会触发canplay事件,songReady就永远为false就无法切换歌曲
      function error() {
        songReady.value = true
      }

      //修改currentTime.value
      function updateTime(e) {
        //做一个控制
        //就是在progressChanging过程中做一个标志位progressChanging默认值false，在onProgressChanging中置为true，在onProgressChanged是置为false
        //在updateTime中做一个判断
        //可以看作在progressChanging过程中进度条发生改变修改currentTime优先级要高，自身歌曲发生改变引起的currentTime改变优先级变低
        if (!progressChanging) {
          currentTime.value = e.target.currentTime
        }
      }

      //监听事件onProgressChanging就是修改 currentTime.value
      function onProgressChanging(progress) {
        progressChanging = true
        //左侧当前时间实时改变
        currentTime.value = currentSong.value.duration * progress
        // 拖动进度条时歌词也要跟着动
        playLyric()
        stopLyric()
      }

      //真实改变audioRef.value.currentTime
      function onProgressChanged(progress) {
        progressChanging = false
        audioRef.value.currentTime = currentTime.value = currentSong.value.duration * progress
        if (!playing.value) {
          // 如果是暂停状态就播放
          store.commit('setPlayingState', true)
        }
        playLyric()
      }

      //给ended事件的end回调函数
      function end() {
        currentTime.value = 0
        if (playMode.value === PLAY_MODE.loop) {
          loop()
        } else {
          next()
        }
      }

      return {
        audioRef,
        barRef,
        fullScreen,
        currentTime,
        currentSong,
        playlist,
        playIcon,
        disableCls,
        progress,
        goBack,
        togglePlay,
        pause,
        prev,
        next,
        ready,
        error,
        //原生DOM事件@timeupdate
        updateTime,
        formatTime,
        onProgressChanging,
        onProgressChanged,
        end,
        //mode
        modeIcon,
        changeMode,
        // favorite
        getFavoriteIcon,
        toggleFavorite,
        // cd
        cdCls,
        cdRef,
        cdImageRef,
        //lyric
        currentLyric,
        currentLineNum,
        pureMusicLyric,
        playingLyric,
        lyricScrollRef, 
        lyricListRef,
        // middle-interactive
        currentShow,
        middleLStyle, 
        middleRStyle, 
        onMiddleTouchStart, 
        onMiddleTouchMove, 
        onMiddleTouchEnd,
        // animation
        cdWrapperRef,
        enter,
        afterEnter,
        leave,
        afterLeave
      }
    }
  }
</script>

<style lang="scss" scoped>
  .player {
    .normal-player {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 150;
      background: $color-background;
      .background {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.6;
        filter: blur(20px);

        img {
          width: 100%;
          height: 100%;
        }
      }
      .top {
        position: relative;
        margin-bottom: 25px;
        .back {
          position: absolute;
          top: 0;
          left: 6px;
          z-index: 50;
        }
        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
        .title {
          width: 70%;
          margin: 0 auto;
          line-height: 40px;
          text-align: center;
          @include no-wrap();
          font-size: $font-size-large;
          color: $color-text;
        }
        .subtitle {
          line-height: 20px;
          text-align: center;
          font-size: $font-size-medium;
          color: $color-text;
        }
      }
      .middle {
        position: fixed;
        width: 100%;
        top: 80px;
        bottom: 170px;
        white-space: nowrap;
        font-size: 0;
        .middle-l {
          display: inline-block;
          // display: none;
          vertical-align: top;
          position: relative;
          width: 100%;
          height: 0;
          padding-top: 80%;
          .cd-wrapper {
            position: absolute;
            left: 10%;
            top: 0;
            width: 80%;
            box-sizing: border-box;
            height: 100%;
            .cd {
              width: 100%;
              height: 100%;
              border-radius: 50%;
              img {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                border-radius: 50%;
                border: 10px solid rgba(255, 255, 255, 0.1);
              }
              .playing {
                animation: rotate 20s linear infinite
              }
            }
          }
          .playing-lyric-wrapper {
            width: 80%;
            margin: 30px auto 0 auto;
            overflow: hidden;
            text-align: center;
            .playing-lyric {
              height: 20px;
              line-height: 20px;
              font-size: $font-size-medium;
              color: $color-text-l;
            }
          }
        }
        .middle-r {
          display: inline-block;
          vertical-align: top;
          width: 100%;
          height: 100%;
          overflow: hidden;
          .lyric-wrapper {
            width: 80%;
            margin: 0 auto;
            overflow: hidden;
            text-align: center;
            .text {
              line-height: 32px;
              color: $color-text-l;
              font-size: $font-size-medium;
              &.current {
                color: $color-text;
              }
            }
            .pure-music {
              padding-top: 50%;
              line-height: 32px;
              color: $color-text-l;
              font-size: $font-size-medium;
            }
          }
        }
      }
      .bottom {
        position: absolute;
        bottom: 50px;
        width: 100%;
        .dot-wrapper {
          text-align: center;
          font-size: 0;
          .dot {
            display: inline-block;
            vertical-align: middle;
            margin: 0 4px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: $color-text-l;
            &.active {
              width: 20px;
              border-radius: 5px;
              background: $color-text-ll;
            }
          }
        }
        .progress-wrapper {
          display: flex;
          align-items: center;
          width: 80%;
          margin: 0px auto;
          padding: 10px 0;
          .time {
            color: $color-text;
            font-size: $font-size-small;
            flex: 0 0 40px;
            line-height: 30px;
            width: 40px;
            &.time-l {
              text-align: left;
            }
            &.time-r {
              text-align: right;
            }
          }
          .progress-bar-wrapper {
            flex: 1;
          }
        }
        .operators {
          display: flex;
          align-items: center;
          .icon {
            flex: 1;
            color: $color-theme;
            &.disable {
              color: $color-theme-d;
            }
            i {
              font-size: 30px;
            }
          }
          .i-left {
            text-align: right;
          }
          .i-center {
            padding: 0 20px;
            text-align: center;
            i {
              font-size: 40px;
            }
          }
          .i-right {
            text-align: left
          }
          .icon-favorite {
            color: $color-sub-theme;
          }
        }
      }
      &.normal-enter-active, &.normal-leave-active {
        transition: all .6s;
        .top, .bottom {
          transition: all .6s cubic-bezier(0.45, 0, 0.55, 1);
        }
      }
      &.normal-enter-from, &.normal-leave-to {
        opacity: 0;
        .top {
          transform: translate3d(0, -100px, 0);
        }
        .bottom {
          transform: translate3d(0, 100px, 0)
        }
      }
    }
  }
</style>
