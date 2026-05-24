import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const MagneticButton = ({ children, className = '', strength = 0.35, as: Tag = 'button', ...props }) => {
    const ref = useRef(null);
    const [hovering, setHovering] = useState(false);

    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const x = useSpring(rawX, { stiffness: 200, damping: 20, mass: 0.5 });
    const y = useSpring(rawY, { stiffness: 200, damping: 20, mass: 0.5 });

    const handleMouseMove = (e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        rawX.set((e.clientX - cx) * strength);
        rawY.set((e.clientY - cy) * strength);
    };

    const handleMouseLeave = () => {
        setHovering(false);
        rawX.set(0);
        rawY.set(0);
    };

    return (
        <motion.div
            ref={ref}
            style={{ x, y, display: 'inline-flex' }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={handleMouseLeave}
        >
            <Tag className={className} {...props}>
                {children}
            </Tag>
        </motion.div>
    );
};

export default MagneticButton;
