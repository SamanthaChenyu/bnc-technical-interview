<template>
  <div class="nine-square-container">
    <div class="nine-square-wrapper">
      <div class="grid-row">
        <div class="grid-cell" :class="{ flashing: isFlashing(0) }">
          <div
            class="ball corner-ball top-left"
            :class="{
              moving: isMoving(0),
              original: props.isOriginal,
              center: !props.isOriginal,
            }"
            :style="!props.isOriginal && ballTransforms[0] ? { transform: ballTransforms[0] } : {}"
          ></div>
        </div>
        <div class="grid-cell" :class="{ flashing: isFlashing(1) }"></div>
        <div class="grid-cell" :class="{ flashing: isFlashing(2) }">
          <div
            class="ball corner-ball top-right"
            :class="{
              moving: isMoving(2),
              original: props.isOriginal,
              center: !props.isOriginal,
            }"
            :style="!props.isOriginal && ballTransforms[2] ? { transform: ballTransforms[2] } : {}"
          ></div>
        </div>
      </div>

      <div class="grid-row">
        <div class="grid-cell" :class="{ flashing: isFlashing(3) }"></div>
        <div class="grid-cell" :class="{ flashing: isFlashing(4) }">
          <!-- 目標點標記 -->
          <div class="target-point" v-if="!props.isOriginal"></div>
        </div>
        <div class="grid-cell" :class="{ flashing: isFlashing(5) }"></div>
      </div>

      <div class="grid-row">
        <div class="grid-cell" :class="{ flashing: isFlashing(6) }">
          <div
            class="ball corner-ball bottom-left"
            :class="{
              moving: isMoving(6),
              original: props.isOriginal,
              center: !props.isOriginal,
            }"
            :style="!props.isOriginal && ballTransforms[6] ? { transform: ballTransforms[6] } : {}"
          ></div>
        </div>
        <div class="grid-cell" :class="{ flashing: isFlashing(7) }"></div>
        <div class="grid-cell" :class="{ flashing: isFlashing(8) }">
          <div
            class="ball corner-ball bottom-right"
            :class="{
              moving: isMoving(8),
              original: props.isOriginal,
              center: !props.isOriginal,
            }"
            :style="!props.isOriginal && ballTransforms[8] ? { transform: ballTransforms[8] } : {}"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps<{
  isOriginal: boolean
}>()

// 閃爍格子
const flashingCells = [2, 4, 8]
// 四個角落
const cornerBalls = [0, 2, 6, 8]
const isAnimating = ref(false)
const ballTransforms = ref<Record<number, string>>({})

// 判斷格子是否閃爍
const isFlashing = (index: number): boolean => {
  return flashingCells.includes(index)
}
// 判斷球是否移動
const isMoving = (index: number): boolean => {
  return cornerBalls.includes(index) && isAnimating.value
}

// 計算球移動到中心的位置
const calculateBallPositions = () => {
  const gridWrapper = document.querySelector('.nine-square-wrapper') as HTMLElement
  const centerCell = document.querySelector(
    '.grid-row:nth-child(2) .grid-cell:nth-child(2)',
  ) as HTMLElement
  const balls = document.querySelectorAll('.corner-ball')

  if (!gridWrapper || !centerCell || balls.length === 0) return

  const centerRect = centerCell.getBoundingClientRect()
  const centerX = centerRect.left + centerRect.width / 2
  const centerY = centerRect.top + centerRect.height / 2

  console.log('Center position:', { centerX, centerY })

  balls.forEach((ball) => {
    const ballElement = ball as HTMLElement
    const ballRect = ballElement.getBoundingClientRect()
    const ballCurrentX = ballRect.left + ballRect.width / 2
    const ballCurrentY = ballRect.top + ballRect.height / 2

    const deltaX = centerX - ballCurrentX
    const deltaY = centerY - ballCurrentY

    // 根據球的類名確定索引
    let ballIndex = 0
    let ballName = ''
    if (ballElement.classList.contains('top-left')) {
      ballIndex = 0
      ballName = 'top-left'
    } else if (ballElement.classList.contains('top-right')) {
      ballIndex = 2
      ballName = 'top-right'
    } else if (ballElement.classList.contains('bottom-left')) {
      ballIndex = 6
      ballName = 'bottom-left'
    } else if (ballElement.classList.contains('bottom-right')) {
      ballIndex = 8
      ballName = 'bottom-right'
    }

    console.log(`${ballName} ball:`, {
      current: { x: ballCurrentX, y: ballCurrentY },
      delta: { x: deltaX, y: deltaY },
      transform: `translate(${deltaX}px, ${deltaY}px)`,
    })

    ballTransforms.value[ballIndex] = `translate(${deltaX}px, ${deltaY}px)`
  })
}

watch(
  () => props.isOriginal,
  async () => {
    if (!isAnimating.value) {
      isAnimating.value = true
    }

    // 如果切換到中心模式，計算位置
    if (!props.isOriginal) {
      await nextTick()
      setTimeout(() => {
        calculateBallPositions()
      }, 100)
    } else {
      // 切換回原始模式，清除 transform
      ballTransforms.value = {}
    }
  },
)

const startAnimation = () => {
  isAnimating.value = true
}
const stopAnimation = () => {
  isAnimating.value = false
}

onMounted(() => {
  // 延遲一秒後開始動畫
  setTimeout(() => {
    startAnimation()
    // 如果一開始就是中心模式，計算位置
    if (!props.isOriginal) {
      setTimeout(() => {
        calculateBallPositions()
      }, 100)
    }
  }, 1000)
})

onUnmounted(() => {
  stopAnimation()
})
</script>

<style lang="scss" scoped>
.nine-square-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  padding: 20px;
  box-sizing: border-box;
}

.nine-square-wrapper {
  display: flex;
  flex-direction: column;
  width: min(90vw, 90vh);
  height: min(90vw, 90vh);
  overflow: visible; // 確保球移動時不會被容器裁切
}

.grid-row {
  display: flex;
  flex: 1;

  &:not(:last-child) {
    margin-bottom: min(2vw, 20px);
  }
}

.grid-cell {
  flex: 1;
  border: black solid min(0.5vw, 4px);
  background: radial-gradient(circle, rgba(113, 81, 95, 1) 81%, rgba(0, 0, 0, 1) 100%);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible; // 確保球移動時不會被裁切

  &:not(:last-child) {
    margin-right: min(2vw, 20px);
  }

  position: relative;

  &.flashing::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.5); // 閃爍的顏色，可以調整
    z-index: 1; // 低於球的 z-index (100)
    animation: flash 2s ease-in-out infinite;
  }
}

.ball {
  width: min(4vw, 30px);
  height: min(4vw, 30px);
  background-color: #a5f12b;
  border-radius: 50%;
  position: absolute;
  z-index: 100; // 提高 z-index 確保球不會被遮蓋
  opacity: 1 !important; // 強制設定 opacity，不受父元素閃爍影響
  transition: transform 2s ease-in-out; // 統一 transition 時間

  // 原始動畫 - 向右移動
  &.corner-ball.moving.original {
    animation: moveRight 3s ease-in-out infinite;
    transition: none; // 原始動畫時不要 transition
    opacity: 1 !important; // 確保動畫時也不受影響
  }

  // 中心聚集動畫 - 使用 JavaScript 計算位置
  &.corner-ball.moving.center {
    transition: transform 2s ease-in-out;
    animation: none; // 中心模式時不要動畫
    opacity: 1 !important; // 確保移動時也不受影響
  }

  // 當動畫停止時，確保回到原位
  &.corner-ball:not(.moving) {
    transform: translate(0, 0);
    transition: transform 2s ease-in-out;
    opacity: 1 !important; // 確保停止時也不受影響
  }
}

// 目標點樣式
.target-point {
  width: 10px;
  height: 10px;
  background-color: yellow;
  border-radius: 50%;
  position: absolute;
  z-index: 5;
}

@keyframes flash {
  0%,
  100% {
    opacity: 0; /* 完全透明 */
  }
  50% {
    opacity: 0.5; /* 半透明，產生閃爍效果 */
  }
}

// 原始動畫 - 向右移動
@keyframes moveRight {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(calc(95vw / 3) * 2);
  }
  100% {
    transform: translateX(0);
  }
}

// JavaScript 控制球的位置，不再需要 CSS 動畫

@media (max-width: 768px) {
  .nine-square-container {
    padding: 10px;
  }

  .nine-square-wrapper {
    width: 95vw;
    height: 95vw;
  }

  .grid-row {
    &:not(:last-child) {
      margin-bottom: min(3vw, 15px);
    }
  }

  .grid-cell {
    border-width: min(1vw, 3px);

    &:not(:last-child) {
      margin-right: min(3vw, 15px);
    }
  }

  .ball {
    width: min(6vw, 25px);
    height: min(6vw, 25px);
  }

  // 手機版也使用 JavaScript 控制位置
}

@media (min-width: 1920px) {
  .nine-square-wrapper {
    max-width: 80vh;
    max-height: 80vh;
  }
}
</style>
