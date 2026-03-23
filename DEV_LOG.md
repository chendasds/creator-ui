# 开发日志





- **日期**：2026-03-21
- **完成功能**：首页 UI 重构（左侧文章列表 + 右侧个人数据统计 + 热门标签云）
- **核心技术点**：
  - Vue 3 Composition API + Element Plus
  - 假数据 Mock 架构设计
  - CSS line-clamp 多行文本截断
  - CSS color-mix() 实现标签云渐变背景
  - Grid 布局实现 2x2 数据统计卡片
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：待后端接口完成后对接真实 API

---

- **日期**：2026-03-21
- **完成功能**：前台顶部导航栏 UI 升级（对齐知乎/掘金风格）
- **核心技术点**：
  - Flex 布局实现 Logo + 主导航 + 搜索框 + 互动区四段式布局
  - Element Plus `<el-badge>` 模拟消息/私信未读红点与数字徽标
  - hover 颜色过渡 + 背景色联动（transition: all 0.2s）
  - 分类导航与消息区预留点击事件骨架（后续绑定真实路由）
- **修改的文件**：`src/layout/FrontLayout.vue`
- **遗留问题/下一步**：关注/分类/消息/私信需绑定真实路由与后端接口

---

- **日期**：2026-03-21
- **完成功能**：首页右侧标签云替换为后端真实标签数据
- **核心技术点**：
  - `/tag/list` 接口对接，支持 `res.code === 200` 标准结构和直接返回数组两种兼容写法
  - 利用后端返回的 `tag.color` 字段动态渲染彩色标签背景，color 有值时白色文字、无边框
  - 删除假数据 `mockTags`，改为 `tagList` 响应式数组驱动模板
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：标签点击事件需绑定筛选逻辑

---

- **日期**：2026-03-21
- **完成功能**：首页标签云 UI 重构（掘金同款浅灰+悬浮点亮风格）
- **核心技术点**：
  - 移除高饱和实心背景，改用 `#f4f5f5` 浅灰底色 + `#515767` 柔和文字
  - `--hover-color` CSS 变量传入标签专属色，hover 时字体变色（不污染背景）
  - `border-radius: 6px` 微圆角替代大圆角，`translateY(-1px)` 悬浮感
  - 修复模板 `>` 符号残留和闭合标签错位问题
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：标签点击筛选逻辑绑定

---

- **日期**：2026-03-21
- **完成功能**：首页标签点击筛选文章（切换选中态 + 带 tagId 参数请求后端）
- **核心技术点**：
  - `activeTagId` 响应式变量记录选中态，点击已选中标签则取消（toggle 逻辑）
  - `fetchArticles` 请求参数追加 `tagId: activeTagId.value`，实现按标签筛选
  - 模板 `:class="{ 'is-active': activeTagId === tag.id }"` 动态绑定选中高亮类
  - `.modern-tag.is-active` 高亮样式：白色文字 + 专属色背景 + 阴影 + 上浮
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端 `/artwork/feed` 需支持 tagId 参数过滤

---

- **日期**：2026-03-21
- **完成功能**：发布页面新增多选标签表单（`/tag/list` 接口 + `el-select` 多选）
- **核心技术点**：
  - `form.tagIds` 数组字段存储多选标签 ID，`el-select multiple` 模式支持多选
  - `fetchTags()` 与首页共用同一接口，兼容 `res.code === 200` 和直接返回数组两种结构
  - Option 中用内联 `:style` 渲染 `# 标签名` 彩色文字，与首页标签云风格一致
  - 引入 `onMounted` 并在组件挂载时调用标签接口
- **修改的文件**：`src/views/Publish.vue`
- **遗留问题/下一步**：首页信息流展示文章关联的标签列表

---

- **日期**：2026-03-21
- **完成功能**：首页信息流卡片内标签渲染升级（`modern-tag-small` 极简风格）
- **核心技术点**：
  - 标签渲染位置在 footer 上方，v-if 判断 `item.tags && item.tags.length`
  - key 改为 `tag.id`，旧 `:key="tag.name || tag"` 写法已淘汰
  - `@click.stop="handleTagClick(tag.id)"` 阻止冒泡，点击标签跳转筛选
  - `.modern-tag-small`：4px 微圆角、极简浅灰底、hover 字体变色
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端 `/artwork/feed` 需返回每篇文章的 tags 数组

---

- **日期**：2026-03-21
- **完成功能**：作品详情页增加阅读时长预测与标签云
- **核心技术点**：
  - `Math.ceil((artwork.wordCount || 0) / 400) || 1` 实时计算阅读分钟数
  - `goToHomeWithTag(tagId)` 跳回首页并带上 `?tagId=` query 参数
  - `.modern-tag-detail` 极简灰底 + hover 字体变专属色，与首页标签云风格统一
- **修改的文件**：`src/views/ArtworkDetail.vue`
- **遗留问题/下一步**：后端 `/artwork/detail/{id}` 需返回 tags 数组

---

- **日期**：2026-03-21
- **完成功能**：发布页封面上传升级为本地图片上传组件
- **核心技术点**：
  - `el-upload` + `:http-request="customUpload"` 完全接管上传行为，不走默认 POST
  - `FormData` 携带文件，`/file/upload` 接口返回图片 URL 直接写入 `form.coverUrl`
  - 预览与上传合一：有图时直接覆盖显示，无图时展示 Plus 图标占位
  - `:show-file-list="false"` 关闭默认文件列表提示，体验更简洁
- **修改的文件**：`src/views/Publish.vue`
- **遗留问题/下一步**：后端 `/file/upload` 需支持 `multipart/form-data` 并返回图片 URL

---

- **日期**：2026-03-21
- **完成功能**：新增分类广场页面，打通顶栏「分类」导航路由
- **核心技术点**：
  - 新建 `CategoryView.vue`，网格布局展示分类卡片，点击卡片跳转首页并带 `?categoryId=`
  - FrontLayout 中 `handleNavClick('category')` 改为 `router.push('/category')`
  - `/category` 路由挂载在 FrontLayout 子路由下，与 `/home`、`/artwork/:id` 同级
- **修改的文件**：`src/views/CategoryView.vue`（新建）、`src/layout/FrontLayout.vue`、`src/router/index.js`
- **遗留问题/下一步**：首页需支持从 URL query 读取 `categoryId` 并激活分类筛选

---

- **日期**：2026-03-21
- **完成功能**：首页支持解析 `categoryId` 并联动文章筛选
- **核心技术点**：
  - `activeCategoryId` 状态与 `activeTagId` 并列，`fetchArticles` params 中同时携带两者
  - onMounted 中 `route.query.categoryId` → `Number` → `activeCategoryId.value`
  - 分类提示条绿色背景高亮，"查看全部"调用 `clearCategory()` 清空并重拉
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端 `/artwork/feed` 需支持 `categoryId` 参数筛选

---

- **日期**：2026-03-21
- **完成功能**：创作中心卡片接入后端 `/user/stats` 真实数据
- **核心技术点**：
  - `statsData`（reactive）替换为 `userStats`（ref），字段名对齐后端：`articleCount`、`totalViews`、`totalLikes`、`fanCount`
  - `fetchUserStats` 在无 token 时直接 return，兼容未登录态不报错
  - `onMounted` 中追加 `fetchUserStats()` 调用
  - 清理无用的 `reactive` import
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端需实现 `/user/stats` 接口

---

- **日期**：2026-03-21
- **完成功能**：优化首页右侧创作中心卡片，移除冗余头部，改造按钮
- **核心技术点**：
  - 删除 `<template #header>` 头部（"创作中心" + 用户图标），卡片内容更紧凑
  - "写文章"按钮改为 "进入创作中心"，跳转 `/creator` 占位路由
  - 新增 `.creator-btn` 样式，`width: 100%`、`margin-top: 16px`
  - 清理残留的孤立 `.write-btn {` 空块，避免 CSS 解析错误
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：实现 `/creator` 创作中心路由页面

---

- **日期**：2026-03-21
- **完成功能**：修复首页筛选状态下点击"首页"无法回到全部列表的 Bug
- **核心技术点**：
  - `watch(() => route.query, ...)` 监听整个 query 对象，同组件跳转时也能响应
  - FrontLayout 首页改为 `@click="$router.push('/')"` 强制回根路径，确保 URL 无参数残留
- **修改的文件**：`src/views/HomeView.vue`（新增 watch）、`src/layout/FrontLayout.vue`（首页导航改造）
- **遗留问题/下一步**：后端 `/artwork/feed` 需支持 `categoryId` 参数筛选

---

- **日期**：2026-03-21
- **完成功能**：创作中心卡片接入后端 `/user/stats` 真实数据
- **核心技术点**：
  - `statsData`（reactive）替换为 `userStats`（ref），字段名对齐后端：`articleCount`、`totalViews`、`totalLikes`、`fanCount`
  - `fetchUserStats` 在无 token 时直接 return，兼容未登录态不报错
  - `onMounted` 中追加 `fetchUserStats()` 调用
  - 清理无用的 `reactive` import
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端需实现 `/user/stats` 接口

---

- **日期**：2026-03-21
- **完成功能**：优化首页右侧创作中心卡片，移除冗余头部，改造按钮
- **核心技术点**：
  - 删除 `<template #header>` 头部（"创作中心" + 用户图标），卡片内容更紧凑
  - "写文章"按钮改为 "进入创作中心"，跳转 `/creator` 占位路由
  - 新增 `.creator-btn` 样式，`width: 100%`、`margin-top: 16px`
  - 清理残留的孤立 `.write-btn {` 空块，避免 CSS 解析错误
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：实现 `/creator` 创作中心路由页面

---

- **日期**：2026-03-21
- **完成功能**：首页从 URL query 读取 tagId 并自动激活标签筛选
- **核心技术点**：
  - `useRoute()` 获取 URL 参数，`Number(route.query.tagId)` 转数值后赋给 `activeTagId.value`
  - onMounted 中先设置 `activeTagId`，再调用 `fetchArticles()`，筛选逻辑自动生效
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端 `/artwork/detail/{id}` 需返回 tags 数组

---

- **日期**：2026-03-21
- **完成功能**：发布页封面上传升级为本地图片上传组件
- **核心技术点**：
  - `el-upload` + `:http-request="customUpload"` 完全接管上传行为，不走默认 POST
  - `FormData` 携带文件，`/file/upload` 接口返回图片 URL 直接写入 `form.coverUrl`
  - 预览与上传合一：有图时直接覆盖显示，无图时展示 Plus 图标占位
  - `:show-file-list="false"` 关闭默认文件列表提示，体验更简洁
- **修改的文件**：`src/views/Publish.vue`
- **遗留问题/下一步**：后端 `/file/upload` 需支持 `multipart/form-data` 并返回图片 URL

---

- **日期**：2026-03-21
- **完成功能**：新增分类广场页面，打通顶栏「分类」导航路由
- **核心技术点**：
  - 新建 `CategoryView.vue`，网格布局展示分类卡片，点击卡片跳转首页并带 `?categoryId=`
  - FrontLayout 中 `handleNavClick('category')` 改为 `router.push('/category')`
  - `/category` 路由挂载在 FrontLayout 子路由下，与 `/home`、`/artwork/:id` 同级
- **修改的文件**：`src/views/CategoryView.vue`（新建）、`src/layout/FrontLayout.vue`、`src/router/index.js`
- **遗留问题/下一步**：首页需支持从 URL query 读取 `categoryId` 并激活分类筛选

---

- **日期**：2026-03-21
- **完成功能**：首页支持解析 `categoryId` 并联动文章筛选
- **核心技术点**：
  - `activeCategoryId` 状态与 `activeTagId` 并列，`fetchArticles` params 中同时携带两者
  - onMounted 中 `route.query.categoryId` → `Number` → `activeCategoryId.value`
  - 分类提示条绿色背景高亮，"查看全部"调用 `clearCategory()` 清空并重拉
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端 `/artwork/feed` 需支持 `categoryId` 参数筛选

---

- **日期**：2026-03-21
- **完成功能**：创作中心卡片接入后端 `/user/stats` 真实数据
- **核心技术点**：
  - `statsData`（reactive）替换为 `userStats`（ref），字段名对齐后端：`articleCount`、`totalViews`、`totalLikes`、`fanCount`
  - `fetchUserStats` 在无 token 时直接 return，兼容未登录态不报错
  - `onMounted` 中追加 `fetchUserStats()` 调用
  - 清理无用的 `reactive` import
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端需实现 `/user/stats` 接口

---

- **日期**：2026-03-21
- **完成功能**：优化首页右侧创作中心卡片，移除冗余头部，改造按钮
- **核心技术点**：
  - 删除 `<template #header>` 头部（"创作中心" + 用户图标），卡片内容更紧凑
  - "写文章"按钮改为 "进入创作中心"，跳转 `/creator` 占位路由
  - 新增 `.creator-btn` 样式，`width: 100%`、`margin-top: 16px`
  - 清理残留的孤立 `.write-btn {` 空块，避免 CSS 解析错误
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：实现 `/creator` 创作中心路由页面

---

- **日期**：2026-03-21
- **完成功能**：修复首页筛选状态下点击"首页"无法回到全部列表的 Bug
- **核心技术点**：
  - `watch(() => route.query, ...)` 监听整个 query 对象，同组件跳转时也能响应
  - FrontLayout 首页改为 `@click="$router.push('/')"` 强制回根路径，确保 URL 无参数残留
- **修改的文件**：`src/views/HomeView.vue`（新增 watch）、`src/layout/FrontLayout.vue`（首页导航改造）
- **遗留问题/下一步**：后端 `/artwork/feed` 需支持 `categoryId` 参数筛选

---

- **日期**：2026-03-21
- **完成功能**：创作中心卡片接入后端 `/user/stats` 真实数据
- **核心技术点**：
  - `statsData`（reactive）替换为 `userStats`（ref），字段名对齐后端：`articleCount`、`totalViews`、`totalLikes`、`fanCount`
  - `fetchUserStats` 在无 token 时直接 return，兼容未登录态不报错
  - `onMounted` 中追加 `fetchUserStats()` 调用
  - 清理无用的 `reactive` import
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端需实现 `/user/stats` 接口

---

- **日期**：2026-03-21
- **完成功能**：优化首页右侧创作中心卡片，移除冗余头部，改造按钮
- **核心技术点**：
  - 删除 `<template #header>` 头部（"创作中心" + 用户图标），卡片内容更紧凑
  - "写文章"按钮改为 "进入创作中心"，跳转 `/creator` 占位路由
  - 新增 `.creator-btn` 样式，`width: 100%`、`margin-top: 16px`
  - 清理残留的孤立 `.write-btn {` 空块，避免 CSS 解析错误
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：实现 `/creator` 创作中心路由页面

---

- **日期**：2026-03-21
- **完成功能**：发布页下拉框 UI 简化 + `tagIds` 完整打通提交链路
- **核心技术点**：
  - Option 内容区还原为默认简洁展示，不再使用内联 span 样式
  - `handleSubmit` 请求体显式补入 `tagIds: form.tagIds`，确保多选标签完整提交
- **修改的文件**：`src/views/Publish.vue`
- **遗留问题/下一步**：首页信息流展示文章关联的标签列表

---

- **日期**：2026-03-21
- **完成功能**：首页信息流卡片内标签渲染升级（`modern-tag-small` 极简风格）
- **核心技术点**：
  - 标签渲染位置在 footer 上方，v-if 判断 `item.tags && item.tags.length`
  - key 改为 `tag.id`，旧 `:key="tag.name || tag"` 写法已淘汰
  - `@click.stop="handleTagClick(tag.id)"` 阻止冒泡，点击标签跳转筛选
  - `.modern-tag-small`：4px 微圆角、极简浅灰底、hover 字体变色
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端 `/artwork/feed` 需返回每篇文章的 tags 数组

---

- **日期**：2026-03-21
- **完成功能**：作品详情页增加阅读时长预测与标签云
- **核心技术点**：
  - `Math.ceil((artwork.wordCount || 0) / 400) || 1` 实时计算阅读分钟数
  - `goToHomeWithTag(tagId)` 跳回首页并带上 `?tagId=` query 参数
  - `.modern-tag-detail` 极简灰底 + hover 字体变专属色，与首页标签云风格统一
- **修改的文件**：`src/views/ArtworkDetail.vue`
- **遗留问题/下一步**：后端 `/artwork/detail/{id}` 需返回 tags 数组

---

- **日期**：2026-03-21
- **完成功能**：发布页封面上传升级为本地图片上传组件
- **核心技术点**：
  - `el-upload` + `:http-request="customUpload"` 完全接管上传行为，不走默认 POST
  - `FormData` 携带文件，`/file/upload` 接口返回图片 URL 直接写入 `form.coverUrl`
  - 预览与上传合一：有图时直接覆盖显示，无图时展示 Plus 图标占位
  - `:show-file-list="false"` 关闭默认文件列表提示，体验更简洁
- **修改的文件**：`src/views/Publish.vue`
- **遗留问题/下一步**：后端 `/file/upload` 需支持 `multipart/form-data` 并返回图片 URL

---

- **日期**：2026-03-21
- **完成功能**：新增分类广场页面，打通顶栏「分类」导航路由
- **核心技术点**：
  - 新建 `CategoryView.vue`，网格布局展示分类卡片，点击卡片跳转首页并带 `?categoryId=`
  - FrontLayout 中 `handleNavClick('category')` 改为 `router.push('/category')`
  - `/category` 路由挂载在 FrontLayout 子路由下，与 `/home`、`/artwork/:id` 同级
- **修改的文件**：`src/views/CategoryView.vue`（新建）、`src/layout/FrontLayout.vue`、`src/router/index.js`
- **遗留问题/下一步**：首页需支持从 URL query 读取 `categoryId` 并激活分类筛选

---

- **日期**：2026-03-21
- **完成功能**：首页支持解析 `categoryId` 并联动文章筛选
- **核心技术点**：
  - `activeCategoryId` 状态与 `activeTagId` 并列，`fetchArticles` params 中同时携带两者
  - onMounted 中 `route.query.categoryId` → `Number` → `activeCategoryId.value`
  - 分类提示条绿色背景高亮，"查看全部"调用 `clearCategory()` 清空并重拉
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端 `/artwork/feed` 需支持 `categoryId` 参数筛选

---

- **日期**：2026-03-21
- **完成功能**：创作中心卡片接入后端 `/user/stats` 真实数据
- **核心技术点**：
  - `statsData`（reactive）替换为 `userStats`（ref），字段名对齐后端：`articleCount`、`totalViews`、`totalLikes`、`fanCount`
  - `fetchUserStats` 在无 token 时直接 return，兼容未登录态不报错
  - `onMounted` 中追加 `fetchUserStats()` 调用
  - 清理无用的 `reactive` import
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端需实现 `/user/stats` 接口

---

- **日期**：2026-03-21
- **完成功能**：优化首页右侧创作中心卡片，移除冗余头部，改造按钮
- **核心技术点**：
  - 删除 `<template #header>` 头部（"创作中心" + 用户图标），卡片内容更紧凑
  - "写文章"按钮改为 "进入创作中心"，跳转 `/creator` 占位路由
  - 新增 `.creator-btn` 样式，`width: 100%`、`margin-top: 16px`
  - 清理残留的孤立 `.write-btn {` 空块，避免 CSS 解析错误
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：实现 `/creator` 创作中心路由页面

---

- **日期**：2026-03-21
- **完成功能**：修复首页筛选状态下点击"首页"无法回到全部列表的 Bug
- **核心技术点**：
  - `watch(() => route.query, ...)` 监听整个 query 对象，同组件跳转时也能响应
  - FrontLayout 首页改为 `@click="$router.push('/')"` 强制回根路径，确保 URL 无参数残留
- **修改的文件**：`src/views/HomeView.vue`（新增 watch）、`src/layout/FrontLayout.vue`（首页导航改造）
- **遗留问题/下一步**：后端 `/artwork/feed` 需支持 `categoryId` 参数筛选

---

- **日期**：2026-03-21
- **完成功能**：创作中心卡片接入后端 `/user/stats` 真实数据
- **核心技术点**：
  - `statsData`（reactive）替换为 `userStats`（ref），字段名对齐后端：`articleCount`、`totalViews`、`totalLikes`、`fanCount`
  - `fetchUserStats` 在无 token 时直接 return，兼容未登录态不报错
  - `onMounted` 中追加 `fetchUserStats()` 调用
  - 清理无用的 `reactive` import
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端需实现 `/user/stats` 接口

---

- **日期**：2026-03-21
- **完成功能**：优化首页右侧创作中心卡片，移除冗余头部，改造按钮
- **核心技术点**：
  - 删除 `<template #header>` 头部（"创作中心" + 用户图标），卡片内容更紧凑
  - "写文章"按钮改为 "进入创作中心"，跳转 `/creator` 占位路由
  - 新增 `.creator-btn` 样式，`width: 100%`、`margin-top: 16px`
  - 清理残留的孤立 `.write-btn {` 空块，避免 CSS 解析错误
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：实现 `/creator` 创作中心路由页面

---

- **日期**：2026-03-21
- **完成功能**：首页从 URL query 读取 tagId 并自动激活标签筛选
- **核心技术点**：
  - `useRoute()` 获取 URL 参数，`Number(route.query.tagId)` 转数值后赋给 `activeTagId.value`
  - onMounted 中先设置 `activeTagId`，再调用 `fetchArticles()`，筛选逻辑自动生效
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端 `/artwork/detail/{id}` 需返回 tags 数组

---

- **日期**：2026-03-21
- **完成功能**：发布页封面上传升级为本地图片上传组件
- **核心技术点**：
  - `el-upload` + `:http-request="customUpload"` 完全接管上传行为，不走默认 POST
  - `FormData` 携带文件，`/file/upload` 接口返回图片 URL 直接写入 `form.coverUrl`
  - 预览与上传合一：有图时直接覆盖显示，无图时展示 Plus 图标占位
  - `:show-file-list="false"` 关闭默认文件列表提示，体验更简洁
- **修改的文件**：`src/views/Publish.vue`
- **遗留问题/下一步**：后端 `/file/upload` 需支持 `multipart/form-data` 并返回图片 URL

---

- **日期**：2026-03-21
- **完成功能**：新增分类广场页面，打通顶栏「分类」导航路由
- **核心技术点**：
  - 新建 `CategoryView.vue`，网格布局展示分类卡片，点击卡片跳转首页并带 `?categoryId=`
  - FrontLayout 中 `handleNavClick('category')` 改为 `router.push('/category')`
  - `/category` 路由挂载在 FrontLayout 子路由下，与 `/home`、`/artwork/:id` 同级
- **修改的文件**：`src/views/CategoryView.vue`（新建）、`src/layout/FrontLayout.vue`、`src/router/index.js`
- **遗留问题/下一步**：首页需支持从 URL query 读取 `categoryId` 并激活分类筛选

---

- **日期**：2026-03-21
- **完成功能**：首页支持解析 `categoryId` 并联动文章筛选
- **核心技术点**：
  - `activeCategoryId` 状态与 `activeTagId` 并列，`fetchArticles` params 中同时携带两者
  - onMounted 中 `route.query.categoryId` → `Number` → `activeCategoryId.value`
  - 分类提示条绿色背景高亮，"查看全部"调用 `clearCategory()` 清空并重拉
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端 `/artwork/feed` 需支持 `categoryId` 参数筛选

---

- **日期**：2026-03-21
- **完成功能**：创作中心卡片接入后端 `/user/stats` 真实数据
- **核心技术点**：
  - `statsData`（reactive）替换为 `userStats`（ref），字段名对齐后端：`articleCount`、`totalViews`、`totalLikes`、`fanCount`
  - `fetchUserStats` 在无 token 时直接 return，兼容未登录态不报错
  - `onMounted` 中追加 `fetchUserStats()` 调用
  - 清理无用的 `reactive` import
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端需实现 `/user/stats` 接口

---

- **日期**：2026-03-21
- **完成功能**：优化首页右侧创作中心卡片，移除冗余头部，改造按钮
- **核心技术点**：
  - 删除 `<template #header>` 头部（"创作中心" + 用户图标），卡片内容更紧凑
  - "写文章"按钮改为 "进入创作中心"，跳转 `/creator` 占位路由
  - 新增 `.creator-btn` 样式，`width: 100%`、`margin-top: 16px`
  - 清理残留的孤立 `.write-btn {` 空块，避免 CSS 解析错误
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：实现 `/creator` 创作中心路由页面

---

- **日期**：2026-03-21
- **完成功能**：修复首页筛选状态下点击"首页"无法回到全部列表的 Bug
- **核心技术点**：
  - `watch(() => route.query, ...)` 监听整个 query 对象，同组件跳转时也能响应
  - FrontLayout 首页改为 `@click="$router.push('/')"` 强制回根路径，确保 URL 无参数残留
- **修改的文件**：`src/views/HomeView.vue`（新增 watch）、`src/layout/FrontLayout.vue`（首页导航改造）
- **遗留问题/下一步**：后端 `/artwork/feed` 需支持 `categoryId` 参数筛选

---

- **日期**：2026-03-21
- **完成功能**：创作中心卡片接入后端 `/user/stats` 真实数据
- **核心技术点**：
  - `statsData`（reactive）替换为 `userStats`（ref），字段名对齐后端：`articleCount`、`totalViews`、`totalLikes`、`fanCount`
  - `fetchUserStats` 在无 token 时直接 return，兼容未登录态不报错
  - `onMounted` 中追加 `fetchUserStats()` 调用
  - 清理无用的 `reactive` import
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端需实现 `/user/stats` 接口

---

- **日期**：2026-03-21
- **完成功能**：优化首页右侧创作中心卡片，移除冗余头部，改造按钮
- **核心技术点**：
  - 删除 `<template #header>` 头部（"创作中心" + 用户图标），卡片内容更紧凑
  - "写文章"按钮改为 "进入创作中心"，跳转 `/creator` 占位路由
  - 新增 `.creator-btn` 样式，`width: 100%`、`margin-top: 16px`
  - 清理残留的孤立 `.write-btn {` 空块，避免 CSS 解析错误
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：实现 `/creator` 创作中心路由页面


---

- **日期**：2026-03-23
- **完成功能**：修复个人主页查看自己时仍显示"关注"按钮的 Bug
- **核心技术点**：
  - `currentUserId` 从 `localStorage.getItem('user')` 中解析已登录用户 ID
  - `isMyOwnSpace` 计算属性判断当前访问主页的 `targetUserId` 是否等于 `currentUserId`
  - 模板使用 `v-if="isMyOwnSpace"` / `v-else` 动态切换"编辑资料"和"关注"按钮
  - `handleEditProfile` / `handleToggleFollow` 占位方法待后续绑定真实路由
- **修改的文件**：`src/views/UserSpaceView.vue`
- **遗留问题/下一步**：编辑资料和关注功能需绑定真实后端接口

---

---

- **日期**：2026-03-23
- **完成功能**：个人主页关注按钮状态联动与点击请求
- **核心技术点**：
  - `isFollowing` 响应式变量存储关注状态
  - `checkFollowStatus(id)` 调用 `/follow/check` 接口获取初始关注状态
  - `handleToggleFollow()` 调用 `/follow/toggle` 接口切换关注状态
  - 关注成功时 `fanCount += 1`，取消关注时 `fanCount -= 1`
  - 按钮根据 `isFollowing` 动态切换样式和文案（"已关注"/"+ 关注"）
  - 自己主页不调用关注状态接口
- **修改的文件**：`src/views/UserSpaceView.vue`
- **遗留问题/下一步**：后端需实现 `/follow/check` 和 `/follow/toggle` 接口

---

- **日期**：2026-03-23
- **完成功能**：顶栏"关注"变成过滤频道，复用首页信息流
- **核心技术点**：
  - FrontLayout 顶栏"关注"改为 `@click="$router.push({ path: '/', query: { feedType: 'follow' } })"`
  - HomeView 新增 `isFollowFeed` 响应式变量
  - `fetchArticles` 请求参数追加 `isFollowFeed: isFollowFeed.value`
  - `watch(() => route.query)` 解析 `feedType === 'follow'` 识别关注流模式
  - onMounted 中初始化解析 `feedType`
  - 关注流模式显示蓝色"正在查看我的关注动态"提示
- **修改的文件**：`src/layout/FrontLayout.vue`、`src/views/HomeView.vue`
- **遗留问题/下一步**：后端 `/artwork/feed` 需支持 `isFollowFeed` 参数筛选关注用户文章

---

- **日期**：2026-03-23
- **完成功能**：路由守卫白名单清理（登录注册整合）
- **核心技术点**：
  - 删除 `/register` 路由配置（Login.vue 已整合 Tabs）
  - 白名单仅保留 `['/login']`
- **修改的文件**：`src/router/index.js`
- **遗留问题/下一步**：无

---

- **日期**：2026-03-23
- **完成功能**：修复个人主页查看自己时仍显示"关注"按钮的 Bug
- **核心技术点**：
  - `currentUserId` 从 `localStorage.getItem('user')` 中解析已登录用户 ID
  - `isMyOwnSpace` 计算属性判断当前访问主页的 `targetUserId` 是否等于 `currentUserId`
  - 模板使用 `v-if="isMyOwnSpace"` / `v-else` 动态切换"编辑资料"和"关注"按钮
  - `handleEditProfile` / `handleToggleFollow` 占位方法待后续绑定真实路由
- **修改的文件**：`src/views/UserSpaceView.vue`
- **遗留问题/下一步**：编辑资料和关注功能需绑定真实后端接口

---

- **日期**：2026-03-23
- **完成功能**：修复退出登录后 token 未清除导致路由守卫失效的 Bug
- **核心技术点**：
  - FrontLayout.vue 的 logout 分支中添加 `localStorage.removeItem('token')`
  - Layout.vue 的 handleLogout 函数中添加 `localStorage.removeItem('token')`
  - 确保退出时清除 user 和 token 两个 key，路由守卫才能正确拦截
- **修改的文件**：`src/layout/FrontLayout.vue`、`src/layout/Layout.vue`
- **遗留问题/下一步**：无

---