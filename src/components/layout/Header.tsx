"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/login/actions";
import type { User } from "@supabase/supabase-js";

export function Header() {
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
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center justify-between pb-8 border-b border-border mb-8"
    >
      <Link 
        href="/" 
        className="font-serif text-xl text-foreground hover:opacity-70 transition-opacity"
      >
        The Finite Life
      </Link>

      <nav className="flex items-center gap-4">
        {isLoading ? (
          <div className="w-20 h-9 bg-secondary/50 rounded animate-pulse" />
        ) : user ? (
          <>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSignOut}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50"
            >
              {isPending ? "Signing out..." : "Sign Out"}
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
