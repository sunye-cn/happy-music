import { createStore, createLogger } from 'vuex'
import state from './state'
import mutations from './mutations'
import * as getters from './getters'
import * as actions from './actions'

// 获取开发环境
const debug = process.env.NODE_ENV !== 'production'

export default createStore({
  state,
  getters,
  mutations,
  actions,
  //vuex提供一个严格模式，就是帮你去检测状态即state的修改是不是在提交mutations的时候
  //开启了严格模式，它就会深度watch你的state，state的任何变化它就会看是否是在提交mutations，如果不是就会报一个警告
  //严格模式会有性能损耗，所以是在开发环境下开启这个严格模式
  strict: debug,
  //vuex提供一个logger插件，开发环境下可以使用此插件来查看提交的状态
  // plugins是一个数组
  plugins: debug ? [createLogger()] : []
})
