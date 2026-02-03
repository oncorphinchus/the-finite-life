"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { TaskInsert, TaskUpdate } from "@/types/database";

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

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Parse and validate input
  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    deadline: formData.get("deadline"),
    parent_id: formData.get("parent_id"),
  };

  const result = createTaskSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const taskData: TaskInsert = {
    user_id: user.id,
    title: result.data.title,
    description: result.data.description || null,
    deadline: result.data.deadline || null,
    parent_id: result.data.parent_id || null,
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
