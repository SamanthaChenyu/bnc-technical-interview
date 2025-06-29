<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue'
import { useMainStore } from '@/stores/main'

interface MenuData {
  key: string
  text: string
  children?: MenuData[]
}

interface Props {
  menu: MenuData
  level?: number
  maxLevel?: number
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  maxLevel: 100,
})

const store = useMainStore()

// 效能優化：使用 ref 來控制子選單的渲染
const shouldRenderChildren = ref(false)

const isOpen = computed(() => {
  return store.isMenuOpen(props.menu.key)
})

const hasChildren = computed(() => {
  return props.menu.children && props.menu.children.length > 0
})

const canExpand = computed(() => {
  return props.level < props.maxLevel && hasChildren.value
})

const toggle = async () => {
  if (!canExpand.value) return

  store.toggleMenu(props.menu.key)

  // 效能優化：只有在需要展開時才渲染子組件
  if (store.isMenuOpen(props.menu.key) && !shouldRenderChildren.value) {
    shouldRenderChildren.value = true
    await nextTick()
  }
}

// 展開全部子選單到最大深度
const expandAll = async () => {
  if (!hasChildren.value) return

  console.log('開始展開全部選單')

  // 先清空所有展開狀態
  store.setOpenMenus([])
  await nextTick()

  // 收集所有需要展開的選單key
  const keysToExpand: string[] = []

  const collectKeys = (menu: MenuData, currentLevel: number = 0) => {
    if (currentLevel >= props.maxLevel) return

    keysToExpand.push(menu.key)
    console.log(`收集第${currentLevel + 1}層: ${menu.text}`)

    if (menu.children) {
      menu.children.forEach((child) => {
        collectKeys(child, currentLevel + 1)
      })
    }
  }

  // 收集所有keys
  collectKeys(props.menu, props.level)

  // 一次性設定所有展開狀態
  store.setOpenMenus(keysToExpand)

  // 確保當前組件渲染子組件
  shouldRenderChildren.value = true
  await nextTick()

  console.log(`展開全部完成！總共${keysToExpand.length}層`)
}

// 監聽選單狀態變化，自動渲染子組件
watch(
  isOpen,
  async (newValue) => {
    if (newValue && !shouldRenderChildren.value) {
      shouldRenderChildren.value = true
      await nextTick()
      console.log(`自動渲染第${props.level}層: ${props.menu.text}`)
    }
  },
  { immediate: true },
)

// 監聽關閉狀態，延遲清理子組件以避免閃爍
const handleTransitionEnd = () => {
  if (!isOpen.value) {
    // 延遲清理，給動畫時間完成
    setTimeout(() => {
      if (!isOpen.value) {
        shouldRenderChildren.value = false
      }
    }, 300)
  }
}
</script>

<template>
  <li
    :class="{
      [`level-${level}`]: true,
      'has-children': hasChildren,
      'max-level': level >= maxLevel,
    }"
  >
    <div class="menu-button-group">
      <button
        type="button"
        @click="toggle"
        :disabled="!canExpand"
        :class="{
          expanded: isOpen,
          disabled: !canExpand,
          'leaf-node': !hasChildren,
          'main-button': true,
        }"
      >
        <span class="menu-text">{{ menu.text }}</span>
        <span v-if="hasChildren && canExpand" class="arrow" :class="{ rotated: isOpen }"> ▶ </span>
        <span v-if="level >= maxLevel && hasChildren" class="max-indicator"> ⋯ </span>
      </button>

      <!-- 展開全部按鈕 -->
      <button
        v-if="hasChildren && canExpand && level === 0"
        type="button"
        @click="expandAll"
        class="expand-all-button"
        title="展開全部到最大深度"
      >
        <span class="expand-all-icon">⚡</span>
      </button>
    </div>

    <transition name="slide-fade" @after-leave="handleTransitionEnd" appear>
      <ul
        v-if="isOpen && shouldRenderChildren && canExpand"
        class="submenu"
        :style="{ '--level': level }"
      >
        <MenuDropdown
          v-for="item in menu.children"
          :key="item.key"
          :menu="item"
          :level="level + 1"
          :max-level="maxLevel"
        />
      </ul>
    </transition>
  </li>
</template>

<style lang="scss" scoped>
ul {
  padding-inline-start: 3px;

  &.submenu {
    // 不使用縮進，所有層級都左對齊
    padding-left: 0;
    max-height: 400px; // 限制高度避免過度滾動
    overflow-y: auto;

    // 效能優化：使用 transform 來提升渲染效能
    transform: translateZ(0);
    will-change: transform, opacity; // 告知瀏覽器將要變化的屬性
  }

  li {
    list-style-type: none;
    cursor: pointer;
    position: relative;

    // 深度視覺指示
    &.level-0 {
      border-left: 2px solid #4caf50;
    }
    &.level-1 {
      border-left: 2px solid #2196f3;
    }
    &.level-2 {
      border-left: 2px solid #ff9800;
    }
    &.level-3 {
      border-left: 2px solid #e91e63;
    }
    &.level-4 {
      border-left: 2px solid #9c27b0;
    }

    // 超過 5 層後使用漸變色
    &:not(.level-0):not(.level-1):not(.level-2):not(.level-3):not(.level-4) {
      border-left: 2px solid hsl(calc(var(--level) * 30), 70%, 60%);
    }

    &.max-level {
      opacity: 0.7;
      border-left-color: #666;
    }

    &.has-children {
      position: relative;
    }

    .menu-button-group {
      display: flex;
      width: 100%;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      cursor: pointer;
      border: 0;
      color: #fff;
      font-size: 14px;
      background-color: transparent;
      transition: all 0.2s ease;
      text-align: left;

      &.main-button {
        flex: 1;
      }

      &.expand-all-button {
        width: 40px;
        padding: 8px;
        background-color: rgba(255, 193, 7, 0.2);
        border-left: 1px solid rgba(255, 255, 255, 0.1);
        justify-content: center;

        &:hover {
          background-color: rgba(255, 193, 7, 0.4);
          transform: scale(1.1);
        }

        .expand-all-icon {
          font-size: 16px;
          color: #ffc107;
          animation: pulse 2s infinite;
        }
      }

      &:hover:not(.disabled) {
        background-color: rgba(255, 255, 255, 0.1);
        transform: translateX(2px);
      }

      &.expanded {
        background-color: rgba(255, 255, 255, 0.15);
        font-weight: 600;
      }

      &.disabled {
        cursor: not-allowed;
        opacity: 0.5;

        &:hover {
          background-color: transparent;
          transform: none;
        }
      }

      &.leaf-node {
        padding-left: 20px;

        &::before {
          content: '•';
          position: absolute;
          left: 8px;
          color: #4caf50;
          font-weight: bold;
        }
      }

      .menu-text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .arrow {
        margin-left: 8px;
        transition: transform 0.2s ease;
        font-size: 12px;
        color: #4caf50;

        &.rotated {
          transform: rotate(90deg);
        }
      }

      .max-indicator {
        margin-left: 8px;
        color: #666;
        font-size: 16px;
        opacity: 0.7;
      }
    }
  }
}

// 動畫效果
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px) scaleY(0.8);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px) scaleY(0.9);
}

// 響應式設計
@media (max-width: 768px) {
  ul {
    &.submenu {
      padding-left: 0; // 行動裝置也不縮進
      max-height: 300px;
    }

    li button {
      padding: 6px 8px;
      font-size: 13px;

      .menu-text {
        max-width: 200px; // 限制文字寬度
      }
    }
  }
}

// 效能優化：減少重繪
* {
  box-sizing: border-box;
}

// 展開全部按鈕的脈衝動畫
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

// 深層選單的額外樣式優化
li[class*='level-'] {
  // 使用 contain 屬性來優化渲染效能
  contain: layout style;

  // 超過 10 層後的特殊處理
  &.level-10,
  &.level-11,
  &.level-12,
  &.level-13,
  &.level-14,
  &.level-15,
  &.level-16,
  &.level-17,
  &.level-18,
  &.level-19 {
    button {
      font-size: 13px;
      padding: 6px 10px;
    }
  }

  // 超過 20 層後進一步縮小
  &[class*='level-']:nth-child(n + 20) {
    button {
      font-size: 12px;
      padding: 4px 8px;
    }
  }
}
</style>
