"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TaskCard } from "./TaskCard";
import type { Task } from "@/types/database";

interface TaskListProps {
  tasks: Task[];
  emptyMessage?: string;
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren" as const,
      staggerChildren: 0.08,
    },
  },
};

export function TaskList({ tasks, emptyMessage = "No tasks yet" }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12 text-muted-foreground"
      >
        <p className="font-serif text-lg">{emptyMessage}</p>
        <p className="text-sm mt-2">Create your first task to get started.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
