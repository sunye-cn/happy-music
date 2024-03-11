import { PLAY_MODE } from '@/assets/js/constant'
import { shuffle } from '@/assets/js/util'

//actions就是对mutations的一个封装
// 选择播放
// 第一个参数是一个对象，第二个参数是一个payload？
export function selectPlay({ commit }, { list, index }) {
  //提交 顺序播放，playMode播放模式
  commit('setPlayMode', PLAY_MODE.sequence)
  //SequenceList顺序播放列表
  commit('setSequenceList', list)
  //修改播放状态
  commit('setPlayingState', true)
  //fullScreen播放器状态(全屏还是收缩)展开是ture
  commit('setFullScreen', true)
  //Playlist正在播放列表
  commit('setPlaylist', list)
  //currentIndex当前播放索引
  commit('setCurrentIndex', index)
}

// 随机播放 对于随机播放索引是没有意义的，所以第二个参数不需要一个对象
export function randomPlay({ commit }, list) {
  commit('setPlayMode', PLAY_MODE.random)
  commit('setSequenceList', list)
  commit('setPlayingState', true)
  commit('setFullScreen', true)
  //对正在播放列表进行洗牌，定义在util.js工具函数中
  commit('setPlaylist', shuffle(list))
  //随机列表第一首歌就可以当作播放的第一首歌
  commit('setCurrentIndex', 0)
}

//第一个参数是一个对象，解构出commit, state, getters，第二个参数是一个payload？
export function changeMode({ commit, state, getters }, mode) {
  //通过getters先拿到当前播放歌曲的id，缓存一下当前歌曲
  const currentId = getters.currentSong.id
  //要切换成随机模式的话
  if (mode === PLAY_MODE.random) {
    //把顺序播放列表进行洗牌，洗成乱序的再提交
    commit('setPlaylist', shuffle(state.sequenceList))
  } else {
    //循环播放或者顺序播放，都是顺序播放列表
    commit('setPlaylist', state.sequenceList)
  }
  //state.playlist是commit('setPlaylist'后的新的列表
  const index = state.playlist.findIndex((song) => {
    //song的id=之前的缓存的currentId
    return song.id === currentId
  })

  commit('setCurrentIndex', index)
  commit('setPlayMode', mode)
}

//第一个参数是一个对象，将它解构拿到commit和state，因为最终也要通过commit一个mutation来完成对数据的修改
export function removeSong({ commit, state }, song) {
  //首先拿到sequenceList、playlist
  const sequenceList = state.sequenceList.slice()
  const playlist = state.playlist.slice()

  //接下来找到这首歌在这俩个列表中的索引，逻辑相同做一个封装findIndex
  const sequenceIndex = findIndex(sequenceList, song)
  const playIndex = findIndex(playlist, song)
  //避免多次连续快速点击的措施,判断一下：sequenceIndex < 0 || playIndex < 0
  if (sequenceIndex < 0 || playIndex < 0) {
    return
  }

  //完成删除，只这样做会报一个警告，
  //因为这样是不允许，在vuex中对state数据做修改只能通过commit一个mutation来完成，所以前面先slice出去，相当于操作它的一个副本，再通过commit一个mutation
  sequenceList.splice(sequenceIndex, 1)
  playlist.splice(playIndex, 1)

  //删除播放歌曲前面的歌的话播放歌曲就会发生改变，做一个判断，如果删除的事前一首歌就将当前歌曲往前移一个，若当前播放歌曲是最后一首歌时删除最后一首歌，也一样
  let currentIndex = state.currentIndex
  if (playIndex < currentIndex || currentIndex === playlist.length) {
    currentIndex--
  }

  commit('setSequenceList', sequenceList)
  commit('setPlaylist', playlist)
  commit('setCurrentIndex', currentIndex)
  if (!playlist.length) {
    commit('setPlayingState', false)
  }
}

export function clearSongList({ commit }) {
  commit('setSequenceList', [])
  commit('setPlaylist', [])
  commit('setCurrentIndex', 0)
  commit('setPlayingState', false)
}

//第一个参数解构出一个commit和一个state
//就是往playlist和sequenceList中添加一首歌
export function addSong({ commit, state }, song) {
  const playlist = state.playlist.slice()
  const sequenceList = state.sequenceList.slice()
  //如果列表中已经有这首歌既不需要再添加，只需要修改它的currentIndex就好
  let currentIndex = state.currentIndex
  const playIndex = findIndex(playlist, song)

  //说明playlist中已经有这首歌
  if (playIndex > -1) {
    currentIndex = playIndex
  } else {
    //没找到就说明原来没有，就把这首歌添加进去
    playlist.push(song)
    //最后面就是最前面立即被播放
    currentIndex = playlist.length - 1
  }

  const sequenceIndex = findIndex(sequenceList, song)
  if (sequenceIndex === -1) {
    //说明不在sequenceList中存在
    sequenceList.push(song)
  }

  commit('setSequenceList', sequenceList)
  commit('setPlaylist', playlist)
  commit('setCurrentIndex', currentIndex)
  commit('setPlayingState', true)
  commit('setFullScreen', true)
}

function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}
