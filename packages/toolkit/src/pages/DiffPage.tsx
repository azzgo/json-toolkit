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
import { getEditorContentJson } from "@/lib/utils";
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
          // onClassName for the left editor
          const getLeftClassName: JSONEditorPropsOptional["onClassName"] = (
            path,
            value
          ) => {
            const diffValue = get(diffResult, path.join("."));

            if (Array.isArray(diffValue)) {
              const parentPath = path.slice(0, -1).join(".");
              const arrayDiff = get(diffResult, parentPath);
              if (Array.isArray(arrayDiff)) {
                let leftArrayDiff = arrayDiff.filter((item) => item[0] !== "+");
                const index = parseInt(path[path.length - 1], 10);
                const tuple = leftArrayDiff[index];

                if (Array.isArray(tuple) && tuple.length === 2) {
                  const diffType = tuple[0];
                  if (diffType === "-") return "bg-red-100"; // Removed value
                  if (diffType === " ") return ""; // Unchanged value
                }
              }
            }
            if (diffValue && typeof diffValue === "object") {
              if ("__old" in diffValue && "__new" in diffValue) {
                return "bg-blue-100"; // Changed value
              }
            }
            let removedPath = [
              ...path.slice(0, path.length - 2),
              path[path.length - 1] + "__deleted",
            ];
            if (get(diffResult, removedPath.join("."))) {
              return "bg-red-100";
            }

            return "";
          };

          // onClassName for the right editor
          const getRightClassName: JSONEditorPropsOptional["onClassName"] = (
            path,
            value
          ) => {
            const diffValue = get(diffResult, path.join("."));

            if (Array.isArray(diffValue)) {
              const parentPath = path.slice(0, -1).join(".");
              const arrayDiff = get(diffResult, parentPath);
              if (Array.isArray(arrayDiff)) {
                const index = parseInt(path[path.length - 1], 10);
                let rightArrayDiff = arrayDiff.filter(
                  (item) => item[0] !== "-"
                );
                const tuple = rightArrayDiff[index];

                if (Array.isArray(tuple) && tuple.length === 2) {
                  const diffType = tuple[0];
                  if (diffType === "+") return "bg-green-100"; // Added value
                  if (diffType === " ") return ""; // Unchanged value
                }
              }
            }
            if (diffValue && typeof diffValue === "object") {
              if ("__old" in diffValue && "__new" in diffValue) {
                return "bg-blue-100"; // Changed value
              }
            }
            let addedPath = [
              ...path.slice(0, path.length - 2),
              path[path.length - 1] + "__added",
            ];
            if (get(diffResult, addedPath.join("."))) {
              return "bg-green-100";
            }

            return "";
          };

          leftEditorRef.current.updateProps({
            mode: Mode.tree,
            onClassName: getLeftClassName,
          });

          rightEditorRef.current.updateProps({
            mode: Mode.tree,
            onClassName: getRightClassName,
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
