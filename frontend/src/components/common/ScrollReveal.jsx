import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Wraps children and animates them in when they enter the viewport
const ScrollReveal = ({
    children,
    className = '',
    delay     = 0,
    y         = 24,
    duration  = 0.7,
    stagger   = 0.08,
    once      = true,
    scrubber  = null, // scroll container ref for scroller
}) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const targets = el.children.length > 1 ? Array.from(el.children) : el;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                targets,
                { opacity: 0, y, willChange: 'transform, opacity' },
                {
                    opacity:  1,
                    y:        0,
                    duration,
                    delay,
                    stagger,
                    ease:     'power3.out',
                    clearProps: 'willChange',
                    scrollTrigger: {
                        trigger:  el,
                        start:    'top 88%',
                        end:      'bottom 20%',
                        toggleActions: once
                            ? 'play none none none'
                            : 'play reverse play reverse',
                        scroller: scrubber?.current || undefined,
                    },
                }
            );
        }, el);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
};

export default ScrollReveal;
