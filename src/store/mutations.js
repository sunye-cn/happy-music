// mutations就是对原始数据即state做修改
const mutations = {
  //都是为了后续写播放器做支持
  // 修改播放状态，第二个参数就是playing就是修改数据参数
  setPlayingState(state, playing) {
    state.playing = playing
  },
  // 设置顺序播放列表
  setSequenceList(state, list) {
    state.sequenceList = list
  },
  // 设置播放列表
  setPlaylist(state, list) {
    state.playlist = list
  },
  // 设置播放模式
  setPlayMode(state, mode) {
    state.playMode = mode
  },
  // 设置当前播放索引
  setCurrentIndex(state, index) {
    state.currentIndex = index
  },
  // 设置播放器状态(全屏还是收缩)
  setFullScreen(state, fullScreen) {
    state.fullScreen = fullScreen
  },
  
  // 设置收藏列表
  setFavoriteList(state, list) {
    state.favoriteList = list
  },
  // 添加歌词
  addSongLyric(state, { song, lyric }) {
    state.sequenceList.map((item) => {
      if (item.mid === song.mid) {
        item.lyric = lyric
      }
      return item
    })
  },
  setSearchHistory(state, searches) {
    state.searchHistory = searches
  },
  setPlayHistory(state, songs) {
    state.playHistory = songs
  }
}

export default mutations
