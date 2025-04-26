
import { useEffect, useRef } from "react";
import { createJSONEditor } from "vanilla-jsoneditor";
import { Button } from "@/components/ui/button";

function JsonDiff() {
  const leftEditorDomRef = useRef(null);
  const rightEditorDomRef = useRef(null);
  const leftEditorRef = useRef(null);
  const rightEditorRef = useRef(null);

  useEffect(() => {
    if (leftEditorDomRef.current) {
      leftEditorRef.current = createJSONEditor({
        target: leftEditorDomRef.current,
        props: { mode: "text" },
      });
    }

    if (rightEditorDomRef.current) {
      rightEditorRef.current = createJSONEditor({
        target: rightEditorDomRef.current,
        props: { mode: "text" },
      });
    }

    return () => {
      leftEditorRef.current?.destroy();
      rightEditorRef.current?.destroy();
    };
  }, []);

  const swapContent = () => {
    if (leftEditorRef.current && rightEditorRef.current) {
      const leftContent = leftEditorRef.current.get();
      const rightContent = rightEditorRef.current.get();
      leftEditorRef.current.update(rightContent);
      rightEditorRef.current.update(leftContent);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-4">
      <div className="flex space-x-2">
        <Button onClick={swapContent}>Swap Content</Button>
        <Button onClick={() => alert("Diff feature coming soon!")}>Show Diff</Button>
      </div>
      <div className="flex space-x-4 flex-1">
        <div className="flex-1 border p-2" ref={leftEditorDomRef}></div>
        <div className="flex-1 border p-2" ref={rightEditorDomRef}></div>
      </div>
    </div>
  );
}

export default JsonDiff;

