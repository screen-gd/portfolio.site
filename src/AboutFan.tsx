'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';

const offsets = [-2.5, -1.5, -.5, .5, 1.5, 2.5];
const angles = [-8, 6, -4, 5, -6, 7];
const heights = [5, 2, 5, 1, 3, 5];
const photos = [
  '/about/burj-khalifa.jpg',
  '/about/city-sunset.jpg',
  '/about/fireworks.jpg',
  '/about/cloudy-city.jpg',
  '/about/city-lights.jpg',
  '/about/airplane-wing.jpg',
];

/** Decorative fan adapted from 21st.dev's Card Fan Carousel, without carousel state. */
export function AboutFan() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fan = root.current;
    const cards = Array.from(fan?.querySelectorAll<HTMLElement>('.about-fan-card') ?? []);
    if (!cards.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let step = 0;
    let clearance = 0;
    let active: number | null = null;

    const measure = () => {
      step = Math.min(132, window.innerWidth * .12);
      clearance = Math.min(40, window.innerWidth * .05);
    };

    const place = (animate: boolean) => {
      cards.forEach((card, index) => {
        const position = {
          x: offsets[index] * step + (active === null ? 0 : index < active ? -clearance : index > active ? clearance : 0),
          y: index === active ? -20 : heights[index],
          rotation: index === active ? 0 : angles[index],
          scale: index === active ? 1.04 : 1,
          zIndex: index === active ? 10 : index + 1,
          opacity: 1,
        };
        if (animate && !reducedMotion) {
          gsap.to(card, { ...position, duration: .42, ease: 'power3.out', overwrite: true });
        } else {
          gsap.set(card, position);
        }
      });
    };

    const layout = () => { measure(); place(false); };
    measure();
    if (reducedMotion) {
      place(false);
    } else {
      cards.forEach((card, index) => {
        gsap.fromTo(card,
          { x: 0, y: 35, rotation: 0, scale: .92, opacity: 0 },
          {
            x: offsets[index] * step,
            y: heights[index],
            rotation: angles[index],
            scale: 1,
            zIndex: index + 1,
            opacity: 1,
            duration: .7,
            delay: index * .045,
            ease: 'power3.out',
          },
        );
      });
    }

    const enter = cards.map((_, index) => () => {
      active = index;
      place(true);
    });

    const leave = () => {
      active = null;
      place(true);
    };

    cards.forEach((card, index) => card.addEventListener('pointerenter', enter[index]));
    fan?.addEventListener('pointerleave', leave);
    window.addEventListener('resize', layout);
    return () => {
      cards.forEach((card, index) => card.removeEventListener('pointerenter', enter[index]));
      fan?.removeEventListener('pointerleave', leave);
      window.removeEventListener('resize', layout);
      gsap.killTweensOf(cards);
    };
  }, []);

  return <div className="about-fan" ref={root} aria-hidden="true">
    {photos.map((src) => <div className="about-fan-card" key={src}>
      <div className="about-fan-photo"><Image src={src} alt="" fill sizes="(max-width: 640px) 100px, 176px" /></div>
    </div>)}
  </div>;
}
