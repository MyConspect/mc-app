import { InlineBootScript } from "@/components/nav/InlineBootScript";
import { themeBootScript } from "@/components/nav/utils/uiStorage";

/** Applies stored theme on the initial HTML parse (before React hydration). */
export function ThemeBootScript() {
  return (
    <InlineBootScript id="theme-boot" html={themeBootScript()} />
  );
}