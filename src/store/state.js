// import { PLAY_MODE, FAVORITE_KEY, PLAY_KEY } from '@/assets/js/constant'
// import {SEARCH_KEY } from '@/assets/js/constant'
import { PLAY_MODE, SEARCH_KEY } from '@/assets/js/constant'
import { load } from '@/assets/js/array-store'

const state = {
  // 顺序(就是原始)播放列表
  sequenceList: [],
  // 真正的正在播放的播放列表
  playlist: [],
  // 是否正在播放
  playing: false,
  // 播放模式(定义在js/constant常量中)
  playMode: PLAY_MODE.sequence,
  // 当前播放索引(播放哪首歌)
  currentIndex: 0,
  // 播放器状态(全屏还是收缩)
  fullScreen: false,
  // 全局收藏列表
  favoriteList: [],
  // favoriteList: load(FAVORITE_KEY),
  searchHistory: load(SEARCH_KEY),
  // playHistory: load(PLAY_KEY),
  playHistory: []
}

export default state
