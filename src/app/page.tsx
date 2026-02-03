import { 
  LuxuryWrapper, 
  LuxurySection, 
  LuxuryHeading, 
  LuxuryText 
} from "@/components/layout/LuxuryWrapper";
import { LifeGrid, GridLegend } from "@/components/life-grid/LifeGrid";
import { TaskList } from "@/components/tasks/TaskList";
import { calculateWeeksLived } from "@/lib/date-utils";
import { createClient } from "@/lib/supabase/server";
import { HomeClient } from "./HomeClient";

// Demo birth date for visitors (will be replaced by user settings)
const DEMO_BIRTH_DATE = "1990-01-15";

export default async function Home() {
  const supabase = await createClient();
  
  // Try to get user settings and tasks
  const { data: { user } } = await supabase.auth.getUser();
  
  let birthDate = DEMO_BIRTH_DATE;
  let lifeExpectancy = 4000;
  let tasks: any[] = [];
  let needsOnboarding = false;
  let userSettings: { birth_date?: string; life_expectancy_weeks?: number } | null = null;
  
  if (user) {
    // Get user settings
    const { data: settings } = await supabase
      .from("user_settings")
      .select("birth_date, life_expectancy_weeks")
      .eq("user_id", user.id)
      .single();
    
    // Transform null to undefined for cleaner typing
    userSettings = settings ? {
      birth_date: settings.birth_date ?? undefined,
      life_expectancy_weeks: settings.life_expectancy_weeks ?? undefined,
    } : null;
    
    if (settings?.birth_date) {
      birthDate = settings.birth_date;
    } else {
      // User is logged in but hasn't set birth date - trigger onboarding
      needsOnboarding = true;
    }
    
    if (settings?.life_expectancy_weeks) {
      lifeExpectancy = settings.life_expectancy_weeks;
    }
    
    // Get tasks
    const { data: userTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    tasks = userTasks || [];
  }
  
  const weeksLived = calculateWeeksLived(birthDate);
  const currentWeek = weeksLived + 1;
  const weeksRemaining = Math.max(0, lifeExpectancy - weeksLived);

  return (
    <HomeClient
      user={user}
      tasks={tasks}
      currentWeek={currentWeek}
      weeksLived={weeksLived}
      weeksRemaining={weeksRemaining}
      lifeExpectancy={lifeExpectancy}
      needsOnboarding={needsOnboarding}
      userSettings={userSettings}
    />
  );
}
