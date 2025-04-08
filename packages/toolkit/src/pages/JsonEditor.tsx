import { useEffect, useRef } from "react";
import { createJSONEditor } from "vanilla-jsoneditor";
import { Button } from "@/components/ui/button";

function JsonEditor() {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    const editor = createJSONEditor({
      target: editorRef.current,
      props: {
        mode: "text",
        onChange: (
          updatedContent: any,
          previousContent: any,
          { contentErrors, patchResult }: any
        ) => {
          // content is an object { json: unknown } | { text: string }
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
      editor.destroy();
    };
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex justify-start p-2 space-x-2">
        <Button>JSON to Typescript Type</Button>
        <Button>JSON Schema to Typescript Type</Button>
      </div>
      <div className="flex-1" ref={editorRef}></div>
    </div>
  );
}

export default JsonEditor;
