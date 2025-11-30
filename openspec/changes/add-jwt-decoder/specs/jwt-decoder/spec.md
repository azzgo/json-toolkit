## ADDED Requirements

### Requirement: JWT 令牌输入
系统 SHALL 提供 JWT 令牌输入字段，接受粘贴和输入的 JWT 字符串。

#### Scenario: 有效的 JWT 输入
- **WHEN** 用户粘贴或输入有效的 JWT 令牌时
- **THEN** 系统立即解析并显示解码后的组件

#### Scenario: 无效的 JWT 输入
- **WHEN** 用户输入无效或格式错误的 JWT 令牌时
- **THEN** 系统显示清晰的错误消息说明问题

### Requirement: JWT Header 显示
系统 SHALL 提取并显示 JWT header 作为带语法高亮的格式化 JSON。

#### Scenario: Header 提取
- **WHEN** 提供有效的 JWT 令牌时
- **THEN** header 部分以可读的 JSON 格式显示算法、令牌类型和任何额外的 header 声明

### Requirement: JWT Payload 显示
系统 SHALL 提取并显示 JWT payload 作为带语法高亮的格式化 JSON。

#### Scenario: Payload 提取
- **WHEN** 提供有效的 JWT 令牌时
- **THEN** payload 部分以可读的 JSON 格式显示所有声明

#### Scenario: 时间戳格式化
- **WHEN** payload 包含时间戳字段（`exp`、`iat`、`nbf`）时
- **THEN** 这些字段同时显示 Unix 时间戳和人类可读的日期/时间

### Requirement: JWT 签名显示
系统 SHALL 显示 JWT 签名的 Base64 编码形式。

#### Scenario: 签名显示
- **WHEN** 提供有效的 JWT 令牌时
- **THEN** 签名部分显示 Base64 编码的签名值

### Requirement: 复制功能
系统 SHALL 为每个解码部分提供复制到剪贴板的功能。

#### Scenario: 复制解码内容
- **WHEN** 用户点击任意部分（header、payload、signature）的复制按钮时
- **THEN** 该部分的 JSON 内容被复制到剪贴板

### Requirement: 导航集成
系统 SHALL 将 JWT 解码器集成到主应用程序导航中。

#### Scenario: 通过导航访问
- **WHEN** 用户导航到 JWT 解码器时
- **THEN** JWT 解码器界面在主内容区域显示

### Requirement: 错误处理
系统 SHALL 优雅地处理各种 JWT 令牌错误情况。

#### Scenario: JWT 结构格式错误
- **WHEN** 令牌不符合标准的三部分 JWT 结构时
- **THEN** 错误消息说明有效的 JWT 需要 header、payload 和 signature 部分

#### Scenario: 无效的 Base64 编码
- **WHEN** 任何 JWT 部分包含无效的 Base64 编码时
- **THEN** 错误消息指出哪个部分有编码问题