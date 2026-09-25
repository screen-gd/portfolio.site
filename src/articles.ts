import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const articleDirectory = path.join(process.cwd(), 'content', 'articles');

export type Article = {
  slug: string;
  title: string;
  summary: string;
  body: string;
};

// Each Markdown file starts with a title heading and a short opening paragraph.
export function parseArticle(filename: string, source: string): Article {
  const [heading, ...lines] = source.replace(/^\uFEFF/, '').split(/\r?\n/);
  if (!heading.startsWith('# ') || !heading.slice(2).trim()) throw new Error(`${filename} must start with a # title`);

  const body = lines.join('\n').trim();
  const summary = body.split(/\n\s*\n/)[0].replace(/\s+/g, ' ').trim();
  if (!summary) throw new Error(`${filename} needs an opening paragraph`);

  return { slug: filename.slice(0, -3), title: heading.slice(2).trim(), summary, body };
}

export async function getArticles(): Promise<Article[]> {
  const filenames = (await readdir(articleDirectory)).filter((name) => name.endsWith('.md'));
  const articles = await Promise.all(filenames.map(async (filename) => {
    const source = await readFile(path.join(articleDirectory, filename), 'utf8');
    return parseArticle(filename, source);
  }));

  return articles.sort((a, b) => a.title.localeCompare(b.title));
}
