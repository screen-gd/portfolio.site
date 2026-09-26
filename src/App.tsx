'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AnimatedThemeToggler } from './AnimatedThemeToggler';
import { FooterShader } from './FooterShader';
import { Signature } from '@/components/signature';
import { createSky, type SkyController } from './sky';
import { projects, type Project } from './projects';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function readTheme() {
  try {
    const saved = localStorage.getItem('sky-theme');
    if (saved) return saved === 'dark';
  } catch { /* Storage may be unavailable. */ }
  return matchMedia('(prefers-color-scheme: dark)').matches;
}

function SkyCanvas({ dark }: { dark: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const sky = useRef<SkyController>(null);

  useEffect(() => {
    if (!canvas.current) return;
    sky.current = createSky(canvas.current, dark ? 0 : 1);
    return () => {
      sky.current?.dispose();
      sky.current = null;
    };
  }, []);

  useEffect(() => sky.current?.setDay(dark ? 0 : 1), [dark]);

  return <canvas id="sky-canvas" ref={canvas} aria-hidden="true" />;
}

function ProjectMedia({ image, imageAlt, aspectRatio, video }: Pick<Project, 'image' | 'imageAlt' | 'aspectRatio' | 'video'>) {
  return (
    <div className="project-visual" style={{ aspectRatio }}>
      {video ? (
        <video src={video} poster={image} controls playsInline preload="none" aria-label={imageAlt} />
      ) : (
        <Image src={image} alt={imageAlt} fill sizes="(max-width: 800px) 100vw, 70vw" />
      )}
    </div>
  );
}

function HoverClip({ src, poster, title }: { src: string; poster: string; title: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const player = video.current;
    if (!player) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) player.pause();
    });
    observer.observe(player);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`hover-clip${playing ? ' is-playing' : ''}`}>
      <video
        ref={video}
        src={src}
        poster={poster}
        aria-label={title}
        controls
        playsInline
        loop
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onPointerEnter={(event) => {
          if (event.pointerType !== 'touch') void event.currentTarget.play().catch(() => {});
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== 'touch') event.currentTarget.pause();
        }}
      />
      <Image src={poster} alt="" fill sizes="(max-width: 800px) 220px, 340px" aria-hidden="true" />
    </div>
  );
}

const contactLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/zaid-ali-ansari/' },
  { label: 'X', href: 'https://x.com/Screeendev' },
  { label: 'Instagram', href: 'https://www.instagram.com/screen.dev/' },
];

function ContactButton() {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <motion.div
      className="hero-contact"
      ref={root}
      initial={false}
      animate={{ width: open ? 170 : 122 }}
      transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }}
    >
      <motion.div
        className="hero-contact-panel"
        initial={false}
        animate={{ height: open ? 178 : 44 }}
        transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }}
      >
        <button ref={trigger} type="button" aria-expanded={open} aria-controls="hero-contact-links" onClick={() => setOpen((value) => !value)}>
          Contact <span aria-hidden="true">↗</span>
        </button>
        <div className="hero-contact-links" id="hero-contact-links">
          <AnimatePresence initial={false}>
            {open && contactLinks.map((link, index) => (
              <motion.a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.2, delay: index * 0.05 }}
              >
                {link.label} <span aria-hidden="true">↗</span>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

const editingClips = [
  { title: 'Commerce & government', src: '/videos/commerce-and-government.mp4', poster: '/videos/commerce-and-government.jpg' },
  { title: 'Microwave Edit', src: '/videos/microwave-edit.mp4', poster: '/videos/microwave-edit.jpg' },
  { title: 'Moment of Inertia', src: '/videos/moment-of-inertia.mp4', poster: '/videos/moment-of-inertia.jpg' },
];

// Dia-inspired rising spectrum: https://www.arlan.me/vault/dia-gradient
const spectrumHeights = [90, 145, 225, 315, 405, 470, 510, 490, 435, 355, 265, 175, 105];


export function App({ view = 'home', children }: { view?: 'home' | 'work' | 'about' | 'articles' | 'article'; children?: ReactNode }) {
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeClip, setActiveClip] = useState(0);
  const page = useRef<HTMLElement>(null);
  const work = useRef<HTMLElement>(null);
  const footer = useRef<HTMLElement>(null);
  const footerSpectrum = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setDark(readTheme());
    const updateScroll = () => setScrolled(window.scrollY > 64);
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  useEffect(() => {
    const systemDark = matchMedia('(prefers-color-scheme: dark)');
    const syncSystemTheme = (event: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem('sky-theme')) return;
      } catch { /* Follow the system theme. */ }
      setDark(event.matches);
    };
    systemDark.addEventListener('change', syncSystemTheme);
    return () => systemDark.removeEventListener('change', syncSystemTheme);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({ anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  useGSAP(() => {
    if (!page.current || !work.current) return;
    const editingSection = page.current.querySelector<HTMLElement>('.editing');
    const workSection = work.current;

    if (!editingSection) return;

    ScrollTrigger.create({
      trigger: editingSection,
      start: 'top top',
      onEnter: () => editingSection.classList.add('is-covered'),
      onLeaveBack: () => editingSection.classList.remove('is-covered'),
    });

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const panels = workSection.querySelectorAll<HTMLElement>('.project');
    const sequence = gsap.timeline({
      scrollTrigger: {
        trigger: workSection,
        start: 'top top',
        end: () => `+=${Math.round((workSection.clientWidth * (panels.length - 1) + window.innerHeight * panels.length * 1.6) * 0.75)}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onEnter: () => workSection.classList.add('is-covered'),
        onLeaveBack: () => workSection.classList.remove('is-covered'),
      },
    });

    panels.forEach((panel, index) => {
      sequence
        .to({}, { duration: 0.4 })
        .fromTo(panel.querySelector('.project-copy'),
          { autoAlpha: 0, y: 32 },
          { autoAlpha: 1, y: 0, duration: 0.65 },
        )
        .to({}, { duration: 0.25 })
        .fromTo(panel.querySelector('.project-visual'),
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 0.7 },
        )
        .to({}, { duration: 0.55 });

      if (index < panels.length - 1) {
        sequence.to(panels, { xPercent: -100 * (index + 1), ease: 'none', duration: 1.2 });
      }
    });

  }, { scope: page });

  useGSAP(() => {
    if (!footer.current || !footerSpectrum.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(footerSpectrum.current,
      { scaleY: 0, transformOrigin: 'center bottom' },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: footer.current,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: 1,
        },
      },
    );
  }, { scope: page });

  const changeTheme = (next: boolean) => {
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    try { localStorage.setItem('sky-theme', next ? 'dark' : 'light'); } catch { /* Theme still changes. */ }
    setDark(next);
  };

  return (
    <>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <nav className="site-nav" aria-label="Main navigation">
          <a className="brand" href={view === 'home' ? '#top' : '/'}>Screen</a>
          <div className="nav-actions">
            <a href="/work" aria-current={view === 'work' ? 'page' : undefined}>Work</a>
            <a href="/about" aria-current={view === 'about' ? 'page' : undefined}>About</a>
            <a href="/articles" aria-current={view === 'articles' || view === 'article' ? 'page' : undefined}>Articles</a>
            <AnimatedThemeToggler dark={dark} onThemeChange={changeTheme} />
          </div>
        </nav>
      </header>

      <main className={`page page-${view}`} ref={page}>
        {view === 'home' && <>
        <section className="hero" id="top" aria-labelledby="hero-title">
          <SkyCanvas dark={dark} />
          <div className="sky-fallback" aria-hidden="true" />
          <div className="sky-edge-blur top" aria-hidden="true" />
          <div className="sky-edge-blur bottom" aria-hidden="true" />
          <div className="hero-layout">
            <div className="hero-bio">
              <span className="hero-greeting">Hey <span className="wave-emoji" role="img" aria-label="waving hand">👋</span>, I’m Zaid</span>
              <h1 id="hero-title">Product developer &amp;<br /> video editor.</h1>
              <p>
                I build{' '}
                <a className="preview-link" href="/work">
                  web products
                  <span className="logo-preview logo-preview-products" aria-hidden="true">
                    <span><Image src="/logos/linkr.png" alt="" width={120} height={41} /></span>
                    <span><Image src="/logos/relay.png" alt="" width={120} height={38} /></span>
                  </span>
                </a>
                {' '}that help people work faster and edit videos that grab attention. I also develop{' '}
                <a className="preview-link" href="https://znsstudios.com" target="_blank" rel="noopener noreferrer">
                  Games
                  <span className="logo-preview logo-preview-studios" aria-hidden="true">
                    <Image src="/logos/zns-studios-transparent.png" alt="" width={160} height={80} />
                  </span>
                </a>
                {' '}and run an{' '}
                <a className="preview-link" href="https://znsnexus.com" target="_blank" rel="noopener noreferrer">
                  Agency
                  <span className="logo-preview logo-preview-nexus" aria-hidden="true">
                    <Image src="/logos/zns-nexus.png" alt="" width={175} height={45} />
                  </span>
                </a>.
              </p>
              <div className="hero-signature" aria-hidden="true">
                <Signature text="Zaid" fontSize={16} color={dark ? '#fff' : '#000'} />
              </div>
              <div className="hero-actions">
                <ContactButton />
                <a href="/work">View my work <span aria-hidden="true">→</span></a>
              </div>
            </div>
          </div>
        </section>

        <section className="editing" id="editing" aria-labelledby="editing-title">
          <div className="project-content">
            <div className="project-copy">
              <h2 id="editing-title">Video editing</h2>
              <p>I mostly edit short-form videos, shaping footage through structure, pacing, and careful cuts.</p>
            </div>
            <div className="editing-carousel" aria-label="Edited videos">
              <div className="editing-phone">
                <div className="editing-stage">
                  <HoverClip key={editingClips[activeClip].src} {...editingClips[activeClip]} />
                </div>
              </div>
              <div className="editing-controls">
                <div>
                  <button type="button" aria-label="Previous video" onClick={() => setActiveClip((index) => (index + editingClips.length - 1) % editingClips.length)}>←</button>
                  <button type="button" aria-label="Next video" onClick={() => setActiveClip((index) => (index + 1) % editingClips.length)}>→</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="work" id="work" ref={work} aria-label="Selected work">
          <div className="project-track">
            {projects.map((project) => (
              <article className="project" id={project.id} key={project.id}>
                <div className="project-content">
                  <div className="project-copy">
                    <h2>{project.name}</h2>
                    <p>{project.description}</p>
                  </div>
                  <ProjectMedia image={project.image} imageAlt={project.imageAlt} aspectRatio={project.aspectRatio} video={project.video} />
                </div>
              </article>
            ))}
          </div>
        </section>
        </>}
        {view !== 'home' && children}
        <footer className="site-footer" id="contact" ref={footer}>
          <svg ref={footerSpectrum} className="footer-spectrum" viewBox="0 0 1300 520" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="footer-spectrum-colors" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="#102b57" />
                <stop offset="0.23" stopColor="#2868bb" />
                <stop offset="0.48" stopColor="#7bb7e8" />
                <stop offset="0.7" stopColor="#adc9ef" />
                <stop offset="0.88" stopColor="#c2b5eb" />
                <stop offset="1" stopColor="#e7dcf8" stopOpacity="0" />
              </linearGradient>
              <filter id="footer-spectrum-blur" x="-10%" y="-20%" width="120%" height="140%">
                <feGaussianBlur stdDeviation="14" />
              </filter>
            </defs>
            <g filter="url(#footer-spectrum-blur)">
              {spectrumHeights.map((height, index) => (
                <rect key={index} x={index * 100} y={520 - height} width="112" height={height} fill="url(#footer-spectrum-colors)" />
              ))}
            </g>
          </svg>
          <div className="footer-panel">
            <FooterShader dark={dark} />
            <div className="footer-intro">
              <h2>Let’s connect</h2>
              <p>Have a web product in mind or a short-form video to edit? Get in touch.</p>
              <div className="footer-actions">
                <a className="footer-contact" href="https://x.com/Screeendev" target="_blank" rel="noopener noreferrer" aria-label="Contact Screen on X, @Screeendev">
                  <span aria-hidden="true">𝕏</span>
                  <span className="footer-contact-label" aria-hidden="true"><span>Contact</span><span>@Screeendev</span></span>
                </a>
                <a className="footer-projects" href="/work">See projects <span aria-hidden="true">→</span></a>
              </div>
            </div>
            <div className="footer-links">
              <div className="footer-socials" aria-label="Social profiles">
                <a href="https://www.linkedin.com/in/zaid-ali-ansari/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">in</a>
                <a href="https://x.com/Screeendev" target="_blank" rel="noopener noreferrer" aria-label="X">𝕏</a>
                <a href="https://www.instagram.com/screen.dev/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              </div>
              <p>© {new Date().getFullYear()} Screen</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
