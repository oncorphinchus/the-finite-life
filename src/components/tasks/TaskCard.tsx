"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  calculateAdjustedDeadline, 
  calculateDaysRemaining, 
  formatDate,
  formatRelativeTime 
} from "@/lib/date-utils";
import { MinusOneButton } from "./MinusOneButton";
import type { Task } from "@/types/database";

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, status: Task["status"]) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
};

const statusColors: Record<Task["status"], string> = {
  pending: "bg-secondary",
  in_progress: "bg-chart-4/20",
  completed: "bg-chart-2/20",
  archived: "bg-muted",
};

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const [localMinusCount, setLocalMinusCount] = useState(task.minus_one_count);
  
  const hasDeadline = !!task.deadline;
  const adjustedDeadline = hasDeadline 
    ? calculateAdjustedDeadline(task.deadline!, localMinusCount)
    : null;
  const daysRemaining = adjustedDeadline 
    ? calculateDaysRemaining(adjustedDeadline)
    : null;
  const isOverdue = daysRemaining !== null && daysRemaining < 0;
  const isUrgent = daysRemaining !== null && daysRemaining <= 3 && daysRemaining >= 0;

  return (
    <motion.article
      variants={cardVariants}
      layout
      className={cn(
        "group relative p-5 rounded-lg border border-border",
        "bg-card hover:bg-card/80",
        "transition-colors duration-200",
        statusColors[task.status]
      )}
    >
      {/* Status indicator */}
      <div className="absolute top-5 right-5">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            task.status === "completed" && "bg-chart-2",
            task.status === "in_progress" && "bg-chart-4",
            task.status === "pending" && "bg-muted-foreground/30",
            task.status === "archived" && "bg-muted-foreground/20"
          )}
        />
      </div>

      {/* Title */}
      <h3 className="font-serif text-lg text-foreground pr-8 mb-2">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Deadline section */}
      {hasDeadline && adjustedDeadline && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-4">
            {/* Original deadline */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className={cn(localMinusCount > 0 && "line-through opacity-50")}>
                {formatDate(task.deadline!)}
              </span>
            </div>

            {/* Adjusted deadline */}
            {localMinusCount > 0 && (
              <div className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
                isOverdue && "text-destructive",
                isUrgent && "text-chart-5"
              )}>
                <ChevronRight className="w-4 h-4" />
                <span>{formatDate(adjustedDeadline)}</span>
              </div>
            )}
          </div>

          {/* Time remaining + Minus button */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-1.5 text-sm",
              isOverdue && "text-destructive",
              isUrgent && "text-chart-5",
              !isOverdue && !isUrgent && "text-muted-foreground"
            )}>
              <Clock className="w-4 h-4" />
              <span>{formatRelativeTime(daysRemaining!)}</span>
            </div>

            <MinusOneButton
              taskId={task.id}
              currentCount={localMinusCount}
              onOptimisticUpdate={setLocalMinusCount}
            />
          </div>
        </div>
      )}

      {/* No deadline - still show minus button for future use */}
      {!hasDeadline && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>No deadline set</span>
        </div>
      )}
    </motion.article>
  );
}