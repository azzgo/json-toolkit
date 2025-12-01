import { defineConfig } from "wxt";
import packageJson from "./package.json";


// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "JSON Toolkit",
    version: packageJson.version,
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
