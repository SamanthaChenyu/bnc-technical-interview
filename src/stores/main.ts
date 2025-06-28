import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', () => {
  // state
  const currentArea = ref({})
  const isScreenWidth = ref<number | null>(null)
  const openMenus = ref(new Set<string>())

  // getters
  const getCurrentArea = computed(() => currentArea.value)
  const getIsScreenWidth = computed(() => isScreenWidth.value)
  const isMenuOpen = computed(() => (menuId: string) => {
    return openMenus.value.has(menuId)
  })

  // actions
  function setCurrentArea(payload: unknown) {
    currentArea.value = payload as Record<string, unknown>
  }

  function setIsScreenWidth(payload: number | null) {
    isScreenWidth.value = payload
  }

  function toggleMenu(menuId: string) {
    if (openMenus.value.has(menuId)) {
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
    currentArea,
    isScreenWidth,
    openMenus,
    // getters
    getCurrentArea,
    getIsScreenWidth,
    isMenuOpen,
    // actions
    setCurrentArea,
    setIsScreenWidth,
    toggleMenu,
    setOpenMenus,
  }
})
