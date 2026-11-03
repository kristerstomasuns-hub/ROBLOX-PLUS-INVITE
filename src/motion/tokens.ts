import { useReducedMotion, type Transition, type Variants } from 'framer-motion'

type Bezier = [number, number, number, number]

export const motionTokens = {
  duration: {
    micro: 0.14,
    standard: 0.24,
    reveal: 0.42,
    pageEnter: 0.22,
    pageExit: 0.18,
  },
  ease: {
    enter: [0.22, 1, 0.36, 1] as Bezier,
    exit: [0.4, 0, 0.2, 1] as Bezier,
  },
} as const

const enter = motionTokens.ease.enter
const exit = motionTokens.ease.exit

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.duration.reveal, ease: enter },
  },
  exit: {
    opacity: 0,
    y: 6,
    transition: { duration: motionTokens.duration.pageExit, ease: exit },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: motionTokens.duration.standard, ease: enter },
  },
  exit: {
    opacity: 0,
    transition: { duration: motionTokens.duration.pageExit, ease: exit },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: motionTokens.duration.standard, ease: enter },
  },
  exit: {
    opacity: 0,
    scale: 0.99,
    transition: { duration: motionTokens.duration.pageExit, ease: exit },
  },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.06 },
  },
}

export const blurReveal: Variants = {
  hidden: { opacity: 0, filter: 'blur(5px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: motionTokens.duration.reveal, ease: enter },
  },
  exit: {
    opacity: 0,
    filter: 'blur(2px)',
    transition: { duration: motionTokens.duration.pageExit, ease: exit },
  },
}

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.duration.pageEnter, ease: enter },
  },
  exit: {
    opacity: 0,
    y: 6,
    transition: { duration: motionTokens.duration.pageExit, ease: exit },
  },
}

export const deadEndVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.22, ease: enter },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.22, ease: exit },
  },
}

const reducedFadeUp: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: motionTokens.duration.standard, ease: enter },
  },
  exit: {
    opacity: 0,
    transition: { duration: motionTokens.duration.pageExit, ease: exit },
  },
}

const reducedFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: motionTokens.duration.standard, ease: enter },
  },
  exit: {
    opacity: 0,
    transition: { duration: motionTokens.duration.pageExit, ease: exit },
  },
}

const reducedScaleIn: Variants = reducedFadeIn

const reducedBlurReveal: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: motionTokens.duration.reveal, ease: enter },
  },
  exit: {
    opacity: 0,
    transition: { duration: motionTokens.duration.pageExit, ease: exit },
  },
}

const reducedPageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: motionTokens.duration.pageEnter, ease: enter },
  },
  exit: {
    opacity: 0,
    transition: { duration: motionTokens.duration.pageExit, ease: exit },
  },
}

export const transitionFor = (
  duration: number = motionTokens.duration.standard,
  easing: Bezier = enter,
): Transition => ({ duration, ease: easing })

export function useMotionPresets() {
  const prefersReduced = useReducedMotion() ?? false

  return {
    reduced: prefersReduced,
    fadeUp: prefersReduced ? reducedFadeUp : fadeUp,
    fadeIn: prefersReduced ? reducedFadeIn : fadeIn,
    scaleIn: prefersReduced ? reducedScaleIn : scaleIn,
    staggerContainer,
    blurReveal: prefersReduced ? reducedBlurReveal : blurReveal,
    pageVariants: prefersReduced ? reducedPageVariants : pageVariants,
    deadEndVariants,
  }
}
