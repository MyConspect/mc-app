import { dispatchHashChange, hashIdFrom } from "@/components/nav/utils/hash";
import {
  handbookMain,
  handbookScrollContainer,
  mainScrollInset,
} from "@/components/topic/utils/conceptScroll";

function scrollElementIntoHandbookView(element: HTMLElement) {
  const scroller = handbookScrollContainer() ?? handbookMain();
  if (!scroller) {
    element.scrollIntoView({ block: "start", behavior: "smooth" });
    return;
  }
  const inset = scroller === handbookMain() ? mainScrollInset(scroller) : 0;
  const top =
    element.getBoundingClientRect().top -
    scroller.getBoundingClientRect().top +
    scroller.scrollTop -
    inset;
  scroller.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

export function scrollToConceptGroupSection(sectionId: string) {
  const pathname = window.location.pathname;
  const hadOpenConcept = Boolean(hashIdFrom(window.location.hash));

  const scroll = () => {
    const element = document.getElementById(sectionId);
    if (element instanceof HTMLElement) {
      scrollElementIntoHandbookView(element);
    }
  };

  if (!hadOpenConcept) {
    scroll();
    return;
  }

  window.history.replaceState(window.history.state, "", pathname);
  dispatchHashChange(false);

  const attemptScroll = (remaining: number) => {
    const element = document.getElementById(sectionId);
    if (element instanceof HTMLElement) {
      scrollElementIntoHandbookView(element);
      return;
    }
    if (remaining > 0) {
      window.requestAnimationFrame(() => attemptScroll(remaining - 1));
    }
  };
  attemptScroll(12);
}
