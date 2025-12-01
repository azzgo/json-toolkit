# UI现代化设计文档

## 架构概述

本设计文档描述了将JSON Toolkit从当前温暖色调主题转换为现代IDE风格界面的技术实现方案。

## 设计原则

### 1. 层次化主题系统
采用CSS自定义属性(Custom Properties)实现主题系统，确保：
- **一致性**：所有组件使用统一的色彩变量
- **可扩展性**：支持未来添加多主题切换
- **维护性**：主题更改只需修改根级变量

### 2. 现代化色彩科学
使用OKLCH色彩空间替代传统HSL，优势包括：
- **感知均匀**：相同亮度数值在视觉上更一致
- **更好的对比度控制**：easier to maintain WCAG AA accessibility standards
- **未来兼容性**：现代浏览器原生支持

### 3. 响应式字体系统
- **UI字体栈**：`'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui`
- **代码字体栈**：`'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace`
- **动态尺寸**：基于viewport和用户偏好调整

## 技术实现

### 颜色系统重构

#### 新的色彩定义
```css
:root {
  /* 基础中性色 */
  --background: oklch(1 0 0);              /* 纯白 #FFFFFF */
  --background-secondary: oklch(0.98 0 0); /* 浅灰 #FAFAFA */
  --foreground: oklch(0.15 0.01 264);      /* 深灰 #1F2937 */
  --foreground-muted: oklch(0.45 0.01 264); /* 中性灰 #6B7280 */
  
  /* 主色调 - 技术蓝 */
  --primary: oklch(0.55 0.15 244);         /* #007AFF */
  --primary-foreground: oklch(1 0 0);      /* 白色文字 */
  
  /* 功能色 */
  --success: oklch(0.7 0.15 162);          /* 翠绿 #10B981 */
  --error: oklch(0.65 0.2 27);             /* 红色 #EF4444 */
  --warning: oklch(0.75 0.15 85);          /* 橙色 #F59E0B */
  
  /* 边框和输入 */
  --border: oklch(0.92 0.005 264);         /* #E5E7EB */
  --border-focus: var(--primary);
  --input-bg: oklch(0.99 0.002 264);       /* #F9FAFB */
}
```

#### 深色模式适配
```css
.dark {
  /* 深色背景 */
  --background: oklch(0.12 0.01 264);      /* #0F172A */
  --background-secondary: oklch(0.16 0.01 264); /* #1E293B */
  --foreground: oklch(0.92 0.005 264);     /* #F1F5F9 */
  --foreground-muted: oklch(0.65 0.01 264); /* #94A3B8 */
  
  /* 调整主色调亮度 */
  --primary: oklch(0.65 0.12 244);         /* 更亮的蓝色 */
  --border: oklch(0.25 0.01 264);          /* #334155 */
}
```

### 组件设计模式

#### 按钮层次系统
1. **Primary Button**: 实色背景，用于主要操作
2. **Secondary Button**: 边框样式，用于次要操作  
3. **Ghost Button**: 透明背景，用于辅助操作
4. **Icon Button**: 仅图标，用于工具栏

#### 导航设计
- **侧边栏**：窄边栏设计(64px收起，240px展开)
- **标签导航**：下划线指示器替代背景色
- **面包屑**：使用separator字符和链接

### JSON编辑器主题集成

#### 语法高亮配置
```css
:root {
  /* JSON语法着色 */
  --json-key: oklch(0.4 0.08 264);         /* 键名：深蓝 */
  --json-string: oklch(0.45 0.1 162);      /* 字符串：绿色 */
  --json-number: oklch(0.5 0.12 27);       /* 数字：橙红 */
  --json-boolean: oklch(0.55 0.15 300);    /* 布尔：紫色 */
  --json-null: oklch(0.5 0.08 180);        /* null：青色 */
}
```

#### 编辑器配置映射
- **vanilla-jsoneditor**主题变量映射到CSS变量
- **差异视图**使用柔和背景色而非文字颜色
- **搜索高亮**使用黄色背景 `oklch(0.9 0.1 85)`

### 响应式设计考虑

#### 断点策略
- **Mobile**: < 768px - 隐藏侧边栏，使用底部导航
- **Tablet**: 768px - 1024px - 可收起侧边栏
- **Desktop**: > 1024px - 完整布局

#### 浏览器扩展适配
- **Popup**: 400x600px固定尺寸，简化导航
- **Side Panel**: 自适应高度，保持侧边栏

## 性能考虑

### CSS优化
- **变量计算缓存**：避免重复计算色彩值
- **选择器优化**：减少深层嵌套
- **关键CSS内联**：首屏渲染优化

### 兼容性
- **浏览器支持**：Chrome 88+, Firefox 96+, Safari 15.4+
- **回退机制**：不支持OKLCH时使用hex值
- **渐进增强**：核心功能在老版本浏览器中仍可用

## 可访问性考虑

### 对比度标准
- **文字对比度**：达到WCAG AA标准(4.5:1)
- **交互元素**：达到AAA标准(7:1)
- **颜色独立性**：不仅依赖颜色传达信息

### 用户偏好支持
- **动态减少**：`prefers-reduced-motion`支持
- **高对比度**：`prefers-contrast: high`支持
- **颜色偏好**：`prefers-color-scheme`支持

## 测试策略

### 视觉回归测试
- **快照测试**：关键界面的截图对比
- **跨浏览器**：Chrome, Firefox, Safari测试
- **设备测试**：Desktop, Tablet, Mobile

### 可访问性测试
- **自动化工具**：axe-core集成
- **手动测试**：键盘导航，屏幕阅读器
- **用户测试**：开发者用户群体反馈

### 性能监控
- **渲染性能**：First Paint, LCP指标
- **CSS加载**：样式表大小和加载时间
- **运行时性能**：主题切换流畅度