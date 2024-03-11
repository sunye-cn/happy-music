import MusicList from '@/components/music-list/music-list'
import storage from 'good-storage'
import { processSongs } from '@/service/song'

export default function createDetailComponent(name, key, fetch) {
  return {
    name,
    components: { MusicList },
    //标题和图片都可以通过singer对象拿到，所以写一个计算属性computed
    props: {
      data: Object
    },
    data() {
      //data不是一个对象而是一个函数所以要return
      return {
        songs: [],
        // 在这里定义loading变量
        loading: true
      }
    },
    computed: {
      computedData() {
        //返回值定义为空
        let ret = null
        //拿到props的singer
        const data = this.data
        //如果props有，即是通过歌手列表点进来的
        if (data) {
          ret = data
        } else {
          //没有就要通过缓存里面去取
          //获取缓存singer
          const cached = storage.session.get(key)
          // 如果缓存里面有,并且缓存中的mid与路径中的参数中的mid是相等的
          if (cached && (cached.mid || cached.id + '') === this.$route.params.id) {
            ret = cached
          }
        }
        return ret
      },
      //拿到图片
      pic() {
        const data = this.computedData
        return data && data.pic ;
      },
      //拿到标题
      title() {
        const data = this.computedData
        return data && (data.name || data.title)
      }
    },
    async created() {
      const data = this.computedData
      //加一个保护，如果没有拿到computedData就不执行后面的逻辑
      if (!data) {
        //直接让它退回一级路由
        const path = this.$route.matched[0].path
        // console.log(path);
        this.$router.push({
          path
        })
        return
      }
      const result = await fetch(data)     
      this.songs = await processSongs(result.songs)   
      // console.log(data);
      // 在数据获取的时候将loading置为false
      this.loading = false
    }
  }
}
