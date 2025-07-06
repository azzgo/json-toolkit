export default defineBackground(() => {
  browser.action.onClicked.addListener(() => {
    browser.tabs.create({
      url: "toolkit/index.html",
    });
  });
});
