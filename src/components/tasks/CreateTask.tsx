"use client";

import { useRef, useTransition } from "react";
import { motion } from "framer-motion";
import { createTask } from "@/features/tasks/actions";

interface CreateTaskProps {
  onTaskCreated?: () => void;
}

export function CreateTask({ onTaskCreated }: CreateTaskProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const title = formData.get("title") as string;
    if (!title?.trim()) return;

    // Create a new FormData with the captured value BEFORE resetting
    const taskFormData = new FormData();
    taskFormData.set("title", title.trim());

    // Clear input immediately for snappy UX
    if (formRef.current) {
      formRef.current.reset();
    }
    inputRef.current?.focus();

    startTransition(async () => {
      await createTask(taskFormData);
      onTaskCreated?.();
    });
  }

  return (
    <motion.form
      ref={formRef}
      action={handleSubmit}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
      className="mb-8"
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name="title"
          placeholder="What needs to be done?"
          autoComplete="off"
          disabled={isPending}
          className="w-full px-0 py-4 bg-transparent border-0 border-b border-border text-foreground text-lg font-serif placeholder:text-muted-foreground/60 placeholder:font-serif focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
        />
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-0 top-1/2 -translate-y-1/2"
          >
            <span className="inline-block w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">Enter</kbd> to add task
      </p>
    </motion.form>
  );
}
