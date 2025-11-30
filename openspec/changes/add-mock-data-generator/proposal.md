# 变更: 添加模拟数据生成器

## Why
前端开发者和测试人员经常需要遵循特定 JSON 结构的真实模拟数据来测试应用程序、API 和用户界面。手动创建测试数据耗时且通常缺乏全面测试所需的多样性。

## What Changes
- 基于现有 JSON 结构或 JSON Schema 添加模拟数据生成
- 集成 faker.js 以基于字段名称和类型生成真实的假数据
- 提供智能字段检测 (邮箱、电话、姓名、地址等)
- 支持可自定义的生成参数 (数量、语言环境、数据类型)
- 添加基于 JSON Schema 的生成以实现更精确的控制
- 包含生成的模拟数据集的数据导出功能

## Impact
- 受影响的规范: 新增 `mock-data-generator` 能力
- 受影响的代码:
  - `packages/toolkit/src/pages/` 中的新页面组件
  - `packages/toolkit/src/lib/` 中的新工具函数
  - 更新 `packages/toolkit/src/components/app-sidebar.tsx` 中的侧边栏导航
  - Package.json 依赖项 (faker.js, 可能的 json-schema-faker)