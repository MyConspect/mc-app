import { inferNavRootSection } from "./sections";
import { readPersistedNavRootSection } from "./rootSectionPreference";

/** Keep optimistic pending href for sidebar highlights while route catches up. */
export function shouldUsePendingNavPath(
  committedPath: string,
  pendingPath: string,
): boolean {
  if (!pendingPath) {
    return false;
  }
  const persistedTab = readPersistedNavRootSection();
  const pendingSection = inferNavRootSection(pendingPath);
  const committedSection = inferNavRootSection(committedPath);
  if (pendingSection === committedSection) {
    return true;
  }
  return persistedTab !== null && pendingSection === persistedTab;
}