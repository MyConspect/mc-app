export const BEHAVIOR_QUESTIONS_TOPIC_SLUG = "behavior-questions";

const MIGRATED_GROUP_LABELS: Readonly<Record<string, string>> = {
  "Test — test-section-interview-process": "Interview process",
  "Test — test-section-career-jobs": "Career & job search",
  "Test — test-section-career-salary": "Salary & negotiation",
  "Test — test-section-career-learning": "Learning & skills",
  "Test — test-section-career-market": "Job market",
  "Test — test-section-company-prep": "Company prep",
};

export const BEHAVIOR_TOPIC_SECTION_ORDER = [
  "Classic HR questions",
  "Interview process",
  "Career & job search",
  "Salary & negotiation",
  "Learning & skills",
  "Job market",
  "Company prep",
] as const;

export function isBehaviorQuestionsTopicSlug(slug: string): boolean {
  return slug === BEHAVIOR_QUESTIONS_TOPIC_SLUG;
}

function normalizeBehaviorGroup(group: string | undefined): string {
  if (!group?.trim()) {
    return "Classic HR questions";
  }
  return MIGRATED_GROUP_LABELS[group] ?? group;
}

export function withBehaviorConceptGroups<
  T extends { readonly group?: string },
>(items: readonly T[]): T[] {
  return items.map((item) => ({
    ...item,
    group: normalizeBehaviorGroup(item.group),
  }));
}