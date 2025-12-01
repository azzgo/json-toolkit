import { defineConfig } from "wxt";
import packageJson from "./package.json";

// 将 npm 版本号转换为 Chrome 插件支持的格式
function toChromeVersion(npmVersion: string): string {
  const match = npmVersion.match(
    /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([a-z]+)\.(\d+))?$/,
  );
  if (!match) throw new Error("Invalid version: " + npmVersion);
  const [, major, minor, patch, pre, preNum] = match;
  let build = 0;
  if (pre) {
    if (pre === "alpha") build = 1000 + Number(preNum || 0);
    else if (pre === "beta") build = 2000 + Number(preNum || 0);
    else if (pre === "rc") build = 3000 + Number(preNum || 0);
    else build = 4000; // 其它预发布
  }
  return [major, minor, patch, build].join(".");
}

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "JSON Toolkit",
    version: toChromeVersion(packageJson.version),
    action: { default_title: "JSON Toolkit" },
    icons: {
      "16": "icon@16px.png",
      "48": "icon@48px.png",
      "128": "icon.png",
    },
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'",
    },
    permissions: ["contextMenus", "activeTab"],
  },
});
