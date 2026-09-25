import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { App } from '../../../App';
import { getArticles } from '../../../articles';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const articles = await getArticles();
  // Static export needs one path before the first article is published.
  return articles.length ? articles.map(({ slug }) => ({ slug })) : [{ slug: '__empty__' }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = (await getArticles()).find((entry) => entry.slug === slug);
  return article ? { title: `${article.title} | Screen`, description: article.summary } : {};
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = (await getArticles()).find((entry) => entry.slug === slug);
  if (!article) notFound();

  return (
    <App view="article">
      <article className="content-page article-page">
        <a className="back-link" href="/articles">← Articles</a>
        <h1>{article.title}</h1>
        <div className="article-body"><ReactMarkdown>{article.body}</ReactMarkdown></div>
      </article>
    </App>
  );
}
