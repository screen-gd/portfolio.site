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
import ElasticSlider from './components/ElasticSlider/ElasticSlider';
import useEmblaCarousel from 'embla-carousel-react';
import { createSky, type SkyController } from './sky';
import { projects, type Project } from './projects';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// dark is null until the theme is read, so the sky starts in the right state instead of animating to it.
function SkyCanvas({ dark }: { dark: boolean | null }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const sky = useRef<SkyController>(null);

  useEffect(() => () => {
    sky.current?.dispose();
    sky.current = null;
  }, []);

  useEffect(() => {
    if (dark === null || !canvas.current) return;
    if (sky.current) sky.current.setDay(dark ? 0 : 1);
    else sky.current = createSky(canvas.current, dark ? 0 : 1);
  }, [dark]);

  return <canvas id="sky-canvas" ref={canvas} aria-hidden="true" />;
}

function ProjectMedia({ image, imageAlt, aspectRatio, video }: Pick<Project, 'image' | 'imageAlt' | 'aspectRatio' | 'video'>) {
  return (
    <div className="project-visual" style={{ aspectRatio, maxWidth: `min(1480px, calc((100svh - 320px) * ${aspectRatio}))` }}>
      {video ? (
        <video src={video} poster={image} controls playsInline preload="none" aria-label={imageAlt} />
      ) : (
        <Image src={image} alt={imageAlt} fill sizes="(max-width: 800px) 90vw, 1480px" />
      )}
    </div>
  );
}

function HoverClip({ src, poster, title, volume, active = true, onSelect }: { src: string; poster: string; title: string; volume: number; active?: boolean; onSelect?: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const audio = useRef<{ context: AudioContext; gain: GainNode } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    const player = video.current;
    if (!player) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio < 0.5) player.pause();
    }, { threshold: 0.5 });
    observer.observe(player);
    return () => {
      observer.disconnect();
      player.pause();
      if (audio.current) void audio.current.context.close();
    };
  }, []);

  useEffect(() => {
    if (audio.current) audio.current.gain.gain.value = volume / 100;
    else if (video.current) video.current.volume = volume / 100;
    if (video.current) video.current.muted = !soundEnabled || volume === 0;
  }, [volume, soundEnabled]);

  useEffect(() => {
    if (!active) video.current?.pause();
  }, [active]);

  const togglePlayback = () => {
    if (!active) {
      onSelect?.();
      return;
    }
    const player = video.current;
    if (!player) return;
    if (!player.paused && (!player.muted || (audio.current && volume === 0))) {
      player.pause();
      return;
    }
    // A gain node makes the volume slider work on iOS, which ignores media.volume.
    if (!audio.current) {
      const context = new AudioContext();
      const gain = context.createGain();
      context.createMediaElementSource(player).connect(gain).connect(context.destination);
      audio.current = { context, gain };
      player.volume = 1;
    }
    audio.current.gain.gain.value = volume / 100;
    player.muted = volume === 0;
    setSoundEnabled(true);
    void audio.current.context.resume().catch(() => {});
    void player.play().catch(() => {});
  };

  return (
    <div className={`hover-clip${playing ? ' is-playing' : ''}`}>
      <video
        ref={video}
        src={src}
        poster={poster}
        aria-label={title}
        playsInline
        loop
        muted={!soundEnabled || volume === 0}
        preload="metadata"
        onPlay={(event) => {
          setPlaying(true);
          event.currentTarget.closest('.editing-track')?.querySelectorAll('video').forEach((other) => {
            if (other !== event.currentTarget) other.pause();
          });
        }}
        onPause={() => setPlaying(false)}
      />
      <Image src={poster} alt="" fill sizes="(max-width: 800px) 220px, 340px" aria-hidden="true" />
      <div
        className="editing-play"
        role="button"
        tabIndex={active ? 0 : -1}
        aria-label={`${!active ? 'Show' : playing && !soundEnabled ? 'Enable audio for' : playing ? 'Pause' : 'Play'} ${title}`}
        onClick={togglePlayback}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            togglePlayback();
          }
        }}
        onPointerEnter={(event) => {
          if (active && event.pointerType !== 'touch') {
            const player = video.current;
            if (!player) return;
            player.muted = volume === 0;
            setSoundEnabled(true);
            if (audio.current) void audio.current.context.resume().catch(() => {});
            void player.play().catch(() => {
              player.muted = true;
              setSoundEnabled(false);
              void player.play().catch(() => {});
            });
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== 'touch') video.current?.pause();
        }}
      >
        {active && !playing && <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>}
      </div>
    </div>
  );
}

const contactEmail = 'contact@screeen.us.ci';

