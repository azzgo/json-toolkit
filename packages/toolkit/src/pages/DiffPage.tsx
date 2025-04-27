import { useEffect, useRef } from "react";
import { Mode, createJSONEditor } from "vanilla-jsoneditor";
import { diff } from "json-diff";
import { Button } from "@/components/ui/button";
import { ChevronsLeftRight } from "lucide-react";
import { Editor } from "@/lib/types";
import { toast } from "sonner";
import { getEditorContentJson } from "@/lib/utils";

function JsonDiff() {
  const leftEditorDomRef = useRef(null);
  const rightEditorDomRef = useRef(null);
  const leftEditorRef = useRef<Editor | null>(null);
  const rightEditorRef = useRef<Editor | null>(null);

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

  const showDiff = () => {
    if (leftEditorRef.current && rightEditorRef.current) {
      const leftContent = leftEditorRef.current.get();
      const rightContent = rightEditorRef.current.get();

      try {
        const leftJSON = getEditorContentJson(leftContent);
        const rightJSON = getEditorContentJson(rightContent);

        const diffResult = diff(leftJSON, rightJSON);

        if (diffResult) {
          leftEditorRef.current.updateProps({
            mode: Mode.tree,
            onClassName: (path) => {
              return diffResult[path as unknown as string] ? "bg-red-100" : "";
            },
          });

          rightEditorRef.current.updateProps( {
            mode: Mode.tree,
            onClassName: (path) => {
              return diffResult[path as unknown as string] ? "bg-green-100" : "";
            },
          });
          leftEditorRef.current.refresh();
          rightEditorRef.current.refresh();
        } else {
          toast.info("No differences found!");
        }
      } catch (error) {
        toast.error("Invalid JSON content in one or both editors.");
      }
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-4 p-2">
      <div className="flex space-x-2">
        <Button onClick={showDiff}>Show Diff</Button>
      </div>
      <div className="flex space-x-4 flex-1 items-center">
        <div className="flex-1 h-full border" ref={leftEditorDomRef}></div>
        <Button
          variant="outline"
          onClick={swapContent}
          className="cursor-pointer"
        >
          <ChevronsLeftRight className="size-4" />
        </Button>
        <div className="flex-1 h-full border" ref={rightEditorDomRef}></div>
      </div>
    </div>
  );
}

export default JsonDiff;
