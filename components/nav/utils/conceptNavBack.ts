/** Previous hash id per topic pathname ("" = topic index, no concept open). */
const previousHashByLocation = new Map<string, string>();

function locationKey(pathname: string, conceptId: string): string {
  return `${pathname}::${conceptId}`;
}

export function recordConceptNav(
  pathname: string,
  fromConceptId: string,
  toConceptId: string,
): void {
  if (fromConceptId === toConceptId) {
    return;
  }
  previousHashByLocation.set(locationKey(pathname, toConceptId), fromConceptId);
}

export function peekConceptBack(
  pathname: string,
  conceptId: string,
): string | undefined {
  if (!conceptId) {
    return undefined;
  }
  return previousHashByLocation.get(locationKey(pathname, conceptId));
}

export function clearConceptNavForPath(pathname: string): void {
  const prefix = `${pathname}::`;
  for (const key of previousHashByLocation.keys()) {
    if (key.startsWith(prefix)) {
      previousHashByLocation.delete(key);
    }
  }
}

/** `""` = topic index; otherwise `#id` href on the same pathname. */
export function conceptBackHref(
  pathname: string,
  conceptId: string,
): string | null {
  const previousId = peekConceptBack(pathname, conceptId);
  if (previousId === undefined) {
    return null;
  }
  return previousId.length > 0 ? `${pathname}#${previousId}` : pathname;
}
