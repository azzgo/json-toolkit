# JSON Toolkit Browser Extension

> The project is on early access, and the extension is not yet available in the Chrome Web Store or Firefox Add-ons. You can build it locally using the provided instructions.

This project is a browser extension for local JSON editing. It leverages the powerful [`josdejong/svelte-jsoneditor`](https://github.com/josdejong/svelte-jsoneditor) library, inheriting all its features for intuitive and flexible JSON manipulation.

Key features:
- Edit and view JSON data locally within your browser.
- Visualize differences between two JSON objects using JSON diff.
- Differences are highlighted directly in the editor using custom class features for clear comparison.

## Build Instructions

To build the extension, follow these steps:

```bash
bun install
bun run toolkit:build:extension
# Build for specific browsers
bun run ext:build:chrome
bun run ext:build:firefox
```
