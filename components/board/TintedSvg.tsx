"use client";

import { useEffect, useState } from "react";

interface TintedSvgProps {
  src: string;
  size: number;
  color?: string;
  className?: string;
}

const cache = new Map<string, string>();

export function TintedSvg({ src, size, color, className }: TintedSvgProps) {
  const [markup, setMarkup] = useState<string | null>(cache.get(src) ?? null);

  useEffect(() => {
    if (cache.has(src)) {
      setMarkup(cache.get(src)!);
      return;
    }
    let cancelled = false;
    fetch(src)
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        cache.set(src, text);
        setMarkup(text);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!markup) {
    return <div style={{ width: size, height: size }} className={className} />;
  }

  return (
    <div
      className={className}
      style={{ width: size, height: size, color, lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: scaleSvg(markup, size) }}
    />
  );
}

function scaleSvg(svg: string, size: number): string {
  return svg
    .replace(/<svg([^>]*)>/, (m, attrs: string) => {
      let out = attrs
        .replace(/\swidth="[^"]*"/g, "")
        .replace(/\sheight="[^"]*"/g, "");
      out += ` width="${size}" height="${size}"`;
      return `<svg${out}>`;
    });
}
