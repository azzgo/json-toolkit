import { useEffect, useRef } from "react";
import {
  JSONEditorPropsOptional,
  Mode,
  createJSONEditor,
} from "vanilla-jsoneditor";
import { diff } from "json-diff";
import { Button } from "@/components/ui/button";
import { GitCompareArrows, ChevronsLeftRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Editor } from "@/lib/types";
import { toast } from "sonner";
import {
  convertDiffResultToJSONPathMap,
  getEditorContentJson,
} from "@/lib/utils";

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
        onClassName: undefined,
      });
      rightEditorRef.current.updateProps({
        onClassName: undefined,
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
          ) => {
            const diffValue = leftDiffResultMap.get(path.join("."));
            if (diffValue === "delete") {
              return "bg-red-50 dark:bg-red-950/30";
            } else if (diffValue === "update") {
              return "bg-orange-50 dark:bg-orange-950/30";
            }
            return "";
          };

          // onClassName for the right editor
          const getRightClassName: JSONEditorPropsOptional["onClassName"] = (
            path,
          ) => {
            const diffValue = rightDiffResultMap.get(path.join("."));
            if (diffValue === "add") {
              return "bg-green-50 dark:bg-green-950/30";
            } else if (diffValue === "update") {
              return "bg-orange-50 dark:bg-orange-950/30";
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
      } catch (_error) {
        toast.error("Invalid JSON content in one or both editors.");
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3">
        <GitCompareArrows className="size-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">JSON Diff</h1>
          <p className="text-sm text-muted-foreground">
            Compare two JSON objects and visualize their differences
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={showDiff} className="h-8 px-3 text-sm">
          Show Diff
        </Button>
      </div>
      
      {/* Editors Container */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex gap-4 flex-1 items-stretch min-h-0">
          <div className="flex-1 border bg-card" ref={leftEditorDomRef}></div>
          
          {/* Swap button in the middle */}
          <div className="flex flex-col justify-center">
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
          
          <div className="flex-1 border bg-card" ref={rightEditorDomRef}></div>
        </div>
      </div>
    </div>
  );
}

export default JsonDiff;
