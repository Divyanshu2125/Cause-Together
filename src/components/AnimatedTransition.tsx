
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedTransitionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({ 
  children,
  className = '',
  delay = 0,
  direction = 'up',
}) => {
  const getVariants = () => {
    const baseVariants = {
      initial: {
        opacity: 0,
      },
      in: {
        opacity: 1,
      },
      out: {
        opacity: 0,
      },
    };
    
    switch (direction) {
      case 'up':
        return {
          ...baseVariants,
          initial: { ...baseVariants.initial, y: 20 },
          in: { ...baseVariants.in, y: 0 },
          out: { ...baseVariants.out, y: -20 },
        };
      case 'down':
        return {
          ...baseVariants,
          initial: { ...baseVariants.initial, y: -20 },
          in: { ...baseVariants.in, y: 0 },
          out: { ...baseVariants.out, y: 20 },
        };
      case 'left':
        return {
          ...baseVariants,
          initial: { ...baseVariants.initial, x: 20 },
          in: { ...baseVariants.in, x: 0 },
          out: { ...baseVariants.out, x: -20 },
        };
      case 'right':
        return {
          ...baseVariants,
          initial: { ...baseVariants.initial, x: -20 },
          in: { ...baseVariants.in, x: 0 },
          out: { ...baseVariants.out, x: 20 },
        };
      default:
        return baseVariants;
    }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
    delay: delay,
  };

  return (
    <motion.div
      className={`w-full ${className}`}
      initial="initial"
      animate="in"
      exit="out"
      variants={getVariants()}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedTransition;
