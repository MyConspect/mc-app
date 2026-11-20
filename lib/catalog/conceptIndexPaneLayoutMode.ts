import type { ConceptIndexLayoutMode } from "@/components/topic/ConceptIndexBalancedLayout";
import { conceptIndexPanePackOptionsForEntries } from "./clusterIndexFitsPane";

type PanePackEntry = {
  readonly weight: number;
  readonly listItemCount: number;
};

/** When to use newspaper + pane pack vs stack for balanced index entries. */
export function conceptIndexLayoutModeForEntries(
  entries: readonly PanePackEntry[],
  options?: { readonly preferNewspaperFrom?: number },
): ConceptIndexLayoutMode {
  const preferFrom = options?.preferNewspaperFrom ?? 2;
  if (entries.length >= preferFrom) {
    return "newspaper";
  }
  if (entries.length === 1 && conceptIndexPanePackOptionsForEntries(entries)) {
    return "newspaper";
  }
  return "stack";
}