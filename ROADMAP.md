# JSON Toolkit Development Roadmap

## Phase 1: 格式转换与多语言支持 (Format & Code Gen)
扩展 JSON 的输入输出边界，使其成为数据流转的中心。

- [x] **多语言类型生成 (Code Generation)** ✅ *已完成*
  - [x] 集成 `quicktype-core` 库，支持强大的代码生成能力
  - [x] 支持7种主流语言：TypeScript, Go, Java, Python (Pydantic), Rust, Swift, C#
  - [x] **专业JSON编辑体验 (Professional JSON Editor)** 🆕
    - [x] 完整替换基础textarea为vanilla-jsoneditor
    - [x] 语法高亮、行号、可折叠JSON对象和数组
    - [x] 文本/树状/表格三种编辑模式
    - [x] 实时JSON验证和错误提示
  - [x] **清理优化代码生成 (Clean Code Generation)** 🆕
    - [x] 自动移除序列化/反序列化样板代码
    - [x] 生成纯类型定义，代码更简洁
    - [x] 支持一键复制和下载生成的代码
  - [x] **多语言同时生成 (Batch Generation)** 🆕
    - [x] 一键生成所有7种语言的类型定义
    - [x] 实时状态反馈和成功通知
    - [x] 标签页切换查看不同语言结果
- [ ] **异构格式互转**
  - [ ] **JSON <-> YAML**: 方便处理 K8s/Docker Compose 等配置。
  - [ ] **JSON <-> XML**: 兼容老旧系统数据。
  - [ ] **JSON <-> CSV**: 方便数据导出与运营查看。

## Phase 2: 开发者实用工具箱 (Dev Utilities)
解决 JSON 数据相关的周边痛点，增加工具粘性。

- [x] **核心JSON编辑器 (JSON Editor)** ✅ *已完成*
  - [x] **统一页面设计 (Consistent Page Design)** 🆕
    - [x] 添加专业标题栏：图标 + "JSON Editor" 标题
    - [x] 清晰的功能描述："Edit, format, and validate JSON with syntax highlighting and tree view"
    - [x] 与其他页面保持一致的布局风格
  - [x] **专业编辑体验 (Professional Editing)** 🆕
    - [x] vanilla-jsoneditor 集成，提供完整编辑功能
    - [x] 文本模式：语法高亮、行号、实时验证
    - [x] 树状模式：层次化显示、可展开折叠节点
    - [x] 表格模式：适合数组数据的编辑
    - [x] 丰富的编辑工具：格式化、压缩、排序、搜索、撤销重做
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

## Phase 3: 浏览器深度集成 (Browser Integration) ✅ *已完成*
利用扩展特性，打通网页内容到工具的路径。

- [x] **右键菜单集成 (Context Menu)** ✅ *已完成*
  - [x] 在网页选中文本后，右键菜单显示 "在 JSON Toolkit 中打开"
  - [x] 将选中内容传递至扩展页面
  - [x] **扩展权限配置 (Extension Permissions)** 🆕
    - [x] 添加 contextMenus 和 activeTab 权限到扩展清单
    - [x] 实现后台脚本中的上下文菜单创建和点击处理
    - [x] 创建内容脚本用于捕获选定文本和智能内容检测
  - [x] **扩展-工具包通信协议 (Extension-Toolkit Communication)** 🆕
    - [x] 设计基于URL参数的简单通信协议
    - [x] 实现从上下文菜单到工具包的无缝数据传递
    - [x] 自动打开/聚焦工具包标签页并加载选中内容
    - [x] 内置错误处理和回退机制
- [x] **智能容错与修复 (JSON Repair)** ✅ *已完成*
  - [x] 针对右键选中的非标准 JSON (如 JS Object 字面量、缺失引号、多余逗号) 进行自动修复
  - [x] 集成 `json5` 和 `jsonrepair` 类库进行预处理
  - [x] **多策略修复引擎 (Multi-Strategy Repair Engine)** 🆕
    - [x] jsonrepair 库自动修复
    - [x] JSON5 解析支持 (JavaScript 对象字面量)
    - [x] 手动修复策略：尾随逗号、不带引号的键、单引号转换
    - [x] 智能内容检测：JSON vs 普通文本识别
  - [x] **修复透明性和用户控制 (Repair Transparency & User Control)** 🆕
    - [x] 置信度评分系统 (0-1.0)
    - [x] 详细的修复建议列表和应用状态
    - [x] 可视化修复建议卡片，支持接受/拒绝操作
    - [x] 高置信度修复 (>80%) 自动应用，低置信度显示建议
    - [x] Toast 通知系统用于修复操作反馈
  - [x] **安全和隐私保护 (Security & Privacy)** 🆕
    - [x] 所有数据处理在客户端本地进行
    - [x] 无持久存储，仅通过URL参数传递数据
    - [x] 清晰的权限声明和透明的权限使用

## Phase 4: 数据模拟 (Mocking)
反向生产力工具，辅助前端开发与测试。

- [x] **Mock 数据生成器** ✅ *已完成*
  - [x] 基于当前 JSON 结构或 Schema，生成大量测试数据。
  - [x] 集成 `faker.js`，支持针对字段名 (e.g., name, email, avatar) 智能填充真实感的假数据。
  - [x] **智能字段检测 (Smart Field Detection)** 🆕
    - [x] 自动识别15+种常见字段模式（邮箱、姓名、电话、地址等）
    - [x] 支持模糊匹配（user_email → email，firstName → 名字）
    - [x] 处理嵌套对象和数组结构的递归生成
  - [x] **分步骤引导流程 (Step-by-Step Guided Flow)** 🆕
    - [x] 三步引导：JSON结构输入 → 字段映射配置 → 数据生成导出
    - [x] 单向数据流设计，防止状态混乱
    - [x] 集成专业JSON编辑器，提供语法高亮和实时验证
  - [x] **自定义配置与导出 (Customization & Export)** 🆕
    - [x] 可调整字段映射覆盖自动检测结果
    - [x] 支持1-10,000条记录的批量生成
    - [x] 随机种子支持，确保可重现的测试数据
    - [x] 多格式导出：JSON数组、CSV格式、复制到剪贴板
