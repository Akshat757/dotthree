'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';

import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Global scroll-reveal observer                                      */
/* ------------------------------------------------------------------ */

const REVEAL_SELECTOR = 'main section, main [data-reveal]';

/**
 * Mounts one IntersectionObserver for the whole page. Every <section> inside
 * <main> (and anything marked data-reveal) receives `data-inview` once ~12% of
 * it is visible; CSS in globals.css animates its direct children with a soft
 * staggered rise. Adds `js-motion` to <html> so the hidden-before-reveal
 * styles only apply when the observer is actually running (no-JS safe).
 */
export function ScrollReveals() {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  React.useEffect(() => {
    const root = document.documentElement;
    if (reduce) {
      root.classList.remove('js-motion');
      return;
    }
    root.classList.add('js-motion');

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute('data-inview', '');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );

    const observe = () => {
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((el) => {
        if (!el.hasAttribute('data-inview')) {
          el.setAttribute('data-reveal', '');
          io.observe(el);
        }
      });
    };
    observe();

    // Catch sections rendered after navigation / client-side state changes.
    const mo = new MutationObserver(() => observe());
    const main = document.getElementById('main');
    if (main) mo.observe(main, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname, reduce]);

  return null;
}

/* ------------------------------------------------------------------ */
/* Scroll progress bar                                                */
/* ------------------------------------------------------------------ */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-accent via-gold to-forest"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Page transition (used by app/template.tsx)                         */
/* ------------------------------------------------------------------ */

export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Opt-in primitives for richer, per-element motion                   */
/* ------------------------------------------------------------------ */

type RevealProps = React.HTMLAttributes<HTMLDivElement> & {
  delay?: number;
  y?: number;
  once?: boolean;
  as?: 'div' | 'section' | 'article' | 'li' | 'span';
};

/** Fade-and-rise an element when it scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.25, margin: '0px 0px -6% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...(rest as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </motion.div>
  );
}

/** Stagger direct children as they enter the viewport. */
export function Stagger({
  children,
  className,
  step = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  step?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? undefined : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: step } } }}
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 22 },
            show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/** Parallax wrapper — moves children at a fraction of scroll speed. */
export function Parallax({
  children,
  className,
  speed = 0.2,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}px`, `${-speed * 100}px`]);
  return (
    <div ref={ref} className={cn('relative', className)}>
      <motion.div style={reduce ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}
