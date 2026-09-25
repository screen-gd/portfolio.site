import type { Metadata } from 'next';
import Image from 'next/image';
import { App } from '../../App';
import { AboutFan } from '../../AboutFan';
import { AboutShader } from '../../AboutShader';
import { StackGravity } from '../../StackGravity';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';

export const metadata: Metadata = {
  title: 'About | Screen',
  description: 'Zaid’s work, experience, education, and tools.',
};

export default function AboutPage() {
  return (
    <App view="about">
      <section className="about-page" aria-labelledby="about-title">
        <div className="about-stage"><AboutShader /><AboutFan /></div>

        <div className="about-column">
          <Card className="about-bio">
            <h1 id="about-title">Hello! I’m <span>Zaid.</span></h1>
            <p>I’m a <strong>product developer and video editor</strong> with a background in design. I build web products that help people work faster and edit videos that grab attention.</p>
            <p>I currently edit videos at <strong>Work Smart Tutorials</strong>. I’m also the COO and co-founder of{' '}
              <a className="preview-link" href="https://znsstudios.com" target="_blank" rel="noopener noreferrer">
                ZNS Studios
                <span className="logo-preview logo-preview-studios" aria-hidden="true">
                  <Image src="/logos/zns-studios-transparent.png" alt="" width={160} height={80} />
                </span>
              </a>{' '}and{' '}
              <a className="preview-link" href="https://znsnexus.com" target="_blank" rel="noopener noreferrer">
                ZNS Nexus
                <span className="logo-preview logo-preview-nexus" aria-hidden="true">
                  <Image src="/logos/zns-nexus.png" alt="" width={175} height={45} />
                </span>
              </a>, where I develop games and run agency work.
            </p>
          </Card>

          <section className="about-group" aria-labelledby="experience-title">
            <h2 id="experience-title">Experience</h2>
            <div className="about-box">
              <Card className="about-row">
                <span className="about-monogram about-logo-wst" aria-hidden="true"><Image src="/logos/work-smart-tutorials.png" alt="" fill sizes="48px" /></span>
                <span className="about-row-copy"><strong>Work Smart Tutorials</strong><span>Video editor <b aria-hidden="true">·</b> April 2025 to present</span></span>
              </Card>
              <Card className="about-row">
                <span className="about-monogram about-logo-studios" aria-hidden="true"><Image src="/logos/zns-studios-transparent.png" alt="" fill sizes="48px" /></span>
                <span className="about-row-copy"><strong>ZNS Studios &amp; ZNS Nexus</strong><span>COO and co-founder <b aria-hidden="true">·</b> Since September 3, 2025</span></span>
              </Card>
            </div>
          </section>

          <section className="about-group" aria-labelledby="education-title">
            <h2 id="education-title">Education</h2>
            <div className="about-box">
              <Card className="about-row">
                <span className="about-monogram" aria-hidden="true">S</span>
                <span className="about-row-copy"><strong>St. Anthony High School &amp; Junior College of Arts, Commerce &amp; Science</strong><span>12th HSC <b aria-hidden="true">·</b> Mumbai, Maharashtra</span></span>
              </Card>
            </div>
          </section>

          <section className="about-group" aria-labelledby="what-title">
            <h2 id="what-title">What I do</h2>
            <div className="about-box about-tags">
              <Badge>Web products</Badge><Badge>Video editing</Badge><Badge>Game development</Badge><Badge>Agency</Badge>
            </div>
          </section>

          <section className="about-group" aria-labelledby="stack-title">
            <h2 id="stack-title">Stack</h2>
            <Card className="about-box about-stack">
              <StackGravity />
            </Card>
          </section>
        </div>
      </section>
    </App>
  );
}
