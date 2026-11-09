# 浏览器页面操作

Web UI 通过 page-picker 浏览器扩展操作用户明确授权的页面。服务端不直接连接系统浏览器；执行请求经过当前在线的 Web UI 页面，再由扩展路由到目标页面。

## 模块与边界

- `server/browser-page-tool.ts`：`browser_page` 工具定义、参数校验与结果整理。
- `web/src/browser-control.ts`：扩展状态查询、已授权页面列表和页面引用。
- `web/src/components/BrowserControl.tsx`：顶栏入口、连接状态、安装与授权指引。
- `web/src/plugin-host.ts`：维护 `window.__piWebUiHost` 页面宿主桥，将服务端请求交给扩展。
- `plugins/page-picker/extension/src/background.ts`：扩展权限检查、授权页面状态与请求路由。
- `plugins/page-picker/extension/src/content/bridge-page.ts`：目标页面内的读取、点击、输入等操作。

安装、构建扩展和用户授权流程见 [`plugins/page-picker/README.md`](../plugins/page-picker/README.md)。扩展是浏览器侧能力，可与本机、局域网或远端部署的 Web UI 配合使用。

## 请求与连接

```text
Agent 的 browser_page
→ 已归属会话的 page_request
→ Web UI 的 __piWebUiHost.pageCall
→ page-picker 扩展
→ 用户授权的目标页面
→ page_response 原路返回
```

Web UI 页面必须保持在线，扩展服务地址必须匹配该页面的 origin 与反向代理路径。单独运行服务端不能替代浏览器页面连接，也不会自动取得系统浏览器的标签页或登录态。没有安装扩展、未开启 AI 页面控制或目标未授权时，应返回明确状态并引导用户完成配置。

## 页面身份与权限

- 页面控制仅面向用户在扩展中授权的 origin，不常驻注入所有站点。远端 Web UI 地址也需要相应 host 权限。
- `pages` / `status` 返回授权页面及其打开状态。只有最后聚焦窗口的当前授权标签页标记 `active`，并提供 `activeOrigin`；未授权页面即使在前台也不上报。
- 多页面时使用明确的 `target`。目标失效不得回退操作其他页面；单页面可直接引用到对话，多页面由用户选择。
- eval 默认关闭，由扩展设置显式开启。常规读取、点击、输入优先使用结构化操作。
- 口令框可以输入，但读取结果和 HTML 摘录不得返回其值，输入操作也不回显口令。脱敏事实源是 `bridge-page.ts` 的 `isPassword` / `outerHtmlMasked`。
- 跨异步请求始终使用创建请求时的会话归属，不读取临时 active 会话。

## 构建与验证

Web UI 按 `npm run build` 构建。扩展通过 `npm run build:extension` 构建，通过 `npm run pack:extension` 打包；加载方式见扩展 README。

相关回归包括 `tests/unit/browser-control.test.ts`、`tests/unit/browser-page-tool.test.ts`、`tests/unit/plugin-host.test.ts`、`tests/unit/page-picker-password-mask.test.ts` 及 `tests/page-picker-bridge-test.mjs`。测试使用独立临时数据和服务端口，不复用用户运行实例。
