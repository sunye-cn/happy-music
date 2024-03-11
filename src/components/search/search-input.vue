<template>
  <div class="search-input">
    <i class="icon-search" />
    <input
      v-model="query"
      class="input-inner"
      :placeholder="placeholder"
    >
    <i
      v-show="query"
      class="icon-dismiss"
      @click="clear"
    />
  </div>
</template>

<script>
  import { debounce } from 'throttle-debounce'

  export default {
    name: 'SearchInput',
    props: {
      modelValue: String,
      // 搜索框为空时给的默认值
      placeholder: {
        type: String,
        default: '搜索歌曲、歌手'
      }
    },
    data() {
      return {
        query: this.modelValue
      }
    },
    created() {
      //在created钩子函数中使用$watchAPI
      this.$watch('query', debounce(300, (newQuery) => {
        //派发一个事件'update:modelValue'，在vue2中是emit一个input事件，vue3就是下面这个
        //希望query的时候不带首尾空格，所以newQuery.trim()把空格去掉，把trim后的结果给外面
        this.$emit('update:modelValue', newQuery.trim())
      }))

      this.$watch('modelValue', (newVal) => {
        this.query = newVal
      })
    },
    methods: {
      clear() {
        this.query = ''
      }
    }
  }
</script>

<style lang="scss" scoped>
  .search-input {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    padding: 0 6px;
    height: 32px;
    background: $color-highlight-background;
    border-radius: 6px;
    .icon-search {
      font-size: 24px;
      color: $color-text-d;
    }
    .input-inner {
      flex: 1;
      margin: 0 5px;
      line-height: 18px;
      background: $color-highlight-background;
      color: $color-text;
      font-size: $font-size-medium;
      outline: 0;
      &::placeholder {
        color: $color-text-d;
      }
    }
    .icon-dismiss {
      font-size: 16px;
      color: $color-text-d;
    }
  }
</style>
