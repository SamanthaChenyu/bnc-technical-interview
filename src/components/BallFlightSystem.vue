<template>
  <div class="ball-flight-container" v-if="visible">
    <!-- 使用 CSS transform 和 GPU 加速來渲染100顆球 -->
    <div
      v-for="ball in balls"
      :key="ball.id"
      class="ball"
      :style="{
        transform: `translate3d(${ball.x}px, ${ball.y}px, 0) scale(${ball.isFlying ? 1 : 0})`,
        backgroundColor: ball.color,
        '--ball-size': ball.size + 'px',
      }"
      :class="{
        flying: ball.isFlying,
        [`speed-${ball.speed}`]: true,
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { watch } from 'vue'

interface Ball {
  id: number
  x: number
  y: number
  targetX: number
  targetY: number
  startX: number
  startY: number
  color: string
  size: number
  speed: 'slow' | 'medium' | 'fast'
  isFlying: boolean
  progress: number // 0-1 飛行進度
}

const props = defineProps<{
  visible: boolean
}>()

const balls = ref<Ball[]>([])
const animationId = ref<number | null>(null)
const containerWidth = ref(window.innerWidth)
const containerHeight = ref(window.innerHeight)

// 預定義的顏色池，避免每次計算
const colorPool = [
  '#A5F12B',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
  '#F8C471',
  '#82E0AA',
  '#F1948A',
  '#AED6F1',
]

// 速度配置
const speedConfig = {
  slow: 0.005,
  medium: 0.008,
  fast: 0.012,
}

// 生成隨機球的位置和屬性
const generateBalls = () => {
  const newBalls: Ball[] = []

  for (let i = 0; i < 100; i++) {
    // 隨機起點（螢幕邊緣）
    const startSide = Math.floor(Math.random() * 4) // 0:上, 1:右, 2:下, 3:左
    let startX: number, startY: number

    switch (startSide) {
      case 0: // 上邊
        startX = Math.random() * containerWidth.value
        startY = -20
        break
      case 1: // 右邊
        startX = containerWidth.value + 20
        startY = Math.random() * containerHeight.value
        break
      case 2: // 下邊
        startX = Math.random() * containerWidth.value
        startY = containerHeight.value + 20
        break
      default: // 左邊
        startX = -20
        startY = Math.random() * containerHeight.value
    }

    // 隨機終點（螢幕內部區域）
    const targetX = 100 + Math.random() * (containerWidth.value - 200)
    const targetY = 100 + Math.random() * (containerHeight.value - 200)

    newBalls.push({
      id: i,
      x: startX,
      y: startY,
      startX,
      startY,
      targetX,
      targetY,
      color: colorPool[i % colorPool.length],
      size: 8 + Math.random() * 12, // 8-20px
      speed: ['slow', 'medium', 'fast'][Math.floor(Math.random() * 3)] as Ball['speed'],
      isFlying: false,
      progress: 0,
    })
  }

  balls.value = newBalls
}

// 使用 easing 函數讓動畫更自然
const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

// 高效能動畫循環
const animateBalls = () => {
  balls.value.forEach((ball) => {
    if (!ball.isFlying) return

    // 更新飛行進度
    ball.progress += speedConfig[ball.speed]

    if (ball.progress >= 1) {
      // 到達終點，重新設定新的目標
      ball.progress = 0
      ball.startX = ball.x
      ball.startY = ball.y

      // 新的隨機目標點
      ball.targetX = 100 + Math.random() * (containerWidth.value - 200)
      ball.targetY = 100 + Math.random() * (containerHeight.value - 200)
    }

    // 使用 easing 計算當前位置
    const easedProgress = easeInOutCubic(ball.progress)
    ball.x = ball.startX + (ball.targetX - ball.startX) * easedProgress
    ball.y = ball.startY + (ball.targetY - ball.startY) * easedProgress
  })

  if (props.visible) {
    animationId.value = requestAnimationFrame(animateBalls)
  }
}

// 開始飛行動畫
const startAnimation = () => {
  if (!props.visible) return

  generateBalls()

  // 分批啟動球的飛行，避免同時啟動造成卡頓
  balls.value.forEach((ball, index) => {
    setTimeout(() => {
      if (props.visible) {
        ball.isFlying = true
      }
    }, index * 20) // 每20ms啟動一顆球
  })

  animationId.value = requestAnimationFrame(animateBalls)
}

// 停止動畫
const stopAnimation = () => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
    animationId.value = null
  }
  balls.value.forEach((ball) => {
    ball.isFlying = false
  })
}

// 監聽視窗大小變化
const handleResize = () => {
  containerWidth.value = window.innerWidth
  containerHeight.value = window.innerHeight
}

// 監聽變化
onMounted(() => {
  window.addEventListener('resize', handleResize)

  // 如果初始就是可見的，立即開始動畫
  if (props.visible) {
    startAnimation()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  stopAnimation()
})

watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      startAnimation()
    } else {
      stopAnimation()
    }
  },
)
</script>

<style lang="scss" scoped>
.ball-flight-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none; // 不阻擋其他元素的互動
  z-index: 1; // 在背景層
  overflow: hidden;
}

.ball {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  pointer-events: none;

  // 啟用硬體加速
  will-change: transform;
  transform-style: preserve-3d;
  backface-visibility: hidden;

  // 基礎陰影效果
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.3);

  // 預設狀態
  opacity: 0;
  transform: translate3d(-100px, -100px, 0) scale(0);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;

  // 飛行狀態
  &.flying {
    opacity: 0.9;
    transform: translate3d(var(--x, 0), var(--y, 0), 0) scale(1);
    transition: opacity 0.3s ease;
  }

  // 不同速度的視覺效果
  &.speed-slow {
    filter: blur(0px);
  }

  &.speed-medium {
    filter: blur(0.5px);
    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.3),
      inset 0 1px 2px rgba(255, 255, 255, 0.4);
  }

  &.speed-fast {
    filter: blur(1px);
    box-shadow:
      0 3px 8px rgba(0, 0, 0, 0.4),
      inset 0 1px 3px rgba(255, 255, 255, 0.5);
  }
}

// 效能優化：減少重繪
* {
  box-sizing: border-box;
}

// 響應式調整
@media (max-width: 768px) {
  .ball {
    // 行動裝置上稍微減少球的大小
    --ball-size: calc(var(--ball-size) * 0.8) !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ball {
    // 對於偏好減少動畫的使用者，移除模糊效果
    filter: none !important;
    transition: none !important;
  }
}
</style>
