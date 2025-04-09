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
  const handleCopyToClipboard = () => {
    const el = document.createElement("textarea");
    el.value = codeContainerRef.current?.innerText || "";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    toast("Copied to clipboard", {
      description: "The TypeScript type has been copied to your clipboard.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Typescript Type</DialogTitle>
          <DialogDescription>
            <div
              ref={codeContainerRef}
              dangerouslySetInnerHTML={{ __html: tsType }}
            />
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button className="cursor-pointer" onClick={handleCopyToClipboard}>Copy</Button>
          <Button className="cursor-pointer" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
