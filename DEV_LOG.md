# 开发日志

---

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
