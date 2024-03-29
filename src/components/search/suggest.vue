<template>
  <div
    ref="rootRef"
    v-loading:[loadingText]="loading"
    v-no-result:[noResultText]="noResult"
    class="suggest"
  >
    <ul class="suggest-list">
      <li
        v-if="singer"
        class="suggest-item"
        @click="selectSinger(singer)"
      >
        <div class="icon">
          <i class="icon-mine" />
        </div>
        <div class="name">
          <p class="text">
            {{ singer.name }}
          </p>
        </div>
      </li>
      <li
        v-for="song in songs"
        :key="song.id"
        class="suggest-item"
        @click="selectSong(song)"
      >
        <div class="icon">
          <i class="icon-music" />
        </div>
        <div class="name">
          <p class="text">
            {{ song.singer }}-{{ song.name }}
          </p>
        </div>
      </li>
      <div
        v-loading:[loadingText]="pullUpLoading"
        class="suggest-item"
      />
    </ul>
  </div>
</template>

<script>
  import { ref, watch, computed, nextTick } from 'vue'
  import { search } from '@/service/search'
  import { processSongs } from '@/service/song'
  import usePullUpLoad from './use-pull-up-load'

  export default {
    name: 'MSuggest',
    props: {
      query: String,
      // 是否可以搜索歌手
      showSinger: {
        type: Boolean,
        default: true
      }
    },
    //定义自定义事件
    emits: ['select-song', 'select-singer'],
    //第二个参数中拿到emit方法
    setup(props, { emit }) {
      const singer = ref(null)
      const songs = ref([])
      //是否有多余数据
      const hasMore = ref(true)
      const page = ref(1)

      // 不需要正在载入这个文案
      const loadingText = ref('')
      // 不是每个请求都会有结果
      const noResultText = ref('抱歉，暂无搜索结果')
      // 设置标志位用在makeItScrollable中
      const manualLoading = ref(false)

      // 用计算属性来
      const loading = computed(() => {
        return !singer.value && !songs.value.length
      })
      const noResult = computed(() => {
        return !singer.value && !songs.value.length && !hasMore.value
      })

      const pullUpLoading = computed(() => {
        return isPullUpLoad.value && hasMore.value
      })

      const preventPullUpLoad = computed(() => {
        return loading.value || manualLoading.value
      })

      const { isPullUpLoad, rootRef, scroll } = usePullUpLoad(searchMore, preventPullUpLoad)

      //watch的值必须是一个响应式对象或者是一个get函数，这个函数() => props.query返回一个props.query
      watch(() => props.query, async (newQuery) => {
        if (!newQuery) {
          return
        }
        await searchFirst()
      })

      // 首次搜索
      async function searchFirst() {
        //对请求做一个保护，防止发生无限请求bug
        if (!props.query) {
          return
        }
        // 首次搜索要重置一些数据
        page.value = 1
        songs.value = []
        singer.value = null
        hasMore.value = true

        // 通过search发送请求
        const result = await search(props.query, page.value, props.showSinger)
        songs.value = await processSongs(result.songs)
        singer.value = result.singer
        hasMore.value = result.hasMore
        await nextTick()
        await makeItScrollable()
      }

      async function searchMore() {
        //对请求做一个保护，防止发生无限请求bug
        if (!hasMore.value || !props.query) {
          return
        }
        //支持分页搜索
        page.value++
        //search方法去发送一个请求
        const result = await search(props.query, page.value, props.showSinger)
        //因为每次返回都是当前page下一屏的数据，但是之前也是有数据的，所以要做一个concat把之前的数据做一个拼接
        songs.value = songs.value.concat(await processSongs(result.songs))
        hasMore.value = result.hasMore
        await nextTick()
        await makeItScrollable()
      }

      //如果请求的数据不满足一屏
      //让它可滚动
      async function makeItScrollable() {
        //说明容器的高度大于内容的高度，就是说>= -1指的是不可滚动的
        if (scroll.value.maxScrollY >= -1) {
          manualLoading.value = true
          //这时候就不断执行searchMore
          await searchMore()
          manualLoading.value = false
        }
      }

      function selectSong(song) {
        //派发一个自定义事件
        emit('select-song', song)
      }

      function selectSinger(singer) {
        emit('select-singer', singer)
      }

      return {
        singer,
        songs,
        loadingText,
        noResultText,
        loading,
        noResult,
        pullUpLoading,
        selectSong,
        selectSinger,
        // pullUpLoad
        rootRef
      }
    }
  }
</script>

<style lang="scss" scoped>
  .suggest {
    height: 100%;
    overflow: hidden;
    .suggest-list {
      padding: 0 30px;
      .suggest-item {
        display: flex;
        align-items: center;
        padding-bottom: 20px;
        .icon {
          flex: 0 0 30px;
          width: 30px;
          [class^="icon-"] {
            font-size: 14px;
            color: $color-text-d;
          }
        }
        .name {
          flex: 1;
          font-size: $font-size-medium;
          color: $color-text-d;
          overflow: hidden;
          .text {
            @include no-wrap();
          }
        }
      }
    }
  }
</style>
