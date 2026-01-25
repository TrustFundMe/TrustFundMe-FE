"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect } from "react";
import { Bold, Italic, Underline as UnderlineIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "What's on your mind?",
  className,
  minHeight = "120px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none px-0 py-1 text-zinc-700 dark:text-zinc-300 text-base [&_p]:my-0.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false } as any);
    }
  }, [value, editor]);

  const onUpdate = useCallback(() => {
    onChange(editor?.getHTML() || "");
  }, [editor, onChange]);

  useEffect(() => {
    if (!editor) return;
    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
    };
  }, [editor, onUpdate]);

  if (!editor) return null;

  return (
    <div className={cn("rounded-lg border border-zinc-200 dark:border-zinc-700 focus-within:ring-2 focus-within:ring-[#ff5e14]/30 focus-within:border-[#ff5e14]/50 transition-all", className)}>
      {/* Toolbar: B, I, U - primary #ff5e14 when active */}
      <div className="flex items-center gap-1 p-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-t-lg">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors",
            editor.isActive("bold") && "bg-[#ff5e14]/20 text-[#ff5e14]"
          )}
          title="In đậm"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors",
            editor.isActive("italic") && "bg-[#ff5e14]/20 text-[#ff5e14]"
          )}
          title="In nghiêng"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors",
            editor.isActive("underline") && "bg-[#ff5e14]/20 text-[#ff5e14]"
          )}
          title="Gạch chân"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
      </div>
      <div style={{ minHeight }} className="px-3 py-2 [&_.ProseMirror]:min-h-[80px] [&_.ProseMirror]:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
