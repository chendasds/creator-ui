<template>
  <div class="settings-container">
    <el-card class="settings-card" shadow="never">
      <el-tabs tab-position="left" class="settings-tabs">
        <el-tab-pane label="修改密码">
          <div class="pane-content">
            <h3 class="pane-title">修改密码</h3>
            <el-form :model="pwdForm" :rules="pwdRules" ref="pwdFormRef" label-width="100px" class="settings-form">
              <el-form-item label="原密码" prop="oldPassword">
                <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="请输入当前密码"></el-input>
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="请输入新密码（不少于6位）"></el-input>
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="pwdForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitPwd" :loading="loading">确认修改</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="账号绑定">
          <div class="pane-content">
            <h3 class="pane-title">账号绑定</h3>
            <div class="bind-list">
              <div class="bind-item">
                <div class="bind-info">
                  <div class="bind-icon-wrapper email">
                    <el-icon><Message /></el-icon>
                  </div>
                  <div class="bind-text">
                    <div class="bind-name">绑定邮箱</div>
                    <div class="bind-desc">可用邮箱接收系统通知或找回密码</div>
                  </div>
                </div>
                <div class="bind-action">
                  <span class="bind-status unbind">未绑定</span>
                  <el-button type="primary" link>去绑定</el-button>
                </div>
              </div>
              
              <div class="bind-item">
                <div class="bind-info">
                  <div class="bind-icon-wrapper phone">
                    <el-icon><Iphone /></el-icon>
                  </div>
                  <div class="bind-text">
                    <div class="bind-name">绑定手机</div>
                    <div class="bind-desc">用于提升账号安全级别及快捷登录</div>
                  </div>
                </div>
                <div class="bind-action">
                  <span class="bind-status unbind">未绑定</span>
                  <el-button type="primary" link>去绑定</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="隐私设置">
          <div class="pane-content">
            <h3 class="pane-title">隐私设置</h3>
            <div class="privacy-list">
              <div class="privacy-item">
                <div class="privacy-text">
                  <div class="privacy-name">隐藏我的收藏</div>
                  <div class="privacy-desc">开启后，其他用户在你的个人主页将无法看到你的收藏列表</div>
                </div>
                <el-switch v-model="privacyForm.hideCollections" :active-value="1" :inactive-value="0" active-color="#409eff" @change="handlePrivacyChange" />
              </div>
              
              <el-divider border-style="dashed" />

              <div class="privacy-item">
                <div class="privacy-text">
                  <div class="privacy-name">不接收系统通知</div>
                  <div class="privacy-desc">开启后，将不再接收来自平台的推送消息（互动消息除外）</div>
                </div>
                <el-switch v-model="privacyForm.disableNotifications" :active-value="1" :inactive-value="0" active-color="#409eff" @change="handlePrivacyChange" />
              </div>

              <el-divider border-style="dashed" />

              <div class="privacy-item">
                <div class="privacy-text">
                  <div class="privacy-name">文章水印保护</div>
                  <div class="privacy-desc">开启后，你在平台发布的图片将自动打上你的专属作者水印</div>
                </div>
                <el-switch v-model="privacyForm.watermark" :active-value="1" :inactive-value="0" active-color="#409eff" @change="handlePrivacyChange" />
              </div>
            </div>
          </div>
        </el-tab-pane>

      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Message, Iphone } from '@element-plus/icons-vue'
import request from '@/api/request'

const router = useRouter()
const pwdFormRef = ref(null)
const loading = ref(false)

// 密码表单
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 隐私设置表单 (0/1 对应后端 Integer)
const privacyForm = reactive({
  hideCollections: 0,
  disableNotifications: 0,
  watermark: 1
})

// 获取用户设置
const fetchProfile = async () => {
  try {
    const res = await request.get('/user/profile')
    if (res.code === 200 && res.data) {
      privacyForm.hideCollections = res.data.hideCollections || 0
      privacyForm.disableNotifications = res.data.disableNotifications || 0
      privacyForm.watermark = res.data.watermark !== undefined ? res.data.watermark : 1
    }
  } catch (error) {
    console.error('获取设置失败', error)
  }
}

// 隐私设置变更自动保存
const handlePrivacyChange = async () => {
  try {
    const res = await request.put('/user/settings', {
      hideCollections: privacyForm.hideCollections,
      disableNotifications: privacyForm.disableNotifications,
      watermark: privacyForm.watermark
    })
    if (res.code === 200) {
      ElMessage.success('设置已自动保存')
    } else {
      ElMessage.error(res.message || '保存失败')
      fetchProfile()
    }
  } catch (error) {
    fetchProfile()
  }
}

onMounted(() => {
  fetchProfile()
})

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== pwdForm.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const pwdRules = reactive({
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [{ required: true, validator: validatePass2, trigger: 'blur' }]
})

const submitPwd = async () => {
  if (!pwdFormRef.value) return
  await pwdFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await request.put('/user/password', {
          oldPassword: pwdForm.oldPassword,
          newPassword: pwdForm.newPassword
        })
        if (res.code === 200) {
          ElMessageBox.alert('密码修改成功，请重新登录！', '提示', {
            confirmButtonText: '去登录',
            type: 'success',
            callback: () => {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              router.push('/login')
            }
          })
        } else {
          ElMessage.error(res.message || '修改失败')
        }
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.settings-container {
  max-width: 1000px;
  margin: 0 auto;
}
.settings-card {
  border-radius: 12px;
  min-height: 550px;
}
.settings-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  padding: 0 30px !important;
  height: 50px;
  line-height: 50px;
  text-align: left;
}
.pane-content {
  padding: 10px 40px;
}
.pane-title {
  margin-bottom: 30px;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}
.settings-form {
  max-width: 460px;
}

/* 账号绑定列表样式 */
.bind-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.bind-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
}
.bind-item:hover {
  background-color: #f0f2f5;
}
.bind-info {
  display: flex;
  align-items: center;
  gap: 16px;
}
.bind-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: #fff;
}
.bind-icon-wrapper.email {
  background: linear-gradient(135deg, #72ebd2 0%, #39d3ad 100%);
}
.bind-icon-wrapper.phone {
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
}
.bind-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}
.bind-desc {
  font-size: 13px;
  color: #909399;
}
.bind-action {
  display: flex;
  align-items: center;
  gap: 16px;
}
.bind-status {
  font-size: 14px;
}
.bind-status.unbind {
  color: #909399;
}

/* 隐私设置列表样式 */
.privacy-list {
  max-width: 600px;
}
.privacy-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}
.privacy-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 6px;
}
.privacy-desc {
  font-size: 13px;
  color: #909399;
}
</style>