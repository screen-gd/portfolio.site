import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Children, isValidElement, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import { App } from '../../../App';
import { TweetLink } from '../../../TweetLink';
import { getBlogPosts, headingId, postDate, readingTime } from '../../../blog';
import { getTweets, type Tweet } from '../../../tweets';
import { Breadcrumbs } from '../../../components/Breadcrumbs';

type Props = { params: Promise<{ slug: string }> };

function textOf(node: ReactNode): string {
  return Children.toArray(node).map((child) => (
    typeof child === 'string' || typeof child === 'number' ? String(child)
      : isValidElement<{ children?: ReactNode }>(child) ? textOf(child.props.children) : ''
  )).join('');
}

function markdownComponents(tweets: Map<string, Tweet>): Components {
  return {
    h2: ({ children }) => <h2 id={headingId(textOf(children))}>{children}</h2>,
    a: ({ href = '', children }) => {
      const tweet = tweets.get(href);
      if (tweet) return <TweetLink tweet={tweet}>{children}</TweetLink>;
      return /^https?:\/\//.test(href) ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> : <a href={href}>{children}</a>;
    },
  };
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  // Static export needs one path before the first post is published.
  return posts.length ? posts.map(({ slug }) => ({ slug })) : [{ slug: '__empty__' }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getBlogPosts()).find((entry) => entry.slug === slug);
  return post ? {
    title: `${post.title} | Screen`, description: post.summary,
    alternates: { canonical: `/blog/${post.slug}` },
  } : {};
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = (await getBlogPosts()).find((entry) => entry.slug === slug);
  if (!post) notFound();
  const tweets = await getTweets(post.body);

  return (
    <App view="post">
      <article className="content-page post-page">
        <Breadcrumbs items={[{ label: 'Blog', href: '/blog' }, { label: post.title, href: `/blog/${post.slug}` }]} />
        <header className="post-header">
          <a className="back-link" href="/blog"><span className="back-arrow" aria-hidden="true" />Blog</a>
          <div className="article-meta">
            {post.date && <time dateTime={post.date}>{postDate(post.date)}</time>}
            {post.category && <span className="article-category">{post.category}</span>}
            <span className="article-reading-time">{readingTime(post)}</span>
          </div>
          <h1>{post.title}</h1>
        </header>
        <hr className="post-divider" />
        <div className="article-body"><ReactMarkdown components={markdownComponents(tweets)}>{post.body}</ReactMarkdown></div>
        <aside className="post-author">Written by <a href="/about">Zaid</a>, product developer and video editor.</aside>
      </article>
    </App>
  );
}
