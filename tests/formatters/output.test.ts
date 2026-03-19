import { jest } from '@jest/globals';
import {
  formatJson,
  formatListTable,
  formatRowTable,
  formatText,
  printOutput,
  type ListTableColumn,
} from '../../src/formatters/output.js';

describe('output formatter', () => {
  test('formats JSON output with indentation', () => {
    expect(formatJson({ ok: true, count: 2 })).toBe(`{
  "ok": true,
  "count": 2
}`);
  });

  test('formats plain text output with string coercion', () => {
    expect(formatText(42)).toBe('42');
    expect(formatText({ name: 'demo' })).toBe('[object Object]');
  });

  test('formats list output as a basic table', () => {
    const columns: ListTableColumn<{ name: string; id: string }>[]= [
      { header: 'Name', getValue: (item) => item.name },
      { header: 'ID', getValue: (item) => item.id },
    ];

    expect(
      formatListTable(
        [
          { name: 'Alpha', id: 'nb-1' },
          { name: 'Beta', id: 'nb-22' },
        ],
        columns
      )
    ).toBe('Name  | ID\nAlpha | nb-1\nBeta  | nb-22');
  });

  test('formats row objects as a simple table', () => {
    expect(
      formatRowTable([
        { id: '20240101010101-abc', content: 'Alpha' },
        { id: '20240101010102-def', content: 'Beta' },
      ])
    ).toBe([
      'id                 | content',
      '20240101010101-abc | Alpha',
      '20240101010102-def | Beta',
    ].join('\n'));
  });

  test('prints JSON when json mode is requested', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    printOutput({ ok: true }, { json: true });

    expect(logSpy).toHaveBeenCalledWith(`{
  "ok": true
}`);
    logSpy.mockRestore();
  });
});
