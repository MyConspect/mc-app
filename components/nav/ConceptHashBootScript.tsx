import { InlineBootScript } from "@/components/nav/InlineBootScript";
import { conceptHashBootScript } from "@/components/nav/utils/conceptHashBoot";

/** Marks deep-linked concept URLs before paint so the topic index nav stays hidden. */
export function ConceptHashBootScript() {
  return (
    <InlineBootScript
      id="concept-hash-boot"
      html={conceptHashBootScript()}
    />
  );
}