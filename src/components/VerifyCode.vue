<template>
  <canvas
    ref="canvasRef"
    class="verify-code-canvas"
    :width="canvasWidth"
    :height="canvasHeight"
    @click="refreshCode"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Props
const props = defineProps({
  width: {
    type: Number,
    default: 120
  },
  height: {
    type: Number,
    default: 44
  },
  codeLength: {
    type: Number,
    default: 4
  }
})

// Emits
const emit = defineEmits(['update:code'])

// Refs
const canvasRef = ref(null)
const canvasWidth = ref(props.width)
const canvasHeight = ref(props.height)

// 生成随机验证码
const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''

  for (let i = 0; i < props.codeLength; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return code
}

// 绘制干扰线
const drawInterferenceLines = (ctx, width, height) => {
  const lineCount = Math.floor(Math.random() * 3) + 2 // 2-4条干扰线

  for (let i = 0; i < lineCount; i++) {
    ctx.beginPath()
    ctx.strokeStyle = `rgba(${Math.random() * 180 + 60}, ${Math.random() * 180 + 60}, ${Math.random() * 180 + 60}, ${Math.random() * 0.5 + 0.3})`
    ctx.lineWidth = Math.random() * 1.5 + 0.5

    // 随机起点和终点
    const startX = Math.random() * width
    const startY = Math.random() * height
    const endX = Math.random() * width
    const endY = Math.random() * height

    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()
  }
}

// 绘制干扰点
const drawInterferenceDots = (ctx, width, height) => {
  const dotCount = Math.floor(Math.random() * 30) + 20 // 20-50个点

  for (let i = 0; i < dotCount; i++) {
    ctx.beginPath()
    ctx.fillStyle = `rgba(${Math.random() * 180 + 60}, ${Math.random() * 180 + 60}, ${Math.random() * 180 + 60}, ${Math.random() * 0.4 + 0.2})`
    ctx.arc(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 1.5 + 0.5,
      0,
      2 * Math.PI
    )
    ctx.fill()
  }
}

// 绘制验证码
const drawCode = (code) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')

  // 清空画布
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

  // 绘制背景
  ctx.fillStyle = '#FAFAFA'
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)

  // 绘制干扰线和点
  drawInterferenceLines(ctx, canvasWidth.value, canvasHeight.value)
  drawInterferenceDots(ctx, canvasWidth.value, canvasHeight.value)

  // 绘制验证码文字
  const fontSize = Math.min(canvasHeight.value * 0.5, 28)
  ctx.font = `bold ${fontSize}px "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

  const charWidth = canvasWidth.value / (code.length + 0.5)
  const startX = charWidth * 0.5

  for (let i = 0; i < code.length; i++) {
    // 随机旋转角度 (-30° 到 30°)
    const angle = (Math.random() - 0.5) * 0.6
    const charX = startX + i * charWidth + (Math.random() - 0.3) * 10
    const charY = canvasHeight.value * 0.65 + (Math.random() - 0.5) * 15

    ctx.save()
    ctx.translate(charX, charY)
    ctx.rotate(angle)

    // 随机颜色 (灰黑色系)
    const grayValue = Math.floor(Math.random() * 60 + 40)
    ctx.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`

    ctx.fillText(code[i], 0, 0)
    ctx.restore()
  }

  // 绘制边框
  ctx.strokeStyle = '#EAEAEA'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, canvasWidth.value - 1, canvasHeight.value - 1)
}

// 刷新验证码
const refreshCode = () => {
  const code = generateCode()
  drawCode(code)
  emit('update:code', code)
  return code
}

// 获取当前验证码
const getCurrentCode = () => {
  return currentCode.value
}

// 当前验证码
const currentCode = ref('')

// 初始化
onMounted(() => {
  refreshCode()
})

// 暴露方法给父组件
defineExpose({
  refresh: refreshCode,
  getCode: getCurrentCode
})
</script>

<style scoped>
.verify-code-canvas {
  display: block;
  cursor: pointer;
  border-radius: 8px;
  transition: opacity 0.2s ease;
}

.verify-code-canvas:hover {
  opacity: 0.85;
}
</style>
