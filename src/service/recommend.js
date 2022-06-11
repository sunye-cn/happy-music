import { get } from './base';

export function getRecommend() {
  // 这个里面的url与backend/router.js131行的一样
  // console.log('getRecommend func')
  return get('/api/getRecommend');
}

export function getAlbum(album) {
  return get('/api/getAlbum', {
    id: album.id
  })
}