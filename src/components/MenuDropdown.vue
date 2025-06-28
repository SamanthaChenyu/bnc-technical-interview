<script setup lang="ts">
import { computed } from 'vue'
import { useMainStore } from '@/stores/main'

interface MenuItem {
  id: number
  name: string
  sub: MenuItem[]
}

interface Props {
  menu: MenuItem
}

const props = defineProps<Props>()

const store = useMainStore()

const isOpen = computed(() => {
  return store.isMenuOpen(String(props.menu.id))
})

const toggle = () => {
  store.toggleMenu(String(props.menu.id))
}
</script>

<template>
  <li>
    <button type="button" @click="toggle">{{ menu.name }}</button>
    <ul v-if="isOpen">
      <MenuDropdown v-for="item in menu.sub" :key="item.id" :menu="item" />
    </ul>
  </li>
</template>

<style lang="scss" scoped>
ul {
  padding-inline-start: 3px;
  li {
    list-style-type: none;
    cursor: pointer;
    position: relative;
    button {
      padding: 4px 8px;
      cursor: pointer;
      border: 0;
      color: #fff;
      font-size: 16px;
      background-color: transparent;
      border-bottom: 1px solid #fff;
      &::after {
        width: 100%;
      }
    }
  }
}
</style>
