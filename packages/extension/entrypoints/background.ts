export default defineBackground(() => {
  // Handle extension icon click
  browser.action.onClicked.addListener(() => {
    browser.tabs.create({
      url: "toolkit/index.html",
    });
  });

  // Create context menu when extension is installed or enabled
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: "openInJsonToolkit",
      title: "在 JSON Toolkit 中打开",
      contexts: ["selection"],
    });
  });

  // Handle context menu clicks
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "openInJsonToolkit" && info.selectionText && tab?.id) {
      // Send message to content script to get the selected text
      browser.tabs.sendMessage(tab.id, {
        action: "getSelectedText",
      }).then((response) => {
        if (response && response.selectedText) {
          // Open JSON Toolkit with the selected text
          openJsonToolkitWithContent(response.selectedText);
        }
      }).catch(() => {
        // Fallback: use the selectionText from context menu
        openJsonToolkitWithContent(info.selectionText || "");
      });
    }
  });

  function openJsonToolkitWithContent(content: string) {
    // Create or focus a JSON Toolkit tab with the selected content
    const toolkitUrl = `toolkit/index.html?content=${encodeURIComponent(content)}`;
    
    browser.tabs.create({
      url: toolkitUrl,
    });
  }
});
