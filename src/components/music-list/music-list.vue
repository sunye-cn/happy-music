<template>
  <div class="music-list">
    <div
      class="back"
      @click="goBack"
    >
      <i class="icon-back" />
    </div>
    <h1 class="title">
      {{ title }}
    </h1>
    <div
      ref="bgImage"
      class="bg-image"
      :style="bgImageStyle"
    >
      <div
        class="play-btn-wrapper"
        :style="playBtnStyle"
      >
        <div
          v-show="songs.length > 0"
          class="play-btn"
          @click="random"
        >
          <i class="icon-play" />
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div
        class="filter"
        :style="filterStyle"
      />
    </div> 
    <scroll
      v-loading="loading"
      v-no-result:[noResultText]="noResult"
      class="list"
      :style="scrollStyle"
      :probe-type="3"
      @scroll="onScroll"
    >
      <div class="song-list-wrapper">
        <song-list
          :songs="songs"
          :rank="rank"
          @select="selectItem"
        />
      </div>
    </scroll>
  </div>
</template>

<script>
import SongList from '@/components/base/song-list/song-list'
import Scroll from '@/components/wrap-scroll'
import { mapActions, mapState } from 'vuex'


//修改层级是距离顶部的距离40像素
const RESERVED_HEIGHT = 40

export default {
  name:'MusicList',
  components: {
    
    SongList,
    Scroll
  },
  props: {
    //songs是歌曲列表
    songs: {
      type: Array,
      default() {
        return []
      }
    },
    //标题
    title: String,
    //背景图片
    pic: String,
    // loading是根据数据获取情况设置的
    // 但是music-list没有数据获取的功能，所以在props中定义布尔类型的loading
    //然后在外面的singer-detail中传入loading
    loading: Boolean,
    //改掉no-result中的默认文案，就是让mosic-list组件也可以接收noResultText这样一个props
    // mosic-list相对来说是一个比较通用的组件，通用组件这种没有数据的文案通常定义在props而不是定义在data
    //因为一旦定义到data别人就没有机会修改这个文案了
    noResultText: {
      type: String,
      default: '抱歉，没有找到可播放的歌曲'
    },
    rank: Boolean
  },
  //动态获取top值的第一步
  data() {
    return {
      // 在data中定义一个图片高度imageHeight变量
      imageHeight: 0,
      //需要知道滚动的y值的距离
      scrollY:0,
      //最大可以滚动的纵轴的距离
      maxTranslateY: 0
    }
  },
  //计算属性
  computed: {
    //noResult这个变量可以定义一个计算属性，根据loading去计算
    noResult() {
      //就是加载完成后即loading结束后且songs为空时noResult才为true
      return !this.loading && !this.songs.length
    },
    //动态添加style，通过动态修改display
    playBtnStyle() {
      //正常情况下display为空字符串
      let display = ''
      //滚动到上面时display设为none
      if (this.scrollY >= this.maxTranslateY) {
        display = 'none'
      }
      return {
        display
      }
    },
    bgImageStyle() {
      //有了maxTranslateY就可以动态修改style
      const scrollY = this.scrollY
      let zIndex = 0
      //在这里动态设置宽高比，先设置两者的默认值
      let paddingTop = '70%'
      let height = 0
      //苹果手机iOS的兼容问题
      let translateZ = 0

      //滚动超过最大可滚动距离时
      if(scrollY > this.maxTranslateY) {      
        zIndex = 10  
        //修改宽高比
        paddingTop = 0
        height = `${RESERVED_HEIGHT}px`
        translateZ = 1
      }

      //缩放是根据scale
      let scale = 1
      //向下拉时scrollY小于0
      if (scrollY < 0) {
        //缩放比例scrollY / this.imageHeight
        //Math.abs是函数返回一个数字的绝对值，因为scrollY小于0
        scale = 1 + Math.abs(scrollY / this.imageHeight)
      }

      return {
        zIndex,
        paddingTop,
        height,
        backgroundImage: `url(${this.pic})`,
        transform: `scale(${scale})translateZ(${translateZ}px)`
      }
    },
    // 因为要动态添加scroll的top值，所以给它动态赋值一个style
    scrollStyle() {
      //是否能滚动到底部，如果有mini-player就让它底在距离底部60px处
      const bottom = this.playlist.length ? '60px' : '0'
      return {
        // top值和imageHeight值一样
        top: `${this.imageHeight}px`,
        bottom
      }
    },
    //给filter层动态设置style，根据scrollY、imageHeight等计算而来，所以放计算属性里面
    filterStyle() {
      //默认不模糊
      let blur = 0
      //获取scrollY的值
      const scrollY = this.scrollY
      //获取高度imageHeight
      const imageHeight = this.imageHeight
      //往上推的过程scrollY >= 0
      if (scrollY >= 0) {
        //本来blur只需要scrollY / imageHeight * 20，
        //但是要有一个越来越模糊的过程，所以通过Math.min来限定最大值this.maxTranslateY / imageHeight*20
        blur = Math.min(this.maxTranslateY / imageHeight, scrollY / imageHeight) * 20
      }
      return {
        backdropFilter: `blur(${blur}px)`
      }
    }, 
    ...mapState([
      'playlist'
    ]) 
  },
  //在钩子函数mounted中
  mounted() {
    //通过DOMAPI拿到imageHeight变量
    this.imageHeight = this.$refs.bgImage.clientHeight
    //可以滚动的最大距离的高度=图片的高度-要改变层级时距离顶部的距离
    this.maxTranslateY = this.imageHeight - RESERVED_HEIGHT
  },
  //方法
  methods: {
    // 点击事件：左上角的回退按钮
    goBack() {
      this.$router.back()
    },
    //监听scroll事件
    onScroll(pos) {
      this.scrollY = -pos.y
    },
    // 监听song-list中的select事件（@select）而定义的函数selectItem
    //接收的数据是一个对象
    selectItem({ song, index }) {
      // 在这里提交一个mutations
      //通过vuex提供的一个语法糖mapActions先在上面派发一个actions
      this.selectPlay({
        list: this.songs,
        index
      })
    },
    
    random() {
      this.randomPlay(this.songs)
    },
    //mapActions作用在methods下面，用扩展运算符使用mapActions这个函数去map一个action叫selectPlay这样一个字符串
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ])
  }
}
</script>

<style lang="scss" scoped>
  .music-list {
    position: relative;
    height: 100%;
    .back {
      position: absolute;
      top: 0;
      left: 6px;
      z-index: 20;
      transform: translateZ(2px);
      .icon-back {
        display: block;
        padding: 10px;
        font-size: $font-size-large-x;
        color: $color-theme;
      }
    }
    .title {
      position: absolute;
      top: 0;
      left: 10%;
      width: 80%;
      z-index: 20;
      transform: translateZ(2px);
      @include no-wrap();
      text-align: center;
      line-height: 40px;
      font-size: $font-size-large;
      color: $color-text;
    }
    .bg-image {
      position: relative;
      width: 100%;
      transform-origin: top;
      background-size: cover;
      //把宽高比去掉（padding-top、height）
      .play-btn-wrapper {
        position: absolute;
        bottom: 20px;
        z-index: 10;
        width: 100%;
        .play-btn {
          box-sizing: border-box;
          width: 135px;
          padding: 7px 0;
          margin: 0 auto;
          text-align: center;
          border: 1px solid $color-theme;
          color: $color-theme;
          border-radius: 100px;
          font-size: 0;
        }
        .icon-play {
          display: inline-block;
          vertical-align: middle;
          margin-right: 6px;
          font-size: $font-size-medium-x;
        }
        .text {
          display: inline-block;
          vertical-align: middle;
          font-size: $font-size-small;
        }
      }
      .filter {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(7, 17, 27, 0.4);
      }
    }
    .list {
      position: absolute;
      bottom: 0;
      width: 100%;
      z-index: 0;
      //列表的overflow:hidden去掉就可以实现将列表拖过图片
      //但是没有写其他逻辑的话就会直接盖过图片而不会停止
      //需要在你想让它停止的位置改变图片的层级
      //要想判断是否滚动到相应的的位置，需要scroll组件实时派发scroll事件
      //通过scroll事件拿到它滚动的位置
      .song-list-wrapper {
        padding: 20px 30px;
        background: $color-background;
      }
    }
  }
</style>
