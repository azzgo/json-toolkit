import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Copy, ArrowLeftRight, Link2, Code2, AlertTriangle, Info, Download } from "lucide-react";
import { JsonDisplayEditor } from "@/components/JsonDisplayEditor";
import { 
  extractQueryFromUrl, 
  objectToQueryString, 
  formatQueryString, 
  isSerializableForUrl, 
  type ParsedUrlData 
} from "@/lib/url-params";

function UrlParamsConverter() {
  const [urlInput, setUrlInput] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [parsedUrlData, setParsedUrlData] = useState<ParsedUrlData | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleUrlInputChange = useCallback((value: string) => {
    setUrlInput(value);
    if (!value.trim()) {
      setParsedUrlData(null);
      setUrlError(null);
      return;
    }

    try {
      const parsedData = extractQueryFromUrl(value.trim());
      setParsedUrlData(parsedData);
      setUrlError(null);
      
      // Auto-update JSON if it's empty
      if (!jsonInput.trim()) {
        setJsonInput(JSON.stringify(parsedData.queryParams, null, 2));
      }
    } catch (err) {
      setUrlError("Failed to parse URL or query string");
      setParsedUrlData(null);
    }
  }, [jsonInput]);

  const handleJsonInputChange = useCallback((value: string) => {
    setJsonInput(value);
    if (!value.trim()) {
      setJsonError(null);
      return;
    }

    try {
      const jsonObject = JSON.parse(value.trim());
      
      if (!isSerializableForUrl(jsonObject)) {
        setJsonError("JSON contains values that cannot be serialized to URL parameters");
        return;
      }
      
      setJsonError(null);
      
      // Auto-update URL if it's empty or only contains base URL
      if (!urlInput.trim() || !urlInput.includes('?')) {
        const queryString = objectToQueryString(jsonObject);
        const baseUrl = urlInput.includes('?') ? urlInput.split('?')[0] : (urlInput || '');
        const newUrl = baseUrl + (queryString ? '?' + queryString : '');
        setUrlInput(newUrl);
        
        // Update parsed data
        const parsedData = extractQueryFromUrl(newUrl);
        setParsedUrlData(parsedData);
      }
    } catch (err) {
      setJsonError("Invalid JSON format");
    }
  }, [urlInput]);

  const convertUrlToJson = useCallback(() => {
    if (!urlInput.trim()) {
      toast.error("Please enter a URL or query string");
      return;
    }

    try {
      const parsedData = extractQueryFromUrl(urlInput.trim());
      setJsonInput(JSON.stringify(parsedData.queryParams, null, 2));
      setParsedUrlData(parsedData);
      setUrlError(null);
      toast.success("URL converted to JSON");
    } catch (err) {
      setUrlError("Failed to parse URL");
      toast.error("Failed to convert URL to JSON");
    }
  }, [urlInput]);

  const convertJsonToUrl = useCallback(() => {
    if (!jsonInput.trim()) {
      toast.error("Please enter JSON data");
      return;
    }

    try {
      const jsonObject = JSON.parse(jsonInput.trim());
      
      if (!isSerializableForUrl(jsonObject)) {
        setJsonError("JSON contains values that cannot be serialized to URL parameters");
        toast.error("JSON contains unsupported data types for URL parameters");
        return;
      }

      const queryString = objectToQueryString(jsonObject);
      const baseUrl = urlInput.includes('?') ? urlInput.split('?')[0] : (urlInput || '');
      const newUrl = baseUrl + (queryString ? '?' + queryString : '');
      
      setUrlInput(newUrl);
      const parsedData = extractQueryFromUrl(newUrl);
      setParsedUrlData(parsedData);
      setJsonError(null);
      toast.success("JSON converted to URL");
    } catch (err) {
      setJsonError("Invalid JSON format");
      toast.error("Failed to convert JSON to URL");
    }
  }, [jsonInput, urlInput]);

  const copyToClipboard = async (content: string, section: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`${section} copied to clipboard`);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const downloadAsFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const clearAll = () => {
    setUrlInput("");
    setJsonInput("");
    setParsedUrlData(null);
    setUrlError(null);
    setJsonError(null);
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-4 p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link2 className="size-5" />
          <h1 className="text-xl font-semibold">URL Parameters Converter</h1>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Convert between URL query parameters and JSON objects. Supports full URLs, query strings, nested objects, and arrays.
        </div>

        {/* Example URLs */}
        <div className="p-3 bg-muted/30 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info className="size-4" />
            <span className="text-sm font-medium">Supported formats:</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Full URL: <code className="bg-muted px-1 rounded break-all">https://api.example.com/users?name=John&age=30</code></div>
            <div>• Query string: <code className="bg-muted px-1 rounded break-all">?name=John&age=30&tags=red&tags=blue</code></div>
            <div>• Parameters only: <code className="bg-muted px-1 rounded break-all">name=John&age=30&user[email]=john@example.com</code></div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* URL Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="size-4" />
              <h2 className="text-lg font-semibold">URL / Query String</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={convertUrlToJson}
                disabled={!urlInput.trim()}
                className="h-8 px-3 text-sm"
              >
                <ArrowLeftRight className="size-4 mr-2" />
                To JSON
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(urlInput, "URL")}
                disabled={!urlInput.trim()}
                className="h-8 px-3 text-sm"
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              placeholder="Paste your URL or query string here..."
              value={urlInput}
              onChange={(e) => handleUrlInputChange(e.target.value)}
              className="w-full p-3 text-sm font-mono border rounded-md bg-background resize-none min-h-[80px] break-all"
              spellCheck={false}
            />
            {urlInput && !urlError && (
              <div className="text-xs text-muted-foreground">
                Length: {urlInput.length} characters
                {parsedUrlData?.queryString && ` • Query params: ${Object.keys(parsedUrlData.queryParams).length}`}
              </div>
            )}
          </div>

          {urlError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertTriangle className="size-4 text-destructive" />
              <span className="text-sm text-destructive">{urlError}</span>
            </div>
          )}

          {/* URL Breakdown */}
          {parsedUrlData && !urlError && (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <h3 className="text-sm font-semibold">URL Breakdown</h3>
              
              {parsedUrlData.baseUrl && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Base URL</div>
                  <div className="text-sm font-mono bg-background p-2 rounded border break-all">
                    {parsedUrlData.baseUrl}
                  </div>
                </div>
              )}
              
              {parsedUrlData.queryString && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Query String</div>
                  <div className="text-sm font-mono bg-background p-2 rounded border break-all">
                    {formatQueryString(parsedUrlData.queryString)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* JSON Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="size-4" />
              <h2 className="text-lg font-semibold">JSON Object</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={convertJsonToUrl}
                disabled={!jsonInput.trim()}
                className="h-8 px-3 text-sm"
              >
                <ArrowLeftRight className="size-4 mr-2" />
                To URL
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(jsonInput, "JSON")}
                disabled={!jsonInput.trim()}
                className="h-8 px-3 text-sm"
              >
                <Copy className="size-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadAsFile(jsonInput, 'url-params.json', 'application/json')}
                disabled={!jsonInput.trim()}
                className="h-8 px-3 text-sm"
              >
                <Download className="size-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <JsonDisplayEditor
              value={jsonInput}
              onChange={handleJsonInputChange}
              placeholder="Switch Edit Mode to Enter JSON object here..."
              className="w-full"
            />
          </div>

          {jsonError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertTriangle className="size-4 text-destructive" />
              <span className="text-sm text-destructive">{jsonError}</span>
            </div>
          )}

          {/* JSON Preview */}
          {jsonInput && !jsonError && (() => {
            try {
              const parsed = JSON.parse(jsonInput);
              const formattedJson = JSON.stringify(parsed, null, 2);
              const keys = Object.keys(parsed);
              return (
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    Valid JSON • Keys: {keys.length} • Length: {jsonInput.length} characters
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h3 className="text-sm font-semibold mb-3">JSON Preview</h3>
                    <JsonDisplayEditor
                      value={formattedJson}
                      readOnly={true}
                      showModeToggle={false}
                      className="w-full"
                    />
                  </div>
                </div>
              );
            } catch {
              return null;
            }
          })()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <Button
          variant="outline"
          onClick={clearAll}
          className="flex items-center gap-2"
        >
          Clear All
        </Button>
      </div>

      {/* Examples Section */}
      <Separator />
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Examples</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 p-4 border rounded-lg">
            <h3 className="text-sm font-semibold">Simple Parameters</h3>
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">URL:</div>
              <code className="text-xs bg-muted p-2 rounded block break-all">
                ?name=John&age=30&active=true
              </code>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">JSON:</div>
              <JsonDisplayEditor
                value={`{
  "name": "John",
  "age": "30", 
  "active": "true"
}`}
                readOnly={true}
                showModeToggle={false}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-2 p-4 border rounded-lg">
            <h3 className="text-sm font-semibold">Nested Objects & Arrays</h3>
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">URL:</div>
              <code className="text-xs bg-muted p-2 rounded block break-all">
                ?user[name]=John&user[email]=john@example.com&tags=red&tags=blue
              </code>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">JSON:</div>
              <JsonDisplayEditor
                value={`{
  "user": {
    "name": "John",
    "email": "john@example.com"
  },
  "tags": ["red", "blue"]
}`}
                readOnly={true}
                showModeToggle={false}
                className="text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UrlParamsConverter;
