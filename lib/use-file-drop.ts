"use client";

import { useEffect, useState, type RefObject } from "react";
import { useBoard } from "./store";
import { makeFileItem } from "./file-drop";
import type { ZoneId } from "./types";

let globalGuardInstalled = false;

function installGlobalGuard() {
  if (typeof window === "undefined") return;
  if (globalGuardInstalled) return;
  globalGuardInstalled = true;
  const prevent = (e: DragEvent) => {
    if (e.dataTransfer?.types?.includes("Files")) {
      e.preventDefault();
    }
  };
  window.addEventListener("dragover", prevent);
  window.addEventListener("drop", prevent);
}

export function useFileDrop(
  ref: RefObject<HTMLElement | null>,
  zoneId: ZoneId,
) {
  const addItems = useBoard((s) => s.addItems);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    installGlobalGuard();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onDragEnter = (e: DragEvent) => {
      if (!e.dataTransfer?.types?.includes("Files")) return;
      e.preventDefault();
      e.stopPropagation();
      setIsOver(true);
    };
    const onDragOver = (e: DragEvent) => {
      if (!e.dataTransfer?.types?.includes("Files")) return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
      setIsOver(true);
    };
    const onDragLeave = (e: DragEvent) => {
      if (e.relatedTarget && el.contains(e.relatedTarget as Node)) return;
      setIsOver(false);
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsOver(false);
      if (!e.dataTransfer?.files?.length) {
        console.log("[knit] drop with no files", e.dataTransfer?.types);
        return;
      }
      try {
        console.log("[knit] drop received", e.dataTransfer.files.length, "files into", zoneId);
        const items = Array.from(e.dataTransfer.files).map(makeFileItem);
        console.log("[knit] adding items", items);
        if (items.length > 0) addItems(zoneId, items);
      } catch (err) {
        console.error("[knit] file ingest threw", err);
      }
    };

    el.addEventListener("dragenter", onDragEnter);
    el.addEventListener("dragover", onDragOver);
    el.addEventListener("dragleave", onDragLeave);
    el.addEventListener("drop", onDrop);
    return () => {
      el.removeEventListener("dragenter", onDragEnter);
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("dragleave", onDragLeave);
      el.removeEventListener("drop", onDrop);
    };
  }, [ref, zoneId, addItems]);

  return { isOver };
}
