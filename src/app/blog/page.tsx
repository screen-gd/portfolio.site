import type { Metadata } from 'next';
import Image from 'next/image';
import { App } from '../../App';
import { getBlogPosts, postDate, readingTime } from '../../blog';

export const metadata: Metadata = {
  title: 'Blog | Screen',
  description: 'Writing by Zaid on products, video, and creative work.',
};

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const [featured, ...latest] = posts;

  return (
    <App view="blog">
      <section className="content-page articles-page" aria-labelledby="blog-title">
        <h1 id="blog-title">Blog</h1>
        <p className="page-lead">Notes on making web products, videos, and games.</p>
        {featured ? (
          <>
            <section className="article-featured" aria-labelledby="featured-heading">
              <h2 className="article-section-heading" id="featured-heading">Featured</h2>
              <div className={`article-featured-grid${featured.cover ? '' : ' without-cover'}`}>
                {featured.cover && (
                  <a className="article-featured-image" href={`/blog/${featured.slug}`} aria-label={`Read ${featured.title}`}>
                    <Image src={featured.cover} alt="" fill sizes="(max-width: 800px) 100vw, 55vw" />
                  </a>
                )}
                <div className="article-featured-copy">
                  <div className="article-meta">
                    {featured.date && <time dateTime={featured.date}>{postDate(featured.date)}</time>}
                    {featured.category && <span className="article-category">{featured.category}</span>}
                  </div>
                  <h3><a href={`/blog/${featured.slug}`}>{featured.title}</a></h3>
                  <p>{featured.summary}</p>
                  <span className="article-reading-time">{readingTime(featured)}</span>
                  <a className="article-read-link" href={`/blog/${featured.slug}`}>Read post <span aria-hidden="true">→</span></a>
                </div>
              </div>
            </section>
            {latest.length > 0 && (
              <section className="article-latest" aria-labelledby="latest-heading">
                <h2 className="article-section-heading" id="latest-heading">Latest</h2>
                <div className="article-list">
                  {latest.map((post) => (
                    <a className="article-row" href={`/blog/${post.slug}`} key={post.slug}>
                      <span className="article-meta">
                        {post.date && <time dateTime={post.date}>{postDate(post.date)}</time>}
                        {post.category && <span className="article-category">{post.category}</span>}
                      </span>
                      <span className="article-row-copy"><strong>{post.title}</strong><small>{post.summary}</small></span>
                      <span className="article-reading-time">{readingTime(post)}</span>
                      <span className="article-row-arrow" aria-hidden="true">→</span>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : <p className="articles-empty">No blog posts published yet.</p>}
      </section>
    </App>
  );
}
