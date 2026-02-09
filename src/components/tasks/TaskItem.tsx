"use client";

import { useState, useRef, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MoreHorizontal, 
  Plus, 
  Pencil, 
  CalendarDays, 
  Trash2,
  Check,
  X,
  Circle,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, calculateDaysRemaining, formatRelativeTime } from "@/lib/date-utils";
import { updateTask, deleteTask } from "@/features/tasks/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CreateTask } from "./CreateTask";
import type { Task } from "@/types/database";

// Extended Task type with children for tree structure
export interface TaskWithChildren extends Task {
  children?: TaskWithChildren[];
}

interface TaskItemProps {
  task: TaskWithChildren;
  depth?: number;
  onTaskUpdate?: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    height: 0,
    transition: { duration: 0.15 },
  },
};

export function TaskItem({ task, depth = 0, onTaskUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const isCompleted = task.status === "completed";
  const hasDeadline = !!task.deadline;
  const daysRemaining = hasDeadline ? calculateDaysRemaining(task.deadline!) : null;
  const isOverdue = daysRemaining !== null && daysRemaining < 0;
  const isUrgent = daysRemaining !== null && daysRemaining <= 3 && daysRemaining >= 0;

  // Toggle completion status
  const handleToggleComplete = () => {
    startTransition(async () => {
      await updateTask(task.id, {
        status: isCompleted ? "pending" : "completed",
      });
      onTaskUpdate?.();
    });
  };

  // Save edited title
  const handleSaveEdit = () => {
    if (!editTitle.trim() || editTitle === task.title) {
      setIsEditing(false);
      setEditTitle(task.title);
      return;
    }

    startTransition(async () => {
      await updateTask(task.id, { title: editTitle.trim() });
      setIsEditing(false);
      onTaskUpdate?.();
    });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(task.title);
  };

  // Handle deadline selection
  const handleDeadlineSelect = (date: Date | undefined) => {
    startTransition(async () => {
      await updateTask(task.id, {
        deadline: date ? date.toISOString().split("T")[0] : null,
      });
      setCalendarOpen(false);
      onTaskUpdate?.();
    });
  };

  // Delete task
  const handleDelete = () => {
    startTransition(async () => {
      await deleteTask(task.id);
      onTaskUpdate?.();
    });
  };

  // Start editing
  const handleStartEdit = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Handle subtask created
  const handleSubtaskCreated = () => {
    setShowSubtaskInput(false);
    onTaskUpdate?.();
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="relative"
    >
      {/* Main Task Row */}
      <div
        className={cn(
          "group flex items-center gap-3 py-3 px-4 rounded-lg",
          "bg-card hover:bg-card/80 border border-border/50",
          "transition-all duration-200",
          isPending && "opacity-60 pointer-events-none",
          depth > 0 && "ml-6 border-l-2 border-l-border"
        )}
      >
        {/* Checkbox - Circular Luxury Style */}
        <button
          onClick={handleToggleComplete}
          disabled={isPending}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200",
            "flex items-center justify-center",
            "active:scale-95",
            isCompleted
              ? "bg-foreground border-foreground text-background"
              : "border-muted-foreground/40 hover:border-foreground/60"
          )}
        >
          <AnimatePresence mode="wait">
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Title / Edit Input */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                className="flex-1 bg-transparent border-b border-foreground text-foreground font-serif focus:outline-none py-1"
              />
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={handleSaveEdit}
                className="text-chart-2"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={handleCancelEdit}
                className="text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <span
              className={cn(
                "font-serif text-base truncate block",
                isCompleted && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </span>
          )}
        </div>

        {/* Deadline Badge */}
        {hasDeadline && !isEditing && (
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium",
                  "transition-colors duration-200",
                  "hover:ring-2 hover:ring-offset-1 hover:ring-offset-background",
                  isOverdue && "bg-destructive/15 text-destructive hover:ring-destructive/30",
                  isUrgent && !isOverdue && "bg-chart-5/15 text-chart-5 hover:ring-chart-5/30",
                  !isOverdue && !isUrgent && "bg-secondary text-muted-foreground hover:ring-border"
                )}
              >
                {formatDate(task.deadline!)}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={task.deadline ? new Date(task.deadline) : undefined}
                onSelect={handleDeadlineSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}

        {/* Menu Button */}
        {!isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon-xs"
                variant="ghost"
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowSubtaskInput(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Subtask
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleStartEdit}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit Title
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCalendarOpen(true)}>
                <CalendarDays className="w-4 h-4 mr-2" />
                {hasDeadline ? "Change Deadline" : "Set Deadline"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Subtask Input (appears below this task) */}
      <AnimatePresence>
        {showSubtaskInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-6 mt-2"
          >
            <CreateTask
              parentId={task.id}
              onTaskCreated={handleSubtaskCreated}
              onCancel={() => setShowSubtaskInput(false)}
              placeholder="Add subtask..."
              compact
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recursive Children */}
      {task.children && task.children.length > 0 && (
        <div className="mt-2 space-y-2">
          <AnimatePresence mode="popLayout">
            {task.children.map((child) => (
              <TaskItem
                key={child.id}
                task={child}
                depth={depth + 1}
                onTaskUpdate={onTaskUpdate}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
