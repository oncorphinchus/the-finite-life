"use client";

import { useRef, useTransition, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createTask } from "@/features/tasks/actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CreateTaskProps {
  parentId?: string;
  onTaskCreated?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  compact?: boolean;
}

export function CreateTask({ 
  parentId, 
  onTaskCreated, 
  onCancel,
  placeholder = "What needs to be done?",
  compact = false 
}: CreateTaskProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const title = formData.get("title") as string;
    if (!title?.trim()) return;

    // Clear any previous error
    setError(null);
    
    // Capture title before resetting form
    const taskTitle = title.trim();

    // Clear input immediately for snappy UX
    if (formRef.current) {
      formRef.current.reset();
    }
    inputRef.current?.focus();

    startTransition(async () => {
      const result = await createTask(taskTitle, parentId);
      
      if (result?.error) {
        setError(result.error);
        console.error("CreateTask error:", result.error);
      } else {
        // Success - refresh to show new task
        router.refresh();
        onTaskCreated?.();
      }
    });
  }

  return (
    <motion.form
      ref={formRef}
      action={handleSubmit}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
      className={cn(compact ? "mb-0" : "mb-8")}
    >
      <div className="relative flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          name="title"
          placeholder={placeholder}
          autoComplete="off"
          autoFocus={compact}
          disabled={isPending}
          className={cn(
            "flex-1 bg-transparent border-0 border-b text-foreground font-serif",
            "placeholder:text-muted-foreground/60 placeholder:font-serif",
            "focus:outline-none focus:border-foreground transition-colors",
            "disabled:opacity-50",
            compact 
              ? "px-0 py-2 text-sm border-border" 
              : "px-0 py-4 text-lg border-border"
          )}
        />
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-shrink-0"
          >
            <span className="inline-block w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
        {compact && onCancel && (
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            onClick={onCancel}
            className="flex-shrink-0 text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className={cn(
        "flex items-center justify-between",
        compact ? "mt-1" : "mt-2"
      )}>
        <p className={cn(
          "text-muted-foreground",
          compact ? "text-[10px]" : "text-xs"
        )}>
          Press <kbd className={cn(
            "bg-secondary rounded font-mono",
            compact ? "px-1 py-0.5 text-[8px]" : "px-1.5 py-0.5 text-[10px]"
          )}>Enter</kbd> to add
        </p>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className={cn(
                "text-red-500",
                compact ? "text-[10px]" : "text-xs"
              )}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.form>
  );
}
