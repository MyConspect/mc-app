import type { Locale } from "@/lib/i18n/locales";
import { topicHref, type Topic } from "@/lib/catalog";
import { withLocale } from "@/lib/i18n/paths";
import { loadTopicOutline } from "@/lib/parse";
import { conceptGroupSectionDomId } from "./conceptGroupSection";
import {
  groupNavConceptsByMarkdownGroup,
  navConceptsFromOutline,
} from "./topicMarkdownGroups";
import { isConspectInterviewGroupLabel } from "@/lib/catalog/conspectInterviewGroup";
import { areRedundantNavTitles } from "./navUtils";
import type { NavCluster } from "./types";

/** Sidebar group rows for a title-twin topic with markdown `group` labels (CSS Core, etc.). */
export function titleTwinMarkdownGroupClusters(
  subjectPath: string,
  clusterTitle: string,
  topic: Topic,
  locale: Locale,
): readonly NavCluster[] {
  const outline = loadTopicOutline(topic, locale);
  if (outline.length === 0) {
    return [];
  }
  const grouped = groupNavConceptsByMarkdownGroup(
    navConceptsFromOutline(outline),
  );
  return grouped
    .filter(
      (entry) =>
        entry.concepts.length > 0 &&
        !areRedundantNavTitles(clusterTitle, entry.label) &&
        !areRedundantNavTitles(topic.title, entry.label) &&
        !isConspectInterviewGroupLabel(entry.label),
    )
    .map(({ label, concepts }) => {
      const id = conceptGroupSectionDomId(label);
      return {
        id,
        title: label,
        href: `${subjectPath}#${id}`,
        topics: [
          {
            slug: topic.slug,
            href: withLocale(locale, topicHref(topic)),
            title: label,
            blurb: "",
            concepts,
            hideSidebarConcepts: false,
          },
        ],
      };
    });
}
