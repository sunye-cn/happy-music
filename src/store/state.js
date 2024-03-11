// import { PLAY_MODE, FAVORITE_KEY, PLAY_KEY } from '@/assets/js/constant'
// import {SEARCH_KEY } from '@/assets/js/constant'
import { PLAY_MODE, SEARCH_KEY } from '@/assets/js/constant'
import { load } from '@/assets/js/array-store'

//定义全局的基本数据
const state = {
  // 顺序播放列表并不一定是真正的播放列表，播放模式可以是顺序播放也可以是随机播放、循环播放
  sequenceList: [],
  // 真正的正在播放的播放列表
  playlist: [],
  // 是否正在播放
  playing: false,
  // 播放模式(定义在js/constant常量中)，默认顺序播放就import PLAY_MODE，然后初始化PLAY_MODE.sequence
  playMode: PLAY_MODE.sequence,
  // 当前播放索引(播放哪首歌)
  currentIndex: 0,
  // 播放器状态(全屏还是收缩)
  fullScreen: false,
  
  // 全局收藏列表，最终都要修改这个列表，给歌曲添加到收藏就是将歌曲添加到favoriteList，取消已收藏歌曲就是将歌曲从favoriteList中移除
  //favoriteList初始值就是一个空数组,初始化逻辑放到main.js中
  favoriteList: [],
  searchHistory: load(SEARCH_KEY),
  playHistory: [],

  // favoriteList: load(FAVORITE_KEY),
   // playHistory: load(PLAY_KEY),
}

export default state
