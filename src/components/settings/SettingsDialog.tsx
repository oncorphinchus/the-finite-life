"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateUserSettings } from "@/features/settings/actions";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentBirthDate?: string | null;
  currentLifeExpectancy?: number;
  forceOpen?: boolean; // Prevents closing if birth_date is null
}

export function SettingsDialog({
  isOpen,
  onClose,
  currentBirthDate,
  currentLifeExpectancy = 4000,
  forceOpen = false,
}: SettingsDialogProps) {
  const [birthDate, setBirthDate] = useState(currentBirthDate || "");
  const [lifeExpectancy, setLifeExpectancy] = useState(currentLifeExpectancy);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentBirthDate) setBirthDate(currentBirthDate);
    if (currentLifeExpectancy) setLifeExpectancy(currentLifeExpectancy);
  }, [currentBirthDate, currentLifeExpectancy]);

  const handleClose = () => {
    if (forceOpen && !birthDate) {
      setError("Please set your birth date to continue");
      return;
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!birthDate) {
      setError("Birth date is required");
      return;
    }

    startTransition(async () => {
      const result = await updateUserSettings({
        birth_date: birthDate,
        life_expectancy_weeks: lifeExpectancy,
      });

      if (result.error) {
        setError(typeof result.error === "string" ? result.error : "Failed to save settings");
      } else {
        onClose();
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-card border border-border rounded-lg p-8 shadow-lg mx-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl text-foreground">Settings</h2>
                {!forceOpen && (
                  <button
                    onClick={handleClose}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {forceOpen && (
                <p className="text-sm text-muted-foreground mb-6">
                  Set your birth date to see your life in weeks accurately.
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Birth Date */}
                <div>
                  <label htmlFor="birth-date" className="block text-sm font-medium text-foreground mb-2">
                    Birth Date
                  </label>
                  <input
                    id="birth-date"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                  />
                </div>

                {/* Life Expectancy */}
                <div>
                  <label htmlFor="life-expectancy" className="block text-sm font-medium text-foreground mb-2">
                    Life Expectancy (weeks)
                  </label>
                  <input
                    id="life-expectancy"
                    type="number"
                    value={lifeExpectancy}
                    onChange={(e) => setLifeExpectancy(Number(e.target.value))}
                    min={1000}
                    max={6000}
                    className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Default: 4,000 weeks (~77 years)
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isPending}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-md font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                >
                  {isPending ? "Saving..." : "Save Settings"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
