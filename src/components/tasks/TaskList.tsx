"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TaskItem, type TaskWithChildren } from "./TaskItem";
import type { Task } from "@/types/database";
import { useRouter } from "next/navigation";

interface TaskListProps {
  tasks: TaskWithChildren[];
  emptyMessage?: string;
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren" as const,
      staggerChildren: 0.06,
    },
  },
};

/**
 * Utility function to build a tree from flat task array
 * Use this when you have a flat list from the database
 */
export function buildTaskTree(tasks: Task[]): TaskWithChildren[] {
  const taskMap = new Map<string, TaskWithChildren>();
  const rootTasks: TaskWithChildren[] = [];

  // First pass: create map of all tasks
  tasks.forEach((task) => {
    taskMap.set(task.id, { ...task, children: [] });
  });

  // Second pass: build tree
  tasks.forEach((task) => {
    const taskWithChildren = taskMap.get(task.id)!;
    
    if (task.parent_id && taskMap.has(task.parent_id)) {
      // Has parent - add to parent's children
      const parent = taskMap.get(task.parent_id)!;
      parent.children = parent.children || [];
      parent.children.push(taskWithChildren);
    } else {
      // No parent or parent not found - it's a root task
      rootTasks.push(taskWithChildren);
    }
  });

  return rootTasks;
}

export function TaskList({ tasks, emptyMessage = "No tasks yet" }: TaskListProps) {
  const router = useRouter();

  const handleTaskUpdate = () => {
    router.refresh();
  };

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
      className="space-y-3"
    >
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onTaskUpdate={handleTaskUpdate}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
