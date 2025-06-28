<template>
  <div class="nine-square-container">
    <div class="nine-square-wrapper">
      <div class="grid-row">
        <div class="grid-cell" :class="{ flashing: isFlashing(0) }">
          <div class="ball corner-ball" :class="{ moving: isMoving(0) }"></div>
        </div>
        <div class="grid-cell" :class="{ flashing: isFlashing(1) }"></div>
        <div class="grid-cell" :class="{ flashing: isFlashing(2) }">
          <div class="ball corner-ball" :class="{ moving: isMoving(2) }"></div>
        </div>
      </div>

      <div class="grid-row">
        <div class="grid-cell" :class="{ flashing: isFlashing(3) }"></div>
        <div class="grid-cell" :class="{ flashing: isFlashing(4) }"></div>
        <div class="grid-cell" :class="{ flashing: isFlashing(5) }"></div>
      </div>

      <div class="grid-row">
        <div class="grid-cell" :class="{ flashing: isFlashing(6) }">
          <div class="ball corner-ball" :class="{ moving: isMoving(6) }"></div>
        </div>
        <div class="grid-cell" :class="{ flashing: isFlashing(7) }"></div>
        <div class="grid-cell" :class="{ flashing: isFlashing(8) }">
          <div class="ball corner-ball" :class="{ moving: isMoving(8) }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 閃爍格子
const flashingCells = [2, 4, 8]

// 四個角落
const cornerBalls = [0, 2, 6, 8]

const isAnimating = ref(false)

// 判斷格子是否閃爍
const isFlashing = (index: number): boolean => {
  return flashingCells.includes(index)
}

// 判斷球是否移動
const isMoving = (index: number): boolean => {
  return cornerBalls.includes(index) && isAnimating.value
}

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

  &:not(:last-child) {
    margin-right: min(2vw, 20px);
  }

  &.flashing {
    animation: flash 2s ease-in-out infinite;
  }
}

.ball {
  width: min(4vw, 30px);
  height: min(4vw, 30px);
  background-color: #a5f12b;
  border-radius: 50%;
  position: absolute;
  z-index: 10;
  opacity: 1;

  &.corner-ball {
    &.moving {
      animation: moveRight 3s ease-in-out infinite;
    }
  }
}

@keyframes flash {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

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
}

@media (min-width: 1920px) {
  .nine-square-wrapper {
    max-width: 80vh;
    max-height: 80vh;
  }
}
</style>
