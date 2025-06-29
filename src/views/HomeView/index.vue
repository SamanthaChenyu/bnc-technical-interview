<template>
  <div class="center">
    <Switch
      v-show="!sidebarCollapse"
      :text="switchStatus ? '九宮格基礎需求' : '九宮格額外需求'"
      v-model="switchStatus"
    />
  </div>
  <div class="dropdown-center">
    <Dropdown
      v-show="!sidebarCollapse"
      :selected-key="selectedMenuKey"
      @select="handleDropdownSelect"
    />
  </div>
  <NineSquare :isOriginal="switchStatus" />
  <div class="wrapper">
    <div id="sidebar" :class="{ active: sidebarCollapse }">
      <SidebarContent
        ref="sidebarContentRef"
        :external-selected-key="selectedMenuKey"
        @selection-change="handleSidebarSelection"
      />
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
import Dropdown from '@/components/Dropdown.vue'

const sidebarCollapse: Ref<boolean> = ref(false)
const switchStatus: Ref<boolean> = ref(true)
const selectedMenuKey: Ref<string | null> = ref(null)
const sidebarContentRef: Ref<InstanceType<typeof SidebarContent> | null> = ref(null)

const sidebarClose = (): void => {
  const target = document.querySelector('#checkbox') as HTMLElement | null
  target?.click()
  sidebarCollapse.value = false
}

const handleDropdownSelect = (key: string): void => {
  selectedMenuKey.value = key
  // 通知 SidebarContent 選擇該項目
  if (sidebarContentRef.value) {
    sidebarContentRef.value.selectItem(key)
  }
}

const handleSidebarSelection = (key: string | null): void => {
  selectedMenuKey.value = key
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
  top: 10%;
  transform: translateX(-50%) translateY(-10%);
}

.dropdown-center {
  position: absolute;
  z-index: 2;
  left: 50%;
  top: 20%;
  transform: translateX(-50%) translateY(-20%);
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
  height: 100vh; // 改用固定高度
  overflow: visible; // 允許內部滾動
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
