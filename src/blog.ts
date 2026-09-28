import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';

const postDirectory = path.join(process.cwd(), 'content', 'blog');
const metadataKeys = ['title', 'date', 'category', 'cover'];

export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  date?: string;
  category?: string;
  cover?: string;
};

// Section headings get ids so they can be linked to directly.
export function headingId(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function postDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}

export function readingTime(post: BlogPost) {
  return `${Math.max(1, Math.ceil(post.body.trim().split(/\s+/).length / 200))} min read`;
}

// Frontmatter is YAML (the /admin editor writes it). The title can live there or in a leading # heading.
export function parseBlogPost(filename: string, source: string): BlogPost {
  let markdown = source.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const metadata: Record<string, string> = {};
  if (markdown.startsWith('---\n')) {
    const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
    if (!frontmatter) throw new Error(`${filename} has unclosed frontmatter`);
    const values = parse(frontmatter[1]) ?? {};
    if (typeof values !== 'object' || Array.isArray(values)) throw new Error(`${filename} has invalid frontmatter`);
    for (const [key, value] of Object.entries(values)) {
      if (!metadataKeys.includes(key)) throw new Error(`${filename} has invalid frontmatter: ${key}`);
      if (value === null || value === '') continue;
      metadata[key] = value instanceof Date ? value.toISOString().slice(0, 10) : String(value).trim();
    }
    if (metadata.date) {
      const parsedDate = Date.parse(metadata.date);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.date) || Number.isNaN(parsedDate) || new Date(parsedDate).toISOString().slice(0, 10) !== metadata.date) {
        throw new Error(`${filename} has an invalid date`);
      }
    }
    markdown = markdown.slice(frontmatter[0].length).trimStart();
  }

  let { title } = metadata;
  if (markdown.startsWith('# ')) {
    const [heading, ...lines] = markdown.split('\n');
    title ||= heading.slice(2).trim();
    markdown = lines.join('\n');
  }
  if (!title) throw new Error(`${filename} needs a title`);

  const body = markdown.trim();
  const summary = body.split(/\n\s*\n/)[0].replace(/\s+/g, ' ').trim();
  if (!summary) throw new Error(`${filename} needs an opening paragraph`);

  return { slug: filename.slice(0, -3), summary, body, ...metadata, title };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const filenames = (await readdir(postDirectory)).filter((name) => name.endsWith('.md'));
  const posts = await Promise.all(filenames.map(async (filename) => {
    const source = await readFile(path.join(postDirectory, filename), 'utf8');
    return parseBlogPost(filename, source);
  }));

  return posts.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.title.localeCompare(b.title));
}
