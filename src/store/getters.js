// 可以计算出来当前播放歌曲currentSong
// getters是一个计算属性，第一个参数可以拿到(state)
export const currentSong = (state) => {
  //当前列表state.playlist当前播放的索引state.currentIndex就可以计算出当前播放的歌曲是什么
  //取数组的第一项 state.playlist[state.currentIndex] 是一个undefined值，而undefined不能调用任何属性，所以这样写会报错
  //这种情况下就是给它一个默认的值即给currentSong一个空对象{}，调用空对象的一些属性是没有问题的，这样player.vue中的currentSong.pic就不会报错
  //另一种方法就是给一个template元素里面有v-if="currentSong"属性，把它放在normal-player下面，并将normal-player下面的逻辑都放这个template中
  //这种就是通过v-if指令来控制，v-if指令在编译阶段会生成三元运算符，不满足条件的话它里面的逻辑就不会执行
  return state.playlist[state.currentIndex] || {}
}
