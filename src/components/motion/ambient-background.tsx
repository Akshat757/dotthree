'use client';

import { useScroll, useTransform, motion, useReducedMotion } from 'motion/react';

/**
 * Site-wide ambient backdrop: slow-drifting soft colour fields in the brand
 * palette (terracotta, sand, forest, gold) plus a faint paper grain. Sits
 * behind all content, is fully non-interactive, and parallaxes gently with
 * scroll. Honours prefers-reduced-motion (drift stops; a static wash remains).
 */
export function AmbientBackground() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], ['0vh', '-28vh']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['0vh', '18vh']);
  const y3 = useTransform(scrollYProgress, [0, 1], ['0vh', '-12vh']);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 40]);

  return (
    <div aria-hidden className="ambient pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        style={reduce ? undefined : { y: y1 }}
        className="ambient-blob ambient-blob--a absolute -top-[20vh] -left-[10vw] size-[70vmax]"
      />
      <motion.div
        style={reduce ? undefined : { y: y2, rotate }}
        className="ambient-blob ambient-blob--b absolute top-[30vh] -right-[20vw] size-[80vmax]"
      />
      <motion.div
        style={reduce ? undefined : { y: y3 }}
        className="ambient-blob ambient-blob--c absolute -bottom-[30vh] left-[20vw] size-[60vmax]"
      />
      <div className="ambient-grain absolute inset-0" />
    </div>
  );
}
