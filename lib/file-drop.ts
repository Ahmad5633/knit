import type { Item } from "./types";

const PDF_MIME = "application/pdf";

const TINTS = {
  pdf: "#d4574a",
  image: "#7aa867",
  generic: "#7a6a8a",
};

let counter = 0;

export function makeFileItem(file: File): Item {
  counter += 1;
  const id = `file-${Date.now()}-${counter}`;
  const isPdf = file.type === PDF_MIME || /\.pdf$/i.test(file.name);
  const isImage = file.type.startsWith("image/");
  const asset = isPdf
    ? "/assets/file-pdf.svg"
    : isImage
      ? "/assets/file-image.svg"
      : "/assets/file-generic.svg";
  const tint = isPdf ? TINTS.pdf : isImage ? TINTS.image : TINTS.generic;
  let objectUrl: string | undefined;
  try {
    objectUrl = URL.createObjectURL(file);
  } catch (err) {
    console.error("[knit] createObjectURL failed", err);
  }
  console.log("[knit] makeFileItem", {
    id,
    name: file.name,
    type: file.type,
    size: file.size,
    isPdf,
    isImage,
    hasObjectUrl: !!objectUrl,
  });
  return {
    id,
    kind: "file",
    asset,
    tint,
    label: file.name,
    fileMime: file.type || "application/octet-stream",
    fileSize: file.size,
    objectUrl,
  };
}

export function isImageMime(mime?: string): boolean {
  return !!mime && mime.startsWith("image/");
}

export function isPdfMime(mime?: string): boolean {
  return mime === PDF_MIME;
}

export function formatBytes(bytes?: number): string {
  if (bytes === undefined) return "";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}
