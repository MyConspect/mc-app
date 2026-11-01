import type { SlotKind } from "@/lib/parse";
import { slotIconSvg } from "@/lib/parse/slot-icons";

export function ConceptSlotLabel({
  kind,
  label,
}: {
  kind: SlotKind;
  label: string;
}) {
  if (kind === "intro") {
    return null;
  }
  const icon = slotIconSvg(kind);

  return (
    <h4 className="concept-slot__heading">
      {icon ? (
        <span
          className="concept-slot__icon"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      ) : null}
      <span className="concept-slot__title">{label}</span>
    </h4>
  );
}
