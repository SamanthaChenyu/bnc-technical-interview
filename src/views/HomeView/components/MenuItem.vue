<template>
  <li class="menu-item">
    <div
      class="menu-item-content"
      :class="{
        selected: selectedKey === item.key,
        'has-children': hasChildren,
        expanded: isExpanded,
      }"
      @click="handleClick"
    >
      <span class="menu-text">{{ item.text }}</span>
      <span v-if="hasChildren" class="menu-arrow">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          :class="{ rotated: isExpanded }"
        >
          <polyline points="9,18 15,12 9,6"></polyline>
        </svg>
      </span>
    </div>

    <transition name="slide">
      <ul v-if="hasChildren && isExpanded" class="submenu">
        <MenuItem
          v-for="child in item.children"
          :key="child.key"
          :item="child"
          :level="level + 1"
          :selected-key="selectedKey"
          :expanded-keys="expandedKeys"
          @select="$emit('select', $event)"
          @toggle="$emit('toggle', $event)"
        />
      </ul>
    </transition>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface MenuData {
  key: string
  text: string
  children?: MenuData[]
}

interface Props {
  item: MenuData
  level: number
  selectedKey: string | null
  expandedKeys: Set<string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [key: string]
  toggle: [key: string]
}>()

const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 0
})

const isExpanded = computed(() => {
  return props.expandedKeys.has(props.item.key)
})

const handleClick = () => {
  emit('select', props.item.key)

  // 如有子項目，觸發展開/收合事件
  if (hasChildren.value) {
    emit('toggle', props.item.key)
  }
}
</script>

<style lang="scss" scoped>
.menu-item {
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &.selected {
    background-color: rgba(255, 255, 255, 0.2);
    border-left-color: #fff;
    font-weight: 600;
  }

  &.has-children {
    .menu-text {
      margin-right: 8px;
    }
  }
}

.menu-text {
  flex: 1;
  color: #fff;
  font-size: 14px;
}

.menu-arrow {
  color: #fff;
  transition: transform 0.3s ease;

  svg {
    display: block;

    &.rotated {
      transform: rotate(90deg);
    }
  }
}

.submenu {
  list-style: none;
  margin: 0;
  padding: 0;
  background-color: rgba(0, 0, 0, 0.1);

  .menu-item-content {
    font-size: 13px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.08);
    }

    &.selected {
      background-color: rgba(255, 255, 255, 0.15);
    }
  }
}

// 動畫效果
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 500px;
  opacity: 1;
}

// 根據層級調整縮排
.menu-item-content {
  padding-left: 20px;
}

// 動態生成多層縮排
.submenu .menu-item-content {
  padding-left: 40px;
}
.submenu .submenu .menu-item-content {
  padding-left: 60px;
}
.submenu .submenu .submenu .menu-item-content {
  padding-left: 80px;
}
.submenu .submenu .submenu .submenu .menu-item-content {
  padding-left: 100px;
}
.submenu .submenu .submenu .submenu .submenu .menu-item-content {
  padding-left: 120px;
}
</style>
