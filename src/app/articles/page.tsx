import type { Metadata } from 'next';
import Image from 'next/image';
import { App } from '../../App';
import { getArticles, type Article } from '../../articles';

export const metadata: Metadata = {
  title: 'Articles | Screen',
  description: 'Writing by Zaid on products, video, and creative work.',
};

function articleDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}

function readingTime(article: Article) {
  return `${Math.max(1, Math.ceil(article.body.trim().split(/\s+/).length / 200))} min read`;
}

export default async function ArticlesPage() {
  const articles = await getArticles();
  const [featured, ...latest] = articles;

  return (
    <App view="articles">
      <section className="content-page articles-page" aria-labelledby="articles-title">
        <h1 id="articles-title">Articles</h1>
        <p className="page-lead">Notes on making web products, videos, and games.</p>
        {featured ? (
          <>
            <section className="article-featured" aria-labelledby="featured-heading">
              <h2 className="article-section-heading" id="featured-heading">Featured</h2>
              <div className={`article-featured-grid${featured.cover ? '' : ' without-cover'}`}>
                {featured.cover && (
                  <a className="article-featured-image" href={`/articles/${featured.slug}`} aria-label={`Read ${featured.title}`}>
                    <Image src={featured.cover} alt="" fill sizes="(max-width: 800px) 100vw, 55vw" />
                  </a>
                )}
                <div className="article-featured-copy">
                  <div className="article-meta">
                    {featured.date && <time dateTime={featured.date}>{articleDate(featured.date)}</time>}
                    {featured.category && <span className="article-category">{featured.category}</span>}
                  </div>
                  <h3><a href={`/articles/${featured.slug}`}>{featured.title}</a></h3>
                  <p>{featured.summary}</p>
                  <span className="article-reading-time">{readingTime(featured)}</span>
                  <a className="article-read-link" href={`/articles/${featured.slug}`}>Read article <span aria-hidden="true">→</span></a>
                </div>
              </div>
            </section>
            {latest.length > 0 && (
              <section className="article-latest" aria-labelledby="latest-heading">
                <h2 className="article-section-heading" id="latest-heading">Latest</h2>
                <div className="article-list">
                  {latest.map((article) => (
                    <a className="article-row" href={`/articles/${article.slug}`} key={article.slug}>
                      <span className="article-meta">
                        {article.date && <time dateTime={article.date}>{articleDate(article.date)}</time>}
                        {article.category && <span className="article-category">{article.category}</span>}
                      </span>
                      <span className="article-row-copy"><strong>{article.title}</strong><small>{article.summary}</small></span>
                      <span className="article-reading-time">{readingTime(article)}</span>
                      <span className="article-row-arrow" aria-hidden="true">→</span>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : <p className="articles-empty">No articles published yet.</p>}
      </section>
    </App>
  );
}
