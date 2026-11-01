import type { TrackId } from "@/lib/catalog";

export type SearchMode = "titles" | "notes";

export type InterviewSection = "questions" | "tasks";

export type NavConcept = {
  readonly id: string;
  readonly title: string;
  readonly searchText?: string;
  readonly titleSearchText?: string;
  readonly interviewSection?: InterviewSection;
  readonly group?: string;
};

export type NavTopic = {
  readonly slug: string;
  readonly href: string;
  readonly title: string;
  readonly blurb: string;
  readonly concepts: readonly NavConcept[];
  readonly hideSidebarConcepts?: boolean;
  readonly nestedTopics?: readonly NavTopic[];
};

export type NavCluster = {
  readonly id: string;
  readonly title: string;
  readonly href: string;
  readonly topics: readonly NavTopic[];
};

export type NavSection = {
  readonly id: string;
  readonly title: string;
  readonly defaultOpen?: boolean;
  readonly collapsible?: boolean;
  readonly flatNav?: boolean;
  readonly clusters: readonly NavCluster[];
};

export type NavSubject = {
  readonly slug: string;
  readonly href: string;
  readonly title: string;
  readonly blurb: string;
  readonly flatNav?: boolean;
  readonly sections?: readonly NavSection[];
  readonly clusters: readonly NavCluster[];
  readonly clustersAfterSections?: readonly NavCluster[];
};

export type NavEntry =
  | { readonly kind: "topic"; readonly topic: NavTopic }
  | { readonly kind: "subject"; readonly subject: NavSubject }
  | {
      readonly kind: "cluster";
      readonly subjectHref: string;
      readonly cluster: NavCluster;
    };

export type NavGroup = {
  readonly id: TrackId;
  readonly title: string;
  readonly href: string;
  readonly entries: readonly NavEntry[];
  readonly leafTopic?: NavTopic;
  readonly hubTopic?: NavTopic;
};

export type NavRootSectionId = "conspect" | "interviews";

export type NavRootSection = {
  readonly id: NavRootSectionId;
  readonly title: string;
  readonly groups: readonly NavGroup[];
};

export type Crumb = {
  readonly label: string;
  readonly href?: string;
};

export type HashCrumb = {
  readonly id: string;
  readonly label: string;
};

export type ChromeCopy = {
  readonly searchPlaceholder: string;
  readonly searchNotesPlaceholder: string;
  readonly searchEmpty: string;
  readonly searchNotesEmpty: string;
  readonly searchMoreHits: string;
  readonly searchLoading: string;
  readonly pageLoading: string;
  readonly searchMode: string;
  readonly searchModeTitles: string;
  readonly searchModeNotes: string;
  readonly inNotes: string;
  readonly clearSearch: string;
  readonly topicsNav: string;
  readonly sectionNav: string;
  readonly conspectNav: string;
  readonly conspectNavHint: string;
  readonly interviewsNav: string;
  readonly interviewsNavHint: string;
  readonly openMenu: string;
  readonly closeMenu: string;
  readonly collapseSidebar: string;
  readonly expandSidebar: string;
  readonly instructions: string;
  readonly home: string;
  readonly breadcrumbs: string;
  readonly lastUpdated: string;
  readonly scrollToTop: string;
  readonly copyLink: string;
  readonly copiedLink: string;
  readonly share: string;
  readonly copyCode: string;
  readonly bookmarksNav: string;
  readonly bookmarksEmpty: string;
  readonly bookmark: string;
  readonly unbookmark: string;
  readonly removeBookmark: string;
  readonly clearAllBookmarks: string;
  readonly clearAllBookmarksConfirm: string;
  readonly confirmYes: string;
  readonly confirmNo: string;
  readonly back: string;
  readonly next: string;
  readonly expandConceptTitle: string;
  readonly collapseConceptTitle: string;
  readonly interviewQuestions: string;
  readonly interviewTasks: string;
  readonly conceptDepthMode: string;
  readonly conceptDepthHint: string;
  readonly conceptDepthQuick: string;
  readonly conceptDepthDetailed: string;
};
