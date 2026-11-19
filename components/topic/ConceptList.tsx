"use client";

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useHandbookContentLinks } from "@/components/nav/hooks/useHandbookContentLinks";
import { useHandbookLocation } from "@/components/nav/hooks/useHandbookLocation";
import {
  HighlightedText,
  useSearchMode,
  useSearchQuery,
  useSearchQueryEdited,
} from "@/components/search";
import { highlightQueryInHtml } from "@/components/search/utils/highlightQueryInHtml";
import { setHashIfChanged, setHashOnPath } from "@/components/nav/utils/hash";
import { nextConceptHash, resolveConceptId } from "@/lib/nav/conceptHash";
import {
  conceptGroupSectionDomId,
  findConceptGroupBySectionId,
} from "@/lib/nav/conceptGroupSection";
import { hashIdFrom } from "@/lib/nav/navUtils";
import { resetHandbookReadingScroll } from "@/components/topic/utils/conceptScroll";
import { CopyConceptLinkButton } from "./CopyConceptLinkButton";
import { chromeFor } from "@/lib/i18n/chrome";
import { localeFromPathname } from "@/lib/i18n/paths";
import type { ChromeCopy } from "@/lib/nav";
import type { Concept } from "@/lib/parse";
import {
  ConceptDetailActionsFooter,
  ConceptDetailTitle,
  ConceptGroupSectionHeader,
} from "./ConceptTitleHeader";
import { ConceptFooterActionsRegistrar } from "./conceptFooterActionsContext";
import { ConceptDepthToggle, useConceptDepth } from "./ConceptDepthToggle";
import { useConceptBodyDepth } from "./useConceptBodyDepth";
import type { ConceptDepthPreference } from "@/components/nav/utils/uiStorage";
import { useCodeCopyButtons } from "./hooks/useCodeCopyButtons";
import { useConceptKeyboardNav } from "./hooks/useConceptKeyboardNav";
import { useHandbookTopicNav } from "./hooks/useHandbookTopicNav";
import { ConceptIndexList as ConceptIndexNavList } from "./ConceptGroupIndexSection";
import { ConceptIndexPaneLayout } from "./ConceptIndexPaneLayout";
import { buildConceptIndexBalancedEntries } from "./buildConceptIndexBalancedEntries";
import {
  conceptsForIndexSection,
  groupConcepts,
  interviewGroupDisplayTitle,
} from "./conceptIndexGroups";
import {
  CONCEPT_INDEX_DOT_INTERACTIVE,
  CONCEPT_INDEX_LINK,
  CONCEPT_INDEX_HEADING_TO_LIST,
  CONCEPT_INDEX_ROW,
  CONCEPT_INDEX_CLUSTER_SECTION,
  HANDBOOK_INDEX_PANE_LIST_SLOT,
  HANDBOOK_INDEX_PANE_SECTION,
} from "./conceptIndexStyles";
import { conceptIndexLayoutModeForEntries } from "@/lib/catalog/conceptIndexPaneLayoutMode";
import { TopicPageTitle } from "./TopicPageTitle";

export function ConceptList({
  concepts,
  emptyMessage,
  groupInterviewSections = false,
  embedInParentGrid = false,
  topicTitle,
  interviewAccordionIndex = false,
  usePaneColumnFlow = true,
  indexHeading,
}: {
  concepts: readonly Concept[];
  emptyMessage: string;
  groupInterviewSections?: boolean;
  /** Section `<section>` nodes only — parent supplies {@link CONCEPT_INDEX_SECTIONS_GRID}. */
  embedInParentGrid?: boolean;
  /** Catalog topic title — prefixes interview section rows when the heading omits it. */
  topicTitle?: string;
  /** Interview Q&A: section list + hash drilldown — not for theory topics with `group`. */
  interviewAccordionIndex?: boolean;
  /** Newspaper columns when multiple sections; set false for a vertical stack only. */
  usePaneColumnFlow?: boolean;
  /** Leaf topic index H1 — omitted on concept detail (`#hash`). */
  indexHeading?: string;
}) {
  const query = useSearchQuery();
  const mode = useSearchMode();
  const queryEdited = useSearchQueryEdited();
  const pathname = usePathname() ?? "/en";
  const chrome = useMemo(
    () => chromeFor(localeFromPathname(pathname)),
    [pathname],
  );
  const { activeConceptId, location } = useHandbookLocation();
  const [bootConceptId, setBootConceptId] = useState("");
  const flat = concepts.length === 1;
  const resolvedConceptId = useMemo(() => {
    const raw = activeConceptId || bootConceptId;
    return resolveConceptId(raw, concepts) || raw;
  }, [activeConceptId, bootConceptId, concepts]);
  const activeConcept = useMemo(
    () => concepts.find((concept) => concept.id === resolvedConceptId) ?? null,
    [resolvedConceptId, concepts],
  );
  const accordionIndex = interviewAccordionIndex && !flat;
  const locationHashId = hashIdFrom(location.hash);
  useLayoutEffect(() => {
    function syncConceptHashFromUrl() {
      const raw = hashIdFrom(window.location.hash);
      const id = resolveConceptId(raw, concepts) || raw;
      const root = document.documentElement;
      if (id && concepts.some((concept) => concept.id === id)) {
        root.dataset.conceptHash = id;
        setBootConceptId(id);
        return;
      }
      delete root.dataset.conceptHash;
      setBootConceptId("");
    }
    syncConceptHashFromUrl();
    window.addEventListener("hashchange", syncConceptHashFromUrl);
    return () =>
      window.removeEventListener("hashchange", syncConceptHashFromUrl);
  }, [concepts, pathname]);
  const conceptIds = useMemo(
    () => concepts.map((concept) => concept.id),
    [concepts],
  );
  useConceptKeyboardNav(conceptIds);
  const groups = useMemo(
    () => groupConcepts(concepts, groupInterviewSections, chrome),
    [chrome, concepts, groupInterviewSections],
  );
  const interviewAccordionDrilldown =
    accordionIndex && query.trim().length === 0;
  const sectionRowTitle = useCallback(
    (label: string) =>
      topicTitle ? interviewGroupDisplayTitle(label, topicTitle) : label,
    [topicTitle],
  );
  const activeInterviewGroup = useMemo(() => {
    if (!interviewAccordionDrilldown || activeConcept) {
      return null;
    }
    return findConceptGroupBySectionId(groups, locationHashId);
  }, [activeConcept, groups, interviewAccordionDrilldown, locationHashId]);
  const activeTheoryGroup = useMemo(() => {
    if (
      activeConcept ||
      interviewAccordionDrilldown ||
      !groupInterviewSections
    ) {
      return null;
    }
    return findConceptGroupBySectionId(groups, locationHashId);
  }, [
    activeConcept,
    groupInterviewSections,
    groups,
    interviewAccordionDrilldown,
    locationHashId,
  ]);
  const balancedEntries = useMemo(
    () =>
      buildConceptIndexBalancedEntries({
        concepts,
        groupInterviewSections,
        chrome,
        pathname,
      }),
    [concepts, groupInterviewSections, chrome, pathname],
  );
  const notesQuery = mode === "notes" ? query : "";
  const arrivalRef = useRef<{ path: string; hash: string } | null>(null);

  useEffect(() => {
    if (!arrivalRef.current || arrivalRef.current.path !== pathname) {
      arrivalRef.current = {
        path: pathname,
        hash: hashIdFrom(window.location.hash),
      };
    }
    const nextHash = nextConceptHash({
      concepts,
      query,
      mode,
      currentHash: hashIdFrom(window.location.hash),
      arrivalHash: arrivalRef.current.hash,
      queryEdited,
    });
    if (nextHash) {
      setHashIfChanged(nextHash);
    }
  }, [concepts, mode, pathname, query, queryEdited]);

  useLayoutEffect(() => {
    if (flat || activeConcept || !interviewAccordionDrilldown) {
      resetHandbookReadingScroll();
    }
  }, [
    activeConcept,
    flat,
    interviewAccordionDrilldown,
    pathname,
    resolvedConceptId,
  ]);

  if (concepts.length === 0) {
    return (
      <p className="max-sm:pt-5 text-zinc-600 dark:text-zinc-400">
        {emptyMessage}
      </p>
    );
  }

  if (flat) {
    const concept = concepts[0];
    if (!concept) {
      return null;
    }
    return (
      <ConceptDetail
        concept={concept}
        notesQuery={notesQuery}
        chrome={chrome}
      />
    );
  }

  if (activeConcept) {
    return (
      <ConceptDetail
        concept={activeConcept}
        notesQuery={notesQuery}
        chrome={chrome}
      />
    );
  }

  if (interviewAccordionDrilldown && activeInterviewGroup?.label) {
    const sectionConcepts = conceptsForIndexSection(activeInterviewGroup);
    return (
      <div className="concept-list-index w-full space-y-4">
        <ConceptGroupSectionHeader
          title={sectionRowTitle(activeInterviewGroup.label)}
          chrome={chrome}
        />
        {sectionConcepts.length > 0 ? (
          <ConceptIndexNavList
            concepts={sectionConcepts}
            query={query}
            chrome={chrome}
            pathname={pathname}
          />
        ) : null}
      </div>
    );
  }

  if (activeTheoryGroup?.label) {
    const sectionConcepts = conceptsForIndexSection(activeTheoryGroup);
    return (
      <div className="concept-list-index w-full space-y-4">
        <ConceptGroupSectionHeader
          title={sectionRowTitle(activeTheoryGroup.label)}
          chrome={chrome}
        />
        {sectionConcepts.length > 0 ? (
          <ConceptIndexNavList
            concepts={sectionConcepts}
            query={query}
            chrome={chrome}
            pathname={pathname}
          />
        ) : null}
      </div>
    );
  }

  if (interviewAccordionDrilldown) {
    const sectionGroups = groups.filter(
      (group) =>
        group.label != null && conceptsForIndexSection(group).length > 0,
    );
    return (
      <nav
        aria-label={chrome.topicsNav}
        className="concept-list-index concept-list w-full"
      >
        <ul className="list-none">
          {sectionGroups.map((group) => {
            const label = group.label;
            if (!label) {
              return null;
            }
            const rowCount = conceptsForIndexSection(group).length;
            return (
              <li
                key={group.key}
                id={conceptGroupSectionDomId(label)}
                className={CONCEPT_INDEX_ROW}
              >
                <button
                  type="button"
                  className={CONCEPT_INDEX_LINK}
                  onClick={() =>
                    setHashOnPath(
                      pathname,
                      conceptGroupSectionDomId(label),
                      false,
                    )
                  }
                >
                  <span
                    aria-hidden="true"
                    className={CONCEPT_INDEX_DOT_INTERACTIVE}
                  />
                  <span className="flex-1 text-pretty transition-colors group-hover:text-yellow-500 dark:group-hover:text-yellow-300">
                    <HighlightedText
                      text={sectionRowTitle(label)}
                      query={query}
                    />
                    <span className="ml-1.5 text-sm font-normal text-zinc-500 dark:text-zinc-400">
                      ({rowCount})
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  const indexSections = groups.map((group) => {
    const sectionConcepts = conceptsForIndexSection(group);
    if (sectionConcepts.length === 0 && !group.label) {
      return null;
    }
    return (
      <section key={group.key} className={CONCEPT_INDEX_CLUSTER_SECTION}>
        {group.label ? (
          <ConceptGroupSectionHeader
            title={sectionRowTitle(group.label)}
            chrome={chrome}
          />
        ) : null}
        {sectionConcepts.length > 0 ? (
          <div className={group.label ? CONCEPT_INDEX_HEADING_TO_LIST : undefined}>
            <ConceptIndexNavList
              concepts={sectionConcepts}
              query={query}
              chrome={chrome}
              pathname={pathname}
            />
          </div>
        ) : null}
      </section>
    );
  });

  const indexBody = (
    <>
      {indexSections}
    </>
  );

  if (embedInParentGrid) {
    if (!indexHeading?.trim()) {
      return indexBody;
    }
    return (
      <section className={CONCEPT_INDEX_CLUSTER_SECTION}>
        <TopicPageTitle title={indexHeading} />
        <div className={CONCEPT_INDEX_HEADING_TO_LIST}>{indexBody}</div>
      </section>
    );
  }

  const paneLayoutMode = usePaneColumnFlow
    ? conceptIndexLayoutModeForEntries(balancedEntries, {
        preferNewspaperFrom: 1,
      })
    : conceptIndexLayoutModeForEntries(balancedEntries);
  if (
    !interviewAccordionDrilldown &&
    paneLayoutMode === "newspaper"
  ) {
    if (!indexHeading?.trim()) {
      return (
        <ConceptIndexPaneLayout
          entries={balancedEntries}
          layoutMode={paneLayoutMode}
        />
      );
    }
    return (
      <section className={HANDBOOK_INDEX_PANE_SECTION}>
        <TopicPageTitle title={indexHeading} />
        <ConceptIndexPaneLayout
          entries={balancedEntries}
          layoutMode={paneLayoutMode}
          className={HANDBOOK_INDEX_PANE_LIST_SLOT}
        />
      </section>
    );
  }

  if (indexHeading?.trim()) {
    return (
      <section
        className={`${CONCEPT_INDEX_CLUSTER_SECTION} concept-list-index w-full`}
      >
        <TopicPageTitle title={indexHeading} />
        <div className={CONCEPT_INDEX_HEADING_TO_LIST}>{indexSections}</div>
      </section>
    );
  }

  return (
    <div className="concept-list-index w-full">{indexSections}</div>
  );
}

const CONCEPT_DETAIL_CARD =
  "concept-detail-article concept-list group relative -mx-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white max-sm:rounded-none sm:mx-0 dark:border-zinc-800 dark:bg-zinc-900";

function conceptHasOptionalDepth(concept: Concept): boolean {
  return (
    concept.hasOptionalDepth === true ||
    (typeof concept.html === "string" &&
      concept.html.includes("concept-depth-detailed"))
  );
}

function ConceptDetail({
  concept,
  notesQuery,
  chrome,
}: {
  concept: Concept;
  notesQuery: string;
  chrome: ChromeCopy;
}) {
  const { showBack, showNext, goBack, goNext, prevHref, nextHref } =
    useHandbookTopicNav({
      conceptOpen: true,
      conceptId: concept.id,
    });

  const hasOptionalDepth = conceptHasOptionalDepth(concept);
  const conceptDepth = useConceptDepth();

  useLayoutEffect(() => {
    resetHandbookReadingScroll();
  }, [concept.id]);

  if (!concept.html) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {chrome.pageLoading}
      </p>
    );
  }
  const actionProps = {
    title: concept.title,
    chrome,
    variant: "detail" as const,
    showBack,
    backHref: prevHref,
    onBack: goBack,
    showNext,
    nextHref,
    onNext: goNext,
    showBookmark: true,
    showShare: true,
    conceptId: concept.id,
  };

  return (
    <article
      id={concept.id}
      className={CONCEPT_DETAIL_CARD}
      {...(hasOptionalDepth ? { "data-concept-depth": conceptDepth } : {})}
    >
      <ConceptFooterActionsRegistrar {...actionProps} />
      <ConceptDetailTitle
        title={concept.title}
        chrome={chrome}
        toolbarAbove={false}
        toolbarAboveFromSm={false}
        hasOptionalDepth={hasOptionalDepth}
        showShare
        showBookmark
        showBack={showBack}
        backHref={prevHref}
        onBack={goBack}
        showNext={showNext}
        nextHref={nextHref}
        onNext={goNext}
        conceptId={concept.id}
      />
      <div
        className="concept-detail-body-scroll min-h-0 flex-1 overscroll-y-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <ConceptBody
          html={concept.html}
          query={notesQuery}
          chrome={chrome}
          compactTop
          conceptDepth={conceptDepth}
          hasOptionalDepth={hasOptionalDepth}
        />
      </div>
      <ConceptDetailActionsFooter {...actionProps} />
    </article>
  );
}

const ConceptBody = memo(function ConceptBody({
  html,
  query,
  chrome,
  compactTop = false,
  conceptDepth,
  hasOptionalDepth = false,
}: {
  html: string;
  query: string;
  chrome: ChromeCopy;
  compactTop?: boolean;
  conceptDepth: ConceptDepthPreference;
  hasOptionalDepth?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useCodeCopyButtons(ref, chrome, html);
  useHandbookContentLinks(ref, html);
  useConceptBodyDepth(ref, conceptDepth, hasOptionalDepth, html);

  return (
    <div
      ref={ref}
      className={
        compactTop
          ? "concept-body concept-body--detail-top px-4 pb-5"
          : "concept-body px-4 pb-5 pt-1"
      }
      dangerouslySetInnerHTML={{ __html: highlightQueryInHtml(html, query) }}
    />
  );
});
