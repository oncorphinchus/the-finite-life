/**
 * THE FINITE LIFE — Date Mathematics
 * Utilities for calculating life weeks and adjusted deadlines
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MS_PER_WEEK = MS_PER_DAY * 7;

/**
 * Calculate the number of weeks lived since birth
 */
export function calculateWeeksLived(birthDate: Date | string): number {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const today = new Date();
  
  // Reset time to midnight for accurate day calculation
  birth.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffMs = today.getTime() - birth.getTime();
  return Math.floor(diffMs / MS_PER_WEEK);
}

/**
 * Calculate the current week number (1-indexed) within total life expectancy
 */
export function getCurrentWeekNumber(
  birthDate: Date | string,
  lifeExpectancyWeeks: number = 4000
): number {
  const weeksLived = calculateWeeksLived(birthDate);
  return Math.min(weeksLived + 1, lifeExpectancyWeeks);
}

/**
 * Calculate the adjusted deadline after minus-one-day deductions
 */
export function calculateAdjustedDeadline(
  originalDeadline: Date | string,
  minusOneDays: number
): Date {
  const deadline = typeof originalDeadline === "string" 
    ? new Date(originalDeadline) 
    : new Date(originalDeadline);
  
  deadline.setDate(deadline.getDate() - minusOneDays);
  return deadline;
}

/**
 * Calculate days remaining until a deadline
 */
export function calculateDaysRemaining(deadline: Date | string): number {
  const target = typeof deadline === "string" ? new Date(deadline) : deadline;
  const today = new Date();
  
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffMs = target.getTime() - today.getTime();
  return Math.ceil(diffMs / MS_PER_DAY);
}

/**
 * Calculate weeks remaining until a deadline
 */
export function calculateWeeksRemaining(deadline: Date | string): number {
  const daysRemaining = calculateDaysRemaining(deadline);
  return Math.ceil(daysRemaining / 7);
}

/**
 * Format a date for display (e.g., "Feb 3, 2026")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format relative time (e.g., "3 weeks", "5 days")
 */
export function formatRelativeTime(daysRemaining: number): string {
  if (daysRemaining < 0) {
    const overdue = Math.abs(daysRemaining);
    if (overdue >= 7) {
      return `${Math.floor(overdue / 7)} weeks overdue`;
    }
    return `${overdue} days overdue`;
  }
  
  if (daysRemaining === 0) return "Today";
  if (daysRemaining === 1) return "Tomorrow";
  if (daysRemaining < 7) return `${daysRemaining} days`;
  if (daysRemaining < 14) return "1 week";
  
  return `${Math.floor(daysRemaining / 7)} weeks`;
}

/**
 * Get the row and column position for a given week number
 * Grid is 52 columns (weeks per year) x 80 rows (years)
 */
export function getWeekPosition(weekNumber: number): { row: number; col: number } {
  const row = Math.floor((weekNumber - 1) / 52);
  const col = (weekNumber - 1) % 52;
  return { row, col };
}

/**
 * Determine the state of a week cell
 */
export type WeekState = "past" | "current" | "future";

export function getWeekState(
  weekNumber: number,
  currentWeek: number
): WeekState {
  if (weekNumber < currentWeek) return "past";
  if (weekNumber === currentWeek) return "current";
  return "future";
}