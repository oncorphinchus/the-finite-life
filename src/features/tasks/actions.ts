"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { TaskInsert, TaskUpdate, Task } from "@/types/database";

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  deadline: z.string().optional(),
  parent_id: z.string().uuid().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  deadline: z.string().optional().nullable(),
  status: z.enum(["pending", "in_progress", "completed", "archived"]).optional(),
  sort_order: z.number().int().optional(),
});

// Extended Task type with children for tree structure
export interface TaskWithChildren extends Task {
  children?: TaskWithChildren[];
}

/**
 * Create a new task (supports subtasks via parentId)
 */
export async function createTask(title: string, parentId?: string) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Validate title
  if (!title || title.trim().length === 0) {
    return { error: "Title is required" };
  }
  
  if (title.length > 200) {
    return { error: "Title must be 200 characters or less" };
  }

  // If parentId is provided, verify it exists and belongs to user
  if (parentId) {
    const { data: parentTask, error: parentError } = await supabase
      .from("tasks")
      .select("id")
      .eq("id", parentId)
      .eq("user_id", user.id)
      .single();

    if (parentError || !parentTask) {
      return { error: "Parent task not found" };
    }
  }

  const taskData: TaskInsert = {
    user_id: user.id,
    title: title.trim(),
    description: null,
    deadline: null,
    parent_id: parentId || null,
  };

  const { data, error } = await supabase
    .from("tasks")
    .insert(taskData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { data };
}

/**
 * Update an existing task
 */
export async function updateTask(taskId: string, updates: TaskUpdate) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const result = updateTaskSchema.safeParse(updates);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      ...result.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { data };
}

/**
 * Decrement deadline (Minus One Day feature)
 */
export async function decrementDeadline(taskId: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get current count and increment
  const { data: task } = await supabase
    .from("tasks")
    .select("minus_one_count")
    .eq("id", taskId)
    .eq("user_id", user.id)
    .single();

  if (!task) {
    return { error: "Task not found" };
  }

  const { error: updateError } = await supabase
    .from("tasks")
    .update({
      minus_one_count: (task.minus_one_count ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/");
  return { success: true };
}

/**
 * Delete a task (cascade delete handles children via DB constraint)
 */
export async function deleteTask(taskId: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

/**
 * Get all tasks for the current user (flat list)
 */
export async function getTasks() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: [], error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data || [] };
}

/**
 * Get tasks as a tree structure (with nested children)
 */
export async function getTasksTree(): Promise<{ data: TaskWithChildren[]; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: [], error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  // Build tree structure
  const tasks = data || [];
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

  return { data: rootTasks };
}
