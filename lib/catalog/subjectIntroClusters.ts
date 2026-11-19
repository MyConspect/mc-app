import {
  SUBJECT_INTRO_OMIT_CLUSTER_IDS,
  subjectCatalogKey,
} from "./subjectIntroOmitIds";

export { SUBJECT_INTRO_OMIT_CLUSTER_IDS };

type SubjectIntroHost = { readonly slug: string };

export function filterSubjectClusterSectionsForIntro<
  T extends { readonly cluster: { readonly id: string } },
>(
  subject: SubjectIntroHost,
  sections: readonly T[],
  hasIntroTopic: boolean,
): T[] {
  if (!hasIntroTopic) {
    return [...sections];
  }
  const omit = SUBJECT_INTRO_OMIT_CLUSTER_IDS[subjectCatalogKey(subject)];
  if (!omit?.length) {
    return [...sections];
  }
  const blocked = new Set(omit);
  return sections.filter((section) => !blocked.has(section.cluster.id));
}