const contactLinks = [
  { label: 'Email', href: `mailto:${contactEmail}` },
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
        animate={{ height: open ? 218 : 44 }}
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
  { title: 'Moment of Inertia', src: '/videos/moment-of-inertia.mp4', poster: '/videos/moment-of-inertia.jpg' },
  { title: 'Fatty liver', src: '/videos/fatty-liver.mp4', poster: '/videos/fatty-liver.jpg' },
  { title: 'Dal Lake', src: '/videos/dal-lake.mp4', poster: '/videos/dal-lake.jpg' },
  { title: 'Commerce & government', src: '/videos/commerce-and-government.mp4', poster: '/videos/commerce-and-government.jpg' },
  { title: 'Microwave Edit', src: '/videos/microwave-edit.mp4', poster: '/videos/microwave-edit.jpg' },
];

export function EditingCarousel() {
  const [volume, setVolume] = useState(50);
  const [carouselRef, carousel] = useEmblaCarousel({
    loop: false,
    startIndex: 0,
    breakpoints: { '(prefers-reduced-motion: reduce)': { duration: 0 } },
  });

  return (
    <div className="editing-showcase">
      <ElasticSlider
        className="editing-volume"
        defaultValue={50}
        isStepped
        onValueChange={setVolume}
        leftIcon={<VolumeIcon />}
        rightIcon={<VolumeIcon loud />}
      />
      <div
        className="editing-carousel"
        ref={carouselRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Edited videos. Swipe or drag to browse."
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            if (event.key === 'ArrowLeft') carousel?.scrollPrev();
            else carousel?.scrollNext();
          }
        }}
      >
        <div className="editing-track">
          {editingClips.map((clip, index) => (
            <div className="editing-slide" key={clip.src} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${editingClips.length}`}>
              <div className="editing-slide-content">
                <div className="editing-phone">
                  <div className="editing-stage"><HoverClip {...clip} volume={volume} /></div>
                </div>
                <strong className="editing-caption">{clip.title}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="editing-controls" role="group" aria-label="Video navigation">
        <button type="button" aria-label="Previous video" disabled={!carousel} onClick={() => carousel?.scrollPrev()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m10 6-6 6 6 6M4 12h16" /></svg>
        </button>
        <button type="button" aria-label="Next video" disabled={!carousel} onClick={() => carousel?.scrollNext()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6 6 6-6 6M20 12H4" /></svg>
        </button>
      </div>
    </div>
  );
}

function VolumeIcon({ loud = false }: { loud?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4z" />
    <path d="M15 8a6 6 0 0 1 0 8" />
    {loud && <path d="M18 5a10 10 0 0 1 0 14" />}
  </svg>;
}

// Dia-inspired rising spectrum: https://www.arlan.me/vault/dia-gradient
const spectrumHeights = [90, 145, 225, 315, 405, 470, 510, 490, 435, 355, 265, 175, 105];


export function App({ view = 'home', children }: { view?: 'home' | 'work' | 'about' | 'blog' | 'post' | 'not-found'; children?: ReactNode }) {
  // null until the theme set by the layout's head script is read.
  const [dark, setDark] = useState<boolean | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const reducedMotion = useReducedMotion();
  const page = useRef<HTMLElement>(null);
  const work = useRef<HTMLElement>(null);
  const footer = useRef<HTMLElement>(null);
  const footerSpectrum = useRef<SVGSVGElement>(null);
  const smoothScroll = useRef<Lenis | null>(null);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === 'dark');
    const updateScroll = () => setScrolled(window.scrollY > 64);
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  useEffect(() => {
    const systemDark = matchMedia('(prefers-color-scheme: dark)');
    const syncSystemTheme = (event: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem('sky-theme')) return;
      } catch { /* Follow the system theme. */ }
      document.documentElement.dataset.theme = event.matches ? 'dark' : 'light';
      setDark(event.matches);
    };
    systemDark.addEventListener('change', syncSystemTheme);
    return () => systemDark.removeEventListener('change', syncSystemTheme);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({ anchors: true });
    smoothScroll.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      smoothScroll.current = null;
    };
  }, []);

  useGSAP(() => {
    if (!page.current || !work.current) return;
    const editingSection = page.current.querySelector<HTMLElement>('.editing');
    const workSection = work.current;

    if (!editingSection) return;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const intro = editingSection.querySelector<HTMLElement>('.work-intro');
    const editingHeading = editingSection.querySelector<HTMLElement>('.editing-heading');
    const editingContent = editingSection.querySelector<HTMLElement>('.video-content');
    const videoRow = editingContent?.querySelector<HTMLElement>('.editing-showcase');
    if (!intro || !editingHeading || !editingContent || !videoRow) return;

    editingSection.classList.add('is-sequenced');
    const panels = Array.from(workSection.querySelectorAll<HTMLElement>('.project'));
    const stages = [intro, editingContent, ...panels];
    gsap.set(stages, { autoAlpha: 0 });
    gsap.set(videoRow, { autoAlpha: 0, y: 32 });
    stages.forEach((stage) => { stage.inert = true; });
    let visibleStage = -1;

    const sequence = gsap.timeline({
      scrollTrigger: {
        trigger: editingSection,
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * (2.9 + panels.length * 1.4))}`,
        pin: true,
        scrub: 0.3,
        invalidateOnRefresh: true,
        onUpdate: (trigger) => {
          if (trigger.direction >= 0 || !trigger.isActive) return;
          // Backward scrolling skips the pinned sequence instead of replaying it.
          trigger.getTween()?.pause();
          trigger.animation?.progress(0);
          const top = Math.max(0, trigger.start - 1);
          if (smoothScroll.current) smoothScroll.current.scrollTo(top, { immediate: true, force: true });
          else window.scrollTo({ top, behavior: 'instant' });
        },
      },
      onUpdate: () => {
        const nextStage = stages.findIndex((stage) => Number(gsap.getProperty(stage, 'opacity')) >= 0.5);
        if (visibleStage === nextStage) return;
        visibleStage = nextStage;
        stages.forEach((stage, index) => {
          stage.inert = index !== nextStage;
          if (stage.inert) stage.querySelectorAll('video').forEach((video) => video.pause());
        });
      },
    })
      .to(intro, { autoAlpha: 1, duration: 0.1 })
      .fromTo(intro.querySelector('h2'),
        { opacity: 0.1, filter: 'blur(12px)', y: 16 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.6, ease: 'none' },
      )
      .to({}, { duration: 0.8 })
      .to(intro, { autoAlpha: 0, y: -16, filter: 'blur(8px)', duration: 0.3 })
      .to(editingContent, { autoAlpha: 1, duration: 0.2 })
      .fromTo(editingHeading.querySelector('h2'),
        { opacity: 0.1, filter: 'blur(12px)', y: 16 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.6, ease: 'none' }, '<',
      )
      .to({}, { duration: 0.8 })
      .to(videoRow, { autoAlpha: 1, y: 0, duration: 0.35 })
      .to({}, { duration: 2.4 })
      .to(editingContent, { x: () => -window.innerWidth, autoAlpha: 0, duration: 0.7, ease: 'none' });

    panels.forEach((panel, index) => {
      sequence
        .to(panel, { autoAlpha: 1, duration: 0.1 })
        .fromTo(panel.querySelector('.project-copy'),
          { autoAlpha: 0, y: 32, filter: 'blur(8px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.65, ease: 'none' },
        )
        .fromTo(panel.querySelector('.project-visual'),
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: 'none' },
        )
        .to({}, { duration: 1 });

      if (index < panels.length - 1) {
        sequence
          .set(panels[index + 1], { autoAlpha: 1 })
          .to(panels, { xPercent: -100 * (index + 1), duration: 1.2, ease: 'none' })
          .set(panel, { autoAlpha: 0 });
      } else {
        sequence.to(panel, { autoAlpha: 0, duration: 0.4 });
      }
    });

    return () => {
      stages.forEach((stage) => { stage.inert = false; });
      editingSection.classList.remove('is-sequenced');
    };
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
            <a href="/blog" aria-current={view === 'blog' || view === 'post' ? 'page' : undefined}>Blog</a>
            <AnimatedThemeToggler dark={dark ?? false} onThemeChange={changeTheme} />
          </div>
        </nav>
      </header>

      <main className={`page page-${view}`} ref={page}>
        {view === 'not-found' && (
          <section className="hero not-found-hero" aria-labelledby="not-found-title">
            <SkyCanvas dark={dark} />
            <div className="sky-fallback" aria-hidden="true" />
            <div className="not-found-copy">
              <h1 id="not-found-title" aria-label="404">
                {'404'.split('').map((digit, index) => (
                  <motion.span key={index} aria-hidden="true"
                    initial={reducedMotion ? false : { opacity: 0, y: 48, rotateX: 35, filter: 'blur(12px)' }}
                    animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
                    transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : index * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  >{digit}</motion.span>
                ))}
              </h1>
              <p>This page isn’t here.</p>
              <a href="/">Back home <span aria-hidden="true">→</span></a>
            </div>
          </section>
        )}
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
                <a href="/zaid-resume-2026.pdf" target="_blank" rel="noopener noreferrer" aria-label="View resume (PDF, opens in a new tab)">
                  Resume <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg>
                </a>
                <a href="/work">View my work <span aria-hidden="true">→</span></a>
              </div>
            </div>
          </div>
        </section>

        <section className="editing" id="editing" aria-labelledby="editing-title">
          <div className="work-intro">
            <h2>Here’s what I do.</h2>
          </div>
          <div className="video-content">
            <div className="editing-heading">
              <h2 id="editing-title">My editing work</h2>
            </div>
            <EditingCarousel />
          </div>
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
                <a className="footer-contact" href={`mailto:${contactEmail}`} aria-label={`Email Screen at ${contactEmail}`}>
                  <span aria-hidden="true">✉</span>
                  <span className="footer-contact-label" aria-hidden="true"><span>Contact</span><span>{contactEmail}</span></span>
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
