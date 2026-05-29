"use client";

import { TopTabs } from "./TopTabs";
import { UserChip } from "./UserChip";
import { SetAsideTray } from "./SetAsideTray";
import { LeftRail } from "./LeftRail";
import { AddContext } from "./AddContext";
import { BottomDock } from "./BottomDock";
import { Canvas } from "./Canvas";
import { FilePreviewModal } from "./FilePreviewModal";
import { DocumentEditorModal } from "./DocumentEditorModal";
import { ErrorBoundary } from "./ErrorBoundary";

export function Board() {
  return (
    <ErrorBoundary>
      <FilePreviewModal />
      <DocumentEditorModal />
      <div className="board-bg relative min-h-screen w-full overflow-hidden">
        {/* Full-board invisible drop layer. Sits at the back so any drop that
            doesn't land on a more specific zone (tray, rails, dock, addContext)
            falls through to the canvas. */}
        <div
          data-zone-id="canvas"
          aria-hidden
          className="absolute inset-0"
        />
        {/* Desktop layout (lg and up): absolute-positioned canvas matching reference */}
        <div className="hidden lg:block">
          <div className="absolute inset-x-[260px] top-[180px] bottom-[140px] xl:inset-x-[300px]">
            <Canvas />
          </div>

          <div className="absolute left-0 top-0">
            <SetAsideTray />
          </div>

          <div className="absolute left-1/2 top-8 -translate-x-1/2 xl:top-10">
            <TopTabs />
          </div>

          <div className="absolute right-6 top-6 xl:right-10">
            <UserChip />
          </div>

          <div className="absolute left-6 top-[280px] xl:left-10 xl:top-[300px]">
            <LeftRail />
          </div>

          <div className="absolute right-6 top-[240px] xl:right-10 xl:top-[260px]">
            <AddContext />
          </div>

          <div className="absolute bottom-8 left-0 right-0 px-6 xl:bottom-10 xl:px-10">
            <BottomDock />
          </div>
        </div>

        {/* Tablet / mobile layout: stacked flow */}
        <div className="flex min-h-screen flex-col gap-5 px-4 py-5 lg:hidden sm:gap-6 sm:px-6 sm:py-6">
          {/* Top bar: brand on the right, tabs scroll horizontally below */}
          <header className="flex items-center justify-end">
            <UserChip />
          </header>

          <nav
            aria-label="Board sections"
            className="-mx-4 flex justify-start overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6"
          >
            <TopTabs />
          </nav>

          {/* Primary work area */}
          <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div className="order-2 flex-shrink-0 sm:order-1">
              <LeftRail />
            </div>
            <div className="order-1 min-h-[220px] flex-1 rounded-3xl bg-white/20 shadow-[0_2px_12px_rgba(60,40,30,0.06)] ring-1 ring-white/30 backdrop-blur-sm sm:order-2 sm:min-h-[280px]">
              <Canvas />
            </div>
            <div className="order-3 flex-shrink-0 sm:w-[180px]">
              <AddContext />
            </div>
          </section>

          {/* Set aside tray — given its own row so it can breathe */}
          <section className="flex justify-center sm:justify-start">
            <SetAsideTray />
          </section>

          {/* Bottom dock */}
          <footer className="mt-auto pt-2">
            <BottomDock />
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  );
}
