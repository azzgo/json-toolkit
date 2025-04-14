import { useEffect, useRef, useState } from "react";
import { createJSONEditor } from "vanilla-jsoneditor";
import { Button } from "@/components/ui/button";
import JsonToTS from "json-to-ts";
import markdownit from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { parseJSON } from "@/lib/utils";
import { DialogComponent } from "./DialogComponent";
import { toast } from "sonner";
import { CodeXmlIcon, FileJson } from "lucide-react";
import { generateJSONSchemaTypes, toSource } from "schema2dts";

type Editor = ReturnType<typeof createJSONEditor>;

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
      let json;
      if (content.json) {
        json = content.json;
      } else if (content.text) {
        json = parseJSON(content.text);
      }

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
      let schema;
      if (content.json) {
        schema = content.json;
      } else if (content.text) {
        schema = parseJSON(content.text);
      }

      if (!schema) {
        toast.error("Invalid JSON Schema");
        return;
      }

      try {
        const tsTypes = toSource(await generateJSONSchemaTypes(schema));
        const rendered = md.render(`\`\`\`typescript\n${tsTypes}\n\`\`\``);
        setTsType(rendered);
        setDialogOpen(true);
      } catch (error) {
        toast.error("Invalid JSON Schema");
      }
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex justify-start p-2 space-x-2">
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={handleJsonToTs}
        >
          <CodeXmlIcon className="size-4" />
          JSON to Typescript Type
        </Button>

        <Button className="cursor-pointer" onClick={handleJsonSchemaToTs}>
          <FileJson className="size-4" />
          JSON Schema to Typescript Type
        </Button>
      </div>
      <div className="flex-1 m-2" ref={editorDomRef}></div>
      <DialogComponent
        open={dialogOpen}
        onOpenChange={() => setDialogOpen(false)}
        tsType={tsType}
      />
    </div>
  );
}

export default JsonEditor;
