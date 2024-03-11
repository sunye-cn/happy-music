<template>
  <teleport to="body">
    <transition name="slide-down">
      <div
        v-show="visible"
        class="message"
        @click="hide"
      >
        <slot />
      </div>
    </transition>
  </teleport>
</template>

<script>
  export default {
    name: 'MMessage',
    props: {
      //延时
      //为什么在props中定义，是因为延时是可以传递的，外部组件可以修改这样就更灵活一些，不要写死
      delay: {
        type: Number,
        default: 2000
      }
    },
    data() {
      return {
        visible: false
      }
    },
    methods: {
      show() {
        this.visible = true
        //不断调用的话，就要创建多个定时器，因为要创建多个定时器，所以每次都给它clear掉
        //创建定时器之前并且定时器对象是挂载到组件实例上，就可以先clear再创建，就避免多次执行show就创建多个定时器的问题
        clearTimeout(this.timer)
        //定时器
        this.timer = setTimeout(() => {
          this.hide()
        }, this.delay)
      },
      //2秒钟后自动隐藏逻辑
      //先创建hide方法再在show方法中创建定时器
      hide() {
        //主动清空的时候不需要定时器，就直接清空它就好了
        clearTimeout(this.timer)
        this.visible = false
      }
    }
  }
</script>

<style scoped lang="scss">
  .message {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 400;
    background: $color-dialog-background;

    &.slide-down-enter-active, &.slide-down-leave-active {
      transition: all 0.3s
    }

    &.slide-down-enter-from, &.slide-down-leave-to {
      transform: translate3d(0, -100%, 0)
    }
  }
</style>
