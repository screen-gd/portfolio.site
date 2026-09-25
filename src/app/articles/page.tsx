import type { Metadata } from 'next';
import { App } from '../../App';
import { getArticles } from '../../articles';

export const metadata: Metadata = {
  title: 'Articles | Screen',
  description: 'Writing by Zaid on products, video, and creative work.',
};

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <App view="articles">
      <section className="content-page articles-page" aria-labelledby="articles-title">
        <h1 id="articles-title">Articles</h1>
        <p className="page-lead">Notes on making web products, videos, and games.</p>
        {articles.length ? (
          <div className="article-list">
            {articles.map((article) => (
              <a href={`/articles/${article.slug}`} key={article.slug}>
                <span><strong>{article.title}</strong><small>{article.summary}</small></span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        ) : <p className="articles-empty">No articles published yet.</p>}
      </section>
    </App>
  );
}
