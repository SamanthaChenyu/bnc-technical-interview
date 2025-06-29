<template>
  <div class="sidebar-content">
    <div class="sidebar-header">
      <h3>選單</h3>
    </div>
    <ul class="menu-list">
      <MenuItem
        v-for="item in list"
        :key="item.key"
        :item="item"
        :level="0"
        :selected-key="selectedKey"
        :expanded-keys="expandedKeys"
        @select="handleMenuSelect"
        @toggle="handleMenuToggle"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, type Ref } from 'vue'
import { type ApiResponse } from '@/services/apiService.ts'
import MenuItem from './MenuItem.vue'
import * as apiService from '@/services/apiService.ts'

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

const props = defineProps<{
  externalSelectedKey?: string | null
}>()

const emit = defineEmits<{
  selectionChange: [key: string | null]
}>()

const list: Ref<MenuData[]> = ref([])
const selectedKey: Ref<string | null> = ref(null)
const expandedKeys: Ref<Set<string>> = ref(new Set())

// localStorage 鍵名
const STORAGE_KEY = 'sidebar-selected-item'

const getMenuDataURL = (): Promise<ApiResponse<MenuData[]>> => {
  return apiService.get('/bnc-technical-interview/data.json')
}

const handleCreate = async (): Promise<void> => {
  const response: ApiResponse<MenuData[]> = await getMenuDataURL()
  list.value = response.data
}

// 保存選取狀態到 localStorage
const saveSelectedItem = (key: string | null): void => {
  if (key) {
    localStorage.setItem(STORAGE_KEY, key)
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

// 從 localStorage 恢復選取狀態
const loadSelectedItem = (): string | null => {
  return localStorage.getItem(STORAGE_KEY)
}

const handleMenuSelect = (key: string): void => {
  selectedKey.value = key
  saveSelectedItem(key) // 保存到 localStorage
  emit('selectionChange', key)

  // 當選擇項目時，收合不相關的展開項目
  const shouldKeepExpanded = (expandedKey: string): boolean => {
    // 檢查是否在選中項目的路徑上
    const isInPath = (
      items: MenuData[],
      targetKey: string,
      currentPath: string[] = [],
    ): boolean => {
      for (const item of items) {
        const newPath = [...currentPath, item.key]

        if (item.key === targetKey) {
          // 找到目標，檢查 expandedKey 是否在路徑中
          return newPath.includes(expandedKey)
        }

        if (item.children) {
          if (isInPath(item.children, targetKey, newPath)) {
            return true
          }
        }
      }
      return false
    }

    return isInPath(list.value, key)
  }

  // 只保留在選中項目路徑上的展開項目
  const keysToKeep = new Set<string>()
  expandedKeys.value.forEach((expandedKey) => {
    if (shouldKeepExpanded(expandedKey)) {
      keysToKeep.add(expandedKey)
    }
  })

  expandedKeys.value = keysToKeep
}

// 暴露給外部調用的選擇方法
const selectItem = (key: string): void => {
  // 找到該項目並展開其父級
  const findAndExpandPath = (
    items: MenuData[],
    targetKey: string,
    path: string[] = [],
  ): string[] | null => {
    for (const item of items) {
      const currentPath = [...path, item.key]

      if (item.key === targetKey) {
        // 找到目標項目，返回完整路徑
        return currentPath
      }

      if (item.children) {
        const result = findAndExpandPath(item.children, targetKey, currentPath)
        if (result) {
          return result
        }
      }
    }
    return null
  }

  const targetPath = findAndExpandPath(list.value, key)
  if (targetPath) {
    // 清除所有展開狀態，只展開目標路徑上的父級項目
    expandedKeys.value.clear()

    // 展開路徑上的所有父級（除了目標項目本身）
    targetPath.slice(0, -1).forEach((parentKey) => {
      expandedKeys.value.add(parentKey)
    })

    selectedKey.value = key
    saveSelectedItem(key) // 保存到 localStorage
    emit('selectionChange', key)
  }
}

// 監聽外部傳入的選擇
watch(
  () => props.externalSelectedKey,
  (newKey) => {
    if (newKey && newKey !== selectedKey.value) {
      selectItem(newKey)
    }
  },
)

// 暴露方法給父組件
defineExpose({
  selectItem,
})

const handleMenuToggle = (key: string): void => {
  // 找到當前項目和它的同級項目
  const findSiblings = (
    items: MenuData[],
    targetKey: string,
    parentItems: MenuData[] = [],
  ): MenuData[] => {
    for (const item of items) {
      if (item.key === targetKey) {
        return parentItems.length > 0 ? parentItems : items
      }
      if (item.children) {
        const result = findSiblings(item.children, targetKey, item.children)
        if (result.length > 0) return result
      }
    }
    return []
  }

  const siblings = findSiblings(list.value, key)

  if (expandedKeys.value.has(key)) {
    // 如果當前項目已展開，則收合它
    expandedKeys.value.delete(key)
    if (selectedKey.value === key) {
      selectedKey.value = null
      saveSelectedItem(null) // 清除保存的狀態
      emit('selectionChange', null)
    }
  } else {
    // 收合所有同級項目，只展開當前項目
    siblings.forEach((sibling) => {
      if (sibling.key !== key) {
        expandedKeys.value.delete(sibling.key)
      }
    })
    expandedKeys.value.add(key)
    selectedKey.value = key
    saveSelectedItem(key) // 保存狀態
    emit('selectionChange', key)
  }
}

onMounted(async () => {
  await handleCreate()

  // 恢復上次選取的項目
  const savedKey = loadSelectedItem()
  if (savedKey && list.value.length > 0) {
    // 檢查保存的 key 是否還存在於選單中
    const itemExists = (items: MenuData[], targetKey: string): boolean => {
      for (const item of items) {
        if (item.key === targetKey) {
          return true
        }
        if (item.children && itemExists(item.children, targetKey)) {
          return true
        }
      }
      return false
    }

    if (itemExists(list.value, savedKey)) {
      selectItem(savedKey)
    } else {
      // 如果保存的項目不存在，清除 localStorage
      saveSelectedItem(null)
    }
  }
})
</script>

<style lang="scss" scoped>
.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.sidebar-header {
  padding: 20px;
  background: #6d7fcc;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0; // 防止 header 被壓縮

  h3 {
    margin: 0;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
  }
}

.menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
  min-height: 0; // 重要：讓 flex 子元素能正確計算高度

  // 自定義滾動條
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
}
</style>
