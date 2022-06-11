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
  const progressBtnWidth = 16

  export default {
    name: 'ProgressBar',
    props: {
      progress: {
        type: Number,
        default: 0
      }
    },
    emits: ['progress-changing', 'progress-changed'],
    data() {
      return {
        // 偏移量
        offset: 0
      }
    },
    computed: {
      progressStyle() {
        return `width:${this.offset}px`
      },
      btnStyle() {
        return `transform:translate3d(${this.offset}px,0,0)`
      }
    },
    watch: {
      progress(newProgress) {
        this.setOffset(newProgress)
      }
    },
    created() {
      // 定义data对象(不是响应式数据不需要定义在data中)
      this.touch = {}
    },
    methods: {
      onTouchStart(e) {
        // 横坐标
        this.touch.x1 = e.touches[0].pageX
        // 初始宽度
        this.touch.beginWidth = this.$refs.progress.clientWidth
      },
      onTouchMove(e) {
        // 偏移多少
        const delta = e.touches[0].pageX - this.touch.x1
        // 位移过后的宽度
        const tempWidth = this.touch.beginWidth + delta
        // 整个进度条的宽度
        const barWidth = this.$el.clientWidth - progressBtnWidth
        // 拖动进度条的宽度
        const progress = Math.min(1, Math.max(tempWidth / barWidth, 0))
        // 算出偏移量
        this.offset = barWidth * progress
        //progress-changing事件代表 手指还没移开
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
        // 获得进度条rect里的left值？？
        const rect = this.$el.getBoundingClientRect()
        // 到进度条开始位置的偏移量
        const offsetWidth = e.pageX - rect.left
        const barWidth = this.$el.clientWidth - progressBtnWidth
        const progress = offsetWidth / barWidth
        this.$emit('progress-changed', progress)
      },
      // 设置进度条偏移量(从mini播放器进来)
      setOffset(progress) {
        const barWidth = this.$el.clientWidth - progressBtnWidth
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
