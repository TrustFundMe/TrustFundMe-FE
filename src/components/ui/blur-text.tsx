import { motion, TargetAndTransition, Transition, Variant } from 'framer-motion';
import { useEffect, useRef, useState, useMemo } from 'react';

const buildKeyframes = (from: object, steps: object[]): object => {
    const keys = new Set([
        ...Object.keys(from),
        ...steps.flatMap((s) => Object.keys(s)),
    ]);

    const keyframes: { [key: string]: any[] } = {};
    keys.forEach((k) => {
        keyframes[k] = [
            (from as any)[k],
            ...steps.map((s) => (s as any)[k])
        ];
    });
    return keyframes;
};

interface BlurTextProps {
    text?: string;
    delay?: number;
    className?: string;
    animateBy?: 'words' | 'letters';
    direction?: 'top' | 'bottom';
    threshold?: number;
    rootMargin?: string;
    animationFrom?: object;
    animationTo?: object[];
    easing?: string | number[] | ((t: number) => number);
    onAnimationComplete?: () => void;
    stepDuration?: number;
}

export const BlurText = ({
    text = '',
    delay = 200,
    className = '',
    animateBy = 'words',
    direction = 'top',
    threshold = 0.1,
    rootMargin = '0px',
    animationFrom,
    animationTo,
    easing = (t: number) => t,
    onAnimationComplete,
    stepDuration = 0.35,
}: BlurTextProps) => {
    const elements = useMemo(() => {
        if (animateBy === 'words') {
            return text.split(' ');
        } else {
            return text.split('');
        }
    }, [text, animateBy]);

    const [inView, setInView] = useState(false);
    const ref = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const currentRef = ref.current;
        if (!currentRef) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.unobserve(currentRef);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(currentRef);

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
            observer.disconnect();
        }
    }, [threshold, rootMargin]);

    const defaultFrom: TargetAndTransition = useMemo(
        () =>
            direction === 'top'
                ? { filter: 'blur(10px)', opacity: 0, y: -50 } as any
                : { filter: 'blur(10px)', opacity: 0, y: 50 } as any,
        [direction]
    );

    const defaultTo: TargetAndTransition[] = useMemo(
        () => [
            {
                filter: 'blur(5px)',
                opacity: 0.5,
                y: direction === 'top' ? 5 : -5,
            } as any,
            {
                filter: 'blur(0px)',
                opacity: 1,
                y: 0,
            } as any,
        ],
        [direction]
    );

    const fromSnapshot = (animationFrom || defaultFrom) as TargetAndTransition;
    const toSnapshots = (animationTo || defaultTo) as TargetAndTransition[];

    const stepCount = Array.isArray(toSnapshots) ? toSnapshots.length + 1 : 2;
    const totalDuration = stepDuration * (stepCount - 1);
    const times = Array.from({ length: stepCount }, (_, i) =>
        stepCount <= 1 ? 0 : i / (stepCount - 1)
    );

    return (
        <p
            ref={ref}
            className={className}
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}
        >
            {elements.map((segment, index) => {
                const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

                const spanTransition = {
                    duration: totalDuration,
                    times: times as number[],
                    delay: inView ? (index * delay) / 1000 : 0,
                    ease: easing as any, // Cast easing to any to bypass strict type checking for now
                };

                return (
                    <motion.span
                        className="inline-block will-change-[transform,filter,opacity]"
                        key={index}
                        initial={fromSnapshot}
                        animate={inView ? (animateKeyframes as any) : fromSnapshot}
                        transition={spanTransition}
                        onAnimationComplete={
                            index === elements.length - 1 && inView ? onAnimationComplete : undefined
                        }
                        style={animateBy === 'words' ? { marginRight: '0.5em' } : {}}
                    >
                        {segment === ' ' ? '\u00A0' : segment}
                    </motion.span>
                );
            })}
        </p>
    );
};
