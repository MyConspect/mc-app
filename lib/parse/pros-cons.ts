function extractCells(row: string): string[] {
  const cells: string[] = [];
  const cellRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
  let match = cellRe.exec(row);
  while (match) {
    cells.push(match[1].trim());
    match = cellRe.exec(row);
  }
  return cells;
}

const COLUMN_LABEL = {
  pro: "Pluses",
  con: "Minuses",
} as const;

function renderList(kind: "pro" | "con", items: readonly string[]): string {
  if (items.length === 0) {
    return "";
  }

  const listItems = items
    .map((item) => `<li class="pros-cons__item">${item}</li>`)
    .join("");

  return `<div class="pros-cons__col"><p class="pros-cons__label">${COLUMN_LABEL[kind]}</p><ul class="pros-cons__list pros-cons__list--${kind}">${listItems}</ul></div>`;
}

export function isProsConsTable(table: string): boolean {
  const hasPros = /\bPros\b/i.test(table) || />\s*\+\s*</.test(table);
  const hasCons = /\bCons\b/i.test(table) || />\s*[−-]\s*</.test(table);
  return hasPros && hasCons;
}

export function transformProsConsTable(table: string): string {
  const proItems: string[] = [];
  const conItems: string[] = [];

  const bodyMatch = table.match(/<tbody>([\s\S]*?)<\/tbody>/i);
  const body = bodyMatch?.[1] ?? table;
  const rows = [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)];

  for (const row of rows) {
    const cells = extractCells(row[1]);
    if (cells[0]) {
      proItems.push(cells[0]);
    }
    if (cells[1]) {
      conItems.push(cells[1]);
    }
  }

  if (proItems.length === 0 && conItems.length === 0) {
    return table;
  }

  return `<div class="pros-cons">${renderList("pro", proItems)}${renderList("con", conItems)}</div>`;
}

export function transformProsConsTables(html: string): string {
  const tableRe = /<table>[\s\S]*?<\/table>/gi;
  return html.replace(tableRe, (table) => {
    if (!isProsConsTable(table)) {
      return table;
    }
    return transformProsConsTable(table);
  });
}
