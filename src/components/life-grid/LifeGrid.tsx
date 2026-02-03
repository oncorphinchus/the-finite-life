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

// Single container fade - no staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Static cell - no animation, pure performance
function WeekCell({
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

  // Current week gets the pulsing animation via native SVG animate
  if (isCurrent) {
    return (
      <rect
        key={weekNumber}
        x={x}
        y={y}
        width={CELL_SIZE}
        height={CELL_SIZE}
        rx={1}
        fill={COLORS.current}
        style={{
          filter: "drop-shadow(0 0 4px rgba(26, 26, 26, 0.6))",
        }}
      >
        <animate
          attributeName="opacity"
          values="1;0.4;1"
          dur="2s"
          repeatCount="indefinite"
        />
      </rect>
    );
  }

  // Past and future weeks - completely static, no framer-motion
  return (
    <rect
      key={weekNumber}
      x={x}
      y={y}
      width={CELL_SIZE}
      height={CELL_SIZE}
      rx={1}
      fill={isPast ? COLORS.past : "transparent"}
      stroke={isPast ? "none" : COLORS.futureStroke}
      strokeWidth={isPast ? 0 : 0.5}
      strokeOpacity={isPast ? 0 : 0.3}
    />
  );
}

// Memoized grid component for performance
const LifeGridInner = memo(function LifeGridInner({ 
  currentWeek, 
  totalWeeks = 4160 
}: LifeGridProps) {
  // Calculate SVG dimensions
  const width = COLS * (CELL_SIZE + CELL_GAP) - CELL_GAP;
  const height = ROWS * (CELL_SIZE + CELL_GAP) - CELL_GAP;

  // Generate all week cells - static rects, no animation overhead
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
      {/* Single motion wrapper for fade-in, no staggered children */}
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
});

export function LifeGrid(props: LifeGridProps) {
  return <LifeGridInner {...props} />;
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
