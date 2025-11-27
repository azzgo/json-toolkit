import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRef } from "react";
import { toast } from "sonner";

interface DialogComponentProps {
  tsType: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DialogComponent({
  tsType,
  open,
  onOpenChange,
}: DialogComponentProps) {
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const handleCopyToClipboard = async () => {
    try {
      const textToCopy = codeContainerRef.current?.innerText || "";
      
      if (navigator.clipboard && window.isSecureContext) {
        // Use modern Clipboard API
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers or non-secure contexts
        const el = document.createElement("textarea");
        el.value = textToCopy;
        el.style.position = "fixed";
        el.style.left = "-999999px";
        el.style.top = "-999999px";
        document.body.appendChild(el);
        el.focus();
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      
      toast("Copied to clipboard", {
        description: "The TypeScript type has been copied to your clipboard.",
      });
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Copy failed", {
        description: "Unable to copy to clipboard. Please try selecting and copying manually.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Typescript Type</DialogTitle>
        </DialogHeader>
        <DialogDescription className="flex-1 min-h-0 flex">
          <div className="max-h-full overflow-y-auto pr-2">
            <div
              ref={codeContainerRef}
              dangerouslySetInnerHTML={{ __html: tsType }}
              className="whitespace-pre-wrap"
            />
          </div>
        </DialogDescription>
        <div className="flex justify-end space-x-2 flex-shrink-0 mt-4">
          <Button className="cursor-pointer" onClick={handleCopyToClipboard}>Copy</Button>
          <Button className="cursor-pointer" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
