import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConceptSlotLabel } from "@/components/topic";
import type { SlotKind } from "@/lib/parse";

export const metadata: Metadata = {
  title: "Instructions",
  description:
    "How the handbook is organized in the sidebar, and what each section inside a concept means.",
};

const CONCEPT_SECTIONS: {
  kind: SlotKind;
  label: string;
  body: string | ReactNode;
}[] = [
  {
    kind: "definition",
    label: "Definition",
    body: "React is a JavaScript library for building user interfaces from reusable components. It manages the view layer only — routing, data fetching, and global conventions come from frameworks or third-party libraries.",
  },
  {
    kind: "how",
    label: "How it works",
    body: (
      <ul>
        <li>
          You describe UI as a function of state; React reconciles the virtual
          DOM and commits updates to the host (e.g. the browser via React DOM).
        </li>
        <li>
          Components re-render when state or props change; hooks encapsulate
          state and side effects.
        </li>
        <li>
          The renderer (<code>react-dom</code>, React Native, etc.) is separate
          from the core <code>react</code> package.
        </li>
      </ul>
    ),
  },
  {
    kind: "cases",
    label: "When to use",
    body: (
      <p>
        SPAs, design systems, embeddable widgets (<code>createRoot</code> on a
        node), Next.js / React Router apps, React Native / Expo.
      </p>
    ),
  },
  {
    kind: "avoid",
    label: "When not to use",
    body: (
      <p>
        Static pages with no interactivity — plain HTML or a lighter library may
        be enough.
      </p>
    ),
  },
  {
    kind: "tradeoffs",
    label: "Pluses and minuses",
    body: (
      <div className="pros-cons">
        <div className="pros-cons__col">
          <p className="pros-cons__label">Pluses</p>
          <ul className="pros-cons__list pros-cons__list--pro">
            <li className="pros-cons__item">
              Component model scales from widgets to full apps.
            </li>
            <li className="pros-cons__item">
              Large ecosystem, DevTools, and hiring pool.
            </li>
          </ul>
        </div>
        <div className="pros-cons__col">
          <p className="pros-cons__label">Minuses</p>
          <ul className="pros-cons__list pros-cons__list--con">
            <li className="pros-cons__item">
              Not batteries-included — router and data layer are extra choices.
            </li>
            <li className="pros-cons__item">
              Learning curve: hooks, concurrent features, RSC mental model.
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    kind: "example",
    label: "Examples",
    body: (
      <pre>
        <code>{`import { useState } from 'react';
import { createRoot } from 'react-dom/client';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

createRoot(document.getElementById('root')!).render(<Counter />);`}</code>
      </pre>
    ),
  },
  {
    kind: "thoughts",
    label: "Thoughts",
    body: "Treat React as a UI runtime, not a full framework — that framing helps in system-design and “React vs Next” interview questions.",
  },
  {
    kind: "sources",
    label: "Sources",
    body: (
      <p>
        <a href="https://react.dev/">react.dev</a>
      </p>
    ),
  },
];

export default function InstructionsPage() {
  return (
    <main className="w-full max-w-3xl px-4 pt-5 pb-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Instructions
      </h1>

      <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
        This handbook is a set of study pages. The sidebar shows where you are.
        Open a topic, then open one idea at a time.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        How notes are organized
      </h2>
      <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-400">
        A <strong>topic</strong> is one page you open and scroll. A{" "}
        <strong>concept</strong> is one accordion on that page — one
        interview-sized idea, such as Promise or useEffect.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="py-2 pr-4 font-semibold">In the sidebar</th>
              <th className="py-2 pr-4 font-semibold">What you see</th>
              <th className="py-2 font-semibold">Example</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2 pr-4 font-medium">Track</td>
              <td className="py-2 pr-4">The big job area</td>
              <td className="py-2">Frontend, Backend, Other</td>
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2 pr-4 font-medium">Subject</td>
              <td className="py-2 pr-4">
                A language or library inside a track
              </td>
              <td className="py-2">HTML, JavaScript, React</td>
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2 pr-4 font-medium">Cluster</td>
              <td className="py-2 pr-4">A group of related pages</td>
              <td className="py-2">Core, Browser, Async</td>
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2 pr-4 font-medium">Topic</td>
              <td className="py-2 pr-4">One page of notes</td>
              <td className="py-2">Structure, Language, Hooks</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium">Concept</td>
              <td className="py-2 pr-4">One expandable item on that page</td>
              <td className="py-2">flexbox, Promise, useEffect</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
        Big subjects work like JavaScript: one subject, a few groups, then
        several topic pages. There is not a separate track for every slice, and
        there is not a new page for every small idea.
      </p>
      <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-400">
        Related ideas stay on the same topic when they belong together — same
        layer of the stack, same kind of interview question. If the same idea
        shows up elsewhere, the full note lives in one place; other pages only
        point to it.
      </p>
      <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-400">
        A long accordion is still one concept. Related APIs (for example map and
        filter) stay on the same page. Extra sidebar links are not a reason to
        break a page apart.
      </p>
      <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-400">
        Quick check: study only that page for 20 minutes. If the title still
        matches what you just studied, you are on the right topic. If the title
        would have to name several different layers, that material belongs on
        another page.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Concept sections
      </h2>
      <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-400">
        Each concept uses the same layout. <strong>Definition</strong> is always
        there. The other blocks appear only when they help. Below is a sample.
      </p>

      <div className="concept-body mt-8">
        {CONCEPT_SECTIONS.map((section) => (
          <section
            key={section.kind}
            className={`concept-slot slot-${section.kind}`}
          >
            <ConceptSlotLabel kind={section.kind} label={section.label} />
            <div className="concept-slot__body">
              {typeof section.body === "string" ? (
                <p>{section.body}</p>
              ) : (
                section.body
              )}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
