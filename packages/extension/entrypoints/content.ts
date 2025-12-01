export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    // Listen for messages from the background script
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.action === 'getSelectedText') {
        // Get the selected text from the page
        const selectedText = window.getSelection()?.toString() || '';
        
        // Basic JSON-like content detection
        const isLikelyJson = detectJsonLikeContent(selectedText);
        
        // Send response back to background script
        sendResponse({
          selectedText,
          isLikelyJson,
        });
        
        return true; // Keep the message channel open for async response
      }
    });

    // Helper function to detect if content looks like JSON
    function detectJsonLikeContent(text: string): boolean {
      if (!text || text.trim().length < 2) return false;
      
      const trimmed = text.trim();
      
      // Check for basic JSON-like structures
      const startsWithBrace = trimmed.startsWith('{') || trimmed.startsWith('[');
      const endsWithBrace = trimmed.endsWith('}') || trimmed.endsWith(']');
      
      // Check for object-like patterns (key: value, key = value, etc.)
      const hasKeyValuePatterns = /[\w"']\s*[:=]\s*[\w"'{[]/.test(trimmed);
      
      // Check for array-like patterns
      const hasArrayPatterns = /\[.*\]/.test(trimmed);
      
      return startsWithBrace && endsWithBrace || hasKeyValuePatterns || hasArrayPatterns;
    }
  },
});