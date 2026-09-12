import { createEmptyLearningProgress, normalizeLearningProgress } from "./progress";
import type { LearningProgressState } from "../../types/learning";

export const LEARNING_PROGRESS_STORAGE_KEY = "mind-over-money:learning-progress";
export const LEARNING_PROGRESS_EVENT = "mind-over-money:learning-progress-change";

export function readLearningProgress(): LearningProgressState {
  if (typeof window === "undefined") return createEmptyLearningProgress();
  try {
    const raw = window.localStorage.getItem(LEARNING_PROGRESS_STORAGE_KEY);
    return raw ? normalizeLearningProgress(JSON.parse(raw)) : createEmptyLearningProgress();
  } catch {
    return createEmptyLearningProgress();
  }
}

export function writeLearningProgress(progress: LearningProgressState): void {
  if (typeof window === "undefined") return;
  const normalized = normalizeLearningProgress(progress);
  window.localStorage.setItem(LEARNING_PROGRESS_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(LEARNING_PROGRESS_EVENT));
}

export function subscribeToLearningProgress(listener: (progress: LearningProgressState) => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handleStorage = (event: StorageEvent) => {
    if (event.key === LEARNING_PROGRESS_STORAGE_KEY) listener(readLearningProgress());
  };
  const handleLocalChange = () => listener(readLearningProgress());
  window.addEventListener("storage", handleStorage);
  window.addEventListener(LEARNING_PROGRESS_EVENT, handleLocalChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(LEARNING_PROGRESS_EVENT, handleLocalChange);
  };
}
