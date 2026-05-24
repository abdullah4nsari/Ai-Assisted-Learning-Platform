import { useEffect, useRef } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';

// Single animated orb
const Orb = ({ style, duration, delay = 0 }) => (
    <motion.div
        className="absolute rounded-full pointer-events-none"
        style={style}
        animate={{
            x:      [0, 18, -12, 8, 0],
            y:      [0, -14, 10, -6, 0],
            scale:  [1, 1.08, 0.96, 1.04, 1],
            opacity:[0.18, 0.28, 0.2, 0.26, 0.18],
        }}
        transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: 'easeInOut',
        }}
    />
);

// Tiny floating dot
const Dot = ({ x, y, size, duration, delay }) => (
    <motion.div
        className="absolute rounded-full bg-emerald-400 pointer-events-none"
        style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, opacity: 0 }}
        animate={{
            y:       [0, -20, 0],
            opacity: [0, 0.5, 0],
        }}
        transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: 'easeInOut',
        }}
    />
);

const DOTS = Array.from({ length: 18 }, (_, i) => ({
    x:        (i * 37 + 11) % 95,
    y:        (i * 53 + 7)  % 90,
    size:     Math.random() * 3 + 1.5,
    duration: 3 + (i % 4),
    delay:    (i * 0.4) % 3,
}));

const SceneBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Large gradient orbs */}
        <Orb
            duration={8}
            delay={0}
            style={{
                width: '280px', height: '280px',
                top: '-80px', right: '-60px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
                filter: 'blur(40px)',
            }}
        />
        <Orb
            duration={11}
            delay={2}
            style={{
                width: '200px', height: '200px',
                bottom: '-40px', left: '20%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
                filter: 'blur(30px)',
            }}
        />
        <Orb
            duration={9}
            delay={1}
            style={{
                width: '140px', height: '140px',
                top: '20%', left: '60%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                filter: 'blur(20px)',
            }}
        />

        {/* Floating dots */}
        {DOTS.map((d, i) => <Dot key={i} {...d} />)}
    </div>
);

export default SceneBackground;
