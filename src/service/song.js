import { get } from './base'

export function processSongs(songs) {
  //songs是歌曲列表
  if(!songs.length) {
    //空列表直接返回
    return Promise.resolve(songs)
  }

  //不为空就返回get请求，url是后端提供的，参数是歌曲的mid数组
  return get('/api/getSongsUrl',{
    //参数通过songs.map映射一下，map里面可以拿到每个song
    mid:songs.map((song) => {
      return song.mid
    })
  }).then((result) => {
    //响应结束之后，响应结果result
    // 拿到前面的urlmap即map
    const map = result.map
    //给列表完善url信息
    return songs.map((song) => {
      //拿到每一个song分别给它添加url
      //map是一个song的mid到url的映射，（方括号里面是key）
      song.url = map[song.mid]
      return song
    }).filter((song) => {
      //并不是每个url都是能播的，只有url里面带vkey的才是可以播放的,vkey的作用就是给歌曲做一个加密
      return song.url && song.url.indexOf('vkey') > -1
    })
  })
}

const lyricMap = {}

export function getLyric(song) {
  if (song.lyric) {
    return Promise.resolve(song.lyric)
  }
  const mid = song.mid
  const lyric = lyricMap[mid]
  if (lyric) {
    return Promise.resolve(lyric)
  }

  return get('/api/getLyric', {
    mid
  }).then((result) => {
    const lyric = result ? result.lyric : '[00:00:00]该歌曲暂时无法获取歌词'
    lyricMap[mid] = lyric
    return lyric
  })
}