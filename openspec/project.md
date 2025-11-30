# 项目背景

## 项目目的
JSON Toolkit 是一款浏览器扩展和 Web 应用，提供高级 JSON 操作工具。项目旨在通过格式转换、验证、可视化以及开发者工具（如 JWT 解码和模拟数据生成）来解决开发者常见的 JSON 相关痛点。

## 技术栈
- **前端**: React 19, TypeScript, Vite
- **UI 组件**: Radix UI, Tailwind CSS v4, Lucide React 图标
- **JSON 处理**: vanilla-jsoneditor, json-diff, json-to-ts, schema2dts
- **浏览器扩展**: WXT (Web Extension Framework)
- **构建工具**: Vite, TypeScript, ESLint
- **包管理器**: Bun (monorepo 工作空间)

## 项目约定

### 代码风格
- 启用 TypeScript 严格模式
- 使用 ESLint 进行代码检查，配合 React hooks 和 refresh 插件
- 偏好使用 hooks 的函数式组件
- 文件和目录使用 kebab-case 命名
- React 组件使用 PascalCase 命名
- 利用 Radix UI + Tailwind CSS 保持一致的样式

### 架构模式
- Monorepo 结构，toolkit (Web 应用) 和 extension 分别为独立包
- 在 toolkit 中使用 React Router 进行客户端路由
- 在 `components/ui/` 中放置共享组件，遵循 shadcn/ui 模式
- 在 `hooks/` 目录中放置自定义 hooks
- 在 `pages/` 目录中组织页面/功能
- 工具函数放在 `lib/utils.ts`

### 测试策略
- 尚未配置明确的测试框架（有改进空间）
- 通过开发服务器和浏览器扩展开发模式进行手动测试
- 通过 ESLint 配置强制执行代码检查

### Git 工作流
- 标准 Git 工作流
- 针对不同浏览器目标（Chrome、Firefox）有独立的构建脚本
- Web 应用和扩展都有开发和生产构建流程

## 领域上下文
JSON Toolkit 专注于 JSON 操作的开发者生产力工具：
- **格式转换**: JSON ↔ YAML、XML、CSV、TypeScript 类型
- **开发者工具**: JWT 解码、URL 参数转换
- **浏览器集成**: 右键上下文菜单、从网页修复 JSON
- **数据模拟**: 基于 JSON schema 使用 faker.js 生成测试数据
- **代码生成**: 多语言类型生成（Go、Java、Python、Rust、Swift、C#）

## 重要约束
- 必须同时作为独立 Web 应用和浏览器扩展工作
- 浏览器扩展必须支持 Chrome 和 Firefox（使用 WXT 实现跨浏览器兼容）
- Web 应用必须可嵌入扩展的弹窗/侧边栏
- 对大型 JSON 文件要考虑性能
- 核心功能不依赖外部 API（客户端处理）

## 外部依赖
- **Radix UI**: 可访问的无样式 UI 原语
- **Tailwind CSS**: 工具优先的 CSS 框架
- **vanilla-jsoneditor**: 带语法高亮的高级 JSON 编辑器
- **WXT**: 跨浏览器扩展开发框架
- **各种 JSON 工具**: json-diff、json-to-ts、schema2dts 用于专业处理
