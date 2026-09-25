'use client';

import { useEffect, useRef, useState } from 'react';
import Gravity, { MatterBody } from '@/components/fancy/physics/gravity';
import { Badge } from '@/components/ui/badge';

const tools = [
  { name: 'Codex', variant: 'default', x: '15%', y: '14%', angle: -7 },
  { name: 'Claude Code', variant: 'orange', x: '37%', y: '16%', angle: 5 },
  { name: 'DaVinci Resolve', variant: 'indigo', x: '62%', y: '12%', angle: -4 },
  { name: 'Affinity Design', variant: 'violet', x: '84%', y: '17%', angle: 5 },
  { name: 'Photoshop', variant: 'blue', x: '28%', y: '43%', angle: -6 },
  { name: 'Premiere Pro', variant: 'violet', x: '53%', y: '45%', angle: 4 },
  { name: 'Unreal Engine', variant: 'default', x: '76%', y: '42%', angle: -3 },
] as const;

export function StackGravity() {
  const scene = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!scene.current) return;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const sync = () => setActive(visible && !reducedMotion.matches);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { rootMargin: '120px' });
    observer.observe(scene.current);
    reducedMotion.addEventListener('change', sync);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener('change', sync);
    };
  }, []);

  return (
    <div className="stack-scene" ref={scene}>
      {active ? (
        <Gravity grabCursor={false}>
          {tools.map((tool) => (
            <MatterBody key={tool.name} x={tool.x} y={tool.y} angle={tool.angle}>
              <Badge variant={tool.variant}>{tool.name}</Badge>
            </MatterBody>
          ))}
        </Gravity>
      ) : (
        <ul>{tools.map((tool) => <li key={tool.name}><Badge variant={tool.variant}>{tool.name}</Badge></li>)}</ul>
      )}
    </div>
  );
}
