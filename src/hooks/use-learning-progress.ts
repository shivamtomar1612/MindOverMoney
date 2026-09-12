"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { LearningProgressState } from "@/types";
import { getLearningSummary, normalizeLearningProgress } from "@/lib/learning/progress";
import { readLearningProgress, subscribeToLearningProgress, writeLearningProgress } from "@/lib/learning/storage";
import { useAuth } from "@/hooks/use-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type RemoteLearningRow = { completed_lessons: string[]; best_quiz_score: number; last_quiz_score: number | null };

export function useLearningProgress(totalLessons: number, baseScore = 42) {
  const { user, loading: authLoading, demoMode } = useAuth();
  const client = getSupabaseBrowserClient();
  const [progress, setProgress] = useState<LearningProgressState>(() => ({ completedLessons: [], bestQuizScore: 0 }));
  const useRemote = Boolean(client && isSupabaseConfigured && !demoMode && user && !user.isDemo);

  useEffect(() => {
    let active = true;
    const syncLocal = () => { if (active) setProgress(readLearningProgress()); };
    if (authLoading) return () => { active = false; };
    if (!useRemote || !client || !user) {
      syncLocal();
      return subscribeToLearningProgress(syncLocal);
    }
    void Promise.resolve(client.from("learning_progress").select("completed_lessons,best_quiz_score,last_quiz_score").eq("user_id", user.id).maybeSingle()).then(({ data, error }) => {
      if (!active) return;
      if (error) { syncLocal(); return; }
      if (!data) { setProgress({ completedLessons: [], bestQuizScore: 0 }); return; }
      const row = data as RemoteLearningRow;
      setProgress(normalizeLearningProgress({ completedLessons: row.completed_lessons, bestQuizScore: row.best_quiz_score, lastQuizScore: row.last_quiz_score ?? undefined }));
    }).catch(() => { if (active) syncLocal(); });
    return () => { active = false; };
  }, [authLoading, client, useRemote, user]);

  const persistRemote = useCallback(async (next: LearningProgressState) => {
    if (!client || !user || !useRemote) return;
    const { error } = await client.from("learning_progress").upsert({ user_id: user.id, completed_lessons: next.completedLessons, best_quiz_score: next.bestQuizScore, last_quiz_score: next.lastQuizScore ?? null }, { onConflict: "user_id" });
    if (error) throw error;
  }, [client, useRemote, user]);

  const updateProgress = useCallback((update: (current: LearningProgressState) => LearningProgressState) => {
    setProgress((current) => {
      const next = normalizeLearningProgress(update(current));
      writeLearningProgress(next);
      void persistRemote(next).catch(() => undefined);
      return next;
    });
  }, [persistRemote]);

  const completeLesson = useCallback((term: string) => {
    updateProgress((current) => ({ ...current, completedLessons: current.completedLessons.includes(term) ? current.completedLessons : [...current.completedLessons, term] }));
  }, [updateProgress]);

  const recordQuiz = useCallback((score: number) => {
    updateProgress((current) => ({ ...current, bestQuizScore: Math.max(current.bestQuizScore, score), lastQuizScore: score }));
  }, [updateProgress]);

  const summary = useMemo(() => getLearningSummary(progress, totalLessons, baseScore), [baseScore, progress, totalLessons]);
  const isLessonComplete = useCallback((term: string) => progress.completedLessons.includes(term), [progress.completedLessons]);

  return { progress, summary, completeLesson, recordQuiz, isLessonComplete };
}
