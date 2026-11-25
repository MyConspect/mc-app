"use client";

/**
 * Sync inline boot scripts (theme, concept hash). Emit the tag only while SSR runs
 * (`window` is undefined); on the client return null so React 19 does not warn.
 * @see https://github.com/pacocoursey/next-themes/pull/386
 */
export function InlineBootScript({
  id,
  html,
}: {
  id: string;
  html: string;
}) {
  if (typeof window !== "undefined") {
    return null;
  }

  return (
    <script
      id={id}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}