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

- **日期**：2026-03-23
- **完成功能**：首页 Tab 排序与 sortType 参数传递
- **核心技术点**：
  - Tab 默认值 `activeTab = ref('recommend')`（已是正确配置）
  - Tab 顺序 "推荐" 在前、"最新发布" 在后（已是正确顺序）
  - `fetchArticles` params 添加 `sortType: activeTab.value` 传给后端
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端需支持 `sortType` 参数实现推荐/最新排序

---

- **日期**：2026-03-23
- **完成功能**：首页热门分类改为后端接口调用，统一标签样式
- **核心技术点**：
  - `hotCategories` 改为空数组，通过 `fetchHotCategories()` 调用 `/category/public/hot` 获取
  - 标签渲染复用 `modern-tag` 样式体系，支持悬浮动画和颜色块质感
  - 点击分类标签跳转首页并传递 `categoryId` 参数
  - 删除原有的 `.category-tag` 自定义样式
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端需实现 `/category/public/hot` 接口返回热门分类列表

---

- **日期**：2026-03-23
- **完成功能**：个人主页热门标签点击筛选功能
- **核心技术点**：
  - 添加 `activeTagId = ref(null)` 状态记录选中标签
  - `fetchArticles` params 添加 `tagId: activeTagId.value` 传给后端
  - `handleTagClick(id)` 函数支持点击切换筛选，再次点击取消选中
- **修改的文件**：`src/views/UserSpaceView.vue`
- **遗留问题/下一步**：后端需支持 `tagId` 参数实现标签筛选

---

- **日期**：2026-03-23
- **完成功能**：顶栏搜索框激活与首页搜索结果展示
- **核心技术点**：
  - FrontLayout.vue 添加 `handleSearch()` 函数，回车/点击图标触发跳转
  - 首页接收 `keyword` 参数，`searchKeyword = ref(null)` 状态
  - `fetchArticles` params 添加 `keyword` 传给后端
  - watch 和 onMounted 监听/拦截 `keyword` 参数
  - 模板添加搜索结果提示框，支持清除搜索
- **修改的文件**：`src/layout/FrontLayout.vue`、`src/views/HomeView.vue`
- **遗留问题/下一步**：后端需支持 `keyword` 参数实现搜索功能

---

- **日期**：2026-03-23
- **完成功能**：首页搜索结果展示创作者卡片
- **核心技术点**：
  - 添加 `searchUserList = ref([])` 状态存储搜索用户列表
  - `fetchSearchUsers()` 函数调用 `/user/public/search` 接口
  - watch 和 onMounted 中调用 `fetchSearchUsers()`
  - 模板添加用户卡片网格布局，点击跳转个人主页
  - CSS 样式实现卡片悬浮动效
- **修改的文件**：`src/views/HomeView.vue`
- **遗留问题/下一步**：后端需实现 `/user/public/search` 接口

---

- **日期**：2026-03-23
- **完成功能**：账号设置页面（修改密码）
- **核心技术点**：
  - 新建 `SettingsView.vue`，左侧 Tab + 右侧修改密码表单
  - 表单校验：原密码必填、新密码不少于6位、确认密码一致校验
  - 调用 `/user/password` PUT 接口修改密码
  - 成功后跳转登录页重新登录
  - 路由注册到 FrontLayout children
- **修改的文件**：`src/views/SettingsView.vue`、`src/router/index.js`
- **遗留问题/下一步**：后端需实现 `/user/password` 接口

---

- **日期**：2026-03-23
- **完成功能**：隐私设置无感自动保存 + 个人资料增加性别/简介字段
- **核心技术点**：
  - `privacyForm` 改为 Integer 类型 (0/1)
  - `fetchProfile()` 页面加载时拉取用户设置
  - `handlePrivacyChange()` 开关拨动自动调用 PUT `/user/settings` 保存
  - el-switch 绑定 `:active-value="1" :inactive-value="0"`
  - UserProfile.vue 表单增加性别 (radio) 和个人简介 (textarea)
  - 保存时请求体包含 gender 和 bio 字段
- **修改的文件**：`src/views/SettingsView.vue`、`src/views/UserProfile.vue`
- **遗留问题/下一步**：后端需实现 `/user/settings` 接口

---

- **日期**：2026-03-23
- **完成功能**：个人主页「编辑资料」弹窗
- **核心技术点**：
  - `openEditDialog()` 打开弹窗时回显用户数据
  - `submitEdit()` 提交 PUT `/user/profile`
  - 表单包含头像 URL、昵称、性别、个人简介
  - 成功后更新 localStorage 并刷新页面
- **修改的文件**：`src/views/UserSpaceView.vue`
- **遗留问题/下一步**：暂无

---

- **日期**：2026-03-23
- **完成功能**：个人主页编辑资料弹窗头像替换为本地文件上传
- **核心技术点**：
  - `uploadHeaders` 携带 Bearer Token
  - `handleAvatarSuccess` 上传成功回写 `editForm.avatarUrl`
  - `beforeAvatarUpload` 校验图片类型和 2MB 大小
  - el-upload 替换原来的 el-input，显示预览头像
- **修改的文件**：`src/views/UserSpaceView.vue`
- **遗留问题/下一步**：后端需实现 `/file/upload` 接口

---

- **日期**：2026-03-23
- **完成功能**：个人主页添加性别徽章显示
- **核心技术点**：
  - 昵称旁显示性别标签（男：蓝色，男：红色）
  - 使用 Male/Female 图标
- **修改的文件**：`src/views/UserSpaceView.vue`
- **遗留问题/下一步**：暂无

---

- **日期**：2026-03-23
- **完成功能**：点赞列表/收藏列表 Tab 数据拉取与渲染
- **核心技术点**：
  - 新增 `likedArtworks` 响应式数组存储点赞作品
  - 新增 `fetchLikes()` 调用 `/interaction/likes/${targetUserId}` 接口
  - 新增 `loading` 变量控制加载状态
  - `handleTabChange` 根据 Tab 类型分发请求（latest/collected/liked）
  - 点赞/收藏列表复用 `article-item` 样式渲染
  - 点赞/收藏列表添加 `category-link`、`meta-separator`、`article-footer` 等完整元信息
  - 点赞/收藏列表添加标签（Tags）展示
  - `fetchCollections`/`fetchLikes` 请求添加 `tagId` 参数支持标签筛选
  - `handleTagClick` 根据当前 Tab 重新拉取对应数据
  - 新增 `handleCardTagClick` 处理卡片内部标签点击，使用 `.stop` 防止冒泡触发卡片点击
  - 右侧标签添加 `is-active` 动态类绑定，选中时高亮显示
  - CSS 新增 `.modern-tag.is-active` 常亮状态样式（使用标签自身 --hover-color）
  - 移除 `.modern-tag-small.is-active`（卡片内小标签不参与常亮联动）
  - 点赞/收藏列表 article-footer 添加评论数和点赞数显示
  - 新增 `followingList`/`followerList` 响应式数组存储关注/粉丝数据
  - 新增 `fetchFollowings()` 调用 `/follow/following/${targetUserId}` 接口
  - 新增 `fetchFollowers()` 调用 `/follow/followers/${targetUserId}` 接口
  - 新增 `goToUserSpace()` 方法实现用户卡片跳转
  - `handleTabChange` 补充 following/followers Tab 切换处理
  - 关注/粉丝列表渲染用户卡片，含头像、昵称、性别图标、个人简介
  - CSS 新增 `.user-list`、`.user-card`、`.user-info` 等用户列表相关样式
  - `loadAllData` 修复：根据当前激活的 Tab 动态拉取对应数据，解决切换用户主页时数据未同步刷新的 Bug
  - `activeTab` 从 URL query 参数读取，解决详情页返回时 Tab 状态丢失问题
  - `handleTabChange` 添加 `router.replace` 将 Tab 状态同步到 URL
- **修改的文件**：`src/views/UserSpaceView.vue`
- **HomeView.vue SPA 状态 URL 化改造**：
  - `activeTab` 改为从 URL query 参数读取，默认为 `'recommend'`
  - `activeTagId` 改为从 URL query 参数读取
  - `activeCategoryId` 改为从 URL query 参数读取
  - `watch(activeTab)` 添加 `router.replace` 将 Tab 切换同步到 URL
  - `handleTagClick` 添加 `router.replace` 将标签筛选同步到 URL
  - `clearCategory` 添加 `router.replace` 将清除分类操作同步到 URL
  - 侧边栏分类标签点击保留其他 URL 参数
  - 文章卡片分类链接点击保留其他 URL 参数
  - `watch(route.query)` 补充 `activeTab` 同步，解决后退时 Tab 高亮丢失问题
- **全局分页状态 URL 同步改造**：
  - `HomeView.vue`：`currentPage` 从 URL query 参数读取，`handleCurrentChange` 同步页码到 URL，`handleTagClick`/`clearCategory`/`watch(activeTab)` 切换筛选条件时重置 page 为 1，`watch(route.query)` 同步 page 参数
  - `UserSpaceView.vue`：`currentPage` 从 URL query 参数读取，`handleCurrentChange` 同步页码到 URL，`handleTabChange` 切换 Tab 时重置 page 为 1，`onMounted`/`watch(route.params.id)`/`watch(route.query)` 同步 page 参数
  - `CategoryView.vue`：无分页逻辑，无需修改
- **消息中心功能开发**：
  - 新建 `src/views/MessageView.vue`：消息通知页面，支持点赞、收藏、评论、关注、系统通知等消息展示
  - 更新 `src/router/index.js`：注册消息中心路由
  - 更新 `src/layout/FrontLayout.vue`：将"消息"改为小铃铛图标，带未读消息红点 Badge
  - `fetchUnreadCount` 方法获取未读消息数量
  - `window.addEventListener('unread-cleared')` 监听消息页面全部已读事件
  - `MessageView.vue` 样式升级：`.notification-item` 改为卡片化设计，增加边框、圆角、悬浮上浮和阴影效果
  - `MessageView.vue` 交互升级：卡片添加 `cursor: pointer`，新增 `handleItemClick` 方法实现全局点击跳转，`@click.stop` 阻止头像和用户名的事件冒泡
- **私信聊天功能开发**：
  - 新建 `src/views/ChatView.vue`：私信大厅页面，包含左侧联系人列表、右侧聊天窗口、自动滚动到底部、3 秒轮询刷新逻辑
  - 更新 `src/router/index.js`：注册 `/chat` 路由
  - 更新 `src/layout/FrontLayout.vue`：导航栏添加私信图标入口（`ChatDotRound`），替换原有的"私信"文字
  - 更新 `src/views/UserSpaceView.vue`：在关注按钮旁添加"发私信"按钮
- **私信红点 Badge 与事件联动**：
  - `FrontLayout.vue` 新增 `chatUnreadCount` 变量和 `fetchChatUnreadCount` 方法
  - `onMounted` 新增 `fetchChatUnreadCount()` 初始化和 `chat-read` 事件监听
  - 私信图标外套 `el-badge` 显示未读数量
  - `ChatView.vue` 的 `fetchHistory` 成功后 `window.dispatchEvent(new Event('chat-read'))` 触发全局事件
- **创作者中心布局开发**：
  - 新建 `src/views/creator/CreatorLayout.vue`：`el-aside` 左侧边栏 + `el-main` 右侧内容区，支持路由切换动画
  - 新建 `src/views/creator/Drafts.vue`：草稿箱占位页面
  - 更新 `src/router/index.js`：重构路由，将 `/publish` 移入 `/creator/publish`，新增 `/creator/drafts`
  - 更新 `FrontLayout.vue`：`handleWrite` 方法跳转路径改为 `/creator/publish`
- **创作者中心重构为数据看板首页**：
  - 新建 `src/views/creator/Dashboard.vue`：数据看板骨架页面，含阅读量/点赞/粉丝/作品数统计卡片
  - 更新 `src/views/creator/CreatorLayout.vue`：侧边栏菜单改为「数据看板」和「草稿箱」，移除「发布作品」
  - 更新 `src/router/index.js`：`redirect` 改为 `/creator/dashboard`，新增 dashboard 子路由，Publish 路由移至 FrontLayout 下作为一级路由
  - 更新 `FrontLayout.vue`：`handleWrite` 跳转改为 `/publish`
- **数据看板对接真实数据**：
  - `src/views/creator/Dashboard.vue`：新增 `fetchStats` 方法请求 `/artwork/dashboard/stats/{userId}`，模板绑定 `stats` 响应式数据，`v-loading` 加载状态
- **数据看板 ECharts 折线图**：
  - `src/views/creator/Dashboard.vue`：`el-empty` 替换为 `<div ref="chartRef">` 图表容器，引入 `echarts`，新增 `initChart` / `fetchTrend` / `handleResize` 方法，`onMounted` 调用 `fetchTrend()` 并监听窗口 resize，`onBeforeUnmount` 销毁图表实例
- **草稿箱对接真实接口**：
  - `src/views/creator/Drafts.vue`：从零重写，模板展示草稿列表卡片，`fetchDrafts` 请求 `/draft/list/{userId}`，`handleDelete` 请求 `DELETE /draft/{id}`，`handleEdit` 跳转 `/publish?draftId={id}`
  - `src/views/Publish.vue`：引入 `useRoute`，新增 `handleSaveDraft` 方法请求 `POST /draft/save`，按钮 `@click="handleSaveDraft"` 绑定；`draftId` 支持更新老草稿
- **作品详情页作者权限操作**：
  - `src/views/ArtworkDetail.vue`：新增 `computed` 引入，新增 `currentUserId`（从 `localStorage` 读取）和 `isAuthor` 计算属性，引入 `Edit`/`Delete` 图标，新增 `handleDeleteArtwork` 方法请求 `DELETE /artwork/{id}`，成功后 `router.replace` 回个人主页
  - 模板 `<meta-info>` 区域下方新增 `v-if="isAuthor"` 权限按钮组（编辑作品/删除作品），编辑按钮跳转 `/publish?id={artwork.id}`
- **发布页支持编辑已发布作品**：
  - `src/views/Publish.vue`：`onMounted` 新增 `route.query.id` 判断，满足条件调用 `loadArtworkDetail(id)` 回显正式作品数据；`loadArtworkDetail` 请求 `GET /artwork/{id}` 并回填 title/content/description/categoryId/coverUrl
  - `handleSubmit` 改为根据 `route.query.id` 区分新增（`POST /artwork/add`）和更新（`PUT /artwork/update`）
- **遗留问题/下一步**：
  - 用户列表头像支持点击访问其个人主页

---

- **日期**：2026-03-26
- **完成功能**：后台管理用户管理模块
- **核心技术点**：
  - 新建 `src/views/user/User.vue`，包含搜索、分页、权限切换和禁用功能
  - `/admin/user` 路由挂载到 `Layout.vue` 管理后台
  - 表格列：ID、头像、用户名、昵称、邮箱、后台权限（el-switch）、账号状态（el-tag）、操作按钮
  - `el-switch` 直接绑定 `row.role`，切换时调用 `PUT /user/admin/update` 更新权限
  - 禁用/启用操作使用 `ElMessageBox.confirm` 二次确认
  - `handleUpdateUser` 失败时自动重刷数据回滚状态
- **修改的文件**：`src/views/user/User.vue`（新建）、`src/router/index.js`、`src/layout/Layout.vue`
- **遗留问题/下一步**：后端需实现 `/user/admin/page` 和 `/user/admin/update` 接口

---

- **日期**：2026-03-26
- **完成功能**：用户管理页面分页切换修复
- **核心技术点**：
  - `@size-change` 和 `@current-change` 直接绑定 `loadData`，避免 `handleQuery` 强制重置页码到 1
  - 搜索按钮保持绑定 `handleQuery`，确保点击搜索时从第 1 页展示
- **修改的文件**：`src/views/user/User.vue`

---

- **日期**：2026-03-26
- **完成功能**：后台管理全站公告推送功能
- **核心技术点**：
  - 新建 `src/views/admin/Announcement.vue`
  - el-alert 警告提示谨慎操作
  - el-input textarea 限制 500 字
  - `ElMessageBox.confirm` 二次确认后 POST `/notification/broadcast` 推送
- **修改的文件**：`src/views/admin/Announcement.vue`（新建）、`src/router/index.js`、`src/layout/Layout.vue`
- **遗留问题/下一步**：后端需实现 `/notification/broadcast` 接口

---

- **日期**：2026-03-26
- **完成功能**：消息中心增加单条删除功能
- **核心技术点**：
  - 引入 Delete 图标
  - 卡片 hover 时显示删除按钮，position: absolute 定位在右下角
  - `handleDelete(id)` 调用 DELETE `/notification/{id}` 删除后刷新列表
  - 未读红点位置调整到右上角
- **修改的文件**：`src/views/MessageView.vue`
- **遗留问题/下一步**：无

- **日期**：2026-03-26
- **完成功能**：用户管理页面增加全量编辑功能
- **核心技术点**：
  - 操作列新增「编辑资料」按钮
  - 新增 `el-dialog` 编辑对话框，包含：昵称、邮箱、手机号、性别（0-保密/1-男/2-女）、个人简介、角色（1-普通/2-管理）、状态（1-正常/0-禁用）
  - `handleEdit(row)` 深拷贝行数据到编辑表单
  - `submitEdit()` 调用 `PUT /user/admin/update` 保存修改
- **修改的文件**：`src/views/user/User.vue`
- **遗留问题/下一步**：无

---

- **日期**：2026-03-26
- **完成功能**：消息删除后同步更新导航栏未读数
- **核心技术点**：
  - FrontLayout.vue 增加 `update-notification-count` 事件监听器
  - onUnmounted 中移除监听防止内存泄漏
  - MessageView.vue 删除成功后 dispatch 该事件
  - 实现前后端未读数实时同步
- **修改的文件**：`src/layout/FrontLayout.vue`、`src/views/MessageView.vue`
- **遗留问题/下一步**：无