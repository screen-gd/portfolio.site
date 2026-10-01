import { siteUrl } from '../site';

export function Breadcrumbs({ items }: { items: readonly { label: string; href: string }[] }) {
  const crumbs = [{ label: 'Home', href: '/' }, ...items];
  const schema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem', position: index + 1, name: crumb.label, item: `${siteUrl}${crumb.href}`,
    })),
  };
  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>{crumbs.map((crumb, index) => (
          <li key={crumb.href}>{index === crumbs.length - 1
            ? <span aria-current="page">{crumb.label}</span>
            : <a href={crumb.href}>{crumb.label}</a>}</li>
        ))}</ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    </>
  );
}
