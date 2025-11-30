# 变更: 添加浏览器深度集成

## Why
用户在浏览网页时经常遇到 JSON 数据，需要用 JSON Toolkit 处理它们。目前他们必须手动复制粘贴数据，这很麻烦。通过右键上下文菜单和自动 JSON 修复的浏览器集成将显著简化这一工作流程。

## What Changes
- 为网页上选定的文本添加右键上下文菜单集成
- 实现传递选定内容的"在 JSON Toolkit 中打开"上下文菜单选项
- 为格式错误的 JSON (JS 对象字面量、缺失引号、尾随逗号) 添加智能 JSON 修复功能
- 集成 json5 或 json-repair 库来预处理非标准 JSON
- 提供从网页内容到工具包界面的无缝切换
- **破坏性变更**: 需要上下文菜单和活动标签页访问的新浏览器扩展权限

## Impact
- 受影响的规范: 新增 `browser-integration` 能力
- 受影响的代码:
  - `packages/extension/entrypoints/background.ts` 中的浏览器扩展后台脚本
  - 用于页面交互的新内容脚本
  - 扩展清单权限更新
  - `packages/toolkit/src/lib/` 中的新 JSON 修复实用工具
  - 扩展和工具包 Web 应用之间的通信桥梁