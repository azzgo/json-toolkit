import { useEffect, useRef, useState } from "react";
import { createJSONEditor, Content, JSONContent, TextContent } from "vanilla-jsoneditor";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Copy, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Editor } from "@/lib/types";

// Custom CSS for JSON editor to remove extra whitespace
const editorStyles = `
  .jse-editor {
    margin: 0 !important;
    padding: 0 !important;
  }
  .jse-editor .jse-main {
    margin: 0 !important;
  }
  .jse-editor .jse-contents {
    margin: 0 !important;
    padding: 8px !important;
  }
`;

interface JsonDisplayEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
  showModeToggle?: boolean;
}

export function JsonDisplayEditor({
  value,
  onChange,
  readOnly = false,
  className = "",
  placeholder = "Enter JSON here...",
  showModeToggle = true,
}: JsonDisplayEditorProps) {
  const editorRef = useRef<Editor | null>(null);
  const editorDomRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const [isEditorMode, setIsEditorMode] = useState(false); // Always default to preview mode
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add custom styles to reduce editor whitespace
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = editorStyles;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Initialize JSON editor
  useEffect(() => {
    if (isEditorMode && editorDomRef.current && !readOnly) {
      try {
        editorRef.current = createJSONEditor({
          target: editorDomRef.current,
          props: {
            mode: "text",
            content: {
              text: value
            },
            readOnly: false,
            mainMenuBar: false,  // Remove menu bar to save space
            statusBar: false,    // Remove status bar to save space
            onChange: (content: Content) => {
              try {
                let jsonText = "";
                if ((content as JSONContent).json !== undefined) {
                  jsonText = JSON.stringify((content as JSONContent).json, null, 2);
                } else if ((content as TextContent).text !== undefined) {
                  jsonText = (content as TextContent).text;
                }
                
                // Validate JSON
                try {
                  if (jsonText.trim()) {
                    JSON.parse(jsonText);
                    setIsValid(true);
                    setError(null);
                  } else {
                    setIsValid(true);
                    setError(null);
                  }
                } catch (e) {
                  setIsValid(false);
                  setError(e instanceof Error ? e.message : "Invalid JSON");
                }
                
                onChange?.(jsonText);
              } catch (e) {
                console.warn("JSON editor content change error:", e);
              }
            }
          },
        });
      } catch (e) {
        console.warn("Failed to create JSON editor:", e);
      }

      return () => {
        if (editorRef.current) {
          try {
            editorRef.current.destroy();
            editorRef.current = null;
          } catch (e) {
            console.warn("Failed to destroy JSON editor:", e);
          }
        }
      };
    }
  }, [isEditorMode, onChange, readOnly]);

  // Update editor content when value changes externally
  useEffect(() => {
    if (editorRef.current && isEditorMode && !readOnly) {
      try {
        const currentContent = editorRef.current.get();
        const currentText = (currentContent as TextContent).text || JSON.stringify((currentContent as JSONContent).json, null, 2) || "";
        
        if (currentText !== value) {
          editorRef.current.set({
            text: value
          });
        }
      } catch (e) {
        console.warn("Failed to update editor content:", e);
      }
    }
  }, [value, isEditorMode, readOnly]);

  // Highlight syntax for display mode
  useEffect(() => {
    if (!isEditorMode || readOnly) {
      if (highlightRef.current && value) {
        try {
          const highlighted = hljs.highlight(value, { language: 'json' }).value;
          highlightRef.current.innerHTML = highlighted;
        } catch (e) {
          // Fallback to plain text if highlighting fails
          highlightRef.current.textContent = value;
        }
      }
    }
  }, [value, isEditorMode, readOnly]);

  const toggleMode = () => {
    if (!readOnly) {
      setIsEditorMode(!isEditorMode);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("JSON copied to clipboard");
    } catch (e) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const formatJson = () => {
    if (!readOnly && onChange) {
      try {
        const parsed = JSON.parse(value);
        const formatted = JSON.stringify(parsed, null, 2);
        onChange(formatted);
        toast.success("JSON formatted");
      } catch (e) {
        toast.error("Invalid JSON - cannot format");
      }
    }
  };

  if (readOnly || !isEditorMode) {
    return (
      <div className={cn("space-y-2", className)}>
        {/* Header with controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!readOnly && showModeToggle && (
              <Button
                size="sm"
                variant="outline"
                onClick={toggleMode}
                className="h-7 px-2 text-xs"
              >
                <Edit className="size-3 mr-1" />
                Edit
              </Button>
            )}
            {isValid ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="size-3" />
                <span className="text-xs">Valid JSON</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="size-3" />
                <span className="text-xs">Invalid JSON</span>
              </div>
            ) : null}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={copyToClipboard}
            disabled={!value}
            className="h-7 px-2 text-xs"
          >
            <Copy className="size-3" />
          </Button>
        </div>

        {/* Highlighted display */}
        <div className="relative">
          <pre
            ref={highlightRef}
            className={cn(
              "text-sm font-mono bg-muted/30 border rounded-md p-3 overflow-auto whitespace-pre-wrap",
              !value && "text-muted-foreground"
            )}
          >
            {!value ? placeholder : value}
          </pre>
          
          {error && (
            <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showModeToggle && (
            <Button
              size="sm"
              variant="outline"
              onClick={toggleMode}
              className="h-7 px-2 text-xs"
            >
              <Eye className="size-3 mr-1" />
              Preview
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={formatJson}
            disabled={!value}
            className="h-7 px-2 text-xs"
          >
            Format
          </Button>
          {isValid ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="size-3" />
              <span className="text-xs">Valid JSON</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="size-3" />
              <span className="text-xs">Invalid JSON</span>
            </div>
          ) : null}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={copyToClipboard}
          disabled={!value}
          className="h-7 px-2 text-xs"
        >
          <Copy className="size-3" />
        </Button>
      </div>

      {/* JSON Editor */}
      <div 
        ref={editorDomRef}
        className={cn("border rounded-md overflow-hidden [&_.jse-editor]:!m-0 [&_.jse-main]:!m-0", className)}
        style={{ maxHeight: "400px" }}
      />
      
      {error && (
        <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
