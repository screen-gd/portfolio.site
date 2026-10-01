'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { EditingCarousel } from '../App';

const categories = ['Web products', 'Video editing'] as const;

export function WorkShowcase({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState(0);
  const [direction, setDirection] = useState(1);
  const reducedMotion = useReducedMotion();

  const select = (index: number) => {
    if (index === selected) return;
    setDirection(index > selected ? 1 : -1);
    setSelected(index);
  };

  return (
    <section className="work-page" aria-labelledby="work-title">
      <div className="work-page-intro">
        <h1 id="work-title">My recent work</h1>
        <div className="work-toggle" role="tablist" aria-label="Work category">
          {categories.map((category, index) => (
            <button
              type="button"
              role="tab"
              id={`work-tab-${index}`}
              aria-selected={selected === index}
              aria-controls="work-category-panel"
              tabIndex={selected === index ? 0 : -1}
              key={category}
              onClick={() => select(index)}
              onKeyDown={(event) => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
                select(next);
                document.getElementById(`work-tab-${next}`)?.focus();
              }}
            >
              {category}
              {selected === index && <motion.span className="work-toggle-indicator" layoutId="work-category-indicator" transition={{ duration: reducedMotion ? 0 : 0.25 }} />}
            </button>
          ))}
        </div>
      </div>
      <div className="work-category-stage">
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={selected}
            id="work-category-panel"
            role="tabpanel"
            aria-labelledby={`work-tab-${selected}`}
            tabIndex={0}
            custom={direction}
            variants={{
              enter: (side: number) => ({ opacity: 0, x: reducedMotion ? 0 : side * 48 }),
              visible: { opacity: 1, x: 0 },
              exit: (side: number) => ({ opacity: 0, x: reducedMotion ? 0 : side * -48, transition: { duration: reducedMotion ? 0 : 0.15 } }),
            }}
            initial="enter"
            animate="visible"
            exit="exit"
            transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {selected === 0 ? children : <EditingCarousel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
