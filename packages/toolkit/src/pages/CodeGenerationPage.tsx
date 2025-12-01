import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  AlertCircle, 
  Code2, 
  Copy, 
  Download, 
  Loader2,
  CheckCircle 
} from "lucide-react";
import { toast } from "sonner";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { 
  createJSONEditor,
  TextContent,
} from "vanilla-jsoneditor";

import {
  SUPPORTED_LANGUAGES,
  generateCode,
  validateJSON,
  isJSONTooLarge,
  CodeGenerationResult,
  CodeGenerationOptions,
} from "@/lib/code-generation";
import { getEditorContentJson } from "@/lib/utils";
import { Editor } from "@/lib/types";

interface LanguageOutputProps {
  language: { id: string; name: string; extension: string };
  result?: CodeGenerationResult;
  loading: boolean;
  onCopy: (code: string) => void;
  onDownload: (code: string, extension: string, languageName: string) => void;
}

function LanguageOutput({ 
  language, 
  result, 
  loading, 
  onCopy, 
  onDownload 
}: LanguageOutputProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current && result?.success && result.code) {
      // Apply syntax highlighting
      const languageMap: Record<string, string> = {
        'typescript': 'typescript',
        'go': 'go', 
        'java': 'java',
        'python': 'python',
        'rust': 'rust',
        'swift': 'swift',
        'csharp': 'csharp',
      };
      
      const hlLanguage = languageMap[language.id] || 'text';
      codeRef.current.innerHTML = hljs.highlight(result.code, { language: hlLanguage }).value;
    }
  }, [result, language.id]);

  return (
    <Card className="h-full flex flex-col overflow-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">{language.name}</CardTitle>
            <CardDescription className="text-xs">
              .{language.extension} format
            </CardDescription>
          </div>
          {result?.success && (
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onCopy(result.code)}
                className="h-7 px-2"
              >
                <Copy className="size-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onDownload(result.code, language.extension, language.name)}
                className="h-7 px-2"
              >
                <Download className="size-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="bg-muted/50 rounded-md p-3 font-mono text-xs">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Loader2 className="size-4 animate-spin mr-2" />
              Generating...
            </div>
          ) : result?.error ? (
            <div className="flex items-start gap-2 text-destructive">
              <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <div className="font-medium">Error</div>
                <div className="text-xs opacity-80">{result.error}</div>
              </div>
            </div>
          ) : result?.success ? (
            <pre className="whitespace-pre-wrap">
              <code ref={codeRef} className="text-xs">
                {result.code}
              </code>
            </pre>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
              Enter JSON to generate {language.name} code
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CodeGenerationPage() {
  const [typeName, setTypeName] = useState('GeneratedType');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('typescript');
  const [results, setResults] = useState<Record<string, CodeGenerationResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [jsonValidation, setJsonValidation] = useState<{ valid: boolean; error?: string }>({ valid: true });
  
  // JSON Editor refs
  const editorDomRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);

  // Initialize JSON Editor
  useEffect(() => {
    if (!editorDomRef.current) return;
    
    editorRef.current = createJSONEditor({
      target: editorDomRef.current,
      props: {
        mode: 'text',
        onChange: (content: any) => {
          try {
            // Get JSON content from editor
            const jsonContent = getEditorContentJson(content);
            if (jsonContent) {
              const jsonString = JSON.stringify(jsonContent);
              const validation = validateJSON(jsonString);
              setJsonValidation(validation);
            } else {
              // Check if there's any text content
              const textContent = (content as TextContent)?.text;
              if (textContent && textContent.trim()) {
                setJsonValidation({ valid: false, error: 'Invalid JSON syntax' });
              } else {
                setJsonValidation({ valid: false, error: 'No JSON content' });
              }
            }
          } catch (error) {
            setJsonValidation({ valid: false, error: 'JSON parsing error' });
          }
        },
      },
    });

    return () => {
      editorRef.current?.destroy();
    };
  }, []);

  const getCurrentJSON = useCallback(() => {
    if (!editorRef.current) return null;
    
    try {
      const content = editorRef.current.get();
      const jsonContent = getEditorContentJson(content);
      return jsonContent ? JSON.stringify(jsonContent) : null;
    } catch (error) {
      console.error('Failed to get JSON from editor:', error);
      return null;
    }
  }, []);

  const setEditorContent = useCallback((jsonString: string) => {
    if (!editorRef.current) return;
    
    try {
      const jsonObject = JSON.parse(jsonString);
      editorRef.current.set({ json: jsonObject });
      
      // Manually trigger validation since onChange might not fire
      setTimeout(() => {
        const validation = validateJSON(jsonString);
        setJsonValidation(validation);
      }, 100);
    } catch (error) {
      console.error('Failed to set JSON in editor:', error);
      setJsonValidation({ valid: false, error: 'Invalid JSON syntax' });
    }
  }, []);

  const generateCodeForAllLanguages = useCallback(async () => {
    const currentJSON = getCurrentJSON();
    
    if (!currentJSON || !currentJSON.trim() || !jsonValidation.valid) {
      toast.error("Please enter valid JSON before generating code");
      return;
    }

    if (isJSONTooLarge(currentJSON)) {
      toast.error("JSON input is too large (max 1MB)");
      return;
    }

    const allLanguageIds = SUPPORTED_LANGUAGES.map(lang => lang.id);
    const loadingState = Object.fromEntries(allLanguageIds.map(id => [id, true]));
    setLoading(loadingState);

    try {
      const promises = allLanguageIds.map(async (languageId) => {
        const options: CodeGenerationOptions = {
          typeName: typeName.trim() || 'GeneratedType',
          indentation: '  ',
          alphabetizeProperties: false,
        };

        const result = await generateCode(currentJSON, languageId, options);
        return [languageId, result] as const;
      });

      const allResults = await Promise.all(promises);
      const resultsMap = Object.fromEntries(allResults);
      
      setResults(resultsMap);
      
      const successCount = allResults.filter(([, result]) => result.success).length;
      toast.success(`Generated code for ${successCount}/${allResults.length} languages`);
    } catch (error) {
      console.error('Bulk code generation failed:', error);
      toast.error("Code generation failed");
    } finally {
      setLoading(Object.fromEntries(allLanguageIds.map(id => [id, false])));
    }
  }, [getCurrentJSON, typeName, jsonValidation.valid]);

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success("Code copied to clipboard");
    }).catch(() => {
      toast.error("Failed to copy code");
    });
  }, []);

  const handleDownloadCode = useCallback((code: string, extension: string, languageName: string) => {
    const fileName = `${typeName.toLowerCase()}.${extension}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Downloaded ${languageName} code as ${fileName}`);
  }, [typeName]);

  const sampleJSON = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "zipCode": "12345"
  },
  "hobbies": ["reading", "cycling", "cooking"],
  "isActive": true
}`;

  const hasValidJSON = useCallback(() => {
    try {
      const currentJSON = getCurrentJSON();
      if (!currentJSON || !currentJSON.trim()) return false;
      
      // Additional validation check
      JSON.parse(currentJSON);
      return true;
    } catch (error) {
      return false;
    }
  }, [getCurrentJSON]);

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Code2 className="size-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Code Generation</h1>
          <p className="text-sm text-muted-foreground">
            Generate strongly-typed code from JSON for multiple languages
          </p>
        </div>
      </div>

      <Separator />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <label htmlFor="type-name" className="text-sm font-medium block mb-2">
            Type/Class Name
          </label>
          <Input
            id="type-name"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            placeholder="GeneratedType"
            className="h-9"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={generateCodeForAllLanguages}
            disabled={!hasValidJSON()}
            className="h-9"
          >
            Generate All Languages
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setEditorContent(sampleJSON)}
            className="h-9"
          >
            Use Sample
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* JSON Input */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">JSON Input</h3>
            <div className="flex items-center gap-1 text-xs">
              {jsonValidation.valid ? (
                <>
                  <CheckCircle className="size-3 text-green-600" />
                  <span className="text-green-600">Valid JSON</span>
                </>
              ) : (
                <>
                  <AlertCircle className="size-3 text-destructive" />
                  <span className="text-destructive">Invalid JSON</span>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <div 
              ref={editorDomRef}
              className="w-full h-full min-h-[300px] border"
            />
          </div>
          {jsonValidation.error && (
            <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-start gap-2 text-destructive">
                <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-medium">JSON Validation Error</div>
                  <div className="text-xs opacity-80 mt-1">{jsonValidation.error}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generated Code Output */}
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-sm font-medium mb-3">Generated Code</h3>
          
          <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage} className="flex-1 flex flex-col min-h-0">
            <TabsList className="w-full grid grid-cols-4 lg:grid-cols-7 gap-1 h-auto p-1">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <TabsTrigger 
                  key={lang.id} 
                  value={lang.id}
                  className="text-xs px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {lang.name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="flex-1 mt-4 min-h-0">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <TabsContent 
                  key={lang.id} 
                  value={lang.id} 
                  className="h-full m-0"
                >
                  <LanguageOutput
                    language={lang}
                    result={results[lang.id]}
                    loading={loading[lang.id] || false}
                    onCopy={handleCopyCode}
                    onDownload={handleDownloadCode}
                  />
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
