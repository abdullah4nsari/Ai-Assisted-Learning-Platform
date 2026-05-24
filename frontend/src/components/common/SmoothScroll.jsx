import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export let lenisInstance = null;

const SmoothScroll = ({ children, scrollContainer }) => {
    const lenisRef = useRef(null);

    useEffect(() => {
        const el = scrollContainer?.current;
        if (!el) return;

        const lenis = new Lenis({
            wrapper: el,
            content: el,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 0.9,
            touchMultiplier: 1.5,
            infinite: false,
        });

        lenisRef.current = lenis;
        lenisInstance = lenis;

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.destroy();
            lenisInstance = null;
            gsap.ticker.remove((time) => lenis.raf(time * 1000));
        };
    }, [scrollContainer]);

    return children;
};

export default SmoothScroll;
