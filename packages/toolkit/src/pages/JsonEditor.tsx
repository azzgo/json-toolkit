import { useEffect, useRef } from "react";
import { createJSONEditor } from "vanilla-jsoneditor";

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

  return <div className="w-screen h-screen" ref={editorRef}></div>;
}

export default JsonEditor;
