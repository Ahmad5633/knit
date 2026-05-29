"use client";

import { TopTabs } from "./TopTabs";
import { UserChip } from "./UserChip";
import { SetAsideTray } from "./SetAsideTray";
import { LeftRail } from "./LeftRail";
import { AddContext } from "./AddContext";
import { BottomDock } from "./BottomDock";
import { Canvas } from "./Canvas";
import { FilePreviewModal } from "./FilePreviewModal";
import { ErrorBoundary } from "./ErrorBoundary";

export function Board() {
  return (
    <ErrorBoundary>
      <FilePreviewModal />
      <div className="board-bg relative min-h-screen w-full overflow-hidden">
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
        <div className="flex min-h-screen flex-col gap-6 px-4 py-6 lg:hidden sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="w-full max-w-[260px] flex-shrink-0">
              <SetAsideTray />
            </div>
            <div className="flex-shrink-0">
              <UserChip />
            </div>
          </div>

          <div className="flex justify-center overflow-x-auto">
            <TopTabs />
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex-shrink-0">
              <LeftRail />
            </div>
            <div className="min-h-[200px] flex-1 rounded-3xl bg-white/15 backdrop-blur-sm">
              <Canvas />
            </div>
            <div className="flex-shrink-0 sm:w-[180px]">
              <AddContext />
            </div>
          </div>

          <div className="mt-auto">
            <BottomDock />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
