import { get } from './base';

export function getRecommend() {
  // 这个里面的url与backend/router.js131行的一样
  // console.log('getRecommend func')
  return get('/api/getRecommend');
}

//定义这个服务
export function getAlbum(album) {
  return get('/api/getAlbum', {
    //将album.id作为query参数传递过去
    id: album.id
  })
}