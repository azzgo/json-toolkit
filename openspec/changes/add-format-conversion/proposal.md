# 变更: 添加 JSON 格式转换功能

## Why
开发者经常需要将 JSON 数据与其他常见数据格式（如 YAML、XML 和 CSV）进行相互转换。这对于配置管理（Kubernetes、Docker Compose 使用 YAML）、遗留系统集成（XML）和数据分析/报告（CSV 导出）尤其重要。

## What Changes
- 添加 JSON 与 YAML 之间的双向转换
- 添加 JSON 与 XML 之间的双向转换
- 添加 JSON 与 CSV 之间的双向转换
- 在工具包界面中提供新的"格式转换器"页面/工具
- 包含格式验证和对格式错误输入的错误处理
- 支持输出格式的适当格式化和缩进选项

## Impact
- 受影响的规范: 新增 `format-conversion` 能力
- 受影响的代码:
  - `packages/toolkit/src/pages/` 中的新页面组件
  - `packages/toolkit/src/lib/` 中的新工具函数
  - 更新 `packages/toolkit/src/components/app-sidebar.tsx` 中的侧边栏导航
  - Package.json 依赖项 (js-yaml, xml2js, csv-parse, csv-stringify)