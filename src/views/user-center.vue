<template>
  <div
    v-no-result:[noResultText]="noResult"
    class="user-center"
  >
    <div
      class="back"
      @click="back"
    >
      <i class="icon-back" />
    </div>
    <div class="switches-wrapper">
      <switches
        v-model="currentIndex"
        :items="['喜欢', '最近',]"
      />
    </div>
    <div
      v-if="currentList.length"
      class="play-btn"
      @click="random"
    >
      <i class="icon-play" />
      <span class="text">随机播放全部</span>
    </div>
    <div class="list-wrapper">
      <scroll
        v-if="currentIndex===0"
        class="list-scroll"
      >
        <div class="list-inner">
          <song-list
            :songs="favoriteList"
            @select="selectSong"
          />
        </div>
      </scroll>
      <scroll
        v-if="currentIndex===1"
        class="list-scroll"
      >
        <div class="list-inner">
          <song-list
            :songs="playHistory"
            @select="selectSong"
          />
        </div>
      </scroll>
    </div>
  </div>
</template>

<script>
  import Switches from '@/components/base/switches/switches'
  import Scroll from '@/components/wrap-scroll'
  import SongList from '@/components/base/song-list/song-list'
  import { mapState, mapActions } from 'vuex'

  export default {
    name: 'UserCenter',
    components: {
      Switches,
      Scroll,
      SongList
    },
    data() {
      return {
        currentIndex: 0
      }
    },
    computed: {
      noResult() {
        return this.currentIndex === 0 ? !this.favoriteList.length : !this.playHistory.length
      },
      noResultText() {
        return this.currentIndex === 0 ? '暂无收藏歌曲' : '你还没有听过歌曲'
      },
      currentList() {
        return this.currentIndex === 0 ? this.favoriteList : this.playHistory
      },
      ...mapState([
        'favoriteList',
        'playHistory'
      ])
    },
    methods: {
      back() {
        this.$router.back()
      },
      selectSong({ song }) {
        this.addSong(song)
      },
      random() {
        this.randomPlay(this.currentList)
      },
      ...mapActions([
        'addSong',
        'randomPlay'
      ])
    }
  }
</script>

<style scoped lang="scss">
  .user-center {
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: 100;
    width: 100%;
    background: $color-background;
    .back {
      position: absolute;
      top: 0;
      left: 6px;
      z-index: 50;
      .icon-back {
        display: block;
        padding: 10px;
        font-size: $font-size-large-x;
        color: $color-theme;
      }
    }
    .switches-wrapper {
      margin: 10px 0 30px 0;
    }
    .play-btn {
      box-sizing: border-box;
      width: 135px;
      padding: 7px 0;
      margin: 0 auto;
      text-align: center;
      border: 1px solid $color-text-l;
      color: $color-text-l;
      border-radius: 100px;
      font-size: 0;
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
    .list-wrapper {
      position: absolute;
      top: 110px;
      bottom: 0;
      width: 100%;
      .list-scroll {
        height: 100%;
        overflow: hidden;
        .list-inner {
          padding: 20px 30px;
        }
      }
    }
  }
</style>
