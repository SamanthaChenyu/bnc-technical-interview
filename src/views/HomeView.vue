<template>
  <div class="home-view">
    <NineSquare />
  </div>
</template>

<script setup lang="ts">
import NineSquare from './HomeView/components/NineSquare.vue'
</script>

<style lang="scss" scoped>
.home-view {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
