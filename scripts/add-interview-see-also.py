#!/usr/bin/env python3
"""Add **See also:** theory links to interview <details> blocks (EN + RU). One-off batch."""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path

CONTENT = Path(__file__).resolve().parents[2] / "mc-content"

STOP = frozenset(
    """
    a an and are as at be between by can could describe difference different do does
    explain for from give how i in is it its javascript js react typescript ts vue
    angular what when where which why will with would you your the this that these those
    concept of into on or if not than then also about can
    """.split()
)

QUESTION_PREFIX_RE = re.compile(
    r"^(what|how|why|when|where|which|explain|describe|can you|tell me about)\s+",
    re.I,
)

DETAILS_BLOCK_RE = re.compile(r"<details>.*?</details>", re.DOTALL | re.IGNORECASE)
INNER_DETAILS_RE = re.compile(
    r"<details>\s*<summary>(.*?)</summary>\s*((?:(?!<details\b)[\s\S])*?)</details>",
    re.I,
)
INLINE_SOURCES_RE = re.compile(r"\*\*Sources:\*\*\s+(https?://\S+)", re.I)
WRAPPER_MARKERS = (
    "interview-group-wrapper",
    "gfe-article-wrapper",
    "gfe-section-wrapper",
)
SUMMARY_RE = re.compile(r"<summary>\s*(.*?)\s*</summary>", re.DOTALL | re.IGNORECASE)
THEORY_LINK_RE = re.compile(
    r"\]\(\./(\d+_[a-z0-9_]+\.md)(#[^)\s]+)?\)",
    re.IGNORECASE,
)
SEE_ALSO_RE = re.compile(r"\*\*See also:\*\*", re.IGNORECASE)
SEE_ALSO_LINE_RE = re.compile(r"\n\*\*See also:\*\*[^\n]+\n\n", re.IGNORECASE)
SEE_ALSO_PARSE_RE = re.compile(
    r"\*\*See also:\*\* \[([^\]]+)\]\(\./([^)#]+)\.md#([^)]+)\)",
    re.IGNORECASE,
)
SOURCES_RE = re.compile(r"\n\*\*Sources:\*\*\s*\n", re.IGNORECASE)

GENERIC_TOKENS = frozenset(
    """
    array map set graph queue trie scope keys key ref unit units act pinia cors https
    http rest api dom node css html js test testing
    """.split()
)


def slugify(value: str) -> str:
    slug = value.lower()
    slug = re.sub(r"[`*_~]", "", slug)
    slug = slug.replace("&", " and ")
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")[:96]
    return slug or "section"


def norm_tokens(text: str) -> set[str]:
    t = re.sub(r"[^a-z0-9\s]", " ", text.lower())
    return {w for w in t.split() if len(w) > 2 and w not in STOP}


@dataclass(frozen=True)
class Concept:
    file: str
    summary: str
    slug: str
    tokens: frozenset[str]


def theory_files_for_interview(name: str) -> list[str]:
    """Return basename prefixes for theory search."""
    base = name.replace(".md", "")
    if base.endswith("_interview"):
        stem = base[: -len("_interview")]
    else:
        stem = re.sub(r"_interview$", "", base)

    if stem.startswith("0_sd_"):
        return ["0_system_design", "0_sd", "7_special"]

    parts = stem.split("_")
    if len(parts) >= 2:
        return [f"{parts[0]}_{parts[1]}", stem]
    return [stem]


def list_theory_paths(locale: str, prefixes: list[str]) -> list[Path]:
    root = CONTENT / locale
    out: list[Path] = []
    for path in sorted(root.glob("*.md")):
        name = path.name
        if "interview" in name:
            continue
        if name in ("0_me.md", "0_books.md", "0_developer.md", "0_intro.md"):
            continue
        if any(name.startswith(p + "_") or name == p + ".md" for p in prefixes):
            out.append(path)
        elif stem := name.split("_", 2):
            pass
    # broader: any file sharing first numeric segment
    seg = prefixes[0].split("_")[0] if prefixes else ""
    if seg.isdigit():
        for path in sorted(root.glob(f"{seg}_*.md")):
            if "interview" in path.name:
                continue
            if path not in out:
                out.append(path)
    return out


def build_concept_index(locale: str) -> dict[str, list[Concept]]:
    by_file: dict[str, list[Concept]] = {}
    root = CONTENT / locale
    for path in sorted(root.glob("*.md")):
        if "interview" in path.name:
            continue
        text = path.read_text(encoding="utf-8")
        concepts: list[Concept] = []
        for m in SUMMARY_RE.finditer(text):
            summary = re.sub(r"\s+", " ", m.group(1)).strip()
            if not summary or len(summary) < 2:
                continue
            concepts.append(
                Concept(
                    file=path.name,
                    summary=summary,
                    slug=slugify(summary),
                    tokens=frozenset(norm_tokens(summary)),
                )
            )
        if concepts:
            by_file[path.name] = concepts
    return by_file


def manual_override(question: str, index: dict[str, list[Concept]]) -> Concept | None:
    q = question.lower()
    rules: list[tuple[str, str, str]] = [
        ("what is react", "4_react_core.md", "React overview"),
        ("reactdom", "4_react_core.md", "React vs ReactDOM"),
        ("virtual dom", "4_react_core.md", "React Fiber"),
        ("reconciliation", "4_react_core.md", "React Fiber"),
        ("useeffect", "4_react_hooks.md", "useEffect"),
        ("usestate", "4_react_hooks.md", "useState"),
        ("usememo", "4_react_hooks.md", "useMemo"),
        ("usecallback", "4_react_hooks.md", "useCallback"),
        ("rules of hooks", "4_react_hooks.md", "Rules of Hooks"),
        ("prop drilling", "4_react_core.md", "Props"),
        ("controlled component", "4_react_core.md", "Controlled vs uncontrolled inputs"),
        ("hoisting", "3_js_variables.md", "Hoisting"),
        ("closure", "3_js_functions.md", "Closures"),
        ("arrow function", "3_js_functions.md", "Arrow functions revisited"),
        ("promise", "3_js_async_promises.md", "Promise basics"),
        ("async/await", "3_js_async_promises.md", "async/await"),
        ("flexbox", "2_css_layout.md", "Flexbox"),
        ("css grid", "2_css_layout.md", "CSS Grid"),
        ("grid layout", "2_css_layout.md", "CSS Grid"),
        ("box model", "2_css_core.md", "Box model"),
        ("specificity", "2_css_core.md", "Specificity"),
        ("z-index", "2_css_layout.md", "Stacking context & z-index"),
        ("media quer", "2_css_layout.md", "Media queries"),
        ("event loop", "8_nodejs_core.md", "Event loop"),
        ("nestjs", "8_nodejs_ecosystem.md", "NestJS"),
        ("typescript", "5_ts_basics.md", "TypeScript overview"),
        ("interface", "5_ts_types_shapes.md", "Interface"),
        ("generics", "5_ts_type_manipulation.md", "Generics"),
        ("null and undefined", "5_ts_null_undefined.md", "null and undefined"),
        ("type assertion", "5_ts_assertions.md", "Type assertions"),
        ("websocket", "6_web_api_websockets.md", "WebSocket"),
        ("graphql", "6_web_api_graphql.md", "GraphQL"),
    ]
    for needle, file, summary in rules:
        if needle in q:
            for c in index.get(file, []):
                if c.summary == summary:
                    return c
    return None


def is_valid_match(question: str, concept: Concept, score: float) -> bool:
    if len(concept.summary.strip()) <= 3:
        return False
    qt = norm_tokens(question)
    overlap = qt & concept.tokens
    qn = question.lower()
    cn = concept.summary.lower()

    if len(cn) >= 10 and cn in qn:
        return True
    if len(overlap) >= 2:
        return score >= 0.45
    if len(concept.tokens) == 1:
        tok = next(iter(concept.tokens))
        if tok in GENERIC_TOKENS:
            return False
        if tok not in qt:
            return False
        if len(tok) < 6:
            return False
    if len(overlap) == 1:
        tok = next(iter(overlap))
        if tok in GENERIC_TOKENS:
            return False
        if len(tok) < 6 and score < 0.75:
            return False
    if overlap and score >= 0.58:
        return True
    if overlap and len(overlap) == 1:
        tok = next(iter(overlap))
        if len(tok) >= 5 and tok not in GENERIC_TOKENS and score >= 0.48:
            return True
    if score >= 0.72:
        return True
    return False


def normalize_question_key(question: str) -> str:
    q = question.lower()
    q = re.sub(r"[^a-z0-9\s]", " ", q)
    q = re.sub(r"\s+", " ", q).strip()
    return q


def interview_stem(interview_name: str) -> str:
    base = interview_name.replace(".md", "")
    if base.endswith("_interview"):
        return base[: -len("_interview")]
    return base


def concept_from_md_link(
    file: str, slug: str | None, label: str, index: dict[str, list[Concept]]
) -> Concept | None:
    concepts = index.get(file, [])
    if slug:
        for c in concepts:
            if c.slug == slug:
                return c
    label_n = label.strip().lower()
    for c in concepts:
        if c.summary.lower() == label_n:
            return c
    return concepts[0] if concepts else None


def build_table_map(
    text: str, index: dict[str, list[Concept]]
) -> dict[str, Concept]:
    mapping: dict[str, Concept] = {}
    for line in text.splitlines():
        if not line.strip().startswith("|") or "---" in line:
            continue
        cols = [c.strip() for c in line.split("|")[1:-1]]
        if len(cols) < 2:
            continue
        theory_col = cols[1] if len(cols) >= 3 else cols[0]
        interview_col = cols[-1]
        if "theory" in theory_col.lower() and "interview" in interview_col.lower():
            continue
        link_match = re.search(
            r"\[([^\]]+)\]\(\./(\d+_[^)#]+)\.md(?:#([^)]+))?\)", theory_col
        )
        if not link_match:
            continue
        label, file_base, slug = link_match.group(1), link_match.group(2), link_match.group(3)
        file = f"{file_base}.md"
        concept = concept_from_md_link(file, slug, label, index)
        if concept is None:
            continue
        for qm in re.findall(r"\[([^\]]+)\]\([^)]*\)", interview_col):
            if "./" in qm or len(qm) < 12:
                continue
            if "same block" in qm.lower() or "search " in qm.lower():
                continue
            mapping[normalize_question_key(qm)] = concept
    return mapping


def lookup_table_map(question: str, table_map: dict[str, Concept]) -> Concept | None:
    key = normalize_question_key(question)
    if key in table_map:
        return table_map[key]
    best: tuple[float, Concept] | None = None
    for tk, concept in table_map.items():
        if key in tk or tk in key:
            return concept
        r = SequenceMatcher(None, key, tk).ratio()
        if r >= 0.84 and (best is None or r > best[0]):
            best = (r, concept)
    return best[1] if best else None


def block_heading(block: str) -> str | None:
    sm = SUMMARY_RE.search(block)
    if not sm:
        return None
    tail = block[sm.end() :]
    hm = re.search(r"###\s*(.+?)\s*(?:\n|$)", tail)
    return hm.group(1).strip() if hm else None


def prose_before_examples(block: str) -> str:
    for marker in ("**Examples:**", "**Sources:**"):
        m = re.search(re.escape(marker), block, re.IGNORECASE)
        if m:
            return block[: m.start()]
    return block


def score_match(question: str, concept: Concept) -> float:
    q = question.strip()
    qn = re.sub(r"\s+", " ", q).lower()
    cn = concept.summary.lower()
    if cn in qn or qn in cn:
        return 0.95
    if slugify(q) == concept.slug:
        return 0.92

    qt = norm_tokens(q)
    if not qt or not concept.tokens:
        return 0.0
    overlap = len(qt & concept.tokens)
    if overlap == 0:
        ratio = SequenceMatcher(None, qn, cn).ratio()
        return ratio * 0.5
    union = len(qt | concept.tokens)
    jaccard = overlap / union
    ratio = SequenceMatcher(None, qn, cn).ratio()
    # Boost when a distinctive token matches (e.g. hoisting → Hoisting)
    boost = 0.25 if overlap >= 1 and any(len(w) > 5 for w in qt & concept.tokens) else 0.1
    return min(0.99, jaccard + ratio * 0.35 + boost)


def pick_concept(
    question: str,
    candidate_files: list[str],
    index: dict[str, list[Concept]],
    *,
    stem: str | None = None,
) -> Concept | None:
    candidates: list[Concept] = []
    for fn in candidate_files:
        candidates.extend(index.get(fn, []))

    best: tuple[float, Concept] | None = None
    for c in candidates:
        s = score_match(question, c)
        if stem and (c.file.startswith(stem + "_") or c.file == stem + ".md"):
            s *= 1.18
        if not is_valid_match(question, c, s):
            continue
        if best is None or s > best[0]:
            best = (s, c)
    return best[1] if best else None


def difference_terms(question: str) -> list[str]:
    m = re.search(
        r"difference between (.+?) and (.+?)(?:\?|$)",
        question,
        re.IGNORECASE | re.DOTALL,
    )
    if not m:
        return []
    a = re.sub(r"\s+", " ", m.group(1)).strip(" ?.")
    b = re.sub(r"\s+", " ", m.group(2)).strip(" ?.")
    return [a, b]


def resolve_concept(
    question: str,
    block: str,
    interview_name: str,
    theory_files: list[str],
    index: dict[str, list[Concept]],
    table_map: dict[str, Concept],
) -> Concept | None:
    stem = interview_stem(interview_name)
    concept = lookup_table_map(question, table_map)
    if concept and is_valid_match(question, concept, score_match(question, concept)):
        return concept

    concept = manual_override(question, index)
    if concept:
        return concept

    prose = prose_before_examples(block)
    no_code = re.sub(r"```[\s\S]*?```", "", prose)
    for m in THEORY_LINK_RE.finditer(no_code):
        f, slug_part = m.group(1), (m.group(2) or "").lstrip("#")
        if "interview" in f:
            continue
        for c in index.get(f, []):
            if slug_part and c.slug != slug_part:
                continue
            if is_valid_match(question, c, score_match(question, c)):
                return c

    heading = block_heading(block)
    for variant in (question, heading):
        if not variant:
            continue
        concept = pick_concept(variant, theory_files, index, stem=stem)
        if concept:
            return concept

    for term in difference_terms(question):
        concept = pick_concept(term, theory_files, index, stem=stem)
        if concept:
            return concept
    return None


def existing_theory_link(block: str) -> tuple[str, str] | None:
    """Prefer in-body theory links outside code examples."""
    no_code = re.sub(r"```[\s\S]*?```", "", prose_before_examples(block))
    for m in THEORY_LINK_RE.finditer(no_code):
        f, h = m.group(1), m.group(2) or ""
        if "interview" in f:
            continue
        if "devinterview" in block[: m.start()]:
            continue
        label = m.group(0)
        if h:
            return (f, h.lstrip("#"))
    return None


def format_see_also(concept: Concept) -> str:
    return f"**See also:** [{concept.summary}](./{concept.file}#{concept.slug})\n\n"


def format_conspect_source(concept: Concept) -> str:
    return f"- [MyConspect — {concept.summary}](./{concept.file}#{concept.slug})\n"


def concept_from_see_also(block: str, index: dict[str, list[Concept]]) -> Concept | None:
    m = SEE_ALSO_PARSE_RE.search(block)
    if not m:
        return None
    label, file, slug = m.group(1), m.group(2) + ".md", m.group(3)
    for c in index.get(file, []):
        if c.slug == slug:
            return c
    return Concept(file=file, summary=label, slug=slug, tokens=frozenset())


def sources_region(block: str) -> str:
    if "**Sources:**" not in block:
        return ""
    return block.split("**Sources:**", 1)[1].split("</details>", 1)[0]


def has_conspect_in_sources(block: str) -> bool:
    region = sources_region(block)
    if not region:
        return False
    return bool(re.search(r"\]\(\./\d+_", region))


def normalize_inline_sources(block: str) -> str:
    return INLINE_SOURCES_RE.sub(
        lambda m: f"**Sources:**\n\n- {m.group(1)}\n\n",
        block,
    )


def ensure_conspect_in_sources(block: str, concept: Concept) -> str:
    block = normalize_inline_sources(block)
    if has_conspect_in_sources(block):
        return block
    bullet = format_conspect_source(concept)
    sm = SOURCES_RE.search(block)
    if sm:
        return block[: sm.end()] + bullet + block[sm.end() :]
    close = block.rfind("</details>")
    if close == -1:
        return block
    return block[:close].rstrip() + f"\n\n**Sources:**\n\n{bullet}\n" + block[close:]


def apply_concept_links(
    block: str,
    concept: Concept,
    *,
    add_see_also: bool,
) -> str:
    updated = block
    if add_see_also and not SEE_ALSO_RE.search(updated):
        updated = patch_block(updated, format_see_also(concept))
    return ensure_conspect_in_sources(updated, concept)


def strip_see_also(block: str) -> str:
    return SEE_ALSO_LINE_RE.sub("\n", block)


def see_also_valid_in_block(block: str, question: str, index: dict[str, list[Concept]]) -> bool:
    m = SEE_ALSO_PARSE_RE.search(block)
    if not m:
        return True
    _label, file, slug = m.group(1), m.group(2) + ".md", m.group(3)
    for c in index.get(file, []):
        if c.slug == slug:
            return is_valid_match(question, c, score_match(question, c))
    return False


def patch_block(block: str, see_line: str, *, replace: bool = False) -> str:
    if SEE_ALSO_RE.search(block):
        if not replace:
            return block
        block = strip_see_also(block)
    sm = SOURCES_RE.search(block)
    if sm:
        return block[: sm.start()] + "\n" + see_line + block[sm.start() :]
    close = block.rfind("</details>")
    if close == -1:
        return block
    return block[:close].rstrip() + "\n\n" + see_line + block[close:]


def theory_basenames_for(interview_name: str, index: dict[str, list[Concept]]) -> list[str]:
    prefixes = theory_files_for_interview(interview_name)
    matched = []
    for fn in index:
        if "interview" in fn:
            continue
        if any(fn.startswith(p + "_") or fn == p + ".md" for p in prefixes):
            matched.append(fn)
    if not matched:
        seg = interview_name.split("_", 1)[0]
        matched = [fn for fn in index if fn.startswith(seg + "_") and "interview" not in fn]
    return matched


def process_markdown(
    text: str,
    interview_name: str,
    index: dict[str, list[Concept]],
    *,
    reconcile: bool = False,
) -> tuple[str, int, int]:
    theory_files = theory_basenames_for(interview_name, index)
    table_map = build_table_map(text, index)
    added_see = 0
    added_sources = 0

    def replacer(m: re.Match[str]) -> str:
        nonlocal added_see, added_sources
        block = m.group(0)
        if any(marker in block for marker in WRAPPER_MARKERS):
            return block
        sm = SUMMARY_RE.search(block)
        if not sm:
            return block
        question = sm.group(1).strip()
        q_lower = question.lower()
        if any(
            x in q_lower
            for x in (
                "cheatsheet",
                "course (#",
                "question index",
                "course index",
            )
        ):
            return block

        concept: Concept | None = None
        add_see_also = True

        if SEE_ALSO_RE.search(block):
            if reconcile and not see_also_valid_in_block(block, question, index):
                block = strip_see_also(block)
            else:
                concept = concept_from_see_also(block, index)
                add_see_also = False

        if concept is None:
            concept = resolve_concept(
                question, block, interview_name, theory_files, index, table_map
            )

        if concept is None:
            return block

        before = block
        block = apply_concept_links(block, concept, add_see_also=add_see_also)
        if SEE_ALSO_RE.search(block) and not SEE_ALSO_RE.search(before):
            added_see += 1
        if has_conspect_in_sources(block) and not has_conspect_in_sources(before):
            added_sources += 1
        return block

    new_text = text
    prev = (-1, -1)
    while (added_see, added_sources) != prev:
        prev = (added_see, added_sources)
        new_text = INNER_DETAILS_RE.sub(replacer, new_text)
    return new_text, added_see, added_sources


def extract_see_also_line(block: str) -> str | None:
    m = SEE_ALSO_LINE_RE.search("\n" + block)
    if not m:
        m2 = re.search(r"\n(\*\*See also:\*\*[^\n]+)\n", block)
        if m2:
            return m2.group(1).strip() + "\n\n"
        return None
    return m.group(0).strip() + "\n"


def sync_ru_from_en(en_text: str, ru_text: str) -> tuple[str, int]:
    """Mirror EN **See also:** lines onto RU blocks by index."""
    en_blocks = DETAILS_BLOCK_RE.findall(en_text)
    ru_blocks = list(DETAILS_BLOCK_RE.finditer(ru_text))
    if len(en_blocks) != len(ru_blocks):
        return ru_text, 0

    changed = 0
    offset = 0
    new_ru = ru_text
    for i, ru_m in enumerate(ru_blocks):
        en_see = extract_see_also_line(en_blocks[i])
        ru_b = ru_m.group(0)
        if en_see:
            patched = patch_block(strip_see_also(ru_b), en_see, replace=True)
        else:
            patched = strip_see_also(ru_b)
        if patched != ru_b:
            changed += 1
            start = ru_m.start() + offset
            end = ru_m.end() + offset
            new_ru = new_ru[:start] + patched + new_ru[end:]
            offset += len(patched) - len(ru_b)
    return new_ru, changed


def main() -> int:
    dry = "--dry-run" in sys.argv
    reconcile = "--reconcile" in sys.argv
    index_en = build_concept_index("en")
    total_en = 0
    total_ru = 0

    interviews = sorted((CONTENT / "en").glob("*interview*.md"))
    total_sources = 0
    for en_path in interviews:
        en_text = en_path.read_text(encoding="utf-8")
        new_en, n, ns = process_markdown(
            en_text, en_path.name, index_en, reconcile=reconcile
        )
        total_en += n
        total_sources += ns
        if not dry and new_en != en_text:
            en_path.write_text(new_en, encoding="utf-8")

        ru_path = CONTENT / "ru" / en_path.name
        if ru_path.is_file():
            ru_text = ru_path.read_text(encoding="utf-8")
            ref_en = new_en
            new_ru, nr = sync_ru_from_en(ref_en, ru_text)
            total_ru += nr
            if not dry and new_ru != ru_text:
                ru_path.write_text(new_ru, encoding="utf-8")

    print(f"EN see-also added: {total_en}")
    print(f"EN conspect sources added: {total_sources}")
    print(f"RU see-also synced: {total_ru}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
