import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
    const cursorRef  = useRef(null);
    const [hovered,  setHovered]  = useState(false);
    const [clicked,  setClicked]  = useState(false);
    const [hidden,   setHidden]   = useState(true);

    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    const springX = useSpring(mouseX, { stiffness: 500, damping: 40, mass: 0.3 });
    const springY = useSpring(mouseY, { stiffness: 500, damping: 40, mass: 0.3 });

    // Slower follower dot
    const followerX = useSpring(mouseX, { stiffness: 120, damping: 28, mass: 0.8 });
    const followerY = useSpring(mouseY, { stiffness: 120, damping: 28, mass: 0.8 });

    useEffect(() => {
        // Only show on non-touch devices
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const onMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            setHidden(false);
        };

        const onLeave  = () => setHidden(true);
        const onEnter  = () => setHidden(false);
        const onDown   = () => setClicked(true);
        const onUp     = () => setClicked(false);

        const onHoverIn = (e) => {
            const el = e.target.closest('a, button, [data-cursor="pointer"], input, textarea, select, label');
            if (el) setHovered(true);
        };
        const onHoverOut = (e) => {
            const el = e.target.closest('a, button, [data-cursor="pointer"], input, textarea, select, label');
            if (el) setHovered(false);
        };

        document.addEventListener('mousemove',  onMove);
        document.addEventListener('mouseleave', onLeave);
        document.addEventListener('mouseenter', onEnter);
        document.addEventListener('mousedown',  onDown);
        document.addEventListener('mouseup',    onUp);
        document.addEventListener('mouseover',  onHoverIn);
        document.addEventListener('mouseout',   onHoverOut);

        return () => {
            document.removeEventListener('mousemove',  onMove);
            document.removeEventListener('mouseleave', onLeave);
            document.removeEventListener('mouseenter', onEnter);
            document.removeEventListener('mousedown',  onDown);
            document.removeEventListener('mouseup',    onUp);
            document.removeEventListener('mouseover',  onHoverIn);
            document.removeEventListener('mouseout',   onHoverOut);
        };
    }, []);

    // Don't render on touch devices
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null;

    return (
        <>
            {/* Main cursor dot */}
            <motion.div
                ref={cursorRef}
                className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
                style={{
                    x: springX,
                    y: springY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                animate={{
                    scale:   clicked ? 0.6 : hovered ? 1.8 : 1,
                    opacity: hidden  ? 0   : 1,
                }}
                transition={{ scale: { duration: 0.15 }, opacity: { duration: 0.2 } }}
            >
                <div
                    className="rounded-full bg-white"
                    style={{ width: '10px', height: '10px' }}
                />
            </motion.div>

            {/* Follower ring */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9998]"
                style={{
                    x: followerX,
                    y: followerY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                animate={{
                    scale:   clicked ? 0.8 : hovered ? 2.2 : 1,
                    opacity: hidden  ? 0   : hovered ? 0.6 : 0.35,
                }}
                transition={{ scale: { duration: 0.25 }, opacity: { duration: 0.2 } }}
            >
                <div
                    className="rounded-full border border-emerald-400"
                    style={{ width: '36px', height: '36px' }}
                />
            </motion.div>
        </>
    );
};

export default CustomCursor;
