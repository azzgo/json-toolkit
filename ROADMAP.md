# JSON Toolkit Development Roadmap

## Phase 1: 格式转换与多语言支持 (Format & Code Gen)
扩展 JSON 的输入输出边界，使其成为数据流转的中心。

- [ ] **多语言类型生成 (Code Generation)**
  - [ ] 集成 `quicktype-core` 或类似库。
  - [ ] 支持除 TypeScript 外的主流语言：Go, Java, Python (Pydantic), Rust, Swift, C#。
- [ ] **异构格式互转**
  - [ ] **JSON <-> YAML**: 方便处理 K8s/Docker Compose 等配置。
  - [ ] **JSON <-> XML**: 兼容老旧系统数据。
  - [ ] **JSON <-> CSV**: 方便数据导出与运营查看。

## Phase 2: 开发者实用工具箱 (Dev Utilities)
解决 JSON 数据相关的周边痛点，增加工具粘性。

- [x] **JWT 解码器 (JWT Decoder)** ✅ *已完成*
  - [x] 新增独立 Tab 或工具栏入口。
  - [x] 输入 JWT 字符串，展示 Header 和 Payload 的 JSON 结构。
  - [x] 解析并格式化显示 `exp`, `iat` 等时间戳字段。
  - [x] **JWT 签名验证 (Signature Verification)** 🆕
    - [x] 支持 HMAC 算法 (HS256, HS384, HS512)
    - [x] 安全的密钥输入和实时验证反馈
    - [x] 客户端签名验证，确保数据安全
    - [x] 验证状态指示器和详细错误信息
- [x] **URL Params 转换器** ✅ *已完成*
  - [x] **URL -> JSON**: 将 URL Query String 解析为 JSON 对象。
  - [x] **JSON -> URL**: 将 JSON 对象序列化为 Query String。
  - [x] **智能URL解析 (Smart URL Parsing)** 🆕
    - [x] 支持完整URL粘贴，自动提取查询参数部分
    - [x] 处理各种URL格式（带/不带协议、域名、端口）
    - [x] 支持嵌套对象记法 (user[name]=John) 和数组参数
  - [x] **专业JSON编辑体验 (Enhanced JSON Editing)** 🆕
    - [x] 集成 vanilla-jsoneditor 提供完整编辑功能
    - [x] highlight.js 语法高亮显示
    - [x] 编辑/预览模式切换，默认预览模式优化体验
    - [x] 实时JSON验证、格式化和错误提示
    - [x] 紧凑布局设计，优化屏幕空间利用

## Phase 3: 浏览器深度集成 (Browser Integration)
利用扩展特性，打通网页内容到工具的路径。

- [ ] **右键菜单集成 (Context Menu)**
  - [ ] 在网页选中文本后，右键菜单显示 "Open in JSON Toolkit"。
  - [ ] 将选中内容传递至扩展页面。
- [ ] **智能容错与修复 (JSON Repair)**
  - [ ] 针对右键选中的非标准 JSON (如 JS Object 字面量、缺失引号、多余逗号) 进行自动修复。
  - [ ] 尝试使用 `json5` 或 `json-repair` 类库进行预处理。

## Phase 4: 数据模拟 (Mocking)
反向生产力工具，辅助前端开发与测试。

- [ ] **Mock 数据生成器**
  - [ ] 基于当前 JSON 结构或 Schema，生成大量测试数据。
  - [ ] 集成 `faker.js`，支持针对字段名 (e.g., name, email, avatar) 智能填充真实感的假数据。
