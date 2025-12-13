# ChatGPT Team Invite

自动化 ChatGPT Team 邀请系统，部署在 Cloudflare Workers 上。

## 功能

- 用户提交邮箱地址
- 自动调用 ChatGPT API 发送 Team 邀请
- 用户收到 OpenAI 官方邀请邮件

## 部署步骤

### 1. 获取认证信息

登录 ChatGPT Team 管理后台：

```
https://chatgpt.com/admin/members
```

打开浏览器开发者工具 (F12) → Network 面板 → 随便触发一个请求，找到以下两个值：

| 名称 | Header 字段 |
|------|-------------|
| ACCOUNT_ID | `chatgpt-account-id` |
| TOKEN | `authorization` 中 `Bearer ` 后面的部分 |

### 2. 部署到 Cloudflare Workers

#### 方式一：Wrangler CLI

```bash
npm install -g wrangler
```

```bash
wrangler login
```

```bash
wrangler deploy
```

#### 方式二：Cloudflare Dashboard

1. 进入 [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers)
2. 创建新 Worker
3. 复制 `worker.js` 内容粘贴
4. 保存并部署

### 3. 配置环境变量

在 Cloudflare Workers 设置中添加环境变量：

| 变量名 | 说明 |
|--------|------|
| `ACCOUNT_ID` | ChatGPT Team 账户 ID |
| `TOKEN` | ChatGPT 认证 Token |
| `WORKSPACE_NAME` | Team 名称（可选，用于前端显示） |

### 4. 绑定自定义域名（可选）

在 Workers 设置中添加自定义域名。

## API 说明

### 提交邀请

```
POST /api/invite
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 响应

成功：
```json
{
  "success": true,
  "message": "邀请已发送，请查收邮件"
}
```

失败：
```json
{
  "success": false,
  "error": "错误信息"
}
```

## 工作原理

```
用户输入邮箱 → Cloudflare Worker → ChatGPT API → OpenAI 发送邀请邮件 → 用户点击链接加入 Team
```

邀请链接由 OpenAI 官方生成并通过邮件发送，格式如：

```
https://chatgpt.com/auth/login?inv_ws_name=XXX&inv_email=xxx&wId=xxx&accept_wId=xxx
```

## 注意事项

- Token 有效期有限，失效后需要重新获取
- 每个 Team 最多邀请 5 人（标准版）
- 建议添加频率限制防止滥用

## License

MIT
