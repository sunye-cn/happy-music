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

//song这个对象可能会有不同对象的mid是相等的这种情况存在
//作进一步优化
//lyricMap的key就是id，值就是lyric
const lyricMap = {}

//获取歌词
//什么时候调用getLyric这个服务呢？当前歌曲发生变化时，比如切歌时即从一首歌变到另一首歌，currentSong发生变化时，就会调用这个服务发送get请求拿到对应的歌词
export function getLyric(song) {
  //既然可以保留lyric，就可以在发送请求时做一个判断
  if (song.lyric) {
    return Promise.resolve(song.lyric)
  }
  //先获取歌曲的mid
  const mid = song.mid
  //通过lyricMap对应的mid拿到lyric
  const lyric = lyricMap[mid]
  if (lyric) {
    //如果能拿到lyric也直接return
    return Promise.resolve(lyric)
  }

  //如果上面都不满足说明之前就没有访问过这首歌的歌词就可以发送get请求，同时把歌词保留在lyricMap里面，并且把lyric保留在song这个对象中
  //又因为song中间不能直接添加这个属性要通过提交mutation，就是在use-lyric.js中。这时vuex的一个限制。
  //拿到lyric之后可以利用一个第三方的库即lyric-parser来对这个歌词做一个解析。
  //因为这个歌词是一个字符串，这个歌词字符串中会映射每一句歌词对应的播放时间是怎么样的
  return get('/api/getLyric', {
    //传入mid作为queri的参数
    mid
  }).then((result) => {
    //判断结果是否为空
    const lyric = result ? result.lyric : '[00:00:00]该歌曲暂时无法获取歌词'
    //获取到歌词之后可以对lyricMap做个保留
    lyricMap[mid] = lyric
    return lyric
  })
}