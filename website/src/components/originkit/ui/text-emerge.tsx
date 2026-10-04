"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type FontStyle = React.CSSProperties;

type TransitionValue = {
    type?: string;
    duration?: number;
    delay?: number;
    ease?: string | number[];
    staggerChildren?: number;
};

type StaggerFrom = "start" | "center" | "end" | "random";
type TextTag = "p" | "span" | "div" | "section";

type Props = {
    text?: string;
    font?: FontStyle;
    color?: string;

    staggerFrom?: StaggerFrom;
    tag?: TextTag;

    transition?: TransitionValue;
};

const mapEase = (ease: TransitionValue["ease"]): string => {
    if (typeof ease !== "string") return "power2.out";

    const easeMap: Record<string, string> = {
        linear: "none",
        easeIn: "power2.in",
        easeOut: "power2.out",
        easeInOut: "power2.inOut",
        circIn: "circ.in",
        circOut: "circ.out",
        circInOut: "circ.inOut",
        backIn: "back.in",
        backOut: "back.out(1.7)",
        backInOut: "back.inOut",
        anticipate: "back.out(1.7)",
    };

    return easeMap[ease] ?? ease;
};

export default function InkdropSpread({
    text = "Text bleeds outward from the center, spreading like ink on paper. Each word radiates from the middle.",
    font = {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "70px",
        fontWeight: 600,
        letterSpacing: "-0.025em",
        lineHeight: "1.1em",
        textAlign: "left",
    },
    color = "#ffffff",

    staggerFrom = "center",
    tag = "p",

    transition = {
        type: "tween",
        duration: 0.5,
        delay: 0,
        ease: "easeOut",
        staggerChildren: 0.03,
    },
}: Props) {
    const containerRef = useRef<HTMLElement>(null);
    const words = text.trim().split(/\s+/).filter(Boolean);
    const textAlign =
        (font.textAlign as React.CSSProperties["textAlign"]) ?? "left";

    useEffect(() => {
        if (!containerRef.current) return;

        const wordEls = containerRef.current.querySelectorAll(".word");

        gsap.killTweensOf(wordEls);

        gsap.set(wordEls, {
            clearProps: "transform,opacity,filter",
        });

        gsap.from(wordEls, {
            opacity: 0,
            scale: 0,
            filter: "blur(4px)",

            duration: transition.duration ?? 0.5,
            delay: transition.delay ?? 0,
            stagger: {
                each: transition.staggerChildren ?? 0.03,
                from: staggerFrom,
            },
            ease: mapEase(transition.ease),
        });
    }, [text, staggerFrom, transition]);

    return React.createElement(
        tag,
        {
            ref: containerRef,
            style: {
                margin: 0,
                display: "block",
                width: "100%",
                whiteSpace: "pre-wrap",
                color,
                ...font,
                textAlign,
            },
        },
        words.map((word, index) => (
            <React.Fragment key={`${word}-${index}`}>
                <span
                    className="word"
                    style={{
                        display: "inline-block",
                    }}
                >
                    {word}
                </span>
                {index < words.length - 1 ? " " : null}
            </React.Fragment>
        ))
    );
}