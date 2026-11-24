export function subjectCatalogKey(subject: {
  readonly track: string;
  readonly slug: string;
}): string {
  return `${subject.track}/${subject.slug}`;
}

/** Cluster ids hidden when an intro topic renders concept groups on the subject hub. */
export const SUBJECT_INTRO_OMIT_CLUSTER_IDS: Readonly<
  Record<string, readonly string[]>
> = {};
