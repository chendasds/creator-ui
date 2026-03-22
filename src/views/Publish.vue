<template>
  <div class="publish-container">
    <div class="publish-content">
      <h1 class="page-title">发布文章</h1>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="publish-form"
      >
        <!-- 标题 -->
        <el-form-item label="文章标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入文章标题"
            size="large"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <!-- 分类 -->
        <el-form-item label="文章分类" prop="categoryId">
          <el-select
            v-model="form.categoryId"
            placeholder="请选择分类"
            size="large"
            style="width: 100%"
          >
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <!-- 标签 -->
        <el-form-item label="文章标签" prop="tagIds">
          <el-select
            v-model="form.tagIds"
            multiple
            placeholder="请选择文章标签（可多选）"
            style="width: 100%"
          >
            <el-option
              v-for="tag in tagList"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            />
          </el-select>
        </el-form-item>

        <!-- 封面图 -->
        <el-form-item label="封面图片" prop="coverUrl">
          <el-upload
            class="cover-uploader"
            action="#"
            :http-request="customUpload"
            :show-file-list="false"
            accept="image/*"
          >
            <img v-if="form.coverUrl" :src="form.coverUrl" class="cover-preview" />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div style="font-size: 12px; color: #909399; margin-top: 8px; line-height: 1.2;">
            点击上方区域上传本地图片。推荐尺寸 16:9，支持 jpg/png 格式。
          </div>
        </el-form-item>

        <!-- 摘要 -->
        <el-form-item label="文章摘要" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入文章摘要（可选）"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <!-- 正文 -->
        <el-form-item label="文章正文" prop="content">
          <div class="editor-wrapper">
            <Toolbar
              :editor="editorRef"
              :default-config="toolbarConfig"
              mode="default"
              class="editor-toolbar"
            />
            <Editor
              v-model="form.content"
              :default-config="editorConfig"
              mode="default"
              class="editor-content"
              @on-change="handleEditorChange"
              @on-created="handleEditorCreated"
            />
          </div>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item class="form-actions">
          <el-button @click="router.push('/')">取消</el-button>
          <el-button @click="handleSubmit(0)">保存草稿</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit(1)">
            发布文章
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import request from '@/api/request'

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const editorRef = shallowRef(null)

// 分类选项（与后端数据库对应）
const categories = ref([
  { id: 1, name: '文学创作' },
  { id: 2, name: '技术文档' },
  { id: 3, name: '生活随笔' },
  { id: 4, name: '学习笔记' }
])

// 标签列表（真实 API）
const tagList = ref([])

// 表单数据
const form = reactive({
  title: '',
  categoryId: null,
  tagIds: [],
  coverUrl: '',
  description: '',
  content: ''
})

/**
 * 本地上传封面
 */
const customUpload = async (options) => {
  const formData = new FormData()
  formData.append('file', options.file)

  try {
    const res = await request.post('/file/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (res.code === 200) {
      form.coverUrl = res.data
      ElMessage.success('封面上传成功')
    } else {
      ElMessage.error(res.message || '上传失败')
    }
  } catch (error) {
    console.error('上传出错:', error)
    ElMessage.error('上传出错，请检查网络或后端服务')
  }
}

/**
 * 获取标签列表
 */
const fetchTags = async () => {
  try {
    const res = await request.get('/tag/list')
    if (res.code === 200 && res.data) {
      tagList.value = res.data || []
    } else if (Array.isArray(res)) {
      tagList.value = res
    }
  } catch (error) {
    console.error('获取标签列表失败:', error)
  }
}

// 表单校验规则
const rules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择文章分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入文章正文', trigger: 'blur' }
  ]
}

// 编辑器配置
const toolbarConfig = {
  excludeKeys: ['group-video'] // 排除视频上传
}

const editorConfig = {
  placeholder: '在这里开始书写你的文章...',
  MENU_CONF: {
    uploadImage: {
      maxFileSize: 10 * 1024 * 1024,
      async customUpload(file, insertFn) {
        const formData = new FormData()
        formData.append('file', file)
        try {
          const res = await request.post('/file/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          if (res.code === 200) {
            insertFn(res.data)
          } else {
            ElMessage.error(res.message || '图片上传失败')
          }
        } catch (error) {
          console.error('上传异常:', error)
          ElMessage.error('图片上传异常')
        }
      },
      onError(file, err, res) {
        console.error('上传出错', err, res)
        ElMessage.error(`${file.name} 上传失败`)
      }
    }
  }
}

// 编辑器回调
const handleEditorCreated = (editor) => {
  editorRef.value = editor
}

onMounted(() => {
  fetchTags()
})

const handleEditorChange = (editor) => {
  form.content = editor.getHtml()
}

// 预览封面
const previewCover = () => {
  if (form.coverUrl) {
    window.open(form.coverUrl, '_blank')
  }
}

// 封面加载失败处理
const handleCoverError = () => {
  ElMessage.error('封面图片加载失败')
  form.coverUrl = ''
}

// 提交表单
const handleSubmit = async (status) => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    // 富文本内容校验
    const plainText = form.content.replace(/<[^>]+>/g, '').trim()
    if (!plainText) {
      ElMessage.error('请输入文章正文内容')
      return
    }

    submitting.value = true
    try {
      const res = await request.post('/artwork/publish', {
        title: form.title,
        categoryId: form.categoryId,
        tagIds: form.tagIds,
        coverUrl: form.coverUrl,
        description: form.description || plainText.slice(0, 200),
        content: form.content,
        status
      })

      if (res.code === 200 || res.success === true) {
        ElMessage.success(status === 1 ? '文章发布成功' : '草稿保存成功')
        router.push('/')
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error('提交失败，请重试')
    } finally {
      submitting.value = false
    }
  })
}

// 销毁编辑器
onBeforeUnmount(() => {
  if (editorRef.value) {
    editorRef.value.destroy()
  }
})
</script>

<style scoped>
.publish-container {
  min-height: calc(100vh - 108px);
  padding: 32px 0;
}

.publish-content {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  padding: 32px 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 32px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;
}

.publish-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
  padding-bottom: 8px !important;
}

.publish-form :deep(.el-input__wrapper) {
  padding: 12px 16px;
}

.publish-form :deep(.el-input__inner) {
  font-size: 16px;
}

.publish-form :deep(.el-textarea__inner) {
  font-size: 15px;
  resize: vertical;
}

/* 封面上传 */
.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 320px;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
  transition: border-color 0.3s;
}

.cover-uploader:hover {
  border-color: #409eff;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 编辑器样式 */
.editor-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.editor-wrapper:hover,
.editor-wrapper:focus-within {
  border-color: #409eff;
}

.editor-toolbar {
  border-bottom: 1px solid #f0f2f5;
  background: #fafafa;
}

.editor-content {
  min-height: 400px;
}

.editor-content :deep(.w-e-text-container) {
  min-height: 400px;
}

.editor-content :deep(.w-e-panel-container) {
  z-index: 1000;
}

/* 操作按钮 */
.form-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f2f5;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-actions :deep(.el-form-item__content) {
  justify-content: flex-end;
}
</style>
