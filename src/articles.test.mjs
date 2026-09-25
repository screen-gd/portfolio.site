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
