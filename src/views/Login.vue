<template>
  <div class="login-container">
    <div class="login-card">
      <div class="card-header">
        <h2>系统登录</h2>
      </div>

      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="登录" name="login">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-position="top"
            size="large"
          >
            <div class="form-content">
              <el-form-item label="账号" prop="username" class="form-item">
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入账号"
                  :prefix-icon="User"
                />
              </el-form-item>
              <el-form-item label="密码" prop="password" class="form-item">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
              <el-form-item label="验证码" prop="verifyCode" class="form-item">
                <div class="verify-code-wrapper">
                  <el-input
                    v-model="loginForm.verifyCode"
                    placeholder="请输入验证码"
                    class="verify-code-input"
                    @keyup.enter="handleLogin"
                  />
                  <VerifyCode
                    ref="loginVerifyCodeRef"
                    class="verify-code-img"
                    :width="120"
                    :height="44"
                    @update:code="handleLoginCodeUpdate"
                  />
                </div>
              </el-form-item>
              <el-form-item>
                <el-button
                  class="submit-btn"
                  :loading="loading"
                  @click="handleLogin"
                >
                  登录
                </el-button>
              </el-form-item>
            </div>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="注册" name="register">
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            label-position="top"
            size="large"
          >
            <div class="form-content">
              <el-form-item label="账号" prop="username" class="form-item">
                <el-input
                  v-model="registerForm.username"
                  placeholder="请输入账号"
                  :prefix-icon="User"
                />
              </el-form-item>
              <el-form-item label="密码" prop="password" class="form-item">
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="请输入密码"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword" class="form-item">
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
              <el-form-item label="验证码" prop="verifyCode" class="form-item">
                <div class="verify-code-wrapper">
                  <el-input
                    v-model="registerForm.verifyCode"
                    placeholder="请输入验证码"
                    class="verify-code-input"
                    @keyup.enter="handleRegister"
                  />
                  <VerifyCode
                    ref="registerVerifyCodeRef"
                    class="verify-code-img"
                    :width="120"
                    :height="44"
                    @update:code="handleRegisterCodeUpdate"
                  />
                </div>
              </el-form-item>
              <el-form-item>
                <el-button
                  class="submit-btn"
                  :loading="loading"
                  @click="handleRegister"
                >
                  注册
                </el-button>
              </el-form-item>
            </div>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import VerifyCode from '@/components/VerifyCode.vue'
import request from '@/api/request'

const router = useRouter()
const activeTab = ref('login')
const loading = ref(false)
const loginFormRef = ref(null)
const registerFormRef = ref(null)
const loginVerifyCodeRef = ref(null)
const registerVerifyCodeRef = ref(null)

// 当前验证码
const loginCurrentCode = ref('')
const registerCurrentCode = ref('')

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  verifyCode: ''
})

// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  verifyCode: ''
})

// 验证码更新回调
const handleLoginCodeUpdate = (code) => {
  loginCurrentCode.value = code
}

const handleRegisterCodeUpdate = (code) => {
  registerCurrentCode.value = code
}

// 切换 Tab 时重置验证码
const handleTabChange = () => {
  loginForm.verifyCode = ''
  registerForm.verifyCode = ''
}

// 验证验证码
const validateVerifyCode = (formName) => {
  if (formName === 'login') {
    if (!loginForm.verifyCode) {
      ElMessage.error('请输入验证码')
      return false
    }
    if (loginForm.verifyCode.toLowerCase() !== loginCurrentCode.value.toLowerCase()) {
      ElMessage.error('验证码错误')
      loginVerifyCodeRef.value?.refresh()
      loginForm.verifyCode = ''
      return false
    }
  } else {
    if (!registerForm.verifyCode) {
      ElMessage.error('请输入验证码')
      return false
    }
    if (registerForm.verifyCode.toLowerCase() !== registerCurrentCode.value.toLowerCase()) {
      ElMessage.error('验证码错误')
      registerVerifyCodeRef.value?.refresh()
      registerForm.verifyCode = ''
      return false
    }
  }
  return true
}

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const loginRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  verifyCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const registerRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  verifyCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      // 验证验证码
      if (!validateVerifyCode('login')) {
        return
      }

      loading.value = true
      try {
        const res = await request.post('/user/login', loginForm)
        console.log('登录响应:', res)

        const userInfo = res.data?.user || res.user
        const token = res.data?.token || res.token

        if (res.success || res.code === 200 || res.code === 0) {
          ElMessage.success(res.message || '登录成功')

          if (userInfo) {
            localStorage.setItem('user', JSON.stringify(userInfo))
          }

          if (token) {
            localStorage.setItem('token', token)
          } else {
            console.warn('⚠️ 警告：后端返回的数据中没有找到 token 字段！请检查后端接口。')
          }

          router.push('/home')
        } else {
          ElMessage.error(res.message || '登录失败')
        }
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      // 验证验证码
      if (!validateVerifyCode('register')) {
        return
      }

      loading.value = true
      try {
        const { confirmPassword, verifyCode, ...registerData } = registerForm
        const res = await request.post('/user/register', registerData)
        if (res.success) {
          ElMessage.success(res.message || '注册成功，请登录')
          activeTab.value = 'login'
          loginForm.username = registerForm.username
          loginForm.password = ''
          loginForm.verifyCode = ''
          registerForm.username = ''
          registerForm.password = ''
          registerForm.confirmPassword = ''
          registerForm.verifyCode = ''
          // 注册成功后刷新验证码
          registerVerifyCodeRef.value?.refresh()
        } else {
          ElMessage.error(res.message || '注册失败')
        }
      } catch (error) {
        console.error('注册失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #FAFAFA;
}

.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border: 1px solid #EAEAEA;
  border-radius: 16px;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 520px;
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
  flex-shrink: 0;
}

.card-header h2 {
  margin: 0;
  color: #000;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.login-tabs {
  margin-top: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 表单内容 */
.form-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  padding: 20px 0;
}

/* 验证码容器 */
.verify-code-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.verify-code-input {
  flex: 1;
}

.verify-code-img {
  flex-shrink: 0;
  border-radius: 8px;
}

.form-item :deep(.el-form-item__label) {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.form-item :deep(.el-input__wrapper) {
  padding: 0;
  box-shadow: none;
  border: 1px solid #EAEAEA;
  border-radius: 8px;
  background: #fff;
  transition: all 0.2s ease;
}

.form-item :deep(.el-input__wrapper:hover) {
  border-color: #D1D1D1;
}

.form-item :deep(.el-input__wrapper.is-focus) {
  border-color: #000;
}

.form-item :deep(.el-input__inner) {
  height: 44px;
  font-size: 14px;
  color: #333;
}

.form-item :deep(.el-input__inner::placeholder) {
  color: #AAA;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 44px;
  margin-top: 24px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: #000;
  border-color: #000;
  border-radius: 8px;
  color: #fff;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  border-color: rgba(0, 0, 0, 0.8);
}

.submit-btn:active {
  background: rgba(0, 0, 0, 0.9);
}

/* Tab 样式优化 */
.login-tabs :deep(.el-tabs__header) {
  margin: 0;
  border-bottom: 1px solid #EAEAEA;
  flex-shrink: 0;
}

.login-tabs :deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.2s ease;
}

.login-tabs :deep(.el-tabs__item:hover) {
  color: #000;
}

.login-tabs :deep(.el-tabs__item.is-active) {
  color: #000;
  font-weight: 600;
}

.login-tabs :deep(.el-tabs__active-bar) {
  background-color: #000;
  height: 2px;
}

.login-tabs :deep(.el-tabs__content) {
  flex: 1;
}

.login-tabs :deep(.el-tab-pane) {
  height: 100%;
  display: flex;
}

.login-tabs :deep(.el-form) {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
