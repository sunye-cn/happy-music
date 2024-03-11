/*
 * 该文件是运行在 Node.js 端的，获取数据的基本的思路就是后端代理，即提供接口路由供前端页面使用，然后在路由内部，我们接收到前端请求后，再发送 HTTP 请求到第三方服务接口，携带相应的请求参数，包括签名的参数字段等等。
 * 对于从第三方接口返回的数据，我们会做一层数据处理，最终提供给前端的数据前端可以直接使用，无需再处理。这样也比较符合真实企业项目的开发规范，即数据的处理放在后端做，前端只做数据渲染和交互。
 */
const axios = require('axios')
const pinyin = require('pinyin')
const Base64 = require('js-base64').Base64
// 获取签名方法
const getSecuritySign = require('./sign')

const ERR_OK = 0
const token = 5381

//歌曲图片加载失败时使用的默认图片
const fallbackPicUrl = 'https://y.gtimg.cn/mediastyle/music_v11/extra/default_300x300.jpg?max_age=31536000'

// 公共参数
const commonParams = {
  g_tk: token,
  loginUin: 0,
  hostUin: 0,
  inCharset: 'utf8',
  outCharset: 'utf-8',
  notice: 0,
  needNewCode: 0,
  format: 'json',
  platform: 'yqq.json'
}

// 获取一个随机数值
function getRandomVal(prefix = '') {
  return prefix + (Math.random() + '').replace('0.', '')
}

// 获取一个随机 uid
function getUid() {
  const t = (new Date()).getUTCMilliseconds()
  return '' + Math.round(2147483647 * Math.random()) * t % 1e10
}

// 对 axios get 请求的封装
// 修改请求的 headers 值，合并公共请求参数
function get(url, params) {
  return axios.get(url, {
    headers: {
      referer: 'https://y.qq.com/',
      origin: 'https://y.qq.com/'
    },
    params: Object.assign({}, commonParams, params)
  })
}

// 对 axios post 请求的封装
// 修改请求的 headers 值
function post(url, params) {
  return axios.post(url, params, {
    headers: {
      referer: 'https://y.qq.com/',
      origin: 'https://y.qq.com/',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 处理歌曲列表
function handleSongList(list) {
  const songList = []

  //根据原始的list做一个遍历
  list.forEach((item) => {
    //遍历到每一项就可以做一个过滤
    const info = item.songInfo || item
    if (info.pay.pay_play !== 0 || !info.interval) {
      // 过滤付费歌曲和获取不到时长的歌曲
      return
    }

    // 构造歌曲的数据结构
    const song = {
      id: info.id,
      mid: info.mid,
      name: info.name,
      singer: mergeSinger(info.singer),
      //这个是歌曲播放的一个url，在这里是拿不到的所以为空，相当于第三方接口做的一个保护，而且每个URL每天都在发生变化
      url: '', // 在另一个接口获取
      duration: info.interval,
      pic: info.album.mid ? `https://y.gtimg.cn/music/photo_new/T002R800x800M000${info.album.mid}.jpg?max_age=2592000` : fallbackPicUrl,
      album: info.album.name
    }

    //把数据结构push到数组中
    songList.push(song)
  })

  //再把数组返回出去
  return songList
}

// 合并多个歌手的姓名
function mergeSinger(singer) {
  const ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((s) => {
    ret.push(s.name)
  })
  return ret.join('/')
}

// 注册后端路由
function registerRouter(devServer) {
  const app = devServer.app
  registerRecommend(app)

  registerSingerList(app)

  registerSingerDetail(app)

  registerSongsUrl(app)

  registerLyric(app)

  registerAlbum(app)

  registerTopList(app)

  registerTopDetail(app)

  registerHotKeys(app)

  registerSearch(app)
}

// 注册推荐列表接口路由
function registerRecommend(app) {
  app.get('/api/getRecommend', (req, res) => {
    // 第三方服务接口 url
    const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'

    // 构造请求 data 参数
    const data = JSON.stringify({
      comm: { ct: 24 },
      recomPlaylist: {
        method: 'get_hot_recommend',
        param: { async: 1, cmd: 2 },
        module: 'playlist.HotRecommendServer'
      },
      focus: { module: 'music.musicHall.MusicHallPlatform', method: 'GetFocus', param: {} }
    })

    // 随机数值
    const randomVal = getRandomVal('recom')
    // 计算签名值
    const sign = getSecuritySign(data)

    // 发送 get 请求,get函数实际上是对axios的一个封装
    get(url, {
      sign,
      '-': randomVal,
      data
    }).then((response) => {
      const data = response.data
      if (data.code === ERR_OK) {
        // 处理轮播图数据
        const focusList = data.focus.data.shelf.v_niche[0].v_card
        const sliders = []
        const jumpPrefixMap = {
          10002: 'https://y.qq.com/n/yqq/album/',
          10014: 'https://y.qq.com/n/yqq/playlist/',
          10012: 'https://y.qq.com/n/yqq/mv/v/'
        }
        // 最多获取 10 条数据
        const len = Math.min(focusList.length, 10)
        for (let i = 0; i < len; i++) {
          const item = focusList[i]
          const sliderItem = {}
          // 单个轮播图数据包括 id、pic、link 等字段
          sliderItem.id = item.id
          sliderItem.pic = item.cover
          if (jumpPrefixMap[item.jumptype]) {
            sliderItem.link = jumpPrefixMap[item.jumptype] + (item.subid || item.id) + '.html'
          } else if (item.jumptype === 3001) {
            sliderItem.link = item.id
          }

          sliders.push(sliderItem)
        }

        // 处理推荐歌单数据
        const albumList = data.recomPlaylist.data.v_hot
        const albums = []
        for (let i = 0; i < albumList.length; i++) {
          const item = albumList[i]
          const albumItem = {}
          // 推荐歌单数据包括 id、username、title、pic 等字段
          albumItem.id = item.content_id
          albumItem.username = item.username
          albumItem.title = item.title
          albumItem.pic = item.cover

          albums.push(albumItem)
        }

        // 往前端发送一个标准格式的响应数据，包括成功错误码和数据
        
          res.json({
            code: ERR_OK,
            result: {
              sliders,
              albums
            }
          })
    
      } else {
        res.json(data)
      }
    })
  })
}

// 注册歌手列表接口路由
function registerSingerList(app) {
  app.get('/api/getSingerList', (req, res) => {
    //拿到第三方服务的url
    const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'
    const HOT_NAME = '热门歌手'
    // const HOT_TITLE_NAME = '热门歌手'

    //构造相关数据
    const data = JSON.stringify({
      comm: { ct: 24, cv: 0 },
      singerList: {
        module: 'Music.SingerListServer',
        method: 'get_singer_list',
        param: { area: -100, sex: -100, genre: -100, index: -100, sin: 0, cur_page: 1 }
      }
    })

    const randomKey = getRandomVal('getUCGI')
    const sign = getSecuritySign(data)

    //发送get请求到第三方服务
    get(url, {
      sign,
      '-': randomKey,
      data
    }).then((response) => {
      //第三方请求接收到请求后返回响应
      const data = response.data
      //获取成功时
      if (data.code === ERR_OK) {
        // 处理歌手列表数据
        const singerList = data.singerList.data.singerlist

        // 构造歌手 Map 数据结构
        const singerMap = {
          hot: {
            // title: '热门歌手',
            title: HOT_NAME,
            list: map(singerList.slice(0, 10))
          }
        }

        singerList.forEach((item) => {
          // 把歌手名转成拼音
          const p = pinyin(item.singer_name)
          if (!p || !p.length) {
            return
          }
          // 获取歌手名拼音的首字母
          const key = p[0][0].slice(0, 1).toUpperCase()
          if (key) {
            if (!singerMap[key]) {
              singerMap[key] = {
                title: key,
                list: []
              }
            }
            // 每个字母下面会有多名歌手
            singerMap[key].list.push(map([item])[0])
          }
        })

        // 热门歌手
        const hot = []
        // 字母歌手
        const letter = []

        // 遍历处理 singerMap，让结果有序
        for (const key in singerMap) {
          const item = singerMap[key]
          if (item.title.match(/[a-zA-Z]/)) {
            letter.push(item)
          } else if (item.title === HOT_NAME) {
            hot.push(item)
          }
        }
        // 按字母顺序排序
        letter.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })

        res.json({
          code: ERR_OK,
          result: {
            singers: hot.concat(letter)
          }
        })
      } else {
        res.json(data)
      }
    })
  })

  // 做一层数据映射，构造单个 singer 数据结构
  function map(singerList) {
    return singerList.map((item) => {
      return {
        id: item.singer_id,
        mid: item.singer_mid,
        name: item.singer_name,
        pic: item.singer_pic.replace(/\.webp$/, '.jpg').replace('150x150', '800x800')
      }
    })
  }
}

// 注册歌手详情接口路由
function registerSingerDetail(app) {
  //当前端发送'/api/getSingerDetail'这个请求之后就会进入到下面的逻辑
  app.get('/api/getSingerDetail', (req, res) => {
    //先构造请求第三方服务接口的URL及请求参数data
    const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'

    const data = JSON.stringify({
      comm: { ct: 24, cv: 0 },
      singerSongList: {
        method: 'GetSingerSongList',
        //因为是请求歌手的详情所以携带一个歌手的mid即singerMid: req.query.mid,这是表示这是哪个歌手的唯一标识
        //num字段表示获取歌手的前多少条歌曲
        //当它从100改成10，就请求不到数据，我们需要给用户一个反馈，这就属于边界情况的处理
        //发送一个异步请求去请求某个数据，数据有的时候正常渲染，没有的时候也要给用户一个反馈
        param: { order: 1, singerMid: req.query.mid, begin: 0, num: 100},
        module: 'musichall.song_list_server'
      }
    })

    const randomKey = getRandomVal('getSingerSong')
    const sign = getSecuritySign(data)

    //发送get请求
    get(url, {
      sign,
      '-': randomKey,
      data
    }).then((response) => {
      const data = response.data
      if (data.code === ERR_OK) {
        //相应成功后拿到歌手的歌曲列表
        const list = data.singerSongList.data.songList
        // 歌单详情、榜单详情接口都有类似处理逻辑，固封装成函数
        const songList = handleSongList(list)

        res.json({
          code: ERR_OK,
          //拿到歌手的歌曲列表详情数据之后将数据返回给前端
          result: {
            songs: songList
          }
        })
      } else {
        res.json(data)
      }
    })
  })
}

// 注册歌曲 url 获取接口路由
// 因为歌曲的 url 每天都在变化，所以需要单独的接口根据歌曲的 mid 获取
function registerSongsUrl(app) {
  //get路由
  app.get('/api/getSongsUrl', (req, res) => {
    //query中传入mid,mid是歌曲中的mid数组
    const mid = req.query.mid

    //构造midGroup实际上是做一个数据的切割
    let midGroup = []
    // 做数据切割的原因：第三方接口只支持最多处理 100 条数据，
    //所以如果超过 100 条数据，我们要把数据按每组 100 条切割，发送多个请求
    //这个切割是为了让前端方便
    if (mid.length > 100) {
      const groupLen = Math.ceil(mid.length / 100)
      for (let i = 0; i < groupLen; i++) {
        midGroup.push(mid.slice(i * 100, (100 * (i + 1))))
      }
    } else {
      midGroup = [mid]
    }

    // 构造urlMap以歌曲的 mid 为 key，存储歌曲 URL
    //这个是给前端用的，知道每个mid对应什么歌曲
    //就可以通过遍历歌曲列表拿到每个歌曲的mid，
    //就知道每个mid映射url是什么,就可以补充url信息了
    const urlMap = {}

    // 处理返回的 mid（具体请求的逻辑）
    function process(mid) {
      //构造第三方服务接口所需要的数据data
      const data = {
        req_0: {
          module: 'vkey.GetVkeyServer',
          method: 'CgiGetVkey',
          param: {
            guid: getUid(),
            //mid数组songmid
            songmid: mid,
            songtype: new Array(mid.length).fill(0),
            uin: '0',
            loginflag: 0,
            platform: '23',
            h5to: 'speed'
          }
        },
        comm: {
          g_tk: token,
          uin: '0',
          format: 'json',
          platform: 'h5'
        }
      }

      //将签名拼到url上，因为要发送post请求
      //虽然代理的是get请求，但是第三方服务只认post请求
      const sign = getSecuritySign(JSON.stringify(data))
      const url = `https://u.y.qq.com/cgi-bin/musics.fcg?_=${getRandomVal()}&sign=${sign}`

      // 发送 post 请求，这个post请求是基于axios.post发的
      //并且'Content-Type'是form-data
      return post(url, data).then((response) => {
        const data = response.data
        if (data.code === ERR_OK) {
          //请求结束拿到结果，midurlinfo是一个数组
          //可以理解为歌曲的详细信息，可以从中拿到purl
          const midInfo = data.req_0.data.midurlinfo
          const sip = data.req_0.data.sip
          const domain = sip[sip.length - 1]
          midInfo.forEach((info) => {
            // purl拼接上domain获取歌曲的真实播放 URL
            //将真实的url放到urlMap中，songmid就是key
            urlMap[info.songmid] = domain + info.purl
          })
        }
      })
    }

    // 构造多个 Promise 请求
    const requests = midGroup.map((mid) => {
      return process(mid)
    })

    // 并行发送多个请求
    return Promise.all(requests).then(() => {
      // 所有请求响应完毕，urlMap 也就构造完毕了，就把响应给前端
      res.json({
        code: ERR_OK,
        result: {
          map: urlMap
        }
      })
    })
  })
}

// 注册歌词接口
//歌词数据为什么不在请求歌曲列表时一并返回呢?因为对于歌曲而言歌词部分的数据实在是太庞大了，
// 如果请求歌曲列表时所有歌词都返回过来，那么数据量就太大了那也是不必要的，
// 因为并不是说歌曲列表里的所有的歌都会被访问到，如果把歌曲歌词的部分单独拆分出来，也就是当你去访问某一首歌时再去异步请求它的歌词，这样数据量就会大大减少
function registerLyric(app) { 
  app.get('/api/getLyric', (req, res) => {
    //get请求，当前端访问到'/api/getLyric'时就会进入下面的逻辑
    const url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'

    //向第三方服务发送一个get请求
    get(url, {
      '-': 'MusicJsonCallback_lrc',
      pcachetime: +new Date(),
      //请求的参数中传入歌曲的mid
      songmid: req.query.mid,
      g_tk_new_20200303: token
    }).then((response) => {
      const data = response.data
      if (data.code === ERR_OK) {
        res.json({
          code: ERR_OK,
          result: {
            //获取的歌词数据通过Base64做一次解码，因为原始数据是编码后的。这里的Base64是JS的Base64的库
            lyric: Base64.decode(data.lyric)
          }
        })
      } else {
        res.json(data)
      }
    })
  })
}

// 注册歌单专辑接口
function registerAlbum(app) {
  //get接口，当前端访问到'/api/getAlbum'时就会进入下面的逻辑
  app.get('/api/getAlbum', (req, res) => {
    //首先定义第三方服务接口所需要的数据data
    const data = {
      req_0: {
        module: 'srf_diss_info.DissInfoServer',
        method: 'CgiGetDiss',
        param: {
          // disstid也就是？是根据query过去的。就可以根据你传入的不同id获得不同的专辑详情了
          disstid: Number(req.query.id),
          onlysonglist: 1,
          song_begin: 0,
          song_num: 100
        }
      },
      comm: {
        g_tk: token,
        uin: '0',
        format: 'json',
        platform: 'h5'
      }
    }

    const sign = getSecuritySign(JSON.stringify(data))

    const url = `https://u.y.qq.com/cgi-bin/musics.fcg?_=${getRandomVal()}&sign=${sign}`

    //post发送一个post请求
    post(url, data).then((response) => {
      const data = response.data
      if (data.code === ERR_OK) {
        //相应成功即数据成功拿到后就可以拿到数据中的songlist
        const list = data.req_0.data.songlist
        //做一层处理之后
        const songList = handleSongList(list)

        res.json({
          code: ERR_OK,
          //再把songlist返回给前端
          result: {
            songs: songList
          }
        })
      } else {
        res.json(data)
      }
    })
  })
}

// 注册排行榜接口
function registerTopList(app) {
  app.get('/api/getTopList', (req, res) => {
    const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'

    //给第三方接口发送一个请求
    const data = JSON.stringify({
      comm: { ct: 24 },
      toplist: { module: 'musicToplist.ToplistInfoServer', method: 'GetAll', param: {} }
    })

    const randomKey = getRandomVal('recom')
    const sign = getSecuritySign(data)

    get(url, {
      sign,
      '-': randomKey,
      data
    }).then((response) => {
      const data = response.data
      //请求成功后就可以拿到数据
      if (data.code === ERR_OK) {
        const topList = []
        const group = data.toplist.data.group

        //但是第三方接口的数据并不能直接拿来使用，需要做一个数据处理
        group.forEach((item) => {
          item.toplist.forEach((listItem) => {
            topList.push({
              id: listItem.topId,
              pic: listItem.frontPicUrl,
              name: listItem.title,
              period: listItem.period,
              //songList就是排行榜的右侧渲染的前几个歌曲
              songList: listItem.song.map((songItem) => {
                return {
                  id: songItem.songId,
                  singerName: songItem.singerName,
                  songName: songItem.title
                }
              })
            })
          })
        })

        res.json({
          code: ERR_OK,
          //处理完的topList返回给前端
          result: {
            topList
          }
        })
      } else {
        res.json(data)
      }
    })
  })
}

// 注册排行榜详情接口
function registerTopDetail(app) {
  //代理了一个get路由，当前端请求'/api/getTopDetail'接口之后就会执行内部逻辑
  app.get('/api/getTopDetail', (req, res) => {
    const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'
    //发送请求会携带一个query、id、period，后两个都是第三方服务接口所需要的
    const { id, period } = req.query

    //想第三方服务发送请求，这构造他所需要的参数数据
    const data = JSON.stringify({
      detail: {
        module: 'musicToplist.ToplistInfoServer',
        method: 'GetDetail',
        param: {
          topId: Number(id),
          offset: 0,
          num: 100,
          period
        }
      },
      comm: {
        ct: 24,
        cv: 0
      }
    })

    const randomKey = getRandomVal('getUCGI')
    const sign = getSecuritySign(data)

    //发送一个get请求到第三方服务，拿到一个接口数据
    get(url, {
      sign,
      '-': randomKey,
      data
    }).then((response) => {
      const data = response.data
      if (data.code === ERR_OK) {
        const list = data.detail.data.songInfoList
        //对于接口数据再做一个handleSongList的处理，处理成我们所需要的数据结构
        const songList = handleSongList(list)

        res.json({
          code: ERR_OK,
          // 将处理好的数据返回给前端
          result: {
            songs: songList
          }
        })
      } else {
        res.json(data)
      }
    })
  })
}

// 注册热门搜索接口
function registerHotKeys(app) {
  //代理了一个get路由，当前端请求'/api/getHotKeys'接口之后就会执行内部逻辑
  app.get('/api/getHotKeys', (req, res) => {
    const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

    //发送get请求
    get(url, {
      g_tk_new_20200303: token
    }).then((response) => {
      const data = response.data
      //请求成功
      if (data.code === ERR_OK) {
        res.json({
          code: ERR_OK,
          //将数据做一层处理，再将处理好的发送给前端
          result: {
            hotKeys: data.data.hotkey.map((key) => {
              return {
                key: key.k,
                id: key.n
              }
            }).slice(0, 10)
          }
        })
      } else {
        res.json(data)
      }
    })
  })
}

// 注册搜索查询接口
function registerSearch(app) {
  //代理了一个get路由，当前端请求'/api/search'接口之后就会执行内部逻辑
  app.get('/api/search', (req, res) => {
    const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'

    //这个请求支持我们传入三个参数 query, page, showSinger ，这三个参数都会构造到data对象中做参数的一部分，因为data对象才是真正向第三方发送的请求参数
    // query是我们查询的字符串；page页码因为是分页请求，未来会实现上拉加载的效果，page值会自增；showSinger这次查询的结果中要不要包含singer数据
    const { query, page, showSinger } = req.query

    const data = {
      _: getRandomVal(),
      g_tk_new_20200303: token,
      w: query,
      p: page,
      //每页的数量就是20，写死的
      perpage: 20,
      n: 20,
      zhidaqu: 1,
      catZhida: showSinger === 'true' ? 1 : 0,
      t: 0,
      flag: 1,
      ie: 'utf-8',
      sem: 1,
      aggr: 0,
      remoteplace: 'txt.mqq.all',
      uin: '0',
      needNewCode: 1,
      platform: 'h5',
      format: 'json'
    }

    //通过get发送一个get请求到第三方服务，传入参数data，拿到一个接口数据
    get(url, data).then((response) => {
      const data = response.data
      if (data.code === ERR_OK) {
        //请求成功后对数据做一个解析
        const songList = []
        const songData = data.data.song
        const list = songData.list

        //首先解析歌曲列表部分，因为它的数据结构不满足我们所需要歌曲的数据结构的
        list.forEach((item) => {
          const info = item
          //拿到每一项后先把付费歌曲过滤掉
          if (info.pay.payplay !== 0 || !info.interval) {
            // 过滤付费歌曲
            return
          }

          const song = {
            id: info.songid,
            mid: info.songmid,
            name: info.songname,
            singer: mergeSinger(info.singer),
            url: '',
            duration: info.interval,
            pic: info.albummid ? `https://y.gtimg.cn/music/photo_new/T002R800x800M000${info.albummid}.jpg?max_age=2592000` : fallbackPicUrl,
            album: info.albumname
          }
          //构造出我们所需要的数据对象后把它push到songList中
          songList.push(song)
        })

        //接下来解析singer
        let singer
        //根据后端返回数据是否包含对应的逻辑
        const zhida = data.data.zhida
        if (zhida && zhida.type === 2) {
          //满足之后就可以构造一个singer对象
          singer = {
            id: zhida.singerid,
            mid: zhida.singermid,
            name: zhida.singername,
            pic: `https://y.gtimg.cn/music/photo_new/T001R800x800M000${zhida.singermid}.jpg?max_age=2592000`
          }
        }

        //分页请求不是无限量的并不是可以永久去分页请求数据，数据是有限的体现在返回值totalnum上
        //当前返回的数据量curnum以及当前的页码curpage
        const { curnum, curpage, totalnum } = songData
        //构造新数据hasMore，20就是每一页请求的数据量perpage
        //每一页的数据量*（当前的页码值 - 1）+ 当前返回的数量，当它小于totalnum时就表示它仍然有多余的数据
        const hasMore = 20 * (curpage - 1) + curnum < totalnum

        res.json({
          code: ERR_OK,
          //前端能拿到的数据就这三个：歌曲列表、歌手对象、是否有多余的数据
          result: {
            songs: songList,
            singer,
            hasMore
          }
        })
      } else {
        res.json(data)
      }
    }).catch((e) => {
      res.status(500).send()
    })
  })
}

module.exports = registerRouter
