import { useEffect, useRef } from "react";
import {
  createJSONEditor,
} from "vanilla-jsoneditor";
import "highlight.js/styles/github.css";
import { Editor } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { FileCode2 } from "lucide-react";


function JsonEditor() {
  const editorDomRef = useRef(null);
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    if (!editorDomRef.current) return;
    editorRef.current = createJSONEditor({
      target: editorDomRef.current,
      props: {
        mode: "text",
      },
    });

    return () => {
      editorRef.current?.destroy();
    };
  }, []);


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

      {/* JSON Editor */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 border bg-card" ref={editorDomRef}></div>
      </div>
    </div>
  );
}

export default JsonEditor;
