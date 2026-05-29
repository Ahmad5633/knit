"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  EditorContent,
  ReactRenderer,
  useEditor,
  type Editor,
} from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import type { SuggestionProps, SuggestionKeyDownProps } from "@tiptap/suggestion";
import { useBoard } from "@/lib/store";
import { SlashCommand, type SlashCommandItem } from "./editor/SlashCommand";
import { ConfirmDialog } from "./ConfirmDialog";

const AUTOSAVE_DELAY_MS = 800;

export function DocumentEditorModal() {
  const editingDocumentId = useBoard((s) => s.editingDocumentId);
  const items = useBoard((s) => s.items);
  const close = useBoard((s) => s.closeDocumentEditor);
  const updateDocument = useBoard((s) => s.updateDocument);
  const deleteDocument = useBoard((s) => s.deleteDocument);

  const item = editingDocumentId ? items[editingDocumentId] : null;
  const isOpen = !!item && item.kind === "document";

  return (
    <AnimatePresence>
      {isOpen && item && (
        <EditorShell
          key={item.id}
          itemId={item.id}
          initialTitle={item.title ?? ""}
          initialContent={item.content ?? ""}
          updatedAt={item.updatedAt}
          onSave={(patch) => updateDocument(item.id, patch)}
          onDelete={() => deleteDocument(item.id)}
          onClose={close}
        />
      )}
    </AnimatePresence>
  );
}

type SaveStatus = "saved" | "dirty" | "saving";

interface EditorShellProps {
  itemId: string;
  initialTitle: string;
  initialContent: string;
  updatedAt?: number;
  onSave: (patch: { title: string; content: string }) => void;
  onDelete: () => void;
  onClose: () => void;
}

function EditorShell({
  initialTitle,
  initialContent,
  updatedAt,
  onSave,
  onDelete,
  onClose,
}: EditorShellProps) {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(
    updatedAt ?? null,
  );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { class: "doc-link" },
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") return "Heading";
          return "Type '/' for commands, or just start writing…";
        },
        showOnlyWhenEditable: true,
        includeChildren: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { class: "doc-image" },
      }),
      CharacterCount.configure({ limit: null }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false, HTMLAttributes: { class: "doc-table" } }),
      TableRow,
      TableHeader,
      TableCell,
      SlashCommand.configure({ render: slashRenderer }),
    ],
    content: initialContent || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "doc-editor prose prose-stone max-w-none min-h-[55vh] focus:outline-none px-8 py-6 text-stone-800",
      },
      handlePaste: (_view, event) => {
        const file = Array.from(event.clipboardData?.files ?? []).find((f) =>
          f.type.startsWith("image/"),
        );
        if (file) {
          event.preventDefault();
          void insertImageFromFile(file, (src) =>
            editorRef.current?.chain().focus().setImage({ src }).run(),
          );
          return true;
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const file = Array.from(event.dataTransfer?.files ?? []).find((f) =>
          f.type.startsWith("image/"),
        );
        if (file) {
          event.preventDefault();
          void insertImageFromFile(file, (src) =>
            editorRef.current?.chain().focus().setImage({ src }).run(),
          );
          return true;
        }
        return false;
      },
    },
    onUpdate: () => {
      setStatus("dirty");
      scheduleAutosave();
    },
  });

  const editorRef = useRef<Editor | null>(null);
  useEffect(() => {
    editorRef.current = editor;
    if (editor && initialTitle) {
      editor.commands.focus("end");
    }
  }, [editor, initialTitle]);

  const persist = useCallback(
    (nextTitle: string, nextContent: string) => {
      setStatus("saving");
      onSave({ title: nextTitle, content: nextContent });
      const now = Date.now();
      setLastSavedAt(now);
      setStatus("saved");
    },
    [onSave],
  );

  const scheduleAutosave = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      const ed = editorRef.current;
      if (!ed) return;
      persist(title, ed.getHTML());
    }, AUTOSAVE_DELAY_MS);
  }, [persist, title]);

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, []);

  const handleManualSave = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    const ed = editorRef.current;
    if (!ed) return;
    persist(title, ed.getHTML());
  }, [persist, title]);

  const handleClose = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    const ed = editorRef.current;
    if (ed && status !== "saved") {
      persist(title, ed.getHTML());
    }
    onClose();
  }, [onClose, persist, status, title]);

  const requestDelete = useCallback(() => {
    setConfirmDeleteOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    setConfirmDeleteOpen(false);
    onDelete();
    onClose();
  }, [onClose, onDelete]);

  const cancelDelete = useCallback(() => {
    setConfirmDeleteOpen(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (confirmDeleteOpen) return;
      if (e.key === "Escape") {
        if ((e.target as HTMLElement | null)?.dataset?.suggestionOpen === "1") return;
        handleClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmDeleteOpen, handleClose, handleManualSave]);

  return (
    <motion.div
      key="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/55 backdrop-blur-sm px-4 py-6"
      onClick={() => {
        if (confirmDeleteOpen) return;
        handleClose();
      }}
    >
      <motion.div
        key="panel"
        initial={{ scale: 0.97, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_rgba(40,30,55,0.32)]"
      >
        <Header
          title={title}
          status={status}
          lastSavedAt={lastSavedAt}
          autoFocusTitle={!initialTitle}
          onTitleChange={(v) => {
            setTitle(v);
            setStatus("dirty");
            scheduleAutosave();
          }}
          onSave={handleManualSave}
          onDelete={requestDelete}
          onClose={handleClose}
        />
        <Toolbar editor={editor} />
        <div className="flex-1 overflow-auto bg-stone-100/60 px-6 py-6">
          <div className="mx-auto max-w-2xl rounded-xl bg-white shadow-[0_2px_12px_rgba(40,30,55,0.06)] ring-1 ring-stone-200/70">
            <EditorContent editor={editor} />
          </div>
          {editor && <DocBubbleMenu editor={editor} />}
        </div>
        <Footer editor={editor} />
        <ConfirmDialog
          open={confirmDeleteOpen}
          tone="danger"
          title={`Delete “${title.trim() || "Untitled"}”?`}
          description="This document will be permanently removed from your board. This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Keep"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      </motion.div>
    </motion.div>
  );
}

interface HeaderProps {
  title: string;
  status: SaveStatus;
  lastSavedAt: number | null;
  autoFocusTitle: boolean;
  onTitleChange: (v: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

function Header({
  title,
  status,
  lastSavedAt,
  autoFocusTitle,
  onTitleChange,
  onSave,
  onDelete,
  onClose,
}: HeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b border-stone-200 bg-white px-6 py-4">
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Untitled"
        autoFocus={autoFocusTitle}
        className="flex-1 truncate bg-transparent text-xl font-semibold tracking-tight text-stone-900 placeholder:text-stone-400 focus:outline-none"
        aria-label="Document title"
      />
      <SaveStatusIndicator status={status} lastSavedAt={lastSavedAt} />
      <button
        type="button"
        onClick={onSave}
        disabled={status === "saved"}
        className="rounded-md bg-violet-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-default disabled:bg-stone-200 disabled:text-stone-500 disabled:shadow-none"
      >
        {status === "saving" ? "Saving…" : "Save"}
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete document"
        title="Delete document"
        className="flex h-8 w-8 items-center justify-center rounded-md text-stone-500 transition hover:bg-rose-50 hover:text-rose-600"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close editor"
        className="flex h-8 w-8 items-center justify-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
    </header>
  );
}

function SaveStatusIndicator({
  status,
  lastSavedAt,
}: {
  status: SaveStatus;
  lastSavedAt: number | null;
}) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  let label: string;
  if (status === "saving") label = "Saving…";
  else if (status === "dirty") label = "Unsaved changes";
  else if (lastSavedAt) label = `Saved ${formatRelative(lastSavedAt, tick)}`;
  else label = "Not saved yet";

  return (
    <span className="hidden text-xs text-stone-500 sm:inline" aria-live="polite">
      {label}
    </span>
  );
}

function formatRelative(ts: number, _tick: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return new Date(ts).toLocaleDateString();
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !file.type.startsWith("image/") || !editor) return;
      void insertImageFromFile(file, (src) =>
        editor.chain().focus().setImage({ src }).run(),
      );
    },
    [editor],
  );

  const handleLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return <div className="h-11 border-b border-stone-200 bg-white" />;
  }

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-stone-200 bg-white/95 px-4 py-2 backdrop-blur">
      <ToolButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="Bold (Ctrl+B)"
      >
        <span className="font-bold">B</span>
      </ToolButton>
      <ToolButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="Italic (Ctrl+I)"
      >
        <span className="italic">I</span>
      </ToolButton>
      <ToolButton
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        label="Underline (Ctrl+U)"
      >
        <span className="underline">U</span>
      </ToolButton>
      <ToolButton
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        label="Strikethrough"
      >
        <span className="line-through">S</span>
      </ToolButton>
      <ToolButton
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
        label="Inline code"
      >
        <span className="font-mono text-[11px]">{"</>"}</span>
      </ToolButton>
      <Divider />
      <ToolButton
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        label="Heading 1"
      >
        H1
      </ToolButton>
      <ToolButton
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        label="Heading 2"
      >
        H2
      </ToolButton>
      <ToolButton
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        label="Heading 3"
      >
        H3
      </ToolButton>
      <Divider />
      <ToolButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        label="Bulleted list"
      >
        <BulletIcon />
      </ToolButton>
      <ToolButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        label="Numbered list"
      >
        <OrderedIcon />
      </ToolButton>
      <ToolButton
        active={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        label="Task list"
      >
        <TaskIcon />
      </ToolButton>
      <Divider />
      <ToolButton
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        label="Quote"
      >
        ❝
      </ToolButton>
      <ToolButton
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        label="Code block"
      >
        <span className="font-mono text-[11px]">{"{}"}</span>
      </ToolButton>
      <ToolButton
        active={false}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        label="Divider"
      >
        —
      </ToolButton>
      <Divider />
      <ToolButton
        active={editor.isActive("link")}
        onClick={handleLink}
        label="Link"
      >
        <LinkIcon />
      </ToolButton>
      <ToolButton
        active={false}
        onClick={() => fileInputRef.current?.click()}
        label="Insert image"
      >
        <ImageIcon />
      </ToolButton>
      <ToolButton
        active={editor.isActive("table")}
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
        label="Insert table"
      >
        ▦
      </ToolButton>
      <Divider />
      <ToolButton
        active={false}
        onClick={() => editor.chain().focus().undo().run()}
        label="Undo (Ctrl+Z)"
        disabled={!editor.can().undo()}
      >
        <UndoIcon />
      </ToolButton>
      <ToolButton
        active={false}
        onClick={() => editor.chain().focus().redo().run()}
        label="Redo (Ctrl+Shift+Z)"
        disabled={!editor.can().redo()}
      >
        <RedoIcon />
      </ToolButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}

function Footer({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const storage = editor.storage.characterCount as
    | { characters: () => number; words: () => number }
    | undefined;
  const characters = storage?.characters?.() ?? 0;
  const words = storage?.words?.() ?? 0;
  return (
    <footer className="flex items-center justify-between border-t border-stone-200 bg-white px-6 py-2 text-[11px] text-stone-500">
      <span>
        {words} word{words === 1 ? "" : "s"} · {characters} character
        {characters === 1 ? "" : "s"}
      </span>
      <span className="hidden sm:inline">
        Tip: press <kbd className="rounded bg-stone-100 px-1 py-0.5 font-mono text-[10px]">/</kbd> for commands
      </span>
    </footer>
  );
}

function DocBubbleMenu({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top" }}
      className="flex items-center gap-0.5 rounded-lg border border-stone-200 bg-white px-1 py-1 shadow-lg"
    >
      <BubbleButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="Bold"
      >
        <span className="font-bold">B</span>
      </BubbleButton>
      <BubbleButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="Italic"
      >
        <span className="italic">I</span>
      </BubbleButton>
      <BubbleButton
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        label="Underline"
      >
        <span className="underline">U</span>
      </BubbleButton>
      <BubbleButton
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        label="Strike"
      >
        <span className="line-through">S</span>
      </BubbleButton>
      <BubbleButton
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
        label="Code"
      >
        <span className="font-mono text-[11px]">{"</>"}</span>
      </BubbleButton>
      <span className="mx-0.5 h-4 w-px bg-stone-200" />
      <BubbleButton
        active={editor.isActive("link")}
        onClick={() => {
          const prev = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("Link URL", prev ?? "https://");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        }}
        label="Link"
      >
        <LinkIcon />
      </BubbleButton>
    </BubbleMenu>
  );
}

interface ToolButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function ToolButton({ active, onClick, label, disabled, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      className={
        "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs transition disabled:opacity-40 " +
        (active
          ? "bg-stone-200 text-stone-900"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900")
      }
    >
      {children}
    </button>
  );
}

function BubbleButton({ active, onClick, label, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={
        "flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs transition " +
        (active
          ? "bg-stone-200 text-stone-900"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900")
      }
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-stone-200" />;
}

function BulletIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="5" cy="6" r="1" fill="currentColor" />
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="5" cy="18" r="1" fill="currentColor" />
      <path d="M9 6h11M9 12h11M9 18h11" strokeLinecap="round" />
    </svg>
  );
}

function OrderedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 6h11M9 12h11M9 18h11" strokeLinecap="round" />
      <path d="M4 4v4M3 8h2M3 14h2l-2 2h2M3 19h2v1H3v1h2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TaskIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="6" height="6" rx="1" />
      <path d="M5 7l1.5 1.5L9 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7h9M12 17h9" strokeLinecap="round" />
      <rect x="3" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" strokeLinecap="round" />
      <path d="M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" strokeLinecap="round" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M21 16l-5-5-9 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 14L4 9l5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9h10a6 6 0 010 12h-3" strokeLinecap="round" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 14l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 9H10a6 6 0 000 12h3" strokeLinecap="round" />
    </svg>
  );
}

function insertImageFromFile(
  file: File,
  insert: (src: string) => void,
): Promise<void> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") insert(reader.result);
      resolve();
    };
    reader.onerror = () => resolve();
    reader.readAsDataURL(file);
  });
}

// ---------- Slash command renderer ----------

interface SlashListProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

function SlashList({ items, command, registerSelector }: SlashListProps & {
  registerSelector: (handler: (e: KeyboardEvent) => boolean) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [items]);

  useEffect(() => {
    registerSelector((e) => {
      if (items.length === 0) return false;
      if (e.key === "ArrowDown") {
        setSelectedIndex((i) => (i + 1) % items.length);
        return true;
      }
      if (e.key === "ArrowUp") {
        setSelectedIndex((i) => (i - 1 + items.length) % items.length);
        return true;
      }
      if (e.key === "Enter") {
        const item = items[selectedIndex];
        if (item) command(item);
        return true;
      }
      return false;
    });
  }, [items, selectedIndex, command, registerSelector]);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-500 shadow-lg">
        No matches
      </div>
    );
  }

  return (
    <div className="max-h-72 w-64 overflow-auto rounded-lg border border-stone-200 bg-white py-1 shadow-xl">
      {items.map((item, i) => (
        <button
          key={item.title}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            command(item);
          }}
          onMouseEnter={() => setSelectedIndex(i)}
          className={
            "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition " +
            (i === selectedIndex ? "bg-stone-100" : "hover:bg-stone-50")
          }
        >
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-stone-200 bg-stone-50 text-xs font-medium text-stone-700">
            {item.icon}
          </span>
          <span className="flex flex-col">
            <span className="font-medium text-stone-800">{item.title}</span>
            <span className="text-[11px] text-stone-500">{item.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function slashRenderer() {
  let renderer: ReactRenderer | null = null;
  let container: HTMLDivElement | null = null;
  let portalRoot: HTMLDivElement | null = null;
  let keyHandler: ((e: KeyboardEvent) => boolean) | null = null;

  const positionAt = (clientRect: DOMRect | null | undefined) => {
    if (!container || !clientRect) return;
    const PAD = 8;
    const w = container.offsetWidth || 256;
    const h = container.offsetHeight || 240;
    let left = clientRect.left;
    let top = clientRect.bottom + PAD;
    if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
    if (top + h > window.innerHeight - 8) top = clientRect.top - h - PAD;
    container.style.left = `${Math.max(8, left)}px`;
    container.style.top = `${Math.max(8, top)}px`;
  };

  return {
    onStart: (props: SuggestionProps<SlashCommandItem>) => {
      portalRoot = document.createElement("div");
      portalRoot.setAttribute("data-slash-root", "");
      document.body.appendChild(portalRoot);

      container = document.createElement("div");
      container.style.position = "fixed";
      container.style.zIndex = "300";
      portalRoot.appendChild(container);

      renderer = new ReactRenderer(SlashList as unknown as React.ComponentType<unknown>, {
        editor: props.editor,
        props: {
          items: props.items,
          command: (item: SlashCommandItem) => props.command(item),
          registerSelector: (h: (e: KeyboardEvent) => boolean) => {
            keyHandler = h;
          },
        },
      });

      const el = renderer?.element;
      if (el instanceof HTMLElement && container) {
        container.appendChild(el);
      }
      positionAt(props.clientRect?.());
    },
    onUpdate: (props: SuggestionProps<SlashCommandItem>) => {
      renderer?.updateProps({
        items: props.items,
        command: (item: SlashCommandItem) => props.command(item),
        registerSelector: (h: (e: KeyboardEvent) => boolean) => {
          keyHandler = h;
        },
      });
      positionAt(props.clientRect?.());
    },
    onKeyDown: (props: SuggestionKeyDownProps) => {
      if (props.event.key === "Escape") {
        return true;
      }
      return keyHandler?.(props.event) ?? false;
    },
    onExit: () => {
      renderer?.destroy();
      renderer = null;
      if (portalRoot && portalRoot.parentNode) {
        portalRoot.parentNode.removeChild(portalRoot);
      }
      portalRoot = null;
      container = null;
      keyHandler = null;
    },
  };
}

