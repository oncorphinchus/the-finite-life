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

// Demo birth date for initial view (will be replaced by user settings)
const DEMO_BIRTH_DATE = "1990-01-15";

export default async function Home() {
  const supabase = await createClient();
  
  // Try to get user settings and tasks
  const { data: { user } } = await supabase.auth.getUser();
  
  let birthDate = DEMO_BIRTH_DATE;
  let tasks: any[] = [];
  
  if (user) {
    // Get user settings
    const { data: settings } = await supabase
      .from("user_settings")
      .select("birth_date")
      .eq("user_id", user.id)
      .single();
    
    if (settings?.birth_date) {
      birthDate = settings.birth_date;
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

  return (
    <LuxuryWrapper>
      {/* Hero Section */}
      <LuxurySection className="text-center">
        <LuxuryHeading as="h1">
          The Finite Life
        </LuxuryHeading>
        <LuxuryText className="max-w-xl mx-auto text-lg">
          You have approximately 4,000 weeks. 
          This is week <span className="font-serif text-foreground">{currentWeek.toLocaleString()}</span>.
        </LuxuryText>
      </LuxurySection>

      {/* Life Grid Section */}
      <LuxurySection>
        <LuxuryHeading as="h2" className="text-center mb-8">
          Your Life in Weeks
        </LuxuryHeading>
        <LifeGrid currentWeek={currentWeek} />
        <GridLegend />
      </LuxurySection>

      {/* Stats Section */}
      <LuxurySection>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <StatCard
            label="Weeks Lived"
            value={weeksLived.toLocaleString()}
          />
          <StatCard
            label="Weeks Remaining"
            value={(4000 - weeksLived).toLocaleString()}
          />
          <StatCard
            label="Years Lived"
            value={Math.floor(weeksLived / 52).toString()}
          />
          <StatCard
            label="% Complete"
            value={`${((weeksLived / 4000) * 100).toFixed(1)}%`}
          />
        </div>
      </LuxurySection>

      {/* Tasks Section */}
      <LuxurySection>
        <LuxuryHeading as="h2">
          Your Tasks
        </LuxuryHeading>
        <LuxuryText className="mb-8">
          Every task has a deadline. Every deadline can be shortened. 
          The <span className="font-medium text-foreground">Minus 1 Day</span> button 
          reminds you that time is finite.
        </LuxuryText>
        
        {user ? (
          <TaskList 
            tasks={tasks} 
            emptyMessage="No tasks yet. Start by creating your first task."
          />
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground font-serif text-lg">
              Sign in to create and manage your tasks
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Your life grid will also sync to your actual birth date.
            </p>
          </div>
        )}
      </LuxurySection>

      {/* Footer */}
      <footer className="text-center text-sm text-muted-foreground pt-12 border-t border-border">
        <p className="font-serif italic">
          "The days are long, but the years are short."
        </p>
        <p className="mt-4">
          Inspired by Oliver Burkeman&apos;s <em>Four Thousand Weeks</em>
        </p>
      </footer>
    </LuxuryWrapper>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-lg bg-card border border-border">
      <p className="text-2xl md:text-3xl font-serif text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}