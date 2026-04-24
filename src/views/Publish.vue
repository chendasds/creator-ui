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
          <el-button @click="handleSaveDraft">保存草稿</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit(1)">
            发布文章
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, shallowRef, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import request from '@/api/request'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const submitting = ref(false)
const editorRef = shallowRef(null)

// 分类列表（从后端动态获取）
const categories = ref([])

const loadCategories = async () => {
  try {
    const res = await request.get('/category/list')
    if (res.code === 200) {
      categories.value = res.data
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

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

// 监听编辑器就绪后，再加载文章详情（彻底移除 setTimeout 硬编码延迟）
watch(editorRef, (editor) => {
  if (editor) {
    const artworkId = route.query.id
    if (artworkId) {
      loadArtworkDetail(artworkId)
    }
  }
})

onMounted(async () => {
  await Promise.all([fetchTags(), loadCategories()])

  const draftId = route.query.draftId
  if (draftId) {
    loadDraftDetail(draftId)
  }

  // 如果没有 articleId，无需等待编辑器，loadArtworkDetail 不会触发
})

const loadArtworkDetail = async (id) => {
  try {
    const res = await request.get(`/artwork/${id}`)
    const rawData = res.data || res
    const art = rawData.artwork || rawData
    
    if (art) {
      form.title = art.title || ''
      form.categoryId = art.categoryId || null
      form.coverUrl = art.coverUrl || ''
      form.description = art.description || ''
      if (rawData.tags) form.tagIds = rawData.tags.map(t => t.id)

      await nextTick()

      const contentHtml = art.content || ''

      if (editorRef.value) {
        try {
          await nextTick()
          editorRef.value.setHtml(contentHtml)
        } catch (slateErr) {
          console.warn('wangEditor 内部节点同步微调:', slateErr)
        }
      } else {
        form.content = contentHtml
      }
      
      ElMessage.success('数据回显成功')
    }
  } catch (error) {
    console.error('回填失败:', error)
  }
}

const loadDraftDetail = async (id) => {
  try {
    const res = await request.get(`/draft/${id}`)
    if (res.code === 200 && res.data) {
      const draft = res.data
      form.title = draft.title || ''
      form.content = draft.content || ''
      form.description = draft.description || ''
      form.categoryId = draft.categoryId || null
    }
  } catch (error) {
    console.error('获取草稿详情失败', error)
    ElMessage.error('草稿数据读取失败')
  }
}

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

// 保存草稿（独立草稿表）
const handleSaveDraft = async () => {
  if (!form.title) {
    ElMessage.warning('草稿至少需要填写一个标题哦！')
    return
  }
  
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    ElMessage.error('请先登录')
    return
  }
  const user = JSON.parse(userStr)

  const draftData = {
    id: route.query.draftId || null, 
    userId: user.id,
    title: form.title,
    content: form.content,
    description: form.description,
    categoryId: form.categoryId
  }

  try {
    const res = await request.post('/draft/save', draftData)
    if (res.code === 200) {
      ElMessage.success('草稿保存成功！')
      router.push('/creator/drafts')
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    console.error('保存草稿失败', error)
  }
}

// 提交表单
const handleSubmit = async (status) => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    // 富文本内容校验
    const plainText = (form.content || '').replace(/<[^>]+>/g, '').trim()
    if (!plainText) {
      ElMessage.error('请输入文章正文内容')
      return
    }

    submitting.value = true
    try {
      const isEdit = !!route.query.id
      const submitData = {
        title: form.title,
        categoryId: form.categoryId,
        tagIds: form.tagIds,
        coverUrl: form.coverUrl,
        description: form.description || plainText.slice(0, 200),
        content: form.content
      }

      const res = isEdit
        ? await request.put(`/artwork/update?id=${route.query.id}`, submitData)
        : await request.post('/artwork/publish', submitData)

      if (res.code === 200 || res.success === true) {
        const draftId = route.query.draftId
        if (draftId) {
          try {
            await request.delete(`/draft/${draftId}`)
          } catch (e) {
            console.error('清理已发布的草稿失败', e)
          }
        }
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
