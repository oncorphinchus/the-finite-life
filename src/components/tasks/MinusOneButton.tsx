"use client";

import { useOptimistic, useTransition } from "react";
import { motion } from "framer-motion";
import { Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { decrementDeadline } from "@/features/tasks/actions";

interface MinusOneButtonProps {
  taskId: string;
  currentCount: number;
  onOptimisticUpdate?: (newCount: number) => void;
  className?: string;
}

export function MinusOneButton({
  taskId,
  currentCount,
  onOptimisticUpdate,
  className,
}: MinusOneButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticCount, setOptimisticCount] = useOptimistic(
    currentCount,
    (_, newCount: number) => newCount
  );

  const handleClick = () => {
    const newCount = optimisticCount + 1;
    
    // Optimistic update - instant (0ms)
    setOptimisticCount(newCount);
    onOptimisticUpdate?.(newCount);
    
    // Server action in background
    startTransition(async () => {
      await decrementDeadline(taskId);
    });
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isPending}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2",
        "bg-primary text-primary-foreground",
        "font-medium text-sm rounded-md",
        "transition-colors duration-200",
        "hover:bg-primary/90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none",
        className
      )}
      aria-label="Subtract one day from deadline"
    >
      <Minus className="w-4 h-4" />
      <span>1 Day</span>
      {optimisticCount > 0 && (
        <motion.span
          key={optimisticCount}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="ml-1 px-1.5 py-0.5 text-xs bg-primary-foreground/20 rounded"
        >
          -{optimisticCount}
        </motion.span>
      )}
    </motion.button>
  );
}

// Compact variant for inline use
export function MinusOneButtonCompact({
  taskId,
  currentCount,
  onOptimisticUpdate,
}: Omit<MinusOneButtonProps, "className">) {
  const [isPending, startTransition] = useTransition();
  const [optimisticCount, setOptimisticCount] = useOptimistic(
    currentCount,
    (_, newCount: number) => newCount
  );

  const handleClick = () => {
    const newCount = optimisticCount + 1;
    setOptimisticCount(newCount);
    onOptimisticUpdate?.(newCount);
    
    startTransition(async () => {
      await decrementDeadline(taskId);
    });
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isPending}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "w-8 h-8 rounded-full",
        "bg-secondary text-secondary-foreground",
        "flex items-center justify-center",
        "hover:bg-secondary/80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "transition-colors duration-200"
      )}
      aria-label="Subtract one day from deadline"
    >
      <Minus className="w-4 h-4" />
    </motion.button>
  );
}