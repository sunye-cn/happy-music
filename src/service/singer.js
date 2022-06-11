import { get } from './base'

export function getSingerList() {
  // console.log('getSingerList')
  return get('/api/getSingerList')
}

export function getSingerDetail(singer) {
  // return get(`/api/getSingerDetail?mid=${singer.mid}`)
  return get('/api/getSingerDetail',{
    mid: singer.mid
  })
}