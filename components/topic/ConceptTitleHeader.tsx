"use client";

import { useHandbookMobileNavOpen } from "@/components/nav/context/handbookMobileNavContext";
import {
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { ConceptHeaderActionProps } from "@/components/topic/conceptFooterActionsContext";
import {
  BookmarkButton,
  useIsBookmarked,
} from "@/components/nav/ui/BookmarkButton";
import type { ChromeCopy } from "@/lib/nav";
import { usePathname } from "next/navigation";
import { CopyConceptLinkButton } from "./CopyConceptLinkButton";
import { ConceptDepthToggle } from "./ConceptDepthToggle";
import { TopicBookmarkButton } from "./TopicBookmarkButton";
import {
  CONCEPT_DETAIL_TOOLBAR_ICON,
  conceptDetailToolbarIconSize,
} from "./conceptDetailToolbarIcon";

const DETAIL_TOOLBAR =
  "concept-detail-toolbar shrink-0 border-b border-zinc-200 bg-white px-4 py-2.5 max-sm:rounded-t-none sm:rounded-t-[calc(0.75rem-1px)] sm:py-3 dark:border-zinc-800 dark:bg-zinc-900";

const DETAIL_TOOLBAR_ACTIONS_ROW =
  "flex min-h-8 w-full items-center justify-between gap-2";

const DETAIL_TITLE_CLASS =
  "m-0 min-w-0 flex-1 text-pretty text-[1.375rem] font-semibold leading-snug tracking-tight text-zinc-900 sm:text-2xl sm:leading-snug dark:text-zinc-50";

const INDEX_HEADER = "flex flex-wrap items-center gap-x-2 gap-y-1";

const TITLE_CLASS =
  "min-w-0 w-full text-pretty text-xl font-semibold leading-7 tracking-tight text-zinc-900 sm:text-2xl sm:leading-8 dark:text-zinc-50";

const INDEX_TITLE_CLASS =
  "min-w-0 flex-[1_1_10rem] text-pretty text-xl font-semibold leading-7 tracking-tight text-zinc-900 sm:text-2xl sm:leading-8 dark:text-zinc-50";

const TITLE_TOGGLE_CLASS =
  "w-full cursor-pointer border-0 bg-transparent p-0 text-left font-inherit text-inherit";

const INDEX_ACTIONS_CLASS =
  "ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5";

const NAV_GROUP = "inline-flex shrink-0 items-center gap-1";

const NAV_BTN_DETAIL = `${CONCEPT_DETAIL_TOOLBAR_ICON} size-7`;

const NAV_BTN_DETAIL_COMPACT = `${CONCEPT_DETAIL_TOOLBAR_ICON} size-7`;

const DETAIL_UTILITY_ICON = `${CONCEPT_DETAIL_TOOLBAR_ICON} ${conceptDetailToolbarIconSize("md")}`;

const NAV_BTN_INDEX =
  "inline-flex size-11 touch-manipulation cursor-pointer items-center justify-center gap-1 rounded-full border border-zinc-200 bg-white px-0 text-[13px] font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 sm:size-8 sm:h-8 sm:min-h-8 sm:w-auto sm:min-w-0 sm:rounded-md sm:px-2.5 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-500/40";

const NAV_ICON = "size-4 shrink-0 text-current";

const ACTION_DIVIDER_INDEX =
  "mx-0.5 h-6 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700";

const DETAIL_TOOLBAR_CLUSTER =
  "inline-flex shrink-0 flex-wrap items-center justify-end gap-0.5";

function ConceptNavControl({
  href,
  onActivate,
  label,
  className,
  children,
}: {
  href: string | null;
  onActivate?: () => void;
  label: string;
  className: string;
  children: ReactNode;
}) {
  if (!href || !onActivate) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label={label}
      className={className}
      onClick={() => onActivate?.()}
    >
      {children}
    </button>
  );
}

function ConceptNavGroup({
  showBack,
  backHref,
  onBack,
  showNext,
  nextHref,
  onNext,
  chrome,
  variant,
}: {
  showBack: boolean;
  backHref: string | null;
  onBack?: () => void;
  showNext: boolean;
  nextHref: string | null;
  onNext?: () => void;
  chrome: ChromeCopy;
  variant: "index" | "detail" | "footer";
}) {
  if (!showBack && !showNext) {
    return null;
  }

  const btnClass =
    variant === "footer"
      ? NAV_BTN_DETAIL_COMPACT
      : variant === "detail"
        ? NAV_BTN_DETAIL
        : NAV_BTN_INDEX;

  return (
    <div
      className={NAV_GROUP}
      role="group"
      aria-label={`${chrome.back} / ${chrome.next}`}
    >
      {showBack ? (
        <ConceptNavControl
          href={backHref}
          onActivate={onBack}
          label={chrome.back}
          className={btnClass}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className={NAV_ICON}>
            <path
              d="M15 18l-6-6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ConceptNavControl>
      ) : null}
      {showNext ? (
        <ConceptNavControl
          href={nextHref}
          onActivate={onNext}
          label={chrome.next}
          className={btnClass}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className={NAV_ICON}>
            <path
              d="M9 18l6-6-6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ConceptNavControl>
      ) : null}
    </div>
  );
}

function ConceptTitleHeading({
  title,
  chrome,
  level,
  variant,
}: {
  title: string;
  chrome: ChromeCopy;
  level: "h1" | "h2";
  variant: "index" | "detail";
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);
  const expanded = expandedTitle === title;
  const [truncated, setTruncated] = useState(false);

  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) {
      return;
    }

    const measure = () => {
      if (window.matchMedia("(min-width: 640px)").matches) {
        setTruncated(false);
        return;
      }
      if (expanded) {
        return;
      }
      setTruncated(el.scrollHeight > el.clientHeight + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [title, expanded]);

  const clampClass = expanded ? "" : "max-sm:line-clamp-2";
  const toggleLabel = expanded
    ? chrome.collapseConceptTitle
    : chrome.expandConceptTitle;
  const showToggle = truncated || expanded;

  const inner = showToggle ? (
    <button
      type="button"
      className={TITLE_TOGGLE_CLASS}
      aria-expanded={expanded}
      aria-label={`${title}. ${toggleLabel}`}
      onClick={() =>
        setExpandedTitle((current) => (current === title ? null : title))
      }
    >
      {title}
    </button>
  ) : (
    title
  );

  const titleBase =
    variant === "detail" ? DETAIL_TITLE_CLASS : INDEX_TITLE_CLASS;
  const className = `${titleBase} ${clampClass}`;

  if (level === "h1") {
    return (
      <h1 ref={titleRef} className={className}>
        {inner}
      </h1>
    );
  }

  return (
    <h2 ref={titleRef} className={className}>
      {inner}
    </h2>
  );
}

const DETAIL_ACTIONS_DOCK =
  "flex min-h-11 touch-manipulation items-center justify-center border-t border-zinc-200 bg-white px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] dark:border-zinc-800 dark:bg-zinc-900";

export function ConceptDetailActionsFooter(props: ConceptHeaderActionProps) {
  const navOpen = useHandbookMobileNavOpen();
  const dockRef = useRef<HTMLDivElement>(null);
  const portalReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const hasActions =
    props.showBack || props.showNext || props.showBookmark || props.showShare;

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!hasActions || navOpen) {
      root.style.removeProperty("--handbook-concept-dock-h");
      return;
    }
    const node = dockRef.current;
    const syncHeight = () => {
      const height = node?.offsetHeight ?? 0;
      if (height > 0) {
        root.style.setProperty("--handbook-concept-dock-h", `${height}px`);
      }
    };
    syncHeight();
    if (!node) {
      return;
    }
    const observer = new ResizeObserver(syncHeight);
    observer.observe(node);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--handbook-concept-dock-h");
    };
  }, [
    hasActions,
    navOpen,
    props.showBack,
    props.showNext,
    props.showBookmark,
    props.showShare,
  ]);

  if (!hasActions || navOpen) {
    return null;
  }

  const dock = !portalReady
    ? null
    : createPortal(
        <div
          ref={dockRef}
          className={`concept-detail-dock fixed inset-x-0 bottom-0 z-30 sm:hidden ${DETAIL_ACTIONS_DOCK}`}
          role="toolbar"
          aria-label={props.chrome.topicsNav}
        >
          <ConceptHeaderActions {...props} compact />
        </div>,
        document.body,
      );

  return (
    <>
      <div
        className="shrink-0 sm:hidden"
        style={{ height: "var(--handbook-concept-dock-h, 2.75rem)" }}
        aria-hidden="true"
      />
      {dock}
    </>
  );
}

export function ConceptHeaderActions({
  title,
  chrome,
  variant,
  compact = false,
  segment = "all",
  showBack = false,
  backHref = null,
  onBack,
  showNext = false,
  nextHref = null,
  onNext,
  showBookmark = false,
  showShare = false,
  conceptId,
  hasOptionalDepth = false,
}: ConceptHeaderActionProps & {
  compact?: boolean;
  hasOptionalDepth?: boolean;
  segment?: "all" | "nav" | "utilities";
}) {
  const dividerClass = ACTION_DIVIDER_INDEX;
  const navVariant = compact ? "footer" : variant;
  const wrapClass =
    variant === "detail" && !compact
      ? DETAIL_TOOLBAR_CLUSTER
      : "flex items-center justify-center gap-1";

  const showDepthInToolbar = variant === "detail" && !compact;

  const depthChrome =
    showDepthInToolbar && hasOptionalDepth ? (
      <ConceptDepthToggle chrome={chrome} />
    ) : hasOptionalDepth && !showDepthInToolbar ? (
      <ConceptDepthToggle chrome={chrome} />
    ) : null;

  const utilityIconClass =
    variant === "detail" ? DETAIL_UTILITY_ICON : undefined;

  const utilityActions = (
    <>
      {showShare ? (
        <CopyConceptLinkButton
          conceptId={conceptId}
          chrome={chrome}
          size="md"
          concealed={false}
          className={utilityIconClass}
        />
      ) : null}
      {showBookmark ? (
        <TopicBookmarkButton
          title={title}
          chrome={chrome}
          conceptId={conceptId}
          size="md"
          className={utilityIconClass}
        />
      ) : null}
    </>
  );

  const navGroup = (
    <ConceptNavGroup
      showBack={showBack}
      backHref={backHref}
      onBack={onBack}
      showNext={showNext}
      nextHref={nextHref}
      onNext={onNext}
      chrome={chrome}
      variant={navVariant}
    />
  );

  if (segment === "nav") {
    return navGroup;
  }

  if (segment === "utilities") {
    if (!showShare && !showBookmark) {
      return null;
    }
    return (
      <div className="inline-flex shrink-0 items-center gap-0.5">
        {utilityActions}
      </div>
    );
  }

  if (variant === "detail" && !compact) {
    return (
      <div className={wrapClass}>
        {navGroup}
        {(showShare || showBookmark) && utilityActions}
      </div>
    );
  }

  return (
    <div className={wrapClass}>
      {navGroup}
      {variant === "index" &&
      (showBack || showNext) &&
      (showShare || showBookmark) ? (
        <span className={dividerClass} aria-hidden="true" />
      ) : null}
      {utilityActions}
      {depthChrome}
    </div>
  );
}

const DETAIL_TITLE_ROW =
  "flex w-full items-start justify-between gap-x-2 gap-y-2 sm:items-center";

export function ConceptDetailTitle({
  title,
  chrome,
  toolbarAbove = true,
  toolbarAboveFromSm = false,
  scrollsWithBody = false,
  hasOptionalDepth = false,
  afterTopicPageTitle = false,
  showShare = false,
  showBookmark = false,
  conceptId,
  insidePanel = false,
}: {
  title: string;
  chrome: ChromeCopy;
  /** False when the toolbar row is omitted (title is the top chrome). */
  toolbarAbove?: boolean;
  /** Toolbar is hidden below `sm` (mobile dock); title uses solo spacing until `sm`. */
  toolbarAboveFromSm?: boolean;
  /** Title lives in the scroll pane (only the toolbar stays fixed above). */
  scrollsWithBody?: boolean;
  hasOptionalDepth?: boolean;
  afterTopicPageTitle?: boolean;
  showShare?: boolean;
  showBookmark?: boolean;
  conceptId?: string;
  /** Title row is the header inside the bordered concept panel. */
  insidePanel?: boolean;
}) {
  const soloTitleBand = !toolbarAbove && !toolbarAboveFromSm;
  const showTitleUtilities = soloTitleBand && (showShare || showBookmark);

  const scrollClass = scrollsWithBody
    ? " concept-detail-title--in-scroll"
    : " shrink-0";
  const base = insidePanel
    ? "concept-detail-title"
    : `concept-detail-title bg-white px-4 dark:bg-zinc-900${scrollClass}`;

  let bandClass: string;
  if (toolbarAboveFromSm) {
    bandClass = `${base} concept-detail-title--under-toolbar-from-sm`;
  } else if (toolbarAbove) {
    bandClass = `${base} concept-detail-title--under-toolbar`;
  } else if (insidePanel) {
    bandClass = `${base} concept-detail-title--in-panel`;
  } else {
    bandClass = `${base} concept-detail-title--solo max-sm:rounded-t-none sm:rounded-t-[calc(0.75rem-1px)]${
      afterTopicPageTitle ? " concept-detail-title--after-topic-page" : ""
    }`;
  }

  return (
    <div className={bandClass}>
      <div className={DETAIL_TITLE_ROW}>
        <ConceptTitleHeading
          title={title}
          chrome={chrome}
          level="h2"
          variant="detail"
        />
        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          {showTitleUtilities ? (
            <ConceptHeaderActions
              title={title}
              chrome={chrome}
              variant="detail"
              segment="utilities"
              showShare={showShare}
              showBookmark={showBookmark}
              conceptId={conceptId}
            />
          ) : null}
          {hasOptionalDepth ? <ConceptDepthToggle chrome={chrome} /> : null}
        </div>
      </div>
    </div>
  );
}

export function ConceptTitleHeader({
  title,
  chrome,
  variant = "index",
  showBack = false,
  backHref = null,
  onBack,
  showNext = false,
  nextHref = null,
  onNext,
  showBookmark = false,
  showShare = false,
  conceptId,
  hideActionsOnMobile = false,
}: {
  title: string;
  chrome: ChromeCopy;
  variant?: "index" | "detail";
  hideActionsOnMobile?: boolean;
  showBack?: boolean;
  backHref?: string | null;
  onBack?: () => void;
  showNext?: boolean;
  nextHref?: string | null;
  onNext?: () => void;
  showBookmark?: boolean;
  showShare?: boolean;
  conceptId?: string;
}) {
  const actionProps: ConceptHeaderActionProps = {
    title,
    chrome,
    variant,
    showBack,
    backHref,
    onBack,
    showNext,
    nextHref,
    onNext,
    showBookmark,
    showShare,
    conceptId,
  };
  const hasActions = showBack || showNext || showBookmark || showShare;
  const headingLevel = variant === "detail" ? "h2" : "h1";
  const indexActionsClass = INDEX_ACTIONS_CLASS;
  const hideChromeOnMobile = hideActionsOnMobile
    ? "hidden sm:contents"
    : "contents";

  if (variant === "detail") {
    if (!hasActions) {
      return null;
    }

    const toolbarClass = hideActionsOnMobile
      ? `${DETAIL_TOOLBAR} hidden sm:block`
      : DETAIL_TOOLBAR;

    return (
      <div className={toolbarClass}>
        <div className={DETAIL_TOOLBAR_ACTIONS_ROW}>
          <div className={hideChromeOnMobile}>
            <ConceptHeaderActions {...actionProps} hasOptionalDepth={false} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={INDEX_HEADER}>
      <ConceptTitleHeading
        title={title}
        chrome={chrome}
        level={headingLevel}
        variant={variant}
      />
      {hasActions ? (
        <span className={indexActionsClass}>
          <ConceptHeaderActions {...actionProps} />
        </span>
      ) : null}
    </div>
  );
}

export function ConceptGroupSectionHeader({
  title,
  chrome,
}: {
  title: string;
  chrome: ChromeCopy;
}) {
  const pathname = usePathname() ?? "/";
  const saved = useIsBookmarked(pathname);

  return (
    <div className={`${INDEX_HEADER} group mb-[10px]`}>
      <ConceptTitleHeading
        title={title}
        chrome={chrome}
        level="h2"
        variant="index"
      />
      <span
        className={
          saved
            ? INDEX_ACTIONS_CLASS
            : `${INDEX_ACTIONS_CLASS} pointer-events-none max-sm:pointer-events-auto group-hover:pointer-events-auto group-focus-within:pointer-events-auto`
        }
      >
        <CopyConceptLinkButton chrome={chrome} size="md" />
        <TopicBookmarkButton
          title={title}
          chrome={chrome}
          size="md"
          revealOnHover
        />
      </span>
    </div>
  );
}
