import { useState } from "react";
import { Upload } from "lucide-react";

interface UploadDropzoneProps {
  onFile: (file: File | undefined) => void;
  onPick: () => void;
}

export function UploadDropzone({ onFile, onPick }: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onFile(e.dataTransfer.files?.[0]);
      }}
      onClick={onPick}
      className={
        "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition " +
        (dragging
          ? "border-neutral-900 bg-neutral-50 dark:border-[#22D3EE] dark:bg-[#15203A]"
          : "border-neutral-300 bg-white hover:border-neutral-500 hover:bg-neutral-50 dark:border-[#1e2d4a] dark:bg-[#0B1220] dark:hover:border-[#94A3B8] dark:hover:bg-[#15203A]")
      }
    >
      <Upload className="mb-3 h-10 w-10 text-neutral-400 dark:text-[#64748B]" />
      <div className="text-base font-medium text-neutral-900 dark:text-[#E2E8F0]">
        Drop an image here, or click to choose one
      </div>
      <div className="mt-1 text-sm text-neutral-600 dark:text-[#64748B]">
        PNG, JPG, WebP. The image stays on your computer — extraction runs in the browser.
      </div>
    </div>
  );
}
