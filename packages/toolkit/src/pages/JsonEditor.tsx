import { useEffect, useRef, useState } from "react";
import {
  JSONSchema,
  createJSONEditor,
} from "vanilla-jsoneditor";
import { Button } from "@/components/ui/button";
import JsonToTS from "json-to-ts";
import markdownit from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { getEditorContentJson } from "@/lib/utils";
import { DialogComponent } from "./DialogComponent";
import { toast } from "sonner";
import { CodeXmlIcon, FileJson } from "lucide-react";
import { generateJSONSchemaTypes, toSource } from "schema2dts";
import { Editor } from "@/lib/types";

const md = markdownit({
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return ""; // use external default escaping
  },
});

function JsonEditor() {
  const editorDomRef = useRef(null);
  const editorRef = useRef<Editor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tsType, setTsType] = useState("");

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

  const handleJsonToTs = () => {
    if (editorRef.current) {
      const content = editorRef.current.get();
      let json = getEditorContentJson(content);

      if (!json) {
        toast.error("Invalid JSON");
        return;
      }

      const tsTypes = JsonToTS(json).join("\n");
      const rendered = md.render(`\`\`\`typescript\n${tsTypes}\n\`\`\``);
      setTsType(rendered);
      setDialogOpen(true);
    }
  };
  const handleJsonSchemaToTs = async () => {
    if (editorRef.current) {
      const content = editorRef.current.get();
      let schema = getEditorContentJson(content);
      if (!schema) {
        toast.error("Invalid JSON Schema");
        return;
      }

      try {
        const tsTypes = toSource(
          await generateJSONSchemaTypes(schema as JSONSchema)
        );
        const rendered = md.render(`\`\`\`typescript\n${tsTypes}\n\`\`\``);
        setTsType(rendered);
        setDialogOpen(true);
      } catch (error) {
        toast.error("Invalid JSON Schema");
      }
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleJsonToTs}
          className="h-8 px-3 text-sm"
        >
          <CodeXmlIcon className="size-4 mr-2" />
          JSON to Type
        </Button>

        <Button
          size="sm"
          onClick={handleJsonSchemaToTs}
          className="h-8 px-3 text-sm"
        >
          <FileJson className="size-4 mr-2" />
          Schema to Type
        </Button>
      </div>
      <div className="flex-1 rounded-lg border bg-card" ref={editorDomRef}></div>
      <DialogComponent
        open={dialogOpen}
        onOpenChange={() => setDialogOpen(false)}
        tsType={tsType}
      />
    </div>
  );
}

export default JsonEditor;
