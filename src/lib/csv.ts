// Minimal CSV parser/serializer with support for quoted fields, commas, and newlines.

export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let i = 0;
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, '');

  while (i < src.length) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ',' || c === ';') {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (c === '\r') {
      i++;
      continue;
    }
    if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v && v.trim() !== ''));
}

export function parseCSVToObjects(text: string): Record<string, string>[] {
  const rows = parseCSV(text);
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? '').trim();
    });
    return obj;
  });
}

function escapeField(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCSV(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const lines = [headers.map(escapeField).join(',')];
  for (const r of rows) {
    lines.push(r.map((v) => escapeField(v == null ? '' : String(v))).join(','));
  }
  return lines.join('\n');
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseBool(v: string | undefined | null, fallback = true): boolean {
  if (v == null) return fallback;
  const s = String(v).trim().toLowerCase();
  if (s === '') return fallback;
  return ['1', 'true', 'sim', 'yes', 'y', 's', 'ativo', 'x'].includes(s);
}

export function parseNumber(v: string | undefined | null): number | null {
  if (v == null) return null;
  const s = String(v).trim().replace(/\s/g, '');
  if (s === '') return null;
  // Accept both "1.234,56" and "1234.56"
  const normalized = s.includes(',') && !s.includes('.')
    ? s.replace(',', '.')
    : s.replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}