import assert from 'node:assert/strict';
import test from 'node:test';
import { parseArticle } from './articles.ts';

test('a Markdown article has a title, list summary, body, and URL slug', () => {
  const article = parseArticle('first-post.md', '# First post\n\nOpening summary.\n\n## Details\n\nMore text.');
  assert.equal(article.slug, 'first-post');
  assert.equal(article.title, 'First post');
  assert.equal(article.summary, 'Opening summary.');
  assert.match(article.body, /## Details/);
});

test('article frontmatter supplies listing metadata without appearing in the body', () => {
  const article = parseArticle('post.md', '---\ndate: 2026-09-26\ncategory: Design\ncover: /articles/desk.jpg\n---\n# Post\n\nOpening summary.\n\nMore text.');
  assert.equal(article.date, '2026-09-26');
  assert.equal(article.category, 'Design');
  assert.equal(article.cover, '/articles/desk.jpg');
  assert.equal(article.summary, 'Opening summary.');
  assert.doesNotMatch(article.body, /category:/);
});
