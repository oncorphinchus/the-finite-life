"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  LuxuryWrapper, 
  LuxurySection, 
  LuxuryHeading, 
  LuxuryText 
} from "@/components/layout/LuxuryWrapper";
import { Header } from "@/components/layout/Header";
import { LifeGrid, GridLegend } from "@/components/life-grid/LifeGrid";
import { TaskList, buildTaskTree } from "@/components/tasks/TaskList";
import { CreateTask } from "@/components/tasks/CreateTask";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import type { User } from "@supabase/supabase-js";
import type { Task } from "@/types/database";

interface HomeClientProps {
  user: User | null;
  tasks: Task[];
  currentWeek: number;
  weeksLived: number;
  weeksRemaining: number;
  lifeExpectancy: number;
  needsOnboarding: boolean;
  userSettings: { birth_date?: string; life_expectancy_weeks?: number } | null;
}

export function HomeClient({
  user,
  tasks,
  currentWeek,
  weeksLived,
  weeksRemaining,
  lifeExpectancy,
  needsOnboarding,
  userSettings,
}: HomeClientProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auto-open settings dialog for onboarding
  useEffect(() => {
    if (needsOnboarding) {
      setIsSettingsOpen(true);
    }
  }, [needsOnboarding]);

  // Build task tree from flat list
  const taskTree = useMemo(() => buildTaskTree(tasks), [tasks]);

  return (
    <LuxuryWrapper>
      {/* Header with Auth & Settings */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentBirthDate={userSettings?.birth_date}
        currentLifeExpectancy={userSettings?.life_expectancy_weeks || 4000}
        forceOpen={needsOnboarding}
      />

      {/* Compact Hero */}
      <LuxurySection className="text-center pb-8">
        <LuxuryHeading as="h1" className="text-3xl md:text-4xl">
          The Finite Life
        </LuxuryHeading>
        <LuxuryText className="max-w-md mx-auto">
          Week <span className="font-serif text-foreground font-medium">{currentWeek.toLocaleString()}</span> of {lifeExpectancy.toLocaleString()}
        </LuxuryText>
      </LuxurySection>

      {/* PRIMARY: Tasks Section - Productivity First */}
      <LuxurySection className="pt-0">
        <LuxuryHeading as="h2" className="text-xl mb-6">
          Your Tasks
        </LuxuryHeading>
        
        {user ? (
          <>
            <CreateTask />
            <TaskList 
              tasks={taskTree} 
              emptyMessage="No tasks yet. What needs to be done?"
            />
          </>
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

      {/* SECONDARY: Stats - Quick Glance */}
      <LuxurySection>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <StatCard
            label="Weeks Lived"
            value={weeksLived.toLocaleString()}
          />
          <StatCard
            label="Weeks Remaining"
            value={weeksRemaining.toLocaleString()}
          />
          <StatCard
            label="Years Lived"
            value={Math.floor(weeksLived / 52).toString()}
          />
          <StatCard
            label="% Complete"
            value={`${((weeksLived / lifeExpectancy) * 100).toFixed(1)}%`}
          />
        </div>
      </LuxurySection>

      {/* TERTIARY: Life Grid - Philosophical Context */}
      <LuxurySection>
        <details className="group">
          <summary className="cursor-pointer list-none flex items-center justify-between">
            <LuxuryHeading as="h2" className="text-xl">
              Your Life in Weeks
            </LuxuryHeading>
            <span className="text-muted-foreground text-sm group-open:rotate-180 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </summary>
          <div className="mt-6">
            <LifeGrid currentWeek={currentWeek} totalWeeks={lifeExpectancy > 4160 ? lifeExpectancy : 4160} />
            <GridLegend />
          </div>
        </details>
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
      <p className="text-xl md:text-2xl font-serif text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
