# 视觉设计规范

## 概述
定义JSON Toolkit的现代化视觉设计系统，包括色彩、字体、布局和组件的一致性标准。

## ADDED Requirements

### Requirement: 现代色彩系统
系统MUST实现基于OKLCH色彩空间的现代化主题系统。

#### Scenario: 主题色彩定义
- **Given** 用户访问任何页面
- **When** 页面加载完成
- **Then** 所有界面元素使用新的色彩变量：
  - 主背景色为纯白色 (`oklch(1 0 0)`) 或浅灰色 (`oklch(0.98 0 0)`)
  - 主色调为技术蓝 (`oklch(0.55 0.15 244)`) 或翠绿色 (`oklch(0.7 0.15 162)`)
  - 文字色为深灰 (`oklch(0.15 0.01 264)`) 而非纯黑
  - 边框使用微妙灰色 (`oklch(0.92 0.005 264)`)

#### Scenario: 深色模式兼容
- **Given** 用户切换到深色模式
- **When** 主题变更完成
- **Then** 所有颜色自动适配深色变体，保持对比度和可读性

### Requirement: 现代字体系统
系统MUST为UI和代码内容提供专业的字体体验。

#### Scenario: UI字体应用
- **Given** 任何包含文本的界面元素
- **When** 元素渲染
- **Then** 使用现代无衬线字体栈 (`'Inter', system-ui, sans-serif`)
- **And** 字体渲染清晰且符合平台标准

#### Scenario: 代码区域字体
- **Given** JSON编辑器、代码生成输出或任何代码显示区域
- **When** 内容渲染
- **Then** 强制使用现代等宽字体 (`'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace`)
- **And** 行高最小为1.5，确保代码可读性
- **And** 通过字重区分JSON键值(键使用bold，值使用normal)

### Requirement: 现代化导航和布局
系统MUST提供清爽、现代的导航和布局体验。

#### Scenario: 侧边栏设计
- **Given** 侧边栏组件
- **When** 组件渲染
- **Then** 采用窄边栏设计 (收起64px，展开240px)
- **And** 背景色为白色或浅灰色，无厚重边框
- **And** 菜单项使用现代化图标和清晰标签

#### Scenario: 标签导航
- **Given** 任何标签导航组件
- **When** 用户查看或交互
- **Then** 使用现代下划线指示器或药丸状设计
- **And** 去除传统的实色背景标签设计

### Requirement: 现代化按钮系统
系统MUST实现分层的按钮设计系统。

#### Scenario: 主要操作按钮
- **Given** 主要CTA按钮 (如提交、生成、保存)
- **When** 按钮渲染
- **Then** 使用实色背景的primary样式
- **And** 背景色使用主色调变量

#### Scenario: 次要操作按钮
- **Given** 次要操作按钮 (如取消、重置)
- **When** 按钮渲染
- **Then** 使用outline或ghost样式，无实色背景
- **And** 仅在hover时显示背景色

#### Scenario: 图标按钮
- **Given** 工具栏或紧凑空间的图标按钮
- **When** 按钮渲染
- **Then** 使用透明背景的minimal设计
- **And** 悬停时显示微妙的背景色

### Requirement: JSON编辑器主题集成
系统MUST为JSON编辑器提供与整体设计一致的主题。

#### Scenario: 语法高亮配色
- **Given** JSON编辑器显示内容
- **When** 内容渲染完成
- **Then** 使用现代化的语法颜色：
  - JSON键名使用深蓝色 (`oklch(0.4 0.08 264)`)
  - 字符串值使用绿色 (`oklch(0.45 0.1 162)`)
  - 数字值使用橙红色 (`oklch(0.5 0.12 27)`)
  - 布尔值使用紫色 (`oklch(0.55 0.15 300)`)
  - null值使用青色 (`oklch(0.5 0.08 180)`)

#### Scenario: 编辑器背景和边框
- **Given** JSON编辑器组件
- **When** 编辑器初始化
- **Then** 背景色与主题背景一致
- **And** 边框使用微妙的灰色，无厚重或彩色边框

### Requirement: 差异视图设计
系统MUST为JSON差异比较提供清晰的视觉指示。

#### Scenario: 差异行背景
- **Given** JSON差异比较视图
- **When** 显示有变更的行
- **Then** 删除的内容使用柔和红色背景 (`oklch(0.98 0.03 30)`)
- **And** 新增的内容使用柔和绿色背景 (`oklch(0.97 0.05 162)`)
- **And** 避免使用文字颜色变化作为主要差异指示

#### Scenario: 差异行号
- **Given** 差异视图的行号列
- **When** 渲染行号
- **Then** 使用中性灰色 (`oklch(0.45 0.01 264)`)
- **And** 背景色与主背景一致

### Requirement: 可访问性标准
系统MUST满足现代可访问性要求。

#### Scenario: 对比度要求
- **Given** 任何文字和背景的组合
- **When** 计算颜色对比度
- **Then** 普通文字达到WCAG AA标准(4.5:1)
- **And** 重要交互元素达到AAA标准(7:1)

#### Scenario: 颜色独立性
- **Given** 任何传达信息的界面元素
- **When** 用户查看内容
- **Then** 信息不仅仅依赖颜色传达
- **And** 提供形状、图标或文字等其他视觉线索

### Requirement: 响应式设计适配
系统MUST在不同设备和浏览器扩展中正确显示。

#### Scenario: 移动端适配
- **Given** 视口宽度小于768px
- **When** 页面渲染
- **Then** 侧边栏自动收起或隐藏
- **And** 主内容区域占据全宽
- **And** 按钮和交互元素适合触摸操作

#### Scenario: 浏览器扩展弹窗
- **Given** 浏览器扩展的popup界面 (400x600px)
- **When** 扩展打开
- **Then** 导航简化为顶部标签或dropdown
- **And** 内容区域最大化利用有限空间
- **And** 字体和按钮大小适合小尺寸窗口