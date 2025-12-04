import { useEffect, useRef, useState } from "react";
import {
  createJSONEditor,
} from "vanilla-jsoneditor";
import "highlight.js/styles/github.css";
import { Editor } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { FileCode2, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { repairJson, JsonRepairResult } from "@/lib/json-repair";
import { toast } from "sonner";

function JsonEditor() {
  const editorDomRef = useRef(null);
  const editorRef = useRef<Editor | null>(null);
  const [repairResult, setRepairResult] = useState<JsonRepairResult | null>(null);
  const [showRepairSuggestions, setShowRepairSuggestions] = useState(false);

  useEffect(() => {
    if (!editorDomRef.current) return;
    editorRef.current = createJSONEditor({
      target: editorDomRef.current,
      props: {
        mode: "text",
        onChange: (content: any) => {
          // Auto-analyze content for potential JSON repair
          if (content.text) {
            analyzeContent(content.text);
          }
        }
      },
    });

    // Check for content from URL parameters (from browser extension)
    const urlParams = new URLSearchParams(window.location.search);
    const contentParam = urlParams.get('content');
    if (contentParam) {
      try {
        const decodedContent = decodeURIComponent(contentParam);
        handleIncomingContent(decodedContent);
      } catch (error) {
        console.error('Failed to decode URL content parameter:', error);
        toast.error('Failed to load content from browser extension');
      }
    }

    return () => {
      editorRef.current?.destroy();
    };
  }, []);

  const analyzeContent = (text: string) => {
    if (!text || text.trim().length === 0) {
      setRepairResult(null);
      setShowRepairSuggestions(false);
      return;
    }

    const result = repairJson(text);
    setRepairResult(result);
    
    // Show suggestions if repair is possible and content is not already valid JSON
    setShowRepairSuggestions(!result.isValidJson && result.repairSuggestions.length > 0);
  };

  const handleIncomingContent = (content: string) => {
    if (!editorRef.current) return;

    // Analyze the content for potential JSON repair
    const result = repairJson(content);
    
    if (result.success && result.repairedText) {
      // Auto-apply repair if confidence is high
      if (result.confidence > 0.8) {
        editorRef.current.set({ text: result.repairedText });
        toast.success(`JSON auto-repaired with high confidence (${Math.round(result.confidence * 100)}%)`);
      } else {
        // Load original content but show repair suggestions
        editorRef.current.set({ text: content });
        setRepairResult(result);
        setShowRepairSuggestions(true);
        toast.info('JSON repair suggestions available');
      }
    } else {
      // Load content as-is
      editorRef.current.set({ text: content });
      if (result.repairSuggestions.length > 0) {
        setRepairResult(result);
        setShowRepairSuggestions(true);
      }
    }
  };

  const applyRepair = () => {
    if (!editorRef.current || !repairResult?.repairedText) return;

    editorRef.current.set({ text: repairResult.repairedText });
    setShowRepairSuggestions(false);
    setRepairResult(null);
    toast.success('JSON repair applied successfully');
  };

  const dismissSuggestions = () => {
    setShowRepairSuggestions(false);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileCode2 className="size-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">JSON Editor</h1>
          <p className="text-sm text-muted-foreground">
            Edit, format, and validate JSON with syntax highlighting and tree view
          </p>
        </div>
      </div>

      <Separator />

      {/* JSON Repair Suggestions */}
      {showRepairSuggestions && repairResult && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="size-5 text-orange-600" />
              JSON Repair Suggestions
              <span className="text-sm font-normal text-muted-foreground">
                (Confidence: {Math.round(repairResult.confidence * 100)}%)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <p className="font-medium mb-2">Suggested fixes:</p>
              <ul className="list-disc list-inside space-y-1">
                {repairResult.repairSuggestions.map((suggestion, index) => (
                  <li key={index} className="text-muted-foreground">
                    {suggestion.description} 
                    <span className="text-xs text-green-600 ml-2">
                      ({Math.round(suggestion.confidence * 100)}% confidence)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={applyRepair}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700"
              >
                <CheckCircle className="size-4 mr-2" />
                Apply Repair
              </Button>
              <Button 
                onClick={dismissSuggestions}
                variant="outline"
                size="sm"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* JSON Editor */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 border bg-card overflow-auto" ref={editorDomRef}></div>
      </div>
    </div>
  );
}

export default JsonEditor;
