"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

// Button hover animation wrapper
interface MotionButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
}

export function MotionButton({ children, className, ...props }: MotionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Card hover animation wrapper
interface MotionCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function MotionCard({ children, className, ...props }: MotionCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Fade in animation for elements appearing
interface FadeInProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
}

export function FadeIn({ children, delay = 0, className, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Scale in animation for modals/dialogs
interface ScaleInProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function ScaleIn({ children, className, ...props }: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Slide in from side animation
interface SlideInProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
}

export function SlideIn({ 
  children, 
  direction = "left", 
  className, 
  ...props 
}: SlideInProps) {
  const directionMap = {
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
    up: { x: 0, y: -20 },
    down: { x: 0, y: 20 },
  };

  const initial = directionMap[direction];

  return (
    <motion.div
      initial={{ opacity: 0, ...initial }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...initial }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stagger children animation container
interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  staggerDelay?: number;
}

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export function StaggerContainer({ 
  children, 
  staggerDelay = 0.1, 
  className, 
  ...props 
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: staggerDelay },
        },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, ...props }: HTMLMotionProps<"div"> & { children: React.ReactNode }) {
  return (
    <motion.div
      variants={staggerItemVariants}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation for loading states
interface PulseProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function Pulse({ children, className, ...props }: PulseProps) {
  return (
    <motion.div
      animate={{ opacity: [1, 0.5, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Spin animation for loading icons
interface SpinProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function Spin({ children, className, ...props }: SpinProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Export motion from framer-motion for custom animations
export { motion, AnimatePresence } from "framer-motion";
export type { Variants } from "framer-motion";
