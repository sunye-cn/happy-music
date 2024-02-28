<template>
  <ul class="song-list">
    <li
      v-for="(song, index) in songs"
      :key="song.id"
      class="item"
      @click="selectItem(song, index)"
    >
      <div
        v-if="rank"
        class="rank"
      >
        <span :class="getRankCls(index)">
          {{ getRankText(index) }}</span>
      </div>
      <div class="content">
        <h2 class="name">
          {{ song.name }}
        </h2>
        <p class="desc">
          {{ getDesc(song) }}
        </p>
      </div>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'SongList',
  props: {
    songs: {
      type: Array,
      default() {
        return []
      }
    },
    rank: Boolean
  },
  //定义emit自定义事件
  emits: ['select'],
  methods: {
    getDesc(song) {
      // 描述包括：歌手名和专辑名称
      return `${song.singer}.${song.album}`
    },
    selectItem(song, index) {
      // 派发一个emit事件
      this.$emit('select', { song, index })
    },
    getRankCls(index) {
      if (index <= 2) {
        return `icon icon${index}`
      } else {
        return 'text'
      }
    },
    getRankText(index) {
      if (index > 2) {
        return index + 1
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .song-list {
    .item {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      height: 64px;
      font-size: $font-size-medium;
      .rank {
        flex: 0 0 25px;
        width: 25px;
        margin-right: 20px;
        text-align: center;
        .icon {
          display: inline-block;
          width: 25px;
          height: 24px;
          background-size: 25px 24px;
          &.icon0 {
            @include bg-image('first');
          }
          &.icon1 {
            @include bg-image('second');
          }
          &.icon2 {
            @include bg-image('third');
          }
        }
        .text {
          color: $color-theme;
          font-size: $font-size-large;
        }
      }
      .content {
        flex: 1;
        line-height: 20px;
        overflow: hidden;
        .name {
          @include no-wrap();
          color: $color-text
        }
        .desc {
          @include no-wrap();
          margin-top: 4px;
          color: $color-text-d;
        }
      }
    }
  }
</style>
