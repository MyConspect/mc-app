/** Markdown group titles that belong to interview Q&A, not conspect theory bullets. */
export function isConspectInterviewGroupLabel(label: string): boolean {
  return /\binterview\b/i.test(label.trim());
}

type ConspectOutlineEntry = {
  readonly group?: string;
  readonly interviewSection?: string;
};

/** Interview Q&A rows and GFE import groups — shown under Interviews, not Conspect. */
export function isConspectInterviewOutlineEntry(
  entry: ConspectOutlineEntry,
): boolean {
  if (entry.interviewSection) {
    return true;
  }
  const group = entry.group?.trim();
  return Boolean(group && isConspectInterviewGroupLabel(group));
}

export function filterConspectTheoryOutline<T extends ConspectOutlineEntry>(
  outline: readonly T[],
): readonly T[] {
  return outline.filter((entry) => !isConspectInterviewOutlineEntry(entry));
}
