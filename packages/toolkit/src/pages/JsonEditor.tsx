import { useEffect, useRef, useState } from "react";
import { createJSONEditor } from "vanilla-jsoneditor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import JsonToTS from "json-to-ts";
import markdownit from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { parseJSON } from "@/lib/utils";

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
        onChange: (
          updatedContent: any,
          previousContent: any,
          { contentErrors, patchResult }: any
        ) => {
          console.log("onChange", {
            updatedContent,
            previousContent,
            contentErrors,
            patchResult,
          });
        },
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
        return;
      }

      const tsTypes = JsonToTS(json).join("\n");
      const rendered = md.render(`\`\`\`typescript\n${tsTypes}\n\`\`\``);
      setTsType(rendered);
      setDialogOpen(true);
    }
  };

  const handleCopyToClipboard = () => {
    const el = document.createElement("textarea");
    el.value = tsType;
    el.select();
    document.body.appendChild(el);
    document.execCommand("copy");
    document.body.removeChild(el);
  };

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex justify-start p-2 space-x-2">
        <Button onClick={handleJsonToTs}>JSON to Typescript Type</Button>
        <Button>JSON Schema to Typescript Type</Button>
      </div>
      <div className="flex-1" ref={editorDomRef}></div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Typescript Type</DialogTitle>
            <DialogDescription>
              <div dangerouslySetInnerHTML={{ __html: tsType }} />
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button onClick={handleCopyToClipboard}>Copy</Button>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default JsonEditor;
