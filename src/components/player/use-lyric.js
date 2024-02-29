import { useStore } from 'vuex'
import { computed, watch, ref } from 'vue'
import { getLyric } from '@/service/song'
import Lyric from 'lyric-parser'

//useLyric内部拿到当前歌曲currentSong并观测它的变化
export default function useLyric({ songReady, currentTime }) {
  //Lyric的一个对象实例
  const currentLyric = ref(null)
  const currentLineNum = ref(0)
  const pureMusicLyric = ref('')
  const playingLyric = ref('')
  const lyricScrollRef = ref(null)
  const lyricListRef = ref(null)

  //通过store拿到currentSong
  const store = useStore()
  const currentSong = computed(() => store.getters.currentSong)

  //观测currentSong的变化，并拿到新值newSong
  watch(currentSong, async (newSong) => {
    // 做一个判断歌曲是不是合法的，是不合法的就什么都不做
    if (!newSong.url || !newSong.id) {
      return
    }
    stopLyric()
    // 切换歌曲时要做数据的重置，这是边界情况考虑(playingLyric是显示在cd下面的那行歌词)
    currentLyric.value = null
    currentLineNum.value = 0
    pureMusicLyric.value = ''
    playingLyric.value = ''

    // 拿到歌词
    //getLyric是一个异步过程，是需要一个网络延时的，如果一个歌曲A切到B在getLyric过程中，这时候又从B切到C，那么B getLyric这个返回逻辑就可以不用执行了
    const lyric = await getLyric(newSong)
    
    //既然在mutation.js中定义了mutation，就在这里提交mutation
    store.commit('addSongLyric', {
      song: newSong,
      lyric
    })
    //做一个判断，就是执行完getLyric这个过程完后currentSong可能会发生变化，
    //因为currentSong是一个响应式数据，如果在getLyric过程中切换了歌曲，过程结束后currentSong和newSong可能就不是一个东西了
    if (currentSong.value.lyric !== lyric) {
      return
    }

    //初始化Lyric对象
    currentLyric.value = new Lyric(lyric, handleLyric)
    const hasLyric = currentLyric.value.lines.length
    if (hasLyric) {
      if (songReady.value) {
        playLyric()
      }
    } else {
      playingLyric.value = pureMusicLyric.value = lyric.replace(/\[(\d{2}):(\d{2}):(\d{2})\]/g, '')
    }
  })

  // 播放歌词
  function playLyric() {
    const currentLyricVal = currentLyric.value
    if (currentLyricVal) {
      currentLyricVal.seek(currentTime.value * 1000)
    }
  }

  function stopLyric() {
    const currentLyricVal = currentLyric.value
    if (currentLyricVal) {
      currentLyricVal.stop()
    }
  }

  //处理函数，歌词在切换过程中执行handleLyric，未来就可以在handleLyric内部执行一些逻辑
  function handleLyric({ lineNum, txt }) {
    // 当前行号
    currentLineNum.value = lineNum
    playingLyric.value = txt
    const scrollComp = lyricScrollRef.value
    const listEl = lyricListRef.value
    if (!listEl) {
      return
    }
    // 滚动时让高亮始终保持中间位置
    if (lineNum > 5) {
      const lineEl = listEl.children[lineNum - 5]
      scrollComp.scroll.scrollToElement(lineEl, 1000)
    } else {
      scrollComp.scroll.scrollTo(0, 0, 1000)
    }
  }

  return {
    currentLyric,
    currentLineNum,
    pureMusicLyric,
    playingLyric,
    lyricScrollRef,
    lyricListRef,
    playLyric,
    stopLyric
  }
}
