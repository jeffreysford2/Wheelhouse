// A small CSV reader for the hand-collected data files.
//
// Handles what spreadsheet exports produce: quoted fields, commas and
// doubled quotes ("") inside quotes, and Windows line endings. That is all
// the curated files need, so no CSV library is pulled in.

/** Split CSV text into rows of fields. Blank lines are skipped. */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const endField = () => {
    row.push(field);
    field = "";
  };
  const endRow = () => {
    endField();
    if (row.some((value) => value !== "")) rows.push(row);
    row = [];
  };

  for (let position = 0; position < text.length; position++) {
    const char = text[position]!;
    if (inQuotes) {
      if (char === '"' && text[position + 1] === '"') {
        field += '"';
        position++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      endField();
    } else if (char === "\n") {
      endRow();
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) endRow();

  return rows;
}

/** Read CSV text with a header row into one object per data row, keyed by column name. */
export function parseCsv(text: string): Record<string, string>[] {
  const [header, ...dataRows] = parseCsvRows(text);
  if (!header) return [];
  return dataRows.map((values) => Object.fromEntries(header.map((column, index) => [column, values[index] ?? ""])));
}
