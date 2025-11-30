# 变更: 添加多语言代码生成功能

## Why
开发者经常需要将 JSON 数据转换为不同编程语言的强类型代码。目前工具包仅支持 JSON 转 TypeScript，这限制了其在多语言开发团队和跨平台项目中的实用性。

## What Changes
- 添加对 Go、Java、Python (Pydantic)、Rust、Swift 和 C# 类型/类生成的支持
- 集成 quicktype-core 或类似库以实现强大的代码生成
- 在工具包界面中提供新的"代码生成"页面/工具
- 保持现有的 TypeScript 生成功能，同时扩展到其他语言
- 包含对不支持的 JSON 结构的适当错误处理

## Impact
- 受影响的规范: 新增 `code-generation` 能力
- 受影响的代码: 
  - `packages/toolkit/src/pages/` 中的新页面组件
  - `packages/toolkit/src/lib/` 中的新工具函数
  - 更新 `packages/toolkit/src/components/app-sidebar.tsx` 中的侧边栏导航
  - Package.json 依赖项 (quicktype-core 或等效库)