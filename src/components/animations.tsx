import { useEffect, useRef, useState, ReactNode } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';

// Mouse Follow Glow for Desktop
export function MouseGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    let timeoutId: any;
    
    const handleMouseMove = (e: MouseEvent) => {
      setVisible(true);
      
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          setPosition({ x: e.clientX, y: e.clientY });
          timeoutId = null;
        }, 10); // Very little throttle for smooth glow, or use requestAnimationFrame
      }
    };
    
    // Only run on desktop with pointer tracking & normal motion preference
    if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  if (!visible) return null;

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 hidden md:block"
      style={{
        background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(79, 70, 229, 0.08), transparent 80%)`,
      }}
    />
  );
}

// Particle System
export function ParticleBackground() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    const newParticles = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 20 + 30,
      delay: Math.random() * -30,
      opacity: Math.random() * 0.3 + 0.1,
      color: ['rgba(79, 70, 229, 0.8)', 'rgba(99, 102, 241, 0.6)', 'rgba(165, 180, 252, 0.5)'][Math.floor(Math.random() * 3)]
    }));
    setParticles(newParticles);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full blur-[2px]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
          }}
          animate={{
            x: ['-5vw', '5vw', '-5vw'],
            y: ['-10vh', '10vh', '-10vh'],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

// Hover Scale
export function HoverScale({ children, className }: { children: ReactNode; className?: string }) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
     return <div className={className}>{children}</div>;
  }
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Image Hover (used inside cards)
export function ImageHoverZoom({ src, alt, className = "", children }: { src: string; alt: string; className?: string, children?: ReactNode }) {
  const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return (
    <div className={`relative overflow-hidden group ${className}`}>
      <motion.img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover transition-transform duration-500 ease-out" 
        whileHover={!isReduced ? { scale: 1.05 } : {}}
      />
      <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors duration-400 ease-out pointer-events-none" />
      {children}
    </div>
  );
}

// Reveal on Scroll Custom Component
export function RevealOnScroll({ children, delay = 0, yOffset = 40, className = "" }: { children: ReactNode, delay?: number, yOffset?: number, className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
     return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ y: yOffset, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : { y: yOffset, opacity: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      {children}
    </motion.div>
  );
}

// Text Mask Reveal Custom Component
export function TextReveal({ children, delay = 0, className = "" }: { children: ReactNode, delay?: number, className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
     return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "100%", opacity: 0.5 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0.5 }}
        transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Parallax Container
export function Parallax({ children, offset = 50, className = "" }: { children: ReactNode; offset?: number; className?: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  if (typeof window !== 'undefined' && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

// Footer Divider Animation
export function AnimatedDivider() {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return (
       <div className="w-full h-12 bg-slate-50 border-b border-slate-200" />
    );
  }

  return (
    <div className="w-full h-16 sm:h-24 overflow-hidden bg-slate-50 relative">
      <svg className="absolute bottom-0 w-full h-full min-w-[1200px]" preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
        <motion.path 
          d="M0 0v46.29c47.79 22.2 103.59 32.17 158 28 70.36-5.37 136.33-33.31 206.8-37.5 73.84-4.36 147.54 16.88 218.2 35.26 69.27 18 138.3 24.88 209.4 13.08 36.15-6 69.85-17.84 104.45-29.34C989.49 25 1113-14.29 1200 52.47V0z"
          fill="currentColor"
          className="text-white opacity-50"
          animate={{
            d: [
              "M0 0v46.29c47.79 22.2 103.59 32.17 158 28 70.36-5.37 136.33-33.31 206.8-37.5 73.84-4.36 147.54 16.88 218.2 35.26 69.27 18 138.3 24.88 209.4 13.08 36.15-6 69.85-17.84 104.45-29.34C989.49 25 1113-14.29 1200 52.47V0z",
              "M0 0v36.29c50.79 12.2 110.59 42.17 168 38 70.36-5.37 126.33-43.31 196.8-47.5 73.84-4.36 157.54 26.88 228.2 45.26 69.27 18 148.3 14.88 219.4 3.08 36.15-6 59.85-27.84 94.45-39.34C989.49 15 1113 4.29 1200 62.47V0z",
              "M0 0v46.29c47.79 22.2 103.59 32.17 158 28 70.36-5.37 136.33-33.31 206.8-37.5 73.84-4.36 147.54 16.88 218.2 35.26 69.27 18 138.3 24.88 209.4 13.08 36.15-6 69.85-17.84 104.45-29.34C989.49 25 1113-14.29 1200 52.47V0z"
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path 
          d="M0 0v46.29c47.79 22.2 103.59 32.17 158 28 70.36-5.37 136.33-33.31 206.8-37.5 73.84-4.36 147.54 16.88 218.2 35.26 69.27 18 138.3 24.88 209.4 13.08 36.15-6 69.85-17.84 104.45-29.34C989.49 25 1113-14.29 1200 52.47V0z"
          fill="currentColor"
          className="text-white"
          animate={{
            d: [
               "M0 0v46.29c47.79 22.2 103.59 32.17 158 28 70.36-5.37 136.33-33.31 206.8-37.5 73.84-4.36 147.54 16.88 218.2 35.26 69.27 18 138.3 24.88 209.4 13.08 36.15-6 69.85-17.84 104.45-29.34C989.49 25 1113-14.29 1200 52.47V0z",
               "M0 0v56.29c47.79 32.2 93.59 12.17 148 8 70.36-5.37 146.33-13.31 216.8-17.5 73.84-4.36 137.54 36.88 208.2 55.26 69.27 18 128.3 34.88 199.4 23.08 36.15-6 79.85-7.84 114.45-19.34C969.49 45 1113-4.29 1200 42.47V0z",
               "M0 0v46.29c47.79 22.2 103.59 32.17 158 28 70.36-5.37 136.33-33.31 206.8-37.5 73.84-4.36 147.54 16.88 218.2 35.26 69.27 18 138.3 24.88 209.4 13.08 36.15-6 69.85-17.84 104.45-29.34C989.49 25 1113-14.29 1200 52.47V0z"
            ]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </svg>
    </div>
  );
}
