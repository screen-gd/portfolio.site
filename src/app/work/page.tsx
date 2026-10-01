import type { Metadata } from 'next';
import Image from 'next/image';
import { App } from '../../App';
import { projects } from '../../projects';
import { WorkShowcase } from '../../components/WorkShowcase';

export const metadata: Metadata = {
  title: 'Work | Screen',
  description: 'Web products and video editing by Zaid.',
  alternates: { canonical: '/work' },
};

export default function WorkPage() {
  return (
    <App view="work">
      <WorkShowcase>
        <div className="work-grid">
          {projects.map((item) => (
            <article className="work-card" key={item.id}>
              <div className="work-card-heading"><span>{item.name}</span><span>Web product</span></div>
              <div className="work-card-image"><Image src={item.image} alt={item.imageAlt} fill sizes="(max-width: 760px) 100vw, 50vw" /></div>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </WorkShowcase>
    </App>
  );
}
