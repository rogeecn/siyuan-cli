import { Command } from 'commander';
import type { SearchService, SearchResult } from '../services/search.js';

interface SearchOptions {
  content?: string;
  filename?: string;
  tag?: string;
  limit?: string;
  json?: boolean;
}

type SearchServiceFactory = () => SearchService;

function requireCriteria(options: SearchOptions) {
  if (options.content?.trim() || options.filename?.trim() || options.tag?.trim()) {
    return;
  }

  throw new Error('At least one of --content, --filename, or --tag is required');
}

function parseLimit(value?: string) {
  if (value === undefined) {
    return 10;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('--limit must be a positive integer');
  }

  return parsed;
}

function formatSearchResults(results: SearchResult[]) {
  if (results.length === 0) {
    return 'No results found.';
  }

  return results
    .map((result, index) => {
      const lines = [`${index + 1}. ${result.title}`, `   ${result.path}`];

      if (result.snippet) {
        lines.push(`   ${result.snippet}`);
      }

      if (result.tags.length > 0) {
        lines.push(`   tags: ${result.tags.join(', ')}`);
      }

      return lines.join('\n');
    })
    .join('\n\n');
}

export function createSearchCommand(createService: SearchServiceFactory) {
  return new Command('search')
    .description('Search notes by content, filename, or tag')
    .option('--content <text>', 'Search note content')
    .option('--filename <text>', 'Search document titles or paths')
    .option('--tag <tag>', 'Search notes with a tag')
    .option('--limit <number>', 'Limit number of results', '10')
    .option('--json', 'Print raw JSON output')
    .action(async (options: SearchOptions) => {
      requireCriteria(options);

      const results = await createService().search({
        content: options.content,
        filename: options.filename,
        tag: options.tag,
        limit: parseLimit(options.limit),
      });

      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
        return;
      }

      console.log(formatSearchResults(results));
    });
}
