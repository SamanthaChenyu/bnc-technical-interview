<template>
  <NineSquare />
  <div class="wrapper">
    <div id="sidebar" :class="{ active: sidebarCollapse }"></div>
    <div v-if="sidebarCollapse" class="mask" @click="sidebarClose" />
    <div id="content" :class="sidebarCollapse ? 'menuOpen' : 'menuClose'">
      <MenuButton v-model="sidebarCollapse" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, type Ref } from 'vue'
import * as apiService from '@/services/apiService.ts'
import { type ApiResponse } from '@/services/apiService.ts'
import MenuButton from '@/components/buttons/MenuButton.vue'
import NineSquare from './components/NineSquare.vue'

interface MenuItem {
  id: number
  name: string
  sub: MenuItem[]
}

interface MenuData {
  key: string
  text: string
  children?: MenuData[]
}

interface SliceItem {
  key: string
  text: string
  hasChildren?: boolean
  groupIdx: number
}

interface TabChangeEvent {
  currentOption: SliceItem
  columnIndex: number
}

interface ConfirmEvent {
  selectedOptions: Array<{ text?: string } | null>
}

interface ClassIds {
  keys: string[]
  sliceList: SliceItem[]
}

const ACTIVE_TYPES = {
  fristClass: 0,
  secondClass: 1,
} as const

const getMenuDataURL = (): Promise<ApiResponse<MenuData[]>> => {
  return apiService.get('/bnc-technical-interview/data.json')
}

const activeTab: Ref<number> = ref(ACTIVE_TYPES.fristClass)
const sidebarCollapse: Ref<boolean> = ref(false)
const menuList: Ref<MenuItem[]> = ref([])
const loading: Ref<boolean> = ref(false)
const list: Ref<MenuData[]> = ref([])
const fieldValue: Ref<string> = ref('')
const showPicker: Ref<boolean> = ref(false)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const arrangeList: Ref<never[]> = ref([])
const currentTabKey: Ref<string | null> = ref(null)
const currentGroupIdx: Ref<number | null> = ref(null)

const fristClassIds: ClassIds = reactive({
  keys: [],
  sliceList: [],
})

const secondClassIds: ClassIds = reactive({
  keys: [],
  sliceList: [],
})

const thiredClassIds: ClassIds = reactive({
  keys: [],
  sliceList: [],
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const tabs = computed((): string[] => {
  switch (true) {
    // 第一層選好，邁向第二項
    case fristClassIds.keys.includes(currentTabKey.value || ''):
      return ['选择第一項', '选择第二項']
    case secondClassIds.keys.includes(currentTabKey.value || ''):
      return ['选择第一項', '选择第二項', '选择第三項']
    case thiredClassIds.keys.includes(currentTabKey.value || ''):
      return ['选择第一項', '选择第二項', '选择第三項', '选择第四項']
    default:
      return ['选择第一項']
  }
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sliceList = computed((): SliceItem[] => {
  switch (activeTab.value) {
    case 1:
      return secondClassIds.sliceList.filter(
        (item: SliceItem) => item.groupIdx === currentGroupIdx.value,
      )
    case 2:
      return thiredClassIds.sliceList.filter(
        (item: SliceItem) => item.groupIdx === currentGroupIdx.value,
      )
    default:
      return fristClassIds.sliceList
  }
})

const handleCreate = async (): Promise<void> => {
  loading.value = true
  menuList.value = [createMenuList(100)]
  const response: ApiResponse<MenuData[]> = await getMenuDataURL()
  list.value = response.data
  handleMenu(response.data)
  loading.value = false
}

const handleMenu = (list: MenuData[]): void => {
  list.forEach((item: MenuData, index: number) => {
    fristClassIds.keys.push(item.key)
    fristClassIds.sliceList.push({
      key: item.key,
      text: item.text,
      groupIdx: index,
    })
    if (item.children) {
      item.children.map((child: MenuData, childIdx: number) => {
        secondClassIds.keys.push(child.key)
        secondClassIds.sliceList.push({
          key: child.key,
          text: child.text,
          hasChildren: !!child.children,
          groupIdx: index,
        })
        if (child.children) {
          child.children.map((grand: MenuData) => {
            thiredClassIds.keys.push(grand.key)
            thiredClassIds.sliceList.push({
              key: grand.key,
              text: grand.text,
              hasChildren: !!grand.children,
              groupIdx: childIdx,
            })
          })
        }
      })
    }
  })
}

const sidebarClose = (): void => {
  const target = document.querySelector('#checkbox') as HTMLElement | null
  target?.click()
  sidebarCollapse.value = false
}

const createMenuList = (levels: number, currentLevel: number = 0): MenuItem => {
  // 基本結構
  const menuItem: MenuItem = {
    id: currentLevel,
    name: `${currentLevel}`,
    sub: [],
  }
  if (currentLevel < levels - 1) {
    menuItem.sub.push(createMenuList(levels, currentLevel + 1))
  }
  return menuItem
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onChangeTabs = ({ currentOption }: TabChangeEvent): void => {
  currentTabKey.value = currentOption.key
  currentGroupIdx.value = currentOption.groupIdx
  if (!currentOption.hasChildren) console.log(currentOption)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onConfirm = ({ selectedOptions }: ConfirmEvent): void => {
  showPicker.value = false
  let name: string = ''
  selectedOptions.map((item) => {
    if (item) return (name += item.text ? item.text + '/' : '')
  })
  fieldValue.value = name
}

onMounted(() => {
  handleCreate()
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

  background: $color_lavendar;
  color: #fff;
  transition: all 0.3s;

  min-width: 450px;
  max-width: 450px;
  min-height: 100%;
  overflow-x: scroll;
  margin-left: -450px;
  &.active {
    margin-left: 0px;
  }
}

#sidebar .sidebar-header {
  padding: 20px;
  background: #6d7fcc;
  display: flex;
  flex-direction: column;
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
    margin-left: -60%; /* reverses previous setting */
    min-width: 60%;
    max-width: 60%;
  }
  #sidebar.active {
    margin-left: 0; /* reverses previous setting */
  }
}

#sidebar ul p {
  color: #fff;
  padding: 10px;
}
</style>
