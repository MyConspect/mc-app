import { catalogBlurb } from "@/lib/i18n/catalog";
import type { Locale } from "@/lib/i18n/locales";
import { withLocale } from "@/lib/i18n/paths";
import {
  expandClusterSectionsForConceptIndex,
  type ClusterConceptIndexExpandOptions,
  type SubjectClusterSection,
} from "./clusterConceptIndex";
import { clusterTargetHref, subjectClusterCards } from "./index";
import type { Subject } from "./index";

type LocalizeSubjectClusterOptions = ClusterConceptIndexExpandOptions & {
  /** Subject hubs list concepts under title-twin clusters; track hubs keep cluster links only. */
  readonly expandTitleTwinTopics?: boolean;
};

export function localizeSubjectClusterSections(
  locale: Locale,
  sections: ReturnType<typeof subjectClusterCards>,
  options?: LocalizeSubjectClusterOptions,
): SubjectClusterSection[] {
  const localized = sections.map((section) => ({
    cluster: {
      ...section.cluster,
      blurb: catalogBlurb(locale, section.cluster.blurb),
    },
    items: section.items.map((item) => ({
      ...item,
      href: withLocale(locale, item.href),
      description: catalogBlurb(locale, item.description),
    })),
  }));
  if (options?.expandTitleTwinTopics === false) {
    return localized;
  }
  const { expandTitleTwinTopics: _omit, ...expandOptions } = options ?? {};
  return expandClusterSectionsForConceptIndex(locale, localized, expandOptions);
}

export function attachClusterHeadingHrefs(
  locale: Locale,
  subject: Subject,
  sections: SubjectClusterSection[],
): SubjectClusterSection[] {
  return sections.map((section) => ({
    ...section,
    headingHref: withLocale(
      locale,
      clusterTargetHref(subject, section.cluster),
    ),
  }));
}

/** Localize cluster cards, expand title-twins, attach heading links (canonical for UI). */
export function localizedClusterSectionsForSubject(
  locale: Locale,
  subject: Subject,
  sections: ReturnType<typeof subjectClusterCards>,
  options?: LocalizeSubjectClusterOptions,
): SubjectClusterSection[] {
  return attachClusterHeadingHrefs(
    locale,
    subject,
    localizeSubjectClusterSections(locale, sections, options),
  );
}

export function subjectClusterSectionsForLocale(
  locale: Locale,
  subject: Subject,
  options?: LocalizeSubjectClusterOptions,
): SubjectClusterSection[] {
  return localizedClusterSectionsForSubject(
    locale,
    subject,
    subjectClusterCards(subject),
    options,
  );
}
