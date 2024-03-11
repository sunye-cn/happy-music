import { get } from './base'

//获取热门搜索的关键词，这个函数再search.vue这个组件中调用
export function getHotKeys() {
  return get('/api/getHotKeys')
}

//对这个请求做一层封装
export function search(query, page, showSinger) {
  return get('/api/search', {
    query,
    page,
    showSinger
  })
}
