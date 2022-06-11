<template>
  <m-header />
  <m-tab />
  <router-view
    v-slot="{ Component }"
    :style="viewStyle"
  >
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <router-view
    v-slot="{ Component }"
    :style="viewStyle"
    name="user"
  >
    <transition
      appear
      name="slide"
    >
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
  <m-player />
</template>

<script>
import Header from '@/components/header/header'
import Tab from '@/components/tab/tab'
import Player from '@/components/player/player'
import { mapState } from 'vuex'

export default {
  components: {
    MHeader: Header,
    MTab: Tab,
    MPlayer: Player,
  },
  computed: {
    viewStyle() {
      const bottom = this.playlist.length ? '60px' : '0'
      return {
        bottom
      }
    },
    ...mapState([
      'playlist'
    ])
  }
}
</script>
