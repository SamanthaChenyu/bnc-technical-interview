import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', () => {
  // state
  const isScreenWidth = ref<number | null>(null)
  const openMenus = ref(new Set<string>())

  // getters
  const getIsScreenWidth = computed(() => isScreenWidth.value)
  const isMenuOpen = computed(() => (menuId: string) => {
    return openMenus.value.has(menuId)
  })

  // actions
  function setIsScreenWidth(payload: number | null) {
    isScreenWidth.value = payload
  }

  function toggleMenu(menuId: string, forceOpen?: boolean) {
    if (forceOpen) {
      openMenus.value.add(menuId)
    } else if (openMenus.value.has(menuId)) {
      openMenus.value.delete(menuId)
    } else {
      openMenus.value.add(menuId)
    }
  }

  function setOpenMenus(menuIds: string[]) {
    openMenus.value = new Set(menuIds)
  }

  return {
    // state
    isScreenWidth,
    openMenus,
    // getters
    getIsScreenWidth,
    isMenuOpen,
    // actions
    setIsScreenWidth,
    toggleMenu,
    setOpenMenus,
  }
})
