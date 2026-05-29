"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useBoard } from "@/lib/store";
import { formatBytes, isImageMime, isPdfMime } from "@/lib/file-drop";

export function FilePreviewModal() {
  const previewItemId = useBoard((s) => s.previewItemId);
  const items = useBoard((s) => s.items);
  const close = useBoard((s) => s.closePreview);
  const item = previewItemId ? items[previewItemId] : null;

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, close]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/55 backdrop-blur-sm px-4 py-6"
          onClick={close}
        >
          <motion.div
            key="panel"
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between gap-4 border-b border-stone-200 px-5 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-stone-800">
                  {item.label ?? "Untitled"}
                </div>
                <div className="text-xs text-stone-500">
                  {item.fileMime || "file"}
                  {item.fileSize !== undefined && ` · ${formatBytes(item.fileSize)}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.objectUrl && (
                  <a
                    href={item.objectUrl}
                    download={item.label}
                    className="rounded-md border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 transition hover:bg-stone-100"
                  >
                    Download
                  </a>
                )}
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close preview"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </header>
            <div className="flex-1 overflow-auto bg-stone-50">
              <PreviewBody item={item} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PreviewBody({
  item,
}: {
  item: NonNullable<ReturnType<typeof useBoard.getState>["items"][string]>;
}) {
  if (!item.objectUrl) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-stone-500">
        No preview available
      </div>
    );
  }
  if (isImageMime(item.fileMime)) {
    return (
      <div className="flex items-center justify-center p-4">
        <img
          src={item.objectUrl}
          alt={item.label ?? "image"}
          className="max-h-[70vh] w-auto rounded-lg object-contain shadow-md"
        />
      </div>
    );
  }
  if (isPdfMime(item.fileMime)) {
    return (
      <iframe
        src={item.objectUrl}
        title={item.label ?? "PDF preview"}
        className="h-[75vh] w-full border-0"
      />
    );
  }
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="text-sm text-stone-600">
        No inline preview available for this file type.
      </div>
      <a
        href={item.objectUrl}
        download={item.label}
        className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700"
      >
        Download {item.label}
      </a>
    </div>
  );
}
