import { get } from './base'

export function getSingerList() {
  // console.log('getSingerList')
  return get('/api/getSingerList')
}

export function getSingerDetail(singer) {
  //参数是一个歌手的数据对象

  // return get(`/api/getSingerDetail?mid=${singer.mid}`)
  return get('/api/getSingerDetail',{
    mid: singer.mid
  })
}