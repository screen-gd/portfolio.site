import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const articleDirectory = path.join(process.cwd(), 'content', 'articles');

export type Article = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  date?: string;
  category?: string;
  cover?: string;
};

// Optional frontmatter adds listing metadata before the title heading.
export function parseArticle(filename: string, source: string): Article {
  let markdown = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const metadata: Pick<Article, 'date' | 'category' | 'cover'> = {};
  if (markdown.startsWith('---\n')) {
    const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---\n/);
    if (!frontmatter) throw new Error(`${filename} has unclosed frontmatter`);
    for (const line of frontmatter[1].split('\n')) {
      const match = line.match(/^(date|category|cover):\s*(.+)$/);
      if (!match) throw new Error(`${filename} has invalid frontmatter: ${line}`);
      const [, key, value] = match;
      if (key === 'date') {
        const parsedDate = Date.parse(value);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(parsedDate) || new Date(parsedDate).toISOString().slice(0, 10) !== value) {
          throw new Error(`${filename} has an invalid date`);
        }
        metadata.date = value;
      } else if (key === 'category') metadata.category = value;
      else metadata.cover = value;
    }
    markdown = markdown.slice(frontmatter[0].length).trimStart();
  }

  const [heading, ...lines] = markdown.split('\n');
  if (!heading.startsWith('# ') || !heading.slice(2).trim()) throw new Error(`${filename} must start with a # title`);

  const body = lines.join('\n').trim();
  const summary = body.split(/\n\s*\n/)[0].replace(/\s+/g, ' ').trim();
  if (!summary) throw new Error(`${filename} needs an opening paragraph`);

  return { slug: filename.slice(0, -3), title: heading.slice(2).trim(), summary, body, ...metadata };
}

export async function getArticles(): Promise<Article[]> {
  const filenames = (await readdir(articleDirectory)).filter((name) => name.endsWith('.md'));
  const articles = await Promise.all(filenames.map(async (filename) => {
    const source = await readFile(path.join(articleDirectory, filename), 'utf8');
    return parseArticle(filename, source);
  }));

  return articles.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.title.localeCompare(b.title));
}
