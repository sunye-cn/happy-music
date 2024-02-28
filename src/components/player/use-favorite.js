import { useStore } from 'vuex'
import { computed } from 'vue'
import { save, remove } from '@/assets/js/array-store'
import { FAVORITE_KEY } from '@/assets/js/constant'

//定义这个钩子函数来写收藏歌曲的交互逻辑
//两个逻辑
//第一根据歌曲是否在收藏列表中来判断他的样式和状态
//第二点击交互逻辑
export default function useFavorite() {
  const store = useStore()
  //拿到收藏列表favoriteList
  const favoriteList = computed(() => store.state.favoriteList)
  //每个歌手最多能有多少首歌
  //实际工作中这个数据是来自于后端的配置，比如后端同步下发一些数据或者调用某个接口告诉你这个用户最多能保存多少条，或者你是一个APP有一个默认的配置文件
  const maxLen = 100

  //传入参数song判断歌曲是否在favorite列表中
  function getFavoriteIcon(song) {
    return isFavorite(song) ? 'icon-favorite' : 'icon-not-favorite'
  }

  //操作歌曲添加或移除收藏列表
  function toggleFavorite(song) {
    //定义临时变量list
    let list
    if (isFavorite(song)) {
      //如果在这个列表中就从列表中移除
      list = remove(FAVORITE_KEY, compare)
    } else {
      //否则就添加进去。利用本地存储是因为希望刷新后还可以拿到数据不会丢失
      //存储喜欢的歌曲或者存储播放过的歌曲，逻辑都是类似的。都是把这些数据往store中存储。
      // 所以这部分逻辑可以剥离出来，抽象到array-store.js中
      //这个key FAVORITE_KEY是根我们收藏歌曲相关的key，定义在constant.js中
      //传入参数，最大歌曲量上线
      list = save(song, FAVORITE_KEY, compare, maxLen)
    }
    //上面remove和save两个逻辑都是对list做的操作，操作完之后会返回一个新的list，并且save要利用本地存储
    store.commit('setFavoriteList', list)

    //compare函数，利用歌曲的id相等判断它俩是不是同一个歌
    function compare(item) {
      return item.id === song.id
    }
  }

  //辅助函数，判断歌曲是否在列表中
  function isFavorite(song) {
    //在收藏列表用findIndex内部可以传入一个函数
    //findIndex是遍历item这个数组>-1说明找到了
    return favoriteList.value.findIndex((item) => {
      //函数内部返回true说明item即song歌曲在收藏列表中
      return item.id === song.id
    }) > -1
  }

  return {
    getFavoriteIcon,
    toggleFavorite
  }
}
