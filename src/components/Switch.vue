<template>
  <div class="switch-container">
    <span class="switch-label">{{ props.text }}</span>
    <label class="switch">
      <input type="checkbox" :checked="props.modelValue" @change="handleToggle" />
      <span class="slider"></span>
    </label>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['update:modelValue'])

const props = defineProps<{
  text: string
  modelValue: boolean
}>()

const handleToggle = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<style lang="scss" scoped>
.switch-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.switch-label {
  font-weight: bold;
  font-size: 16px;
  letter-spacing: 1px;
  color: #333;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: '';
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
}

input:checked + .slider {
  background-color: #6d7fcc;
}

input:focus + .slider {
  box-shadow: 0 0 1px #6d7fcc;
}

input:checked + .slider:before {
  transform: translateX(26px);
}
</style>
