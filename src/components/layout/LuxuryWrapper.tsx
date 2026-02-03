"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LuxuryWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function LuxuryWrapper({ children, className }: LuxuryWrapperProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Subtle paper texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "relative mx-auto max-w-4xl px-6 py-12 md:px-12 md:py-20",
          className
        )}
      >
        {children}
      </motion.main>
    </div>
  );
}

export function LuxurySection({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <motion.section
      variants={itemVariants}
      className={cn("mb-16", className)}
    >
      {children}
    </motion.section>
  );
}

export function LuxuryHeading({ 
  children, 
  as: Component = "h1",
  className 
}: { 
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Component className={cn("font-serif text-foreground mb-6", className)}>
        {children}
      </Component>
    </motion.div>
  );
}

export function LuxuryText({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.p
      variants={itemVariants}
      className={cn("text-muted-foreground leading-relaxed", className)}
    >
      {children}
    </motion.p>
  );
}