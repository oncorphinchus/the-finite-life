"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/login/actions";
import type { User } from "@supabase/supabase-js";

interface HeaderProps {
  onOpenSettings?: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      className="flex items-center justify-between pb-8 border-b border-border mb-8"
    >
      <Link 
        href="/" 
        className="font-serif text-xl text-foreground hover:opacity-70 transition-opacity"
      >
        The Finite Life
      </Link>

      <nav className="flex items-center gap-3">
        {isLoading ? (
          <div className="w-20 h-9 bg-secondary/50 rounded animate-pulse" />
        ) : user ? (
          <>
            {/* Settings Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onOpenSettings}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/50"
              aria-label="Settings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </motion.button>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSignOut}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50"
            >
              {isPending ? "..." : "Sign Out"}
            </motion.button>
          </>
        ) : (
          <Link href="/login">
            <motion.span
              whileTap={{ scale: 0.98 }}
              className="inline-block px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 rounded-md transition-opacity"
            >
              Login
            </motion.span>
          </Link>
        )}
      </nav>
    </motion.header>
  );
}
