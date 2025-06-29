<template>
  <div class="dropdown-container">
    <div class="dropdown-header" @click="toggleDropdown">
      <span class="dropdown-text">{{ selectedText || '請選擇項目' }}</span>
      <span class="dropdown-arrow" :class="{ rotated: isOpen }">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </span>
    </div>

    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu">
        <div
          v-for="option in flatOptions"
          :key="option.key"
          class="dropdown-option"
          :class="{
            selected: selectedKey === option.key,
            [`level-${option.level}`]: true,
          }"
          @click="handleSelect(option)"
        >
          {{ option.displayText }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, withDefaults, type Ref } from 'vue'
import { type ApiResponse } from '@/services/apiService.ts'
import * as apiService from '@/services/apiService.ts'
import { onUnmounted } from 'vue'

interface MenuData {
  key: string
  text: string
  children?: MenuData[]
}

interface FlatOption {
  key: string
  text: string
  displayText: string
  level: number
  path: string[]
}

const emit = defineEmits<{
  select: [key: string]
}>()

const props = withDefaults(
  defineProps<{
    selectedKey?: string | null
  }>(),
  {
    selectedKey: null,
  },
)

const isOpen: Ref<boolean> = ref(false)
const menuData: Ref<MenuData[]> = ref([])
const selectedKey: Ref<string | null> = ref(props.selectedKey ?? null)

// 將選單資料扁平化
const flattenMenu = (items: MenuData[], level = 0, path: string[] = []): FlatOption[] => {
  const result: FlatOption[] = []

  items.forEach((item) => {
    const currentPath = [...path, item.text]
    const displayText = level > 0 ? '　'.repeat(level) + item.text : item.text

    result.push({
      key: item.key,
      text: item.text,
      displayText,
      level,
      path: currentPath,
    })

    if (item.children && item.children.length > 0) {
      result.push(...flattenMenu(item.children, level + 1, currentPath))
    }
  })

  return result
}

const flatOptions = computed(() => flattenMenu(menuData.value))

const selectedText = computed(() => {
  const option = flatOptions.value.find((opt) => opt.key === selectedKey.value)
  return option ? option.path.join(' > ') : ''
})

const getMenuDataURL = (): Promise<ApiResponse<MenuData[]>> => {
  return apiService.get('/bnc-technical-interview/data.json')
}

const loadMenuData = async (): Promise<void> => {
  try {
    const response: ApiResponse<MenuData[]> = await getMenuDataURL()
    menuData.value = response.data
  } catch (error) {
    console.error('載入選單資料失敗:', error)
  }
}

const toggleDropdown = (): void => {
  isOpen.value = !isOpen.value
}

const handleSelect = (option: FlatOption): void => {
  selectedKey.value = option.key
  isOpen.value = false
  emit('select', option.key)
}

// 監聽外部傳入的 selectedKey 變化
watch(
  () => props.selectedKey,
  (newKey) => {
    selectedKey.value = newKey
  },
)

// 點擊外部關閉下拉選單
const handleClickOutside = (event: Event): void => {
  const target = event.target as HTMLElement
  const dropdown = document.querySelector('.dropdown-container')
  if (dropdown && !dropdown.contains(target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  loadMenuData()
  document.addEventListener('click', handleClickOutside)
})

// 清理事件監聽
const cleanup = (): void => {
  document.removeEventListener('click', handleClickOutside)
}

onUnmounted(cleanup)
</script>

<style lang="scss" scoped>
.dropdown-container {
  position: relative;
  min-width: 250px;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border: 2px solid #6d7fcc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #5267c8;
    box-shadow: 0 2px 8px rgba(109, 127, 204, 0.2);
  }
}

.dropdown-text {
  flex: 1;
  color: #333;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-arrow {
  color: #6d7fcc;
  transition: transform 0.3s ease;
  margin-left: 8px;

  &.rotated {
    transform: rotate(180deg);
  }

  svg {
    display: block;
  }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 2px solid #6d7fcc;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dropdown-option {
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
  border-bottom: 1px solid #f0f0f0;

  &:hover {
    background-color: #f8f9ff;
  }

  &.selected {
    background-color: #6d7fcc;
    color: #fff;
  }

  &:last-child {
    border-bottom: none;
  }

  // 不同層級的樣式
  &.level-0 {
    font-weight: 600;
    color: #333;
  }

  &.level-1 {
    color: #666;
    font-size: 13px;
  }

  &.level-2 {
    color: #888;
    font-size: 12px;
  }
}

// 下拉動畫
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
  transform-origin: top;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: scaleY(1);
}

// 自定義滾動條
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: #6d7fcc;
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: #5267c8;
}
</style>
