import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const TiltCard = ({ children, className = '', intensity = 8, glare = true }) => {
    const cardRef  = useRef(null);
    const [hovering, setHovering] = useState(false);

    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);

    const springConfig = { stiffness: 300, damping: 30, mass: 0.5 };
    const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [intensity, -intensity]), springConfig);
    const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-intensity, intensity]), springConfig);
    const glareX  = useTransform(rawX, [-0.5, 0.5], ['0%', '100%']);
    const glareY  = useTransform(rawY, [-0.5, 0.5], ['0%', '100%']);

    const handleMouseMove = (e) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;
        rawX.set((e.clientX - rect.left) / rect.width  - 0.5);
        rawY.set((e.clientY - rect.top)  / rect.height - 0.5);
    };

    const handleMouseLeave = () => {
        setHovering(false);
        rawX.set(0);
        rawY.set(0);
    };

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
                perspective: '800px',
            }}
            className={`relative ${className}`}
        >
            {/* Glare overlay */}
            {glare && hovering && (
                <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none z-10 overflow-hidden"
                    style={{ opacity: 0.08 }}
                >
                    <motion.div
                        className="absolute w-32 h-32 rounded-full bg-white blur-2xl"
                        style={{
                            left: glareX,
                            top:  glareY,
                            translateX: '-50%',
                            translateY: '-50%',
                        }}
                    />
                </motion.div>
            )}
            {children}
        </motion.div>
    );
};

export default TiltCard;
