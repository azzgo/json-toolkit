## ADDED Requirements

### Requirement: 完整 URL 自动解析和查询参数提取
系统应当(SHALL)自动检测完整 URL 输入并提取查询参数部分进行转换。

#### Scenario: 粘贴完整 URL 自动提取查询参数
- **当** 用户粘贴完整 URL "https://api.example.com/users?name=John&age=30&active=true"
- **那么** 系统自动识别并提取查询字符串 "name=John&age=30&active=true"
- **并且** 自动转换为 JSON 对象 `{"name": "John", "age": "30", "active": "true"}`

#### Scenario: 支持各种 URL 格式
- **当** 用户输入不同格式的 URL（带或不带协议，带或不带域名）
- **那么** 系统正确识别并提取查询参数
- **例如**: 
  - "www.example.com/page?param=value" 
  - "/api/data?filter=active&sort=desc"
  - "https://subdomain.example.com:8080/path?complex=param"

### Requirement: URL 查询字符串到 JSON 转换
系统应当(SHALL)解析 URL 查询字符串并将其转换为具有适当类型处理的结构化 JSON 对象。

#### Scenario: 将简单查询字符串转换为 JSON
- **当** 用户输入带查询字符串 "?name=John&age=30&active=true" 的 URL
- **那么** 系统生成 JSON 对象 `{"name": "John", "age": "30", "active": "true"}`

#### Scenario: 使用括号记法处理嵌套参数
- **当** 用户输入带嵌套参数 "?user[name]=John&user[email]=john@example.com" 的 URL
- **那么** 系统生成嵌套 JSON 对象 `{"user": {"name": "John", "email": "john@example.com"}}`

#### Scenario: 将数组参数转换为 JSON
- **当** 用户输入带重复参数 "?tags=red&tags=blue&tags=green" 的 URL
- **那么** 系统生成带数组的 JSON `{"tags": ["red", "blue", "green"]}`

### Requirement: JSON 到 URL 查询字符串转换
系统应当(SHALL)将 JSON 对象序列化为格式正确且编码的 URL 查询字符串。

#### Scenario: 将扁平 JSON 对象转换为查询字符串
- **当** 用户输入 JSON `{"name": "John", "age": 30, "active": true}`
- **那么** 系统生成查询字符串 "?name=John&age=30&active=true"

#### Scenario: 将嵌套 JSON 转换为括号记法
- **当** 用户输入嵌套 JSON `{"user": {"name": "John", "email": "john@example.com"}}`
- **那么** 系统生成查询字符串 "?user[name]=John&user[email]=john@example.com"

#### Scenario: 将 JSON 数组转换为重复参数
- **当** 用户输入带数组的 JSON `{"tags": ["red", "blue", "green"]}`
- **那么** 系统生成查询字符串 "?tags=red&tags=blue&tags=green"

### Requirement: URL 编码和字符处理
系统应当(SHALL)正确处理参数值中特殊字符的 URL 编码和解码。

#### Scenario: 处理值中的特殊字符
- **当** 用户输入包含空格、符号或非 ASCII 字符的参数
- **那么** 系统正确地对值进行 URL 编码 (空格变成 %20 等)

#### Scenario: 解码编码的参数
- **当** 用户输入带编码字符的 URL，如 "name=John%20Doe&title=Senior%20Developer"
- **那么** 系统解码为可读的 JSON `{"name": "John Doe", "title": "Senior Developer"}`

### Requirement: 参数格式选项和配置
系统应当(SHALL)提供处理不同参数格式和边缘情况的选项。

#### Scenario: 选择数组序列化格式
- **当** 用户选择不同的数组格式 (括号、索引、逗号分隔)
- **那么** 系统根据选定格式转换数组 (tags[]=red vs tags[0]=red vs tags=red,blue)

#### Scenario: 处理空参数和重复参数
- **当** 用户输入带空值或重复键的 URL
- **那么** 系统提供处理行为的选项 (保持空值、过滤掉、合并值)

### Requirement: 输入验证和错误处理
系统应当(SHALL)验证输入并为格式错误的 URL 或不兼容的 JSON 结构提供清晰的错误消息。

#### Scenario: 无效的 URL 格式
- **当** 用户输入格式错误的 URL 或查询字符串
- **那么** 系统显示关于 URL 语法问题的具体错误消息

#### Scenario: 不可序列化的 JSON 值
- **当** 用户输入包含函数、undefined 或深度嵌套对象的 JSON
- **那么** 系统提供关于不支持值和转换限制的警告

#### Scenario: 非常长的 URL 处理
- **当** 转换的查询字符串超过浏览器 URL 限制
- **那么** 系统警告可能的 URL 长度限制

### Requirement: 用户界面和可用性
系统应当(SHALL)提供直观的双向转换界面和有用的功能。

#### Scenario: 实时转换预览
- **当** 用户在 URL 或 JSON 输入中键入
- **那么** 系统立即更新对应的输出格式

#### Scenario: 复制和导出功能
- **当** 用户想要复制或导出转换结果
- **那么** 系统为两种格式提供复制到剪贴板和下载选项

#### Scenario: 格式示例和帮助
- **当** 用户需要支持格式的指导
- **那么** 系统提供清晰的 URL 参数格式示例和对应的 JSON 结构

### Requirement: JSON 编辑器和语法高亮增强
系统应当(SHALL)提供专业的JSON编辑和显示体验，区分可编辑和只读场景。

#### Scenario: JSON 编辑器用于可编辑场景
- **当** 用户需要编辑或输入 JSON 数据
- **那么** 系统提供带有语法高亮、错误检测和自动完成的专业 JSON 编辑器
- **并且** 编辑器支持格式化、折叠和验证功能
- **并且** 编辑器采用紧凑布局，无多余留白，优化屏幕空间使用

#### Scenario: 语法高亮用于只读显示
- **当** 系统显示解析后的 JSON 数据或示例
- **那么** 系统使用语法高亮来增强可读性
- **并且** 高亮显示包括键、字符串、数字、布尔值和特殊字符的不同着色

#### Scenario: 编辑模式切换
- **当** 用户需要在编辑和预览模式之间切换
- **那么** 系统提供清晰的模式切换选项
- **并且** 默认使用预览模式（语法高亮显示）提供更好的阅读体验
- **并且** 保持数据一致性和用户体验连续性

#### Scenario: JSON 验证和错误提示
- **当** 用户输入无效的 JSON 格式
- **那么** 编辑器实时显示错误位置和具体错误信息
- **并且** 提供修复建议和格式化选项