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
          content: {
            json: {
              a: "123",
              b: [1, 2, 5, ["a", "c"]],
              d: {
                name: "alice",
                gender: "female",
              },
              e: [1, { code: "123", name: 'test' }],
            },
          },
        },
      })
    }

    if (rightEditorDomRef.current) {
      rightEditorRef.current = createJSONEditor({
        target: rightEditorDomRef.current,
        props: {
          mode: "text",
          content: {
            json: {
              a: "123",
              b: [1, 2, 3, ["a", "b"]],
              c: [],
              d: {
                name: "bob",
              },
              e: [1, { code: "123", name: 'prod' }],
            },
          },
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
