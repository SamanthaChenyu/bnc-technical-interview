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
  <div class="ball-control-center">
    <label class="ball-checkbox" v-show="!sidebarCollapse">
      <input type="checkbox" v-model="showHundredBalls" class="checkbox-input" />
      <span class="checkbox-text">顯示一百顆飛行球</span>
    </label>
  </div>
  <div v-show="!sidebarCollapse" v-if="menuData.length > 0" class="menu-dropdown-section">
    <ul class="menu-dropdown-container">
      <MenuDropdown v-for="item in menuData" :key="item.key" :menu="item" :max-level="100" />
    </ul>
  </div>
  <NineSquare :isOriginal="switchStatus" />
  <BallFlightSystem :visible="showHundredBalls" />
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
import { ref, onMounted, type Ref } from 'vue'
import MenuButton from '@/components/buttons/MenuButton.vue'
import NineSquare from './components/NineSquare.vue'
import SidebarContent from './components/SidebarContent.vue'
import Switch from '@/components/Switch.vue'
import Dropdown from '@/components/Dropdown.vue'
import MenuDropdown from '@/components/MenuDropdown.vue'
import BallFlightSystem from '@/components/BallFlightSystem.vue'
import { type ApiResponse } from '@/services/apiService.ts'
import * as apiService from '@/services/apiService.ts'

interface MenuData {
  key: string
  text: string
  children?: MenuData[]
}

const sidebarCollapse: Ref<boolean> = ref(false)
const switchStatus: Ref<boolean> = ref(true)
const selectedMenuKey: Ref<string | null> = ref(null)
const sidebarContentRef: Ref<InstanceType<typeof SidebarContent> | null> = ref(null)
const menuData: Ref<MenuData[]> = ref([])
const showHundredBalls: Ref<boolean> = ref(false)

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

const loadMenuData = async (): Promise<void> => {
  try {
    const response: ApiResponse<MenuData[]> = await apiService.get(
      '/bnc-technical-interview/deep-menu-100-levels.json',
    )
    menuData.value = response.data
  } catch (error) {
    console.error('載入100層資料失敗:', error)
  }
}

onMounted(() => {
  loadMenuData()
})
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

.ball-control-center {
  position: absolute;
  z-index: 2;
  left: 50%;
  top: 10px;
  transform: translateX(-50%);
}

.ball-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 20px;
  border-radius: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(109, 127, 204, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    border-color: rgba(109, 127, 204, 0.5);
    transform: translateY(-2px);
  }

  .checkbox-input {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #6d7fcc;
  }

  .checkbox-text {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    user-select: none;
  }
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

.menu-dropdown-section {
  position: absolute;
  z-index: 2;
  background-color: #7486d6;
  bottom: 0;
  margin-top: 20px;
  padding: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  h4 {
    color: #fff;
    font-size: 16px;
    margin: 0 0 10px 0;
    font-weight: 600;
  }

  .instruction-text {
    color: #ffc107;
    font-size: 12px;
    margin: 0 0 15px 0;
    font-style: italic;
    opacity: 0.9;
  }

  .menu-dropdown-container {
    list-style: none;
    margin: 0;
    padding: 0;
  }
}
</style>
