export interface OutputOptions {
  json?: boolean;
}

export interface ListTableColumn<T> {
  header: string;
  getValue: (item: T) => unknown;
}

export function formatJson(data: unknown) {
  return JSON.stringify(data, null, 2);
}

export function formatText(value: unknown) {
  return String(value);
}

function renderTable(values: string[][]) {
  if (values.length === 0) {
    return '';
  }

  const widths = values[0].map((_, columnIndex) => {
    const rowWidths = values.map((row) => row[columnIndex]?.length ?? 0);
    return Math.max(...rowWidths);
  });

  const renderRow = (row: string[]) =>
    row
      .map((value, index) => {
        if (index === row.length - 1) {
          return value;
        }

        return value.padEnd(widths[index] ?? value.length, ' ');
      })
      .join(' | ');

  return values.map(renderRow).join('\n');
}

export function formatListTable<T>(items: T[], columns: ListTableColumn<T>[]) {
  if (columns.length === 0) {
    return '';
  }

  const rows = items.map((item) => columns.map((column) => formatText(column.getValue(item))));
  return renderTable([columns.map((column) => column.header), ...rows]);
}

export function formatRowTable(rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    return 'No results found.';
  }

  const headers = Object.keys(rows[0] ?? {});
  return renderTable([
    headers,
    ...rows.map((row) => headers.map((header) => formatText(row[header] ?? ''))),
  ]);
}

export function printOutput(
  data: unknown,
  options: OutputOptions,
  formatHumanReadable: (value: unknown) => string = formatText
) {
  console.log(options.json ? formatJson(data) : formatHumanReadable(data));
}
