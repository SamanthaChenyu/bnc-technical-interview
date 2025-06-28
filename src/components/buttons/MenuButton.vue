<template>
  <div id="menuToggle">
    <input id="checkbox" type="checkbox" v-model="modelValue" />
    <label class="toggle" for="checkbox">
      <div class="bar bar--top"></div>
      <div class="bar bar--middle"></div>
      <div class="bar bar--bottom"></div>
    </label>
  </div>
</template>

<script setup lang="ts">
// vue3 的 v-model 寫法
const modelValue = defineModel<boolean>({ required: true })
</script>

<style lang="scss" scoped>
#checkbox {
  display: none;
  &:checked + .toggle .bar--top {
    bottom: calc(50% - 6px - 4px);
    margin-bottom: calc(6px + 4px / 2);
    transform: rotate(45deg);
    transition-delay: calc(0s + 0.35s * 0.3), calc(0s + 0.35s * 1.3), calc(0s + 0.35s * 1.3);
  }
  &:checked + .toggle .bar--middle {
    top: calc(50% + 6px);
    opacity: 0;
    transition-duration: 0.35s, 0s;
    transition-delay: 0s, calc(0s + 0.35s);
  }
  &:checked + .toggle .bar--bottom {
    top: calc(50% - 4px / 2);
    transform: rotate(-45deg);
    transition-delay: calc(0s + 0.35s * 1.3), calc(0s + 0.35s * 1.3);
  }
}

.toggle {
  position: relative;
  width: 27px;
  cursor: pointer;
  margin: auto;
  display: block;
  height: calc(4px * 3 + 12px);
}

.bar {
  position: absolute;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: calc(4px / 2);
  background: #222;
  color: inherit;
  opacity: 1;
  transition: none 0.35s cubic-bezier(0.5, -0.35, 0.35, 1.5) 0s;
}

/***** Collapse Animation *****/

.bar--top {
  bottom: calc(50% + 8px);
  transition-property: bottom, margin, transform;
  transition-delay: calc(0s + 0.35s), 0s, 0s;
}

.bar--middle {
  top: calc(50% - 4px / 2);
  transition-property: top, opacity;
  transition-duration: 0.35s, 0s;
  transition-delay: calc(0s + 0.35s * 1.3), calc(0s + 0.35s * 1.3);
}

.bar--bottom {
  top: calc(50% + 8px);
  transition-property: top, transform;
  transition-delay: 0s;
}

@media (max-width: 1200px) {
  .toggle {
    width: 24px;
  }
  .bar {
    height: 3px;
  }
  #checkbox {
    &:checked + .toggle .bar--bottom {
      top: calc(50% - 1px);
      transform: rotate(-45deg);
      transition-delay: calc(0s + 0.35s * 1.3), calc(0s + 0.35s * 1.3);
    }
  }
}
</style>
