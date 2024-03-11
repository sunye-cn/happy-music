import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import lazyPlugin from 'vue3-lazy'
import loadingDirective from './components/base/loading/directive'
import noResultDirective from '@/components/base/no-result/directive'
// import { load} from '@/assets/js/array-store'
// import { FAVORITE_KEY } from '@/assets/js/constant'
import { load, saveAll } from '@/assets/js/array-store'
import { FAVORITE_KEY, PLAY_KEY } from '@/assets/js/constant'
import { processSongs } from '@/service/song'

// 引入全局样式文件
import '@/assets/scss/index.scss'

//先读取本地的列表数据
const favoriteSongs = load(FAVORITE_KEY)
if (favoriteSongs.length > 0) {
  //做一个批处理用processSongs，处理完之后就可以拿到新的songs，就是带有新的URL的歌曲列表
  processSongs(favoriteSongs).then((songs) => {
    //这样就可以更新本地存储的store中的数据了
    store.commit('setFavoriteList', songs)
    //将整个歌曲列表存储在本地的缓存中
    saveAll(songs, FAVORITE_KEY)
  })
}

//播放历史列表
const historySongs = load(PLAY_KEY)
if (historySongs.length > 0) {
  processSongs(historySongs).then((songs) => {
    store.commit('setPlayHistory', songs)
    saveAll(songs, PLAY_KEY)
  })
}

createApp(App).use(store).use(router).use(lazyPlugin, {
  loading: require('@/assets/images/default.png')
}).directive('loading',loadingDirective).directive('no-result', noResultDirective).mount('#app')
