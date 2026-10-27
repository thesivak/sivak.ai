// CSV for Excel: UTF-8 with a byte-order mark, CRLF rows, every cell quoted.
// Cells that a spreadsheet would run as a formula (= + - @, tab, carriage return) get a leading apostrophe.
const FORMULA = /^[=+\-@\t\r]/;

export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (FORMULA.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function toCsv(header: string[], rows: unknown[][]): string {
  return "﻿" + [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
