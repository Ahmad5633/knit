"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error("[knit] render error:", error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-stone-900/70 p-6 text-white">
          <div className="max-w-xl rounded-xl bg-stone-800 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-rose-300">
              Something went wrong rendering the board
            </h2>
            <pre className="mt-3 max-h-64 overflow-auto rounded bg-stone-900 p-3 text-xs text-rose-200">
              {String(this.state.error?.stack ?? this.state.error?.message ?? this.state.error)}
            </pre>
            <button
              type="button"
              onClick={this.reset}
              className="mt-4 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-700"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
