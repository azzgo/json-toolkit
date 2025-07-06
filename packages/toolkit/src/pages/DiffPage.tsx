import { useEffect, useRef } from "react";
import {
  JSONEditorPropsOptional,
  Mode,
  createJSONEditor,
} from "vanilla-jsoneditor";
import { diff } from "json-diff";
import { Button } from "@/components/ui/button";
import { ChevronsLeftRight } from "lucide-react";
import { Editor } from "@/lib/types";
import { toast } from "sonner";
import {
  convertDiffResultToJSONPathMap,
  getEditorContentJson,
} from "@/lib/utils";
import { get } from "radash";

function JsonDiff() {
  const leftEditorDomRef = useRef(null);
  const rightEditorDomRef = useRef(null);
  const leftEditorRef = useRef<Editor | null>(null);
  const rightEditorRef = useRef<Editor | null>(null);

  useEffect(() => {
    if (leftEditorDomRef.current) {
      leftEditorRef.current = createJSONEditor({
        target: leftEditorDomRef.current,
        props: {
          mode: "text",
        },
      });
    }

    if (rightEditorDomRef.current) {
      rightEditorRef.current = createJSONEditor({
        target: rightEditorDomRef.current,
        props: {
          mode: "text",
        },
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
      leftEditorRef.current.updateProps({
        onClassName: null,
      });
      rightEditorRef.current.updateProps({
        onClassName: null,
      });
      leftEditorRef.current.refresh();
      rightEditorRef.current.refresh();
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
        const [leftDiffResultMap, rightDiffResultMap] =
          convertDiffResultToJSONPathMap(diffResult);

        if (diffResult) {
          // onClassName for the left editor
          const getLeftClassName: JSONEditorPropsOptional["onClassName"] = (
            path,
            value,
          ) => {
            const diffValue = leftDiffResultMap.get(path.join("."));
            if (diffValue === "delete") {
              return "bg-red-100";
            } else if (diffValue === "update") {
              return "bg-yellow-100";
            }
            return "";
          };

          // onClassName for the right editor
          const getRightClassName: JSONEditorPropsOptional["onClassName"] = (
            path,
            value,
          ) => {
            const diffValue = rightDiffResultMap.get(path.join("."));
            if (diffValue === "add") {
              return "bg-green-100";
            } else if (diffValue === "update") {
              return "bg-yellow-100";
            }
            return "";
          };

          if (leftDiffResultMap.size > 0) {
            leftEditorRef.current.updateProps({
              mode: Mode.tree,
              onClassName: getLeftClassName,
            });
            leftEditorRef.current.refresh();
          }

          if (rightDiffResultMap.size > 0) {
            rightEditorRef.current.updateProps({
              mode: Mode.tree,
              onClassName: getRightClassName,
            });
            rightEditorRef.current.refresh();
          }
        } else {
          toast.info("No differences found!");
        }
      } catch (error) {
        toast.error("Invalid JSON content in one or both editors.");
      }
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={showDiff} className="h-8 px-3 text-sm">
          Show Diff
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={swapContent}
          className="h-8 w-8 p-0"
          aria-label="Swap content"
        >
          <ChevronsLeftRight className="size-4" />
        </Button>
      </div>
      <div className="flex gap-4 flex-1 items-stretch">
        <div className="flex-1 rounded-lg border bg-card" ref={leftEditorDomRef}></div>
        <div className="flex-1 rounded-lg border bg-card" ref={rightEditorDomRef}></div>
      </div>
    </div>
  );
}

export default JsonDiff;
