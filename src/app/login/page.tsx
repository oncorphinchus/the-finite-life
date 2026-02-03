"use client";

import { useState } from "react";
import { useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { login, signup, sendMagicLink, type AuthState } from "./actions";

type AuthMode = "signin" | "signup";

const initialState: AuthState = {};

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showMagicLink, setShowMagicLink] = useState(false);
  
  const [loginState, loginAction, loginPending] = useActionState(login, initialState);
  const [signupState, signupAction, signupPending] = useActionState(signup, initialState);
  const [magicState, magicAction, magicPending] = useActionState(sendMagicLink, initialState);

  const currentState = showMagicLink ? magicState : (mode === "signin" ? loginState : signupState);
  const isPending = showMagicLink ? magicPending : (mode === "signin" ? loginPending : signupPending);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      {/* Paper texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl text-foreground mb-3">
            The Finite Life
          </h1>
          <p className="text-muted-foreground">
            4,000 weeks. Make them count.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          {/* Mode Toggle */}
          {!showMagicLink && (
            <div className="flex mb-8 border-b border-border">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                  mode === "signin"
                    ? "text-foreground border-b-2 border-foreground -mb-[1px]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                  mode === "signup"
                    ? "text-foreground border-b-2 border-foreground -mb-[1px]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {showMagicLink && (
            <button
              type="button"
              onClick={() => setShowMagicLink(false)}
              className="mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <span>←</span> Back to {mode === "signin" ? "sign in" : "sign up"}
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={showMagicLink ? "magic" : mode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {showMagicLink ? (
                /* Magic Link Form */
                <form action={magicAction} className="space-y-6">
                  <div>
                    <label 
                      htmlFor="magic-email" 
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="magic-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                      placeholder="your@email.com"
                    />
                  </div>

                  <SubmitButton pending={isPending}>
                    Send Magic Link
                  </SubmitButton>
                </form>
              ) : (
                /* Sign In / Sign Up Form */
                <form 
                  action={mode === "signin" ? loginAction : signupAction} 
                  className="space-y-6"
                >
                  <div>
                    <label 
                      htmlFor="email" 
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="password" 
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      minLength={6}
                      className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                      placeholder="••••••••"
                    />
                  </div>

                  <SubmitButton pending={isPending}>
                    {mode === "signin" ? "Sign In" : "Create Account"}
                  </SubmitButton>
                </form>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Status Messages */}
          <AnimatePresence>
            {currentState.error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-sm text-destructive text-center"
              >
                {currentState.error}
              </motion.p>
            )}
            {currentState.message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-sm text-foreground text-center bg-secondary/50 rounded-md p-3"
              >
                {currentState.message}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Magic Link Option */}
          {!showMagicLink && (
            <div className="mt-8 pt-6 border-t border-border text-center">
              <button
                type="button"
                onClick={() => setShowMagicLink(true)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Or sign in with a <span className="underline">magic link</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Quote */}
        <p className="mt-8 text-center text-sm text-muted-foreground font-serif italic">
          "The days are long, but the years are short."
        </p>
      </motion.div>
    </div>
  );
}

function SubmitButton({ 
  children, 
  pending 
}: { 
  children: React.ReactNode; 
  pending: boolean;
}) {
  return (
    <motion.button
      type="submit"
      disabled={pending}
      whileTap={{ scale: 0.98 }}
      className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-md font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
          />
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
