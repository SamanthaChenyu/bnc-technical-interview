<template>
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
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue'
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

const list: Ref<MenuData[]> = ref([])
const selectedKey: Ref<string | null> = ref(null)
const expandedKeys: Ref<Set<string>> = ref(new Set())

const getMenuDataURL = (): Promise<ApiResponse<MenuData[]>> => {
  return apiService.get('/bnc-technical-interview/data.json')
}

const handleCreate = async (): Promise<void> => {
  const response: ApiResponse<MenuData[]> = await getMenuDataURL()
  list.value = response.data
}

const handleMenuSelect = (key: string): void => {
  selectedKey.value = key
}

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
  }
}

onMounted(() => {
  handleCreate()
})
</script>

<style lang="scss" scoped>
.sidebar-header {
  padding: 20px;
  background: #6d7fcc;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

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
}
</style>
