"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, Variants } from "framer-motion";

interface TypewriterTextProps {
    text: string;
    className?: string;
    delay?: number; // Initial delay in seconds
    repeatDelay?: number; // Delay before repeating (ms)
}

export function TypewriterText({
    text,
    className = "",
    delay = 0,
    repeatDelay = 60000 // Default 1 minute
}: TypewriterTextProps) {
    const [animationKey, setAnimationKey] = useState(0);

    // Detect if text contains Thai characters
    const isThai = useMemo(() => /[\u0E00-\u0E7F]/.test(text), [text]);

    // Use Intl.Segmenter for Thai, simple split for English
    const characters = useMemo(() => {
        if (isThai && typeof Intl !== "undefined" && (Intl as any).Segmenter) {
            const segmenter = new (Intl as any).Segmenter("th", { granularity: "grapheme" });
            return Array.from(segmenter.segment(text)).map((s: any) => s.segment);
        }
        // For English and fallback: split by character
        return text.split("");
    }, [text, isThai]);

    // Reset animation when text changes (language switch)
    useEffect(() => {
        setAnimationKey(prev => prev + 1);
    }, [text]);

    // Loop effect - restart animation after delay
    useEffect(() => {
        if (!repeatDelay) return;

        const intervalId = setInterval(() => {
            setAnimationKey(prev => prev + 1);
        }, repeatDelay);

        return () => clearInterval(intervalId);
    }, [repeatDelay]);

    const container: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.02,
                delayChildren: delay
            }
        }
    };

    const child: Variants = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 15,
                stiffness: 200
            }
        },
        hidden: {
            opacity: 0,
            y: 6
        }
    };

    return (
        <motion.p
            key={animationKey}
            variants={container}
            initial="hidden"
            animate="visible"
            className={className}
        >
            {characters.map((char, index) => (
                <motion.span
                    variants={child}
                    key={`${animationKey}-${index}`}
                    style={{ display: "inline-block", whiteSpace: "pre" }}
                >
                    {char}
                </motion.span>
            ))}
        </motion.p>
    );
}
