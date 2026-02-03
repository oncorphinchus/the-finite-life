"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const settingsSchema = z.object({
  birth_date: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed < new Date();
  }, "Please enter a valid birth date in the past"),
  life_expectancy_weeks: z.number().int().min(1).max(6000).default(4000),
  theme: z.enum(["light", "dark"]).default("light"),
});

export async function getUserSettings() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: null, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned, which is fine for new users
    return { data: null, error: error.message };
  }

  return { data };
}

export async function createOrUpdateSettings(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const rawData = {
    birth_date: formData.get("birth_date"),
    life_expectancy_weeks: Number(formData.get("life_expectancy_weeks")) || 4000,
    theme: formData.get("theme") || "light",
  };

  const result = settingsSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  // Upsert - insert or update if exists
  const { data, error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: user.id,
      birth_date: result.data.birth_date,
      life_expectancy_weeks: result.data.life_expectancy_weeks,
      theme: result.data.theme,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { data };
}