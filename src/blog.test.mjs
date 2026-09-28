import assert from 'node:assert/strict';
import test from 'node:test';
import { parseBlogPost } from './blog.ts';

test('a Markdown blog post has a title, list summary, body, and URL slug', () => {
  const post = parseBlogPost('first-post.md', '# First post\n\nOpening summary.\n\n## Details\n\nMore text.');
  assert.equal(post.slug, 'first-post');
  assert.equal(post.title, 'First post');
  assert.equal(post.summary, 'Opening summary.');
  assert.match(post.body, /## Details/);
});

test('blog post frontmatter supplies listing metadata without appearing in the body', () => {
  const post = parseBlogPost('post.md', '---\ndate: 2026-09-26\ncategory: Design\ncover: /blog/desk.jpg\n---\n# Post\n\nOpening summary.\n\nMore text.');
  assert.equal(post.date, '2026-09-26');
  assert.equal(post.category, 'Design');
  assert.equal(post.cover, '/blog/desk.jpg');
  assert.equal(post.summary, 'Opening summary.');
  assert.doesNotMatch(post.body, /category:/);
});

test('the editor writes the title into frontmatter', () => {
  const post = parseBlogPost('post.md', "---\ntitle: '\"Quoted\" title'\ndate: 2026-09-29\ncategory: ''\n---\n\nOpening summary.\n\n## First section\n\nMore text.");
  assert.equal(post.title, '"Quoted" title');
  assert.equal(post.date, '2026-09-29');
  assert.equal(post.category, undefined);
  assert.equal(post.summary, 'Opening summary.');
});
