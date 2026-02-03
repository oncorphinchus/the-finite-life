"use client";

import { useMemo, memo } from "react";
import { motion } from "framer-motion";
import { getWeekPosition, getWeekState, type WeekState } from "@/lib/date-utils";

interface LifeGridProps {
  currentWeek: number;
  totalWeeks?: number;
}

const CELL_SIZE = 8;
const CELL_GAP = 2;
const COLS = 52; // Weeks per year
const ROWS = 80; // Years of life

// Colors from design system
const COLORS = {
  past: "#1A1A1A",      // Charcoal - filled
  current: "#1A1A1A",   // Charcoal - pulsing
  future: "#E8E8E0",    // Sand darker - stroke only
  futureStroke: "#1A1A1A",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      when: "beforeChildren" as const,
      staggerChildren: 0.0005,
    },
  },
};

const cellVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut" as const,
    },
  },
};

// Memoized cell component for performance
const WeekCell = memo(function WeekCell({
  weekNumber,
  state,
  x,
  y,
}: {
  weekNumber: number;
  state: WeekState;
  x: number;
  y: number;
}) {
  const isPast = state === "past";
  const isCurrent = state === "current";

  return (
    <motion.rect
      key={weekNumber}
      variants={cellVariants}
      x={x}
      y={y}
      width={CELL_SIZE}
      height={CELL_SIZE}
      rx={1}
      fill={isPast || isCurrent ? COLORS.past : "transparent"}
      stroke={isPast ? "none" : COLORS.futureStroke}
      strokeWidth={isPast ? 0 : 0.5}
      strokeOpacity={isPast ? 0 : 0.3}
      style={isCurrent ? {
        filter: "drop-shadow(0 0 3px rgba(26, 26, 26, 0.5))",
      } : undefined}
    >
      {isCurrent && (
        <animate
          attributeName="opacity"
          values="1;0.5;1"
          dur="2s"
          repeatCount="indefinite"
        />
      )}
    </motion.rect>
  );
});

export function LifeGrid({ currentWeek, totalWeeks = 4160 }: LifeGridProps) {
  // Calculate SVG dimensions
  const width = COLS * (CELL_SIZE + CELL_GAP) - CELL_GAP;
  const height = ROWS * (CELL_SIZE + CELL_GAP) - CELL_GAP;

  // Generate all week cells
  const cells = useMemo(() => {
    const result = [];
    for (let week = 1; week <= totalWeeks; week++) {
      const { row, col } = getWeekPosition(week);
      const state = getWeekState(week, currentWeek);
      const x = col * (CELL_SIZE + CELL_GAP);
      const y = row * (CELL_SIZE + CELL_GAP);

      result.push(
        <WeekCell
          key={week}
          weekNumber={week}
          state={state}
          x={x}
          y={y}
        />
      );
    }
    return result;
  }, [currentWeek, totalWeeks]);

  return (
    <div className="w-full overflow-x-auto pb-4">
      <motion.svg
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto"
        style={{ minWidth: width }}
        role="img"
        aria-label={`Life grid showing ${currentWeek} weeks lived out of ${totalWeeks} total weeks`}
      >
        <title>{`Life Grid - ${currentWeek} of ${totalWeeks} weeks`}</title>
        {cells}
      </motion.svg>
    </div>
  );
}

// Grid legend component
export function GridLegend() {
  return (
    <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mt-6">
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-sm" 
          style={{ backgroundColor: COLORS.past }}
        />
        <span>Lived</span>
      </div>
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-sm border"
          style={{ borderColor: COLORS.futureStroke, borderWidth: 1 }}
        />
        <span>Remaining</span>
      </div>
    </div>
  );
}
