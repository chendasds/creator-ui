# 创作平台前端代码深度审查报告

**审查日期**：2026-03-26  
**审查范围**：`src/` 目录下所有 Vue 组件、路由、API 请求封装  
**技术栈**：Vue 3 + Vite + Element Plus + Axios + Pinia

---

## 一、🚨 前端安全与鉴权漏洞 (Security & Auth Risks)

### 1.1 路由守卫检查

| 文件 | 行号 | 问题 | 风险等级 |
|------|------|------|----------|
| `src/router/index.js` | 120-162 | `router.beforeEach` 已完整实现登录拦截 + 管理员越权拦截（`role !== 2`），逻辑正确 | ✅ 无 |
| `src/router/index.js` | 41-63 | `/creator` 和 `/publish` 路由**未配置权限校验**，任何登录用户均可访问 | ⚠️ 中 |
| `src/router/index.js` | 66-76 | `/message`、`/chat` 路由未配置权限校验 | ⚠️ 中 |

**建议**：对 `/creator/*`、`/publish`、`/message`、`/chat` 等需要登录但对角色无特殊要求的路由，路由守卫已通过基础登录校验，无需额外处理。但若将来需要区分"创作者"与"普通用户"，需在 `user.role` 中增加 `role === 3` 的判断。

---

### 1.2 XSS 与数据安全

| 文件 | 行号 | 问题 | 风险等级 |
|------|------|------|----------|
| `src/views/ArtworkDetail.vue` | 59 | `<div class="article-content" v-html="artwork.content">` 直接渲染后端返回的富文本内容，存在 XSS 注入风险 | 🔴 高 |
| `src/views/ChatView.vue` | 58 | `<div class="msg-bubble">{{ msg.content }}</div>` 使用插值表达式，安全 | ✅ |
| `src/api/request.js` | 54-65 | `error.response?.data?.message` 防御性取值，逻辑正确 | ✅ |

**建议**：

- 对 `ArtworkDetail.vue` 中的富文本内容，在渲染前进行 HTML 过滤（推荐使用 `DOMPurify` 库），或在后端对富文本内容进行 XSS 过滤。
- localStorage 中存储了 `user` 和 `token`，这是业界常见做法，但建议在后端实现短期 Token + RefreshToken 机制，降低 Token 泄露后的窗口期风险。

---

### 1.3 敏感信息存储

| 存储项 | 内容 | 风险评估 |
|--------|------|----------|
| `localStorage.token` | JWT Token | ⚠️ 中等 — 建议 HTTPS 传输、设置 HttpOnly Cookie（后端配合） |
| `localStorage.user` | 用户信息 JSON（含 id, username, role 等） | ⚠️ 中等 — 明文存储，用户可随意篡改 role 字段越权 |
| `localStorage.user` | 若含 `password` 字段则**风险极高** | 🔴 高 |

**发现**：`src/views/Login.vue` 仅存储 `userInfo`（不含密码），未存储密码，安全 ✅

---

## 二、🐛 交互逻辑盲区与边界情况 (Logic Flaws & Edge Cases)

### 2.1 状态同步与内存泄漏

| 文件 | 行号 | 问题 | 风险等级 |
|------|------|------|----------|
| `src/layout/FrontLayout.vue` | 198-206 | `window.addEventListener` 已正确在 `onUnmounted` 中清理，**无内存泄漏** | ✅ |
| `src/views/ChatView.vue` | 233-235 | `pollTimer`（`setInterval`）已正确在 `onUnmounted` 中清理 | ✅ |
| `src/views/MessageView.vue` | 152-162 | **未使用 `onUnmounted`** 清理任何监听器，依赖组件销毁自动清理（Vue 3 自动清理，但建议显式清理） | ⚠️ 低 |

**详细说明**：`MessageView.vue` 中使用了 `window.dispatchEvent` 发送事件，但未在组件卸载时显式 `removeEventListener`。Vue 3 的 `<script setup>` 在组件卸载时会自动清理事件监听器，但这依赖于浏览器的垃圾回收机制，建议显式清理以确保健壮性。

---

### 2.2 异常处理

| 文件 | 行号 | 问题 | 风险等级 |
|------|------|------|----------|
| `src/api/request.js` | 52-65 | 全局响应拦截器已处理 401 状态码并自动跳转登录页 | ✅ |
| `src/api/request.js` | 61-63 | 非 401 错误也做了 `ElMessage.error` 提示和 `Promise.reject` | ✅ |
| `src/views/Publish.vue` | 173-176 | `customUpload` 异常处理完整，有 `try-catch` + `ElMessage.error` | ✅ |
| `src/views/admin/Tag.vue` | 122-126 | `loadData` 的 `catch` 块只有 `console.error`，**缺少用户提示** | ⚠️ 中 |
| `src/views/admin/Comment.vue` | 65-75 | 同上，缺少用户提示 | ⚠️ 中 |
| `src/views/HomeView.vue` | 302-311 | `fetchArticles` 异常只打日志，`articleList` 清空后页面显示"暂无作品"，用户体验尚可 | ⚠️ 低 |

**关键问题**：`Tag.vue` 和 `Comment.vue` 的 `loadData` 方法在网络异常时没有给用户任何 UI 反馈，页面会一直处于 loading 状态。

---

### 2.3 边界 UI

| 文件 | 行号 | 问题 | 风险等级 |
|------|------|------|----------|
| `src/views/HomeView.vue` | 50 | `articleList.length === 0` 时显示 `el-empty`，有友好缺省提示 | ✅ |
| `src/views/MessageView.vue` | 14 | 消息列表为空时显示 `el-empty` | ✅ |
| `src/views/HomeView.vue` | 511-523 | 文章标题使用 `-webkit-line-clamp: 2` 截断，长文本不会导致布局崩塌 | ✅ |
| `src/views/ArtworkDetail.vue` | 854-858 | 评论内容使用 `text-truncate` + `-webkit-line-clamp: 4`，安全 | ✅ |
| `src/views/ChatView.vue` | 384-393 | 消息气泡使用 `word-break: break-word`，长文本安全换行 | ✅ |
| `src/views/Publish.vue` | 136-141 | **硬编码分类数据**，若后端分类表有变更，前端需手动同步 | ⚠️ 中 |
| `src/views/admin/Comment.vue` | 68-75 | `loadData` 失败时 `loading` 可能不会关闭（若请求抛出异常），导致 UI 死锁 | 🔴 高 |

---

## 三、💩 代码规范与组件设计 (Code Smells & Maintainability)

### 3.1 魔法字符串与魔法数字

| 文件 | 行号 | 魔法值 | 建议常量命名 |
|------|------|--------|--------------|
| `src/router/index.js` | 146 | `user.role !== 2` | `USER_ROLE.ADMIN = 2` |
| `src/views/Publish.vue` | 137-140 | `{ id: 1, name: '文学创作' }` 等 | 从 API `/category/list` 动态获取 |
| `src/views/user/User.vue` | 37 | `:active-value="2"` / `:inactive-value="1"` | `USER_ROLE.ADMIN` / `USER_ROLE.NORMAL` |
| `src/views/ArtworkDetail.vue` | 1,2 | `interactionType: 1` (点赞) / `2` (收藏) | `INTERACTION_TYPE.LIKE = 1` |
| `src/views/HomeView.vue` | 393 | `fetchUserStats` 在无 token 时静默失败 | 应给出提示或跳转登录 |
| `src/views/MessageView.vue` | 81-89 | `type: 1,2,3,4,5` 硬编码 | `NOTIFICATION_TYPE` 常量对象 |

---

### 3.2 重复代码与组件抽取

| 重复模式 | 出现位置 | 抽取建议 |
|----------|----------|----------|
| 分页组件 | `Tag.vue`、`Comment.vue`、`User.vue`、`Artwork.vue`、`Announcement.vue` | 抽取为 `<CommonPagination>` 组件 |
| 上传逻辑 | `Publish.vue:159-177`（封面上传）、`Publish.vue:219-234`（富文本图片上传） | 抽取为 `useUpload` Composable |
| 表格加载状态 | 多个管理页面 | 抽取为 `<LoadingTable>` 组件 |
| localStorage 读取 user | 所有组件 | 抽取为 `useAuth()` Composable，统一 user 解析逻辑 |
| 时间格式化 | `HomeView.vue`、`MessageView.vue`、`ChatView.vue` 各自实现 | 抽取为 `useFormatTime()` Composable |

---

### 3.3 组件大小评估

| 组件 | 行数 | 评估 |
|------|------|------|
| `src/views/Publish.vue` | 554 行 | ⚠️ 较大 — 包含编辑器配置、上传逻辑、草稿保存，逻辑较多但职责尚可接受 |
| `src/views/ArtworkDetail.vue` | 956 行 | 🔴 过大 — 详情展示 + 评论系统（嵌套评论）建议拆分为 `ArtworkContent.vue` + `CommentSection.vue` |
| `src/views/HomeView.vue` | 450 行 | ⚠️ 中等 — 列表 + 侧边栏，尚可接受 |
| `src/views/ChatView.vue` | 237 行 | ⚠️ 中等 — 私信逻辑，建议抽取 `useChat()` Composable |
| `src/views/admin/*` | 各 60-250 行 | ✅ 合理 |

---

## 四、⚡ 性能瓶颈隐患 (Performance Bottlenecks)

### 4.1 路由懒加载

| 文件 | 行号 | 状态 |
|------|------|------|
| `src/router/index.js` | 全文 | **所有路由均使用 `() => import(...)` 懒加载** ✅ |

---

### 4.2 列表渲染 Key 绑定

| 文件 | 行号 | `:key` 绑定 | 评估 |
|------|------|-------------|------|
| `src/views/HomeView.vue` | 54 | `:key="item.id"` | ✅ 正确 — 使用唯一 ID |
| `src/views/ArtworkDetail.vue` | 112 | `:key="comment.id"` | ✅ 正确 |
| `src/views/admin/Tag.vue` | 17 | `:key="scope.$index"` 或 `:key="item.id"`（el-table 默认） | ✅ el-table 自动处理 |
| `src/views/ChatView.vue` | 44 | `:key="msg.id"` | ✅ 正确 |
| `src/views/MessageView.vue` | 19 | `:key="item.id"` | ✅ 正确 |
| `src/layout/FrontLayout.vue` | 43-50 | Dropdown-menu 使用默认 key | ✅ |

---

### 4.3 其他性能问题

| 文件 | 行号 | 问题 | 影响 |
|------|------|------|------|
| `src/views/HomeView.vue` | 377-391 | `watch(() => route.query, ...)` 深度监听，每次路由变化触发 4 个 API 请求 | ⚠️ 中 — 可考虑合并请求或添加防抖 |
| `src/views/ChatView.vue` | 198-206 | 3 秒轮询获取聊天记录，在多标签页场景下会并发轮询 | ⚠️ 中 — 建议改为 WebSocket 推送 |
| `src/layout/FrontLayout.vue` | 196-200 | 页面加载时并发请求未读数和私信未读数（2 个请求） | ⚠️ 低 — 可合并为 1 个接口 |
| `src/views/HomeView.vue` | 50-126 | 文章列表有分页，但标签和分类数据每次 `onMounted` 都重新请求 | ⚠️ 低 — 可考虑缓存 |
| `src/views/Publish.vue` | 249-263 | `onMounted` 中使用 `setTimeout` 等待 300ms 回显数据 | 🔴 高 — 硬编码延迟不可靠，应使用 `watch` + `nextTick` |

---

## 五、💡 架构演进与完善建议 (Actionable Recommendations)

### 5.1 安全加固

**优先级：🔴 高 — 立即处理**

```javascript
// 1. ArtworkDetail.vue — 富文本 XSS 过滤
// 安装：npm install dompurify
import DOMPurify from 'dompurify'

// 在渲染时：
<div class="article-content" v-html="sanitizedContent"></div>

// script 中：
import { computed } from 'vue'
const sanitizedContent = computed(() => {
  return DOMPurify.sanitize(artwork.value.content, {
    ALLOWED_TAGS: ['p', 'br', 'h1', 'h2', 'h3', 'img', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class']
  })
})
```

```javascript
// 2. localStorage user 篡改防护 — 在路由守卫中增加签名验证（后端配合）
// 前端不应信任 localStorage 中的 role 值，应每次从后端 /user/me 接口获取最新角色
```

---

### 5.2 异常处理修复

**优先级：🔴 高**

```javascript
// src/views/admin/Tag.vue — loadData 修复
const loadData = async () => {
  loading.value = true
  try {
    const res = await request.get('/tag/page', { params: queryParams.value })
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('加载数据失败，请刷新重试')
    console.error('获取标签列表失败', error)
  } finally {
    loading.value = false // 确保 loading 状态关闭
  }
}
```

---

### 5.3 组件抽取建议

**优先级：⚠️ 中**

```javascript
// src/composables/useAuth.js — 统一用户信息获取
import { ref } from 'vue'

export function useAuth() {
  const user = ref(null)
  
  const initUser = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        user.value = JSON.parse(userStr)
      } catch (e) {
        console.error('用户信息解析失败', e)
      }
    }
  }
  
  const clearUser = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    user.value = null
  }
  
  const isAdmin = () => user.value?.role === 2
  const isLoggedIn = () => !!localStorage.getItem('token')
  
  return { user, initUser, clearUser, isAdmin, isLoggedIn }
}
```

```javascript
// src/components/CommonPagination.vue — 通用分页组件
// 将 Tag.vue、Comment.vue 等的分页逻辑抽取为此组件
```

---

### 5.4 性能优化

**优先级：⚠️ 中**

```javascript
// 1. HomeView.vue — 防抖搜索
import { debounce } from 'lodash-es'

watch(() => route.query.keyword, debounce((newKeyword) => {
  if (newKeyword) {
    currentPage.value = 1
    fetchSearchUsers()
  }
}, 300))
```

```javascript
// 2. ChatView.vue — 改为 WebSocket（长期建议）
// 短期：将 setInterval 轮询改为被动刷新（仅在页面激活时拉取）
const handleVisibilityChange = () => {
  if (document.hidden) {
    clearInterval(pollTimer)
  } else {
    startPolling()
  }
}
document.addEventListener('visibilitychange', handleVisibilityChange)
```

```javascript
// 3. Publish.vue — 移除硬编码 setTimeout
// 使用 watch + nextTick 替代
watch(() => route.query.id, async (newId) => {
  if (newId) {
    await nextTick()
    await loadArtworkDetail(newId)
  }
}, { immediate: true })
```

---

### 5.5 架构升级建议

| 建议 | 理由 | 实施难度 |
|------|------|----------|
| 引入 TypeScript | 当前为 JS 项目，类型安全缺失，role 等魔法数字无法静态检查 | ⭐⭐⭐ |
| Pinia Store 实际使用 | `store/index.js` 创建了 Pinia，但所有组件仍直接读写 localStorage | ⭐⭐ |
| 统一错误处理 | 提取 `useErrorHandler()` Composable，统一所有 API 错误的 UX 处理 | ⭐ |
| API 层 TypeScript 类型定义 | 定义 `ApiResponse<T>`、`User`、`Artwork` 等接口 | ⭐⭐ |
| E2E 测试 | 使用 Playwright 对登录、发布、评论等核心流程编写测试 | ⭐⭐⭐ |
| 引入 Vitest 单元测试 | 对 Composable（如 useAuth、useFormatTime）编写单元测试 | ⭐⭐ |

---

## 六、📋 问题汇总与修复优先级

### 🔴 必须立即修复（阻塞性）

| # | 文件 | 问题 | 修复方案 |
|---|------|------|----------|
| 1 | `src/views/ArtworkDetail.vue` | `v-html` 渲染富文本，XSS 高风险 | 引入 DOMPurify 过滤 |
| 2 | `src/views/admin/Comment.vue` | `loadData` 异常时 loading 不关闭，UI 死锁 | 添加 `finally { loading = false }` |
| 3 | `src/views/Publish.vue` | 硬编码 `setTimeout(300)` 等待数据回显 | 改用 `watch` + `nextTick` |

### ⚠️ 建议尽快修复（功能性缺陷）

| # | 文件 | 问题 | 修复方案 |
|---|------|------|----------|
| 4 | `src/views/admin/Tag.vue` | `loadData` 异常无用户提示 | 添加 `ElMessage.error` |
| 5 | `src/views/Publish.vue` | 分类数据硬编码 | 从 API `/category/list` 动态获取 |
| 6 | `src/views/HomeView.vue` | 路由 query 变化触发多个并发请求 | 添加防抖或合并接口 |
| 7 | `src/layout/FrontLayout.vue` | 未读数未在组件卸载时显式清理事件监听 | 添加 `onUnmounted` 清理 |

### 💡 长期优化（非阻塞）

| # | 文件 | 问题 | 修复方案 |
|---|------|------|----------|
| 8 | 全局 | 魔法数字分散多处 | 提取为常量文件 `src/constants/` |
| 9 | `src/views/ArtworkDetail.vue` | 组件过大（956行） | 拆分为 ArticleContent + CommentSection |
| 10 | `src/views/ChatView.vue` | setInterval 轮询 | 改为 WebSocket 或 passive polling |
| 11 | 全局 | 多个组件重复分页逻辑 | 抽取为 `<CommonPagination>` |
| 12 | 全局 | localStorage 直接操作分散各处 | 统一到 `useAuth()` Composable |
| 13 | 全局 | JS 无类型约束 | 逐步迁移至 TypeScript |

---

**报告生成完毕**  
如需针对任何具体问题进行详细分析或提供修复代码，请告知。
