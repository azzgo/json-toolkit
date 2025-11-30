# 变更: 添加 URL 参数转换器

## Why
开发者经常处理 URL 查询字符串，需要将它们转换为 JSON 进行处理，或者反之为构建 URL。这在 Web 开发、API 测试和调试场景中尤其常见，需要以编程方式操作查询参数。

## What Changes
- 添加 URL 查询字符串和 JSON 对象之间的双向转换
- 在工具包界面中提供新的"URL 参数转换器"页面/工具
- 支持嵌套参数结构 (括号记法如 `user[name]=John`)
- 处理数组参数 (相同键的多个值)
- 包含 URL 编码/解码功能
- 为格式错误的 URL 或 JSON 提供适当的验证和错误处理

## Impact
- 受影响的规范: 新增 `url-params-converter` 能力
- 受影响的代码:
  - `packages/toolkit/src/pages/` 中的新页面组件
  - `packages/toolkit/src/lib/` 中的新工具函数
  - 更新 `packages/toolkit/src/components/app-sidebar.tsx` 中的侧边栏导航
  - 可能依赖 query-string 或 qs 库进行高级解析