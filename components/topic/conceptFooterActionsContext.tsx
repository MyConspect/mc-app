"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { ChromeCopy } from "@/lib/nav";

export type ConceptHeaderActionProps = {
  title: string;
  chrome: ChromeCopy;
  variant: "index" | "detail";
  showBack?: boolean;
  backHref?: string | null;
  onBack?: () => void;
  showNext?: boolean;
  nextHref?: string | null;
  onNext?: () => void;
  showBookmark?: boolean;
  showShare?: boolean;
  conceptId?: string;
};

type ConceptFooterActionsContextValue = {
  readonly actions: ConceptHeaderActionProps | null;
  readonly setActions: Dispatch<
    SetStateAction<ConceptHeaderActionProps | null>
  >;
};

const ConceptFooterActionsContext =
  createContext<ConceptFooterActionsContextValue | null>(null);

export function ConceptFooterActionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [actions, setActions] = useState<ConceptHeaderActionProps | null>(null);
  const value = useMemo(() => ({ actions, setActions }), [actions, setActions]);
  return (
    <ConceptFooterActionsContext.Provider value={value}>
      {children}
    </ConceptFooterActionsContext.Provider>
  );
}

function useConceptFooterActionsContext() {
  const ctx = useContext(ConceptFooterActionsContext);
  if (!ctx) {
    throw new Error(
      "ConceptFooterActionsProvider is missing from the component tree.",
    );
  }
  return ctx;
}

export function useConceptFooterActions() {
  return useContext(ConceptFooterActionsContext)?.actions ?? null;
}

function conceptFooterActionsActive(props: ConceptHeaderActionProps) {
  const hasActions =
    props.showBack || props.showNext || props.showBookmark || props.showShare;
  const useMobileBar =
    props.variant === "detail" || props.showBack || props.showNext;
  return hasActions && useMobileBar;
}

export function ConceptFooterActionsRegistrar(props: ConceptHeaderActionProps) {
  const { setActions } = useConceptFooterActionsContext();
  const {
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
  } = props;
  const active = conceptFooterActionsActive(props);
  const actions = useMemo(
    (): ConceptHeaderActionProps => ({
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
    }),
    [
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
    ],
  );

  useLayoutEffect(() => {
    if (!active) {
      setActions(null);
      return;
    }
    setActions(actions);
    return () => setActions(null);
  }, [active, actions, setActions]);

  return null;
}
