let hasCompleted = false;

export async function hasCompletedOnboarding(): Promise<boolean> {
  return hasCompleted;
}

export async function setCompletedOnboarding(completed: boolean): Promise<void> {
  hasCompleted = completed;
}
