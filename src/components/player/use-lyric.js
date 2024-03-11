import { useStore } from 'vuex'
import { computed, watch, ref } from 'vue'
import { getLyric } from '@/service/song'
import Lyric from 'lyric-parser'

//useLyric内部拿到当前歌曲currentSong并观测它的变化
export default function useLyric({ songReady, currentTime }) {
  //lyric-parser的一个对象实例
  const currentLyric = ref(null)
  //当前显示的行号
  const currentLineNum = ref(0)
  //捕捉到的纯音乐无歌词音乐会显示的文案，如果有就显示出来。这里进行初始化
  const pureMusicLyric = ref('')
  //playing-lyric中playingLyric表示当前播放的歌词是什么
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
    //获取逻辑实例化lyric，通过lyric-parser做一个解析时，做一个判断，如果解析出lines有长度的话就认为你就是有lyric，否则就是无歌词
    const hasLyric = currentLyric.value.lines.length
    if (hasLyric) {
      //如果songReady为true，即他已经开始播放，这个时候同步歌词才有意义
      //lyric获取之后发现歌曲ready这个时候可以播放
      //如果歌词已经获之后currentSong ready还没有触发playLyric就不能执行了，
      //所以若要保证playLyric一定执行的话可以在player.vue中监听canplay事件触发ready的时候在ready里面再执行playLyric
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
      //seek函数seek到当前的播放时间
      currentLyricVal.seek(currentTime.value * 1000)
    }
  }

  //playing从播放到暂停的状态歌词也要做一个相应的暂停
  function stopLyric() {
    const currentLyricVal = currentLyric.value
    if (currentLyricVal) {
      currentLyricVal.stop()
    }
  }

  //回调函数，歌词在切换过程中执行handleLyric，未来就可以在handleLyric内部执行一些逻辑
  //handleLyric这个触发条件，播放歌词的过程中，歌词播放完会跳到下一行，一行一行的跳每次都会执行这个handleLyric
  function handleLyric({ lineNum, txt }) {
    // 当前行号，handleLyric参数中可以拿到行号
    currentLineNum.value = lineNum
    playingLyric.value = txt
    //组件实例 后缀Comp
    const scrollComp = lyricScrollRef.value
    //DOM实例 后缀El
    const listEl = lyricListRef.value
    //因为listEl指向play.vue中的"lyric-wrapper"这个层，根据currentLyric是否有v-if控制的value可能为空
    if (!listEl) {
      //没有的话就return，没有的话列表就没有必要去滚动了
      return
    }
  
    //希望前五行时滚动始终在顶部，第六行时希望是他的位置减去第五行的位置
    // 这样滚动时保证当前高亮始终保持中间位置
    if (lineNum > 5) {
      //为什么要获取list，通过listchildren获取到就可以获取到每一个lineEl，从而获取到每一行对应的DOM
      //lineNum - 5是为了让滚动的位置偏中间一点
      //lineEl就是要滚动到这一行的这个位置
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
