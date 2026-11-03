"use client";

import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useHandbookLocation } from "@/components/nav/hooks/useHandbookLocation";
import {
  HighlightedText,
  useSearchMode,
  useSearchQuery,
  useSearchQueryEdited,
} from "@/components/search";
import {
  BookmarkButton,
  useIsBookmarked,
} from "@/components/nav/ui/BookmarkButton";
import { highlightQueryInHtml } from "@/components/search/utils/highlightQueryInHtml";
import { setHashIfChanged, setHashOnPath } from "@/components/nav/utils/hash";
import { hashIdFrom } from "@/lib/nav/navUtils";
import { CopyConceptLinkButton } from "./CopyConceptLinkButton";
import { handbookScrollContainer } from "@/components/topic/utils/conceptScroll";
import { chromeFor } from "@/lib/i18n/chrome";
import { localeFromPathname } from "@/lib/i18n/paths";
import { nextConceptHash } from "@/lib/nav/conceptHash";
import type { ChromeCopy } from "@/lib/nav";
import type { Concept } from "@/lib/parse";
import {
  ConceptDetailActionsFooter,
  ConceptDetailTitle,
  ConceptGroupSectionHeader,
} from "./ConceptTitleHeader";
import { ConceptFooterActionsRegistrar } from "./conceptFooterActionsContext";
import { useConceptDepth } from "./ConceptDepthToggle";
import { useConceptBodyDepth } from "./useConceptBodyDepth";
import type { ConceptDepthPreference } from "@/components/nav/utils/uiStorage";
import { useCodeCopyButtons } from "./hooks/useCodeCopyButtons";
import { useConceptKeyboardNav } from "./hooks/useConceptKeyboardNav";
import { useHandbookTopicNav } from "./hooks/useHandbookTopicNav";

type ConceptGroup = {
  readonly key: string;
  readonly label: string | null;
  readonly concepts: Concept[];
};

function groupLabel(concept: Concept, chrome: ChromeCopy): string | null {
  if (concept.group) {
    return concept.group;
  }
  if (concept.interviewSection === "tasks") {
    return chrome.interviewTasks;
  }
  if (concept.interviewSection === "questions") {
    return chrome.interviewQuestions;
  }
  return null;
}

function groupConcepts(
  concepts: readonly Concept[],
  groupInterviewSections: boolean,
  chrome: ChromeCopy,
): ConceptGroup[] {
  if (!groupInterviewSections) {
    return [{ key: "default", label: null, concepts: [...concepts] }];
  }

  const groups: ConceptGroup[] = [];
  let current: ConceptGroup | null = null;
  let currentSectionKey: string | null = null;

  for (const concept of concepts) {
    const label = groupLabel(concept, chrome);
    const sectionKey = concept.group
      ? `topic:${concept.group}`
      : `section:${concept.interviewSection ?? "default"}`;
    if (!current || currentSectionKey !== sectionKey) {
      currentSectionKey = sectionKey;
      current = {
        key: `${sectionKey}:${groups.length}`,
        label,
        concepts: [],
      };
      groups.push(current);
    }
    current.concepts.push(concept);
  }

  return groups;
}

function scrollMainToTop() {
  const scroller = handbookScrollContainer();
  if (scroller) {
    scroller.scrollTop = 0;
  }
}

export function ConceptList({
  concepts,
  emptyMessage,
  groupInterviewSections = false,
}: {
  concepts: readonly Concept[];
  emptyMessage: string;
  groupInterviewSections?: boolean;
}) {
  const query = useSearchQuery();
  const mode = useSearchMode();
  const queryEdited = useSearchQueryEdited();
  const pathname = usePathname() ?? "/en";
  const chrome = useMemo(
    () => chromeFor(localeFromPathname(pathname)),
    [pathname],
  );
  const { activeConceptId } = useHandbookLocation();
  const [bootConceptId, setBootConceptId] = useState("");
  const flat = concepts.length === 1;
  const resolvedConceptId = activeConceptId || bootConceptId;
  const activeConcept = useMemo(
    () => concepts.find((concept) => concept.id === resolvedConceptId) ?? null,
    [resolvedConceptId, concepts],
  );

  useLayoutEffect(() => {
    function syncConceptHashFromUrl() {
      const id = hashIdFrom(window.location.hash);
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
    if (resolvedConceptId) {
      return;
    }
    scrollMainToTop();
  }, [pathname, resolvedConceptId]);

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

  return (
    <div className="space-y-8">
      {groups.map((group) => {
        if (group.concepts.length === 0 && !group.label) {
          return null;
        }
        return (
          <section key={group.key}>
            {group.label ? (
              <ConceptGroupSectionHeader title={group.label} chrome={chrome} />
            ) : null}
            {group.concepts.length > 0 ? (
              <ConceptIndexList
                concepts={group.concepts}
                query={query}
                chrome={chrome}
                pathname={pathname}
              />
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

const CONCEPT_LIST_CARD =
  "concept-list overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900";

const CONCEPT_DETAIL_CARD =
  "concept-detail-article concept-list group relative -mx-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white max-sm:rounded-none sm:mx-0 dark:border-zinc-800 dark:bg-zinc-900";

function ConceptIndexList({
  concepts,
  query,
  chrome,
  pathname,
}: {
  concepts: readonly Concept[];
  query: string;
  chrome: ChromeCopy;
  pathname: string;
}) {
  return (
    <nav aria-label={chrome.topicsNav} className={CONCEPT_LIST_CARD}>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 [&>li:first-child>button]:pt-2">
        {concepts.map((concept) => (
          <ConceptIndexRow
            key={concept.id}
            concept={concept}
            query={query}
            chrome={chrome}
            pathname={pathname}
          />
        ))}
      </ul>
    </nav>
  );
}

const CONCEPT_INDEX_BUTTON =
  "concept-index-link flex min-h-11 w-full touch-manipulation cursor-pointer items-center gap-2 px-4 py-3 text-left text-base font-medium text-zinc-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 dark:focus-visible:ring-zinc-500/40";

function ConceptIndexRow({
  concept,
  query,
  chrome,
  pathname,
}: {
  concept: Concept;
  query: string;
  chrome: ChromeCopy;
  pathname: string;
}) {
  const saved = useIsBookmarked(pathname, concept.id);

  return (
    <li className="group relative transition-colors hover:bg-yellow-50 dark:hover:bg-yellow-950/60">
      <button
        type="button"
        className={CONCEPT_INDEX_BUTTON}
        onClick={() => setHashOnPath(pathname, concept.id, false)}
      >
        <HighlightedText text={concept.title} query={query} />
      </button>
      <div
        className={
          saved
            ? "absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-0.5 max-sm:pointer-events-auto"
            : "pointer-events-none absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-0.5 max-sm:pointer-events-auto group-hover:pointer-events-auto group-focus-within:pointer-events-auto"
        }
      >
        <CopyConceptLinkButton conceptId={concept.id} chrome={chrome} />
        <BookmarkButton
          pathname={pathname}
          title={concept.title}
          conceptId={concept.id}
          chrome={chrome}
          revealOnHover
        />
      </div>
    </li>
  );
}

function conceptHasOptionalDepth(concept: Concept): boolean {
  return (
    concept.hasOptionalDepth === true ||
    concept.html.includes("concept-depth-detailed")
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
      <div
        className="concept-detail-body-scroll min-h-0 flex-1 overscroll-y-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <ConceptDetailTitle
          title={concept.title}
          chrome={chrome}
          toolbarAbove={false}
          toolbarAboveFromSm={false}
          scrollsWithBody
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
