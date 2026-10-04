"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react"

const MAX_CELLS = 4200

const FADE_EASING = "linear"

const WALK_FRACTION = 0.5

const MAX_WALK_STEPS = 96

const CAPTION_INSET = "12%"

const REFERENCE_WIDTH = 1200

const TEXT_SCALE_MIN = 0.34
const TEXT_SCALE_MAX = 1.9

const DEFAULT_BACKGROUND = "#FFFFFF"

const DEFAULT_TEXT = "We specialize in turning space into complex shapes"

const DEFAULT_FONT_SIZE = 76

const DEFAULT_FONT: CSSProperties = {
    fontFamily: "Inter, sans-serif",
    fontSize: DEFAULT_FONT_SIZE,
    fontWeight: 700,
    letterSpacing: "-0.03em",
    lineHeight: 1.04,
}

const DEFAULT_TEXT_COLOR = "#FFFFFF"

const DEFAULT_PIXEL = {
    color: "#FFFFFF",
    gap: 0,
    radius: 0,
}

const DEFAULT_TRAIL = {
    hold: 0.3,
    fade: 0.45,
    reach: 0,
}

const DEFAULTS = {
    invert: true,
    columns: 20,
}

type StyleWithVars = CSSProperties & Record<`--${string}`, string>

type StyleWithWrap = CSSProperties & { textWrap?: string }

type Coalescing = { getCoalescedEvents?: () => PointerEvent[] }

const CELL_STYLE: CSSProperties = {
    width: "100%",
    aspectRatio: "1 / 1",
    background: "var(--pt-color)",
    borderRadius: "var(--pt-radius)",
    opacity: 0,
    mixBlendMode: "var(--pt-blend, normal)" as any,
}

export interface PixelTrailPixel {
    color?: string
    gap?: number
    radius?: number
    blendMode?: CSSProperties["mixBlendMode"]
}

export interface PixelTrailTrail {
    hold?: number
    fade?: number
    reach?: number
}

export interface PixelTrailProps {
    text?: string
    background?: string
    font?: CSSProperties
    textColor?: string
    invert?: boolean
    columns?: number
    pixel?: PixelTrailPixel
    trail?: PixelTrailTrail
    style?: CSSProperties
    global?: boolean
}

interface Grid {
    cols: number
    rows: number
    gap: number
    pitch: number
    count: number
}

export default function PixelTrail({
    text,
    background = "transparent",
    font,
    textColor = "#FFFFFF",
    invert = DEFAULTS.invert,
    columns = DEFAULTS.columns,
    pixel,
    trail,
    style,
    global = false,
}: PixelTrailProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const cellsRef = useRef<HTMLElement[]>([])
    const timersRef = useRef<number[]>([])
    const lastRef = useRef<{ x: number; y: number } | null>(null)

    const px = { ...DEFAULT_PIXEL, ...pixel }
    const tr = { ...DEFAULT_TRAIL, ...trail }

    const [size, setSize] = useState({ w: 0, h: 0 })

    useEffect(() => {
        const host = hostRef.current
        if (!host) return

        const read = (w: number, h: number) =>
            setSize((s) =>
                Math.abs(s.w - w) < 0.5 && Math.abs(s.h - h) < 0.5
                    ? s
                    : { w, h }
            )

        read(host.clientWidth, host.clientHeight)

        const ro = new ResizeObserver((entries) => {
            const box = entries[0]?.contentRect
            if (box) read(box.width, box.height)
        })
        ro.observe(host)
        return () => ro.disconnect()
    }, [])

    const grid: Grid = useMemo(() => {
        const gap = Math.max(0, px.gap)
        let cols = Math.max(2, Math.round(columns))
        if (size.w <= 0 || size.h <= 0)
            return { cols, rows: 0, gap, pitch: 0, count: 0 }

        const measure = (c: number) => {
            const cell = Math.max(1, (size.w - gap * (c - 1)) / c)
            const pitch = cell + gap

            return {
                pitch,
                rows: Math.max(1, Math.ceil((size.h + gap) / pitch)),
            }
        }

        let m = measure(cols)
        let guard = 0
        while (cols * m.rows > MAX_CELLS && cols > 2 && guard++ < 16) {
            cols = Math.max(2, Math.floor(cols * 0.85))
            m = measure(cols)
        }

        return { cols, rows: m.rows, gap, pitch: m.pitch, count: cols * m.rows }
    }, [columns, px.gap, size.w, size.h])

    const liveRef = useRef({
        cols: 0,
        rows: 0,
        pitch: 0,
        hold: DEFAULT_TRAIL.hold,
        fade: DEFAULT_TRAIL.fade,
        reach: DEFAULT_TRAIL.reach,
    })
    liveRef.current = {
        cols: grid.cols,
        rows: grid.rows,
        pitch: grid.pitch,
        hold: Math.max(0, tr.hold),
        fade: Math.max(0, tr.fade),
        reach: Math.max(0, Math.round(tr.reach)),
    }

    useEffect(() => {
        for (const t of timersRef.current) if (t) window.clearTimeout(t)
        const g = gridRef.current
        cellsRef.current = g ? (Array.from(g.children) as HTMLElement[]) : []
        timersRef.current = new Array(cellsRef.current.length).fill(0)
        lastRef.current = null
    }, [grid.cols, grid.rows])

    useEffect(
        () => () => {
            for (const t of timersRef.current) if (t) window.clearTimeout(t)
        },
        []
    )

    const strike = (col: number, row: number, alpha: number) => {
        const { cols, rows, hold, fade } = liveRef.current
        if (col < 0 || row < 0 || col >= cols || row >= rows) return

        const i = row * cols + col
        const el = cellsRef.current[i]
        if (!el) return

        const pending = timersRef.current[i]
        if (pending) window.clearTimeout(pending)

        const current = parseFloat(el.style.opacity) || 0
        const next = current > alpha ? current : alpha

        el.style.transition = "none"
        el.style.opacity = String(next)

        timersRef.current[i] = window.setTimeout(() => {
            timersRef.current[i] = 0
            el.style.transition = `opacity ${fade}s ${FADE_EASING}`
            el.style.opacity = "0"
        }, hold * 1000)
    }

    const stamp = (x: number, y: number) => {
        const { pitch, reach } = liveRef.current
        if (pitch <= 0) return

        const col = Math.floor(x / pitch)
        const row = Math.floor(y / pitch)

        if (reach <= 0) {
            strike(col, row, 1)
            return
        }

        for (let dr = -reach; dr <= reach; dr++) {
            for (let dc = -reach; dc <= reach; dc++) {
                const d = Math.sqrt(dc * dc + dr * dr)
                if (d > reach + 0.5) continue
                strike(col + dc, row + dr, 1 - d / (reach + 1))
            }
        }
    }

    const trace = (x: number, y: number) => {
        const pitch = liveRef.current.pitch
        const last = lastRef.current

        if (last) {
            const dx = x - last.x
            const dy = y - last.y
            const steps = Math.min(
                MAX_WALK_STEPS,
                Math.ceil(Math.sqrt(dx * dx + dy * dy) / (pitch * WALK_FRACTION))
            )
            for (let i = 1; i < steps; i++) {
                stamp(last.x + (dx * i) / steps, last.y + (dy * i) / steps)
            }
        }

        stamp(x, y)
        lastRef.current = { x, y }
    }

    const onPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
        const host = hostRef.current
        if (!host || liveRef.current.pitch <= 0) return

        const rect = host.getBoundingClientRect()
        const layoutWidth = host.offsetWidth
        const scale = layoutWidth > 0 ? rect.width / layoutWidth : 1
        if (!(scale > 0)) return

        const native = e.nativeEvent as PointerEvent & Coalescing
        const samples = native.getCoalescedEvents
            ? native.getCoalescedEvents()
            : []
        const points: Array<{ clientX: number; clientY: number }> =
            samples.length ? samples : [native]

        for (const p of points) {
            trace((p.clientX - rect.left) / scale, (p.clientY - rect.top) / scale)
        }
    }

    useEffect(() => {
        if (!global) return

        const handleGlobalPointer = (e: PointerEvent) => {
            const host = hostRef.current
            if (!host || liveRef.current.pitch <= 0) return

            // Suppress pixel trail inside interactive playground
            const target = e.target as HTMLElement | null
            if (target && target.closest?.('.playground-section, .playground-ide, .playground-loading, [data-no-pixel-trail]')) {
                lastRef.current = null
                return
            }

            const pgElements = document.querySelectorAll('.playground-section, .playground-ide, [data-no-pixel-trail]')
            for (let i = 0; i < pgElements.length; i++) {
                const r = pgElements[i].getBoundingClientRect()
                if (
                    e.clientX >= r.left &&
                    e.clientX <= r.right &&
                    e.clientY >= r.top &&
                    e.clientY <= r.bottom
                ) {
                    lastRef.current = null
                    return
                }
            }

            const rect = host.getBoundingClientRect()
            const layoutWidth = host.offsetWidth
            const scale = layoutWidth > 0 ? rect.width / layoutWidth : 1
            if (!(scale > 0)) return

            if (
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            ) {
                trace((e.clientX - rect.left) / scale, (e.clientY - rect.top) / scale)
            }
        }

        window.addEventListener("pointermove", handleGlobalPointer, { passive: true })
        window.addEventListener("pointerdown", handleGlobalPointer, { passive: true })

        return () => {
            window.removeEventListener("pointermove", handleGlobalPointer)
            window.removeEventListener("pointerdown", handleGlobalPointer)
        }
    }, [global])

    const gridStyle: StyleWithVars = {
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
        gap: `${grid.gap}px`,
        alignContent: "start",
        pointerEvents: "none",
        "--pt-color": px.color || "#38bdf8",
        "--pt-radius": `${Math.max(0, px.radius ?? 0)}px`,
        "--pt-blend": (px.blendMode || "normal") as string,
    }

    const cells = useMemo(
        () =>
            Array.from({ length: grid.count }, (_, i) => (
                <div key={i} style={CELL_STYLE} />
            )),
        [grid.count]
    )

    const caption = (text || "").trim()
    const face = { ...DEFAULT_FONT, ...font }
    const authored =
        typeof face.fontSize === "number"
            ? face.fontSize
            : parseFloat(String(face.fontSize ?? "")) || DEFAULT_FONT_SIZE

    const textScale =
        size.w > 0
            ? Math.min(
                  TEXT_SCALE_MAX,
                  Math.max(TEXT_SCALE_MIN, size.w / REFERENCE_WIDTH)
              )
            : 1

    const captionBoxStyle: CSSProperties = {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: `0 ${CAPTION_INSET}`,
        mixBlendMode: invert ? "difference" : "normal",
        pointerEvents: "none",
        userSelect: "none",
    }

    const captionTextStyle: StyleWithWrap = {
        ...face,
        color: textColor,
        fontSize: Math.round(authored * textScale * 100) / 100,
        width: "100%",
        margin: 0,
        textAlign: "center",
        textWrap: "balance",
        overflowWrap: "break-word",
    }

    return (
        <div
            ref={hostRef}
            onPointerMove={onPointer}
            onPointerDown={onPointer}
            onPointerLeave={() => {
                lastRef.current = null
            }}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                background,
                isolation: "isolate",
                ...style,
            }}
        >
            <div ref={gridRef} style={gridStyle}>
                {cells}
            </div>

            {caption && (
                <div style={captionBoxStyle}>
                    <span style={captionTextStyle}>{caption}</span>
                </div>
            )}
        </div>
    )
}