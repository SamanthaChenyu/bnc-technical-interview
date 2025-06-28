<template>
  <div class="center">
    <Switch
      v-show="!sidebarCollapse"
      :text="switchStatus ? '基礎需求' : '額外需求'"
      v-model="switchStatus"
    />
  </div>
  <NineSquare :isOriginal="switchStatus" />
  <div class="wrapper">
    <div id="sidebar" :class="{ active: sidebarCollapse }">
      <SidebarContent />
    </div>
    <div v-if="sidebarCollapse" class="mask" @click="sidebarClose" />
    <div id="content" :class="sidebarCollapse ? 'menuOpen' : 'menuClose'">
      <MenuButton v-model="sidebarCollapse" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'
import MenuButton from '@/components/buttons/MenuButton.vue'
import NineSquare from './components/NineSquare.vue'
import SidebarContent from './components/SidebarContent.vue'
import Switch from '@/components/Switch.vue'

const sidebarCollapse: Ref<boolean> = ref(false)
const switchStatus: Ref<boolean> = ref(true)

const sidebarClose = (): void => {
  const target = document.querySelector('#checkbox') as HTMLElement | null
  target?.click()
  sidebarCollapse.value = false
}
</script>

<style lang="scss" scoped>
$color_lavendar: #7386d5;
$color_lighter: #92a3ec;
$color_darker: #5267c8;

@keyframes mask-animation {
  0% {
    backdrop-filter: blur(0px);
  }
  100% {
    backdrop-filter: blur(10px);
  }
}

.wrapper {
  position: fixed;
  height: 100vh;
  z-index: 1;
  width: 100%;
  top: 0;
}

.center {
  position: absolute;
  z-index: 2;
  left: 50%;
  top: 15%;
  transform: translateX(-50%) translateY(-15%);
}

.mask {
  cursor: pointer;
  position: fixed;
  left: 0;
  z-index: 0;
  width: 100%;
  height: calc(100%);
  backdrop-filter: blur(0px);
  transition: all 0.3s ease-in-out;
  animation: mask-animation 0.3s ease-in-out forwards;
}

.menuOpen {
  margin-left: 450px;
  transition: all 0.3s;
}
.menuClose {
  margin-left: 0px;
  transition: all 0.3s;
}

.sidebarButton {
  border: 0;
  background-color: $color_darker;
  padding: 8px 16px;
  border-radius: 4px;
  color: #fff;
  box-shadow: 4px 4px 1px 0px $color_lighter;
  cursor: pointer;
  transition: 0.3s all;
  margin-top: 8px;
  &:hover {
    transform: translate(1px, 1px);
    box-shadow: 2px 2px 1px 0px $color_lighter;
  }
}

ul {
  padding-inline-start: 0px;
}
#content {
  padding: 20px;
  float: left;
}

p {
  font-family: 'Poppins', sans-serif;
  font-size: 1.1em;
  font-weight: 300;
  line-height: 1.7em;
  color: #999;
}

#sidebar {
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;

  background: $color_lavendar;
  color: #fff;
  transition: all 0.3s;

  min-width: 450px;
  max-width: 450px;
  min-height: 100%;
  overflow: hidden;
  margin-left: -450px;
  &.active {
    margin-left: 0px;
  }
}

@media (max-width: 768px) {
  .menuOpen {
    margin-left: 60%;
  }
  .mask {
    top: 0px;
    height: 100%;
  }
  #sidebar {
    margin-left: -60%;
    min-width: 60%;
    max-width: 60%;
  }
  #sidebar.active {
    margin-left: 0;
  }
}

#sidebar ul p {
  color: #fff;
  padding: 10px;
}
</style>
