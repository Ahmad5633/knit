"use client";

import dynamic from "next/dynamic";

// SSR is disabled for the entire interactive board surface. The board uses
// framer-motion `motion.div`s with drag, which render slightly different DOM
// attributes on the server vs the client and cause hydration mismatches.
// That mismatch silently breaks drag-and-drop on production (especially on
// larger viewports where layout differs more between SSR and CSR). There is
// no SEO/perf benefit to SSR-ing this surface, so we render it client-only.
const Board = dynamic(
  () => import("./Board").then((mod) => ({ default: mod.Board })),
  {
    ssr: false,
    loading: () => (
      <div className="board-bg min-h-screen w-full" />
    ),
  },
);

export function BoardClient() {
  return <Board />;
}
