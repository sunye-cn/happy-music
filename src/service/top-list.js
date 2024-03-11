//发送请求的逻辑
import { get } from './base'

//在排行榜页面top-list.vue调用这个函数
export function getTopList() {
  //发送一个get请求
  return get('/api/getTopList')
}

//做一层封装，在top-detail.vue组件调用getTopDetail
export function getTopDetail(top) {
  return get('/api/getTopDetail', {
    id: top.id,
    period: top.period
  })
}
