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
import { useHandbookContentLinks } from "@/components/nav/hooks/useHandbookContentLinks";
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
import { nextConceptHash, resolveConceptId } from "@/lib/nav/conceptHash";
import { hashIdFrom, sameTitle } from "@/lib/nav/navUtils";
import { CopyConceptLinkButton } from "./CopyConceptLinkButton";
import { resetHandbookReadingScroll } from "@/components/topic/utils/conceptScroll";
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
  const resolvedConceptId = useMemo(() => {
    const raw = activeConceptId || bootConceptId;
    return resolveConceptId(raw, concepts) || raw;
  }, [activeConceptId, bootConceptId, concepts]);
  const activeConcept = useMemo(
    () => concepts.find((concept) => concept.id === resolvedConceptId) ?? null,
    [resolvedConceptId, concepts],
  );
  const accordionIndex = groupInterviewSections && !flat;
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
    if (flat || activeConcept || !accordionIndex) {
      resetHandbookReadingScroll();
    }
  }, [accordionIndex, activeConcept, flat, pathname, resolvedConceptId]);

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
            {group.label &&
            !sameTitle(group.label, group.concepts[0]?.title ?? "") ? (
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
    <nav
      aria-label={chrome.topicsNav}
      className={`${CONCEPT_LIST_CARD} concept-list--accordion`}
    >
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
    <li
      id={concept.id}
      className="group relative transition-colors hover:bg-yellow-50 dark:hover:bg-yellow-950/60"
    >
      <button
        type="button"
        className={CONCEPT_INDEX_BUTTON}
        onClick={() => setHashOnPath(pathname, concept.id, false)}
      >
        <span
          aria-hidden="true"
          className="mt-0.5 inline-block size-3 shrink-0 text-zinc-400 dark:text-zinc-500"
        >
          <svg viewBox="0 0 12 12" className="size-3 fill-current">
            <path d="M4.2 1.8 9 6l-4.8 4.2V1.8Z" />
          </svg>
        </span>
        <HighlightedText text={concept.title} query={query} />
      </button>
      <div
        className={
          saved
            ? "absolute top-3 right-2 flex items-center gap-0.5 max-sm:pointer-events-auto"
            : "pointer-events-none absolute top-3 right-2 flex items-center gap-0.5 max-sm:pointer-events-auto group-hover:pointer-events-auto group-focus-within:pointer-events-auto"
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

  useLayoutEffect(() => {
    resetHandbookReadingScroll();
  }, [concept.id]);
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
