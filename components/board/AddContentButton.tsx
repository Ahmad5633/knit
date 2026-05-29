"use client";

import { useRef } from "react";
import { useBoard } from "@/lib/store";
import { makeFileItem } from "@/lib/file-drop";

export function AddContentButton() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const addItems = useBoard((s) => s.addItems);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const items = Array.from(files).map(makeFileItem);
    if (items.length > 0) addItems("canvas", items);
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={onPick}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-full bg-stone-800/85 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur transition hover:bg-stone-900 hover:scale-[1.02] active:scale-[0.98]"
      >
        + Add content
      </button>
    </>
  );
}
