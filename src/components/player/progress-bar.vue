<template>
  <div
    class="progress-bar"
    @click="onClick"
  >
    <div class="bar-inner">
      <div
        ref="progress"
        class="progress"
        :style="progressStyle"
      />
      <div
        class="progress-btn-wrapper"
        :style="btnStyle"
        @touchstart.prevent="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend.prevent="onTouchEnd"
      >
        <div class="progress-btn" />
      </div>
    </div>
  </div>
</template>

<script>
  //通过下面css中.progress-btn的出来的button的宽度
  const progressBtnWidth = 16

  export default {
    name: 'ProgressBar',
    props: {
      //进度这样的数据，组件任何状态都可以根据进度来计算出来
      //外部接收一个progress属性
      progress: {
        type: Number,
        default: 0
      }
    },
    //两个自定义事件progress-changing手指还没有离开、'progress-changed手指离开完成拖动'
    emits: ['progress-changing', 'progress-changed'],
    //宽度
    data() {
      return {
        // 偏移量
        offset: 0
      }
    },
    computed: {
      //动态style
      //是左侧黄色进度条
      progressStyle() {
        return `width:${this.offset}px`
      },
      //滑块的
      btnStyle() {
        //做位移
        return `transform:translate3d(${this.offset}px,0,0)`
      }
    },
    //这个watch是一个对象
    //为什么用watch实现，computed实现也可以，但是computed一开始获取this.$el.clientWidth是获取不到的，
    //而watch时组件已经渲染
    watch: {
      //监听progress的变化拿到新的progress值newProgress
      progress(newProgress) {
        //计算偏移量
        this.setOffset(newProgress)
      }
    },
    created() {
      // 定义data对象(不是响应式数据不需要定义在data中)
      //定义一个可以共享的对象
      this.touch = {}
    },
    methods: {
      //移动端常见的拖动事件onTouchStart、onTouchMove、onTouchEnd
      //进度条相关逻辑、拖动改变歌曲进度
      onTouchStart(e) {
        //因为e.touches[0].pageX在move时也需要被调用，所以直接给它绑定到一个可以共享的对象上
        // 横坐标 开始点击的位置
        this.touch.x1 = e.touches[0].pageX
        // 初始宽度 左侧进度条的宽度可以理解为当前的offset值是多少
        this.touch.beginWidth = this.$refs.progress.clientWidth
      },
      onTouchMove(e) {
        // 偏移多少 从初始位置偏移了多少 delta可以大于0也可以小于0，取决于你是往右移的还是往左移的
        const delta = e.touches[0].pageX - this.touch.x1
        // 位移过后进度条的宽度
        const tempWidth = this.touch.beginWidth + delta
        // 整个进度条的宽度
        const barWidth = this.$el.clientWidth - progressBtnWidth
        // 拖动进度条的宽度 限制在0到1之间
        const progress = Math.min(1, Math.max(tempWidth / barWidth, 0))
        // 算出偏移量
        this.offset = barWidth * progress
        //progress-changing事件代表 手指还没移开 派发两个自定义事件s
        this.$emit('progress-changing', progress)
      },
      onTouchEnd() {
        const barWidth = this.$el.clientWidth - progressBtnWidth
        const progress = this.$refs.progress.clientWidth / barWidth
        // progress-changed事件代表 手指已经移开
        this.$emit('progress-changed', progress)
      },
      // 支持点击进度条跳转
      onClick(e) {
        // 获得进度条rect里的left值
        const rect = this.$el.getBoundingClientRect()
        // 到进度条开始位置的偏移量
        const offsetWidth = e.pageX - rect.left
        const barWidth = this.$el.clientWidth - progressBtnWidth
        const progress = offsetWidth / barWidth
        this.$emit('progress-changed', progress)
      },
      // 设置进度条偏移量(从mini播放器进来)
      setOffset(progress) {
        //总的进度条宽度=总的peogress-bar的宽度-button的宽度
        const barWidth = this.$el.clientWidth - progressBtnWidth
        //progress这个进度是从0-1的
        this.offset = barWidth * progress
      }
    }
  }
</script>

<style lang="scss" scoped>
  .progress-bar {
    height: 30px;
    .bar-inner {
      position: relative;
      top: 13px;
      height: 4px;
      background: rgba(0, 0, 0, 0.3);
      .progress {
        position: absolute;
        height: 100%;
        background: $color-theme;
      }
      .progress-btn-wrapper {
        position: absolute;
        left: -8px;
        top: -13px;
        width: 30px;
        height: 30px;
        .progress-btn {
          position: relative;
          top: 7px;
          left: 7px;
          box-sizing: border-box;
          width: 16px;
          height: 16px;
          border: 3px solid $color-text;
          border-radius: 50%;
          background: $color-theme;
        }
      }
    }
  }
</style>
