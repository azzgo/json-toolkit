import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DialogComponentProps {
  tsType: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DialogComponent({ tsType, open, onOpenChange }: DialogComponentProps) {

  const handleCopyToClipboard = () => {
    const el = document.createElement("textarea");
    el.value = tsType;
    el.select();
    document.body.appendChild(el);
    document.execCommand("copy");
    document.body.removeChild(el);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Typescript Type</DialogTitle>
          <DialogDescription>
            <div dangerouslySetInnerHTML={{ __html: tsType }} />
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button onClick={handleCopyToClipboard}>Copy</Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
      
