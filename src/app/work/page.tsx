import type { Metadata } from 'next';
import Image from 'next/image';
import { App } from '../../App';
import { projects } from '../../projects';

export const metadata: Metadata = {
  title: 'Work | Screen',
  description: 'Web products by Zaid.',
};

export default function WorkPage() {
  return (
    <App view="work">
      <section className="work-page" aria-labelledby="work-title">
        <div className="work-page-intro">
          <h1 id="work-title">My recent work</h1>
          <p>Web products I’ve built.</p>
        </div>
        <div className="work-grid">
          {projects.map((item) => (
            <article className="work-card" key={item.id}>
              <div className="work-card-heading"><span>{item.name}</span><span>Web product</span></div>
              <div className="work-card-image"><Image src={item.image} alt={item.imageAlt} fill sizes="(max-width: 760px) 100vw, 50vw" /></div>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </App>
  );
}
