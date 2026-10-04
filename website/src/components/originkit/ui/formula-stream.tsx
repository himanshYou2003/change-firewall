"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

const BASE_RATE = 70
const CURVE_MAX = 0.16
const STRIP_PX = 18

const PUSH_MAX = 0.5
const TIERS = [
    { scale: 0.58, alpha: 0.32, rate: 0.55 },
    { scale: 0.78, alpha: 0.5, rate: 0.75 },
    { scale: 1.0, alpha: 0.75, rate: 1.0 },
    { scale: 1.3, alpha: 1.0, rate: 1.3 },
]
const SUP_SCALE = 0.62
const SUP_RISE = 0.42
const SUB_DROP = 0.22
const SEED = 1729

const FORMULAS = [
    "e^{iπ} + 1 = 0",
    "∫_{−∞}^{∞} e^{−x²} dx = √π",
    "∇ · E = ρ / ε_{0}",
    "∇ × B = μ_{0}J + μ_{0}ε_{0} ∂E/∂t",
    "iħ ∂ψ/∂t = Ĥψ",
    "E = mc²",
    "a² + b² = c²",
    "F = G m_{1}m_{2} / r²",
    "ζ(s) = Σ_{n=1}^{∞} 1/n^{s}",
    "f(x) = Σ_{n=0}^{∞} f^{(n)}(a) (x − a)^{n} / n!",
    "∮_{C} F · dr = ∬_{S} (∇ × F) · dS",
    "x = (−b ± √(b² − 4ac)) / 2a",
    "sin²θ + cos²θ = 1",
    "lim_{n→∞} (1 + 1/n)^{n} = e",
    "R_{μν} − ½ R g_{μν} + Λ g_{μν} = 8πG T_{μν}",
    "∂u/∂t = α ∇²u",
    "P(A|B) = P(B|A) P(A) / P(B)",
    "det(A − λI) = 0",
    "φ = (1 + √5) / 2",
    "S = k_{B} ln Ω",
    "Δx Δp ≥ ħ/2",
    "∫_{a}^{b} f′(x) dx = f(b) − f(a)",
    "f̂(ξ) = ∫ f(x) e^{−2πixξ} dx",
    "ρ(∂v/∂t + v · ∇v) = −∇p + μ∇²v",
    "π = 4 Σ_{k=0}^{∞} (−1)^{k} / (2k + 1)",
    "Γ(z) = ∫_{0}^{∞} t^{z−1} e^{−t} dt",
    "PV = nRT",
    "∂²u/∂t² = c² ∇²u",
    "H(X) = −Σ p(x) log p(x)",
    "d/dt (∂L/∂q̇) = ∂L/∂q",
    "n! ≈ √(2πn) (n/e)^{n}",
    "∇²φ = 0",
    "σ = √(Σ (x_{i} − μ)² / N)",
    "|ψ⟩ = α|0⟩ + β|1⟩",
    "y″ + ω²y = 0",
    "A = πr²",
    "V − E + F = 2",
    "e^{x} = Σ_{n=0}^{∞} x^{n} / n!",
    "⟨a, b⟩ = |a| |b| cos θ",
    "∑_{k=1}^{n} k = n(n + 1) / 2",
]

function mulberry32(a: number) {
    return function () {
        a |= 0
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

type RGBA = [number, number, number, number]
const colorCache = new Map<string, RGBA>()

function parseColor(input: string | undefined, fallback: RGBA): RGBA {
    if (!input) return fallback
    const hit = colorCache.get(input)
    if (hit) return hit
    let s = input.trim()
    const v = /^var\(\s*--[^,]+,\s*(.+)\)$/.exec(s)
    if (v) s = v[1].trim()
    if (typeof document === "undefined") return fallback
    const cv = document.createElement("canvas")
    cv.width = cv.height = 1
    const ctx = cv.getContext("2d", { willReadFrequently: true })
    if (!ctx) return fallback
    ctx.fillStyle = "#010203"
    ctx.fillStyle = s
    if (ctx.fillStyle === "#010203" && s.toLowerCase() !== "#010203") return fallback
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillRect(0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    const out: RGBA = [d[0], d[1], d[2], d[3] / 255]
    colorCache.set(input, out)
    return out
}

interface FontLike {
    fontFamily?: string
    fontSize?: string | number
    fontWeight?: string | number
    fontStyle?: string
    letterSpacing?: string | number
}
function fontPx(f: FontLike | undefined): number {
    const raw = f?.fontSize
    const n = typeof raw === "number" ? raw : parseFloat(String(raw ?? ""))
    return Number.isFinite(n) && n > 0 ? Math.min(200, n) : 26
}
function fontShorthand(f: FontLike | undefined, px: number): string {
    const style = f?.fontStyle ?? "italic"
    const weight = f?.fontWeight ?? 400
    const family = f?.fontFamily ?? "Georgia"
    const quoted = /[\s,]/.test(family) && !/["']/.test(family) ? `"${family}"` : family
    return `${style} ${weight} ${px}px ${quoted}, "Times New Roman", serif`
}
function letterSpacingPx(f: FontLike | undefined, px: number): number {
    const raw = f?.letterSpacing
    if (raw == null) return 0
    const s = String(raw)
    const n = parseFloat(s)
    if (!Number.isFinite(n)) return 0
    return s.endsWith("em") ? n * px : n
}

interface Run {
    text: string
    level: 0 | 1 | -1
    group: number
}

function parseFormula(src: string): Run[] {
    const runs: Run[] = []
    let buf = ""
    let group = 0
    let i = 0
    let lastWasScript = false
    const flush = () => {
        if (buf) runs.push({ text: buf, level: 0, group: ++group })
        buf = ""
    }
    while (i < src.length) {
        const c = src[i]
        if ((c === "^" || c === "_") && i + 1 < src.length) {
            flush()
            let body: string
            if (src[i + 1] === "{") {
                const end = src.indexOf("}", i + 2)
                body = src.slice(i + 2, end < 0 ? src.length : end)
                i = end < 0 ? src.length : end + 1
            } else {
                body = src[i + 1]
                i += 2
            }

            if (!lastWasScript) group++
            runs.push({ text: body, level: c === "^" ? 1 : -1, group })
            lastWasScript = true
            continue
        }
        buf += c
        lastWasScript = false
        i++
    }
    flush()
    return runs
}
const PARSED = FORMULAS.map(parseFormula)

interface Sprite {
    sx: number
    sy: number
    sw: number
    sh: number
    w: number
    h: number
    baseline: number
}
interface Atlas {
    canvas: HTMLCanvasElement
    sprites: Sprite[]
}

function layoutFormula(
    ctx: CanvasRenderingContext2D,
    runs: Run[],
    f: FontLike | undefined,
    px: number
) {
    const ls = letterSpacingPx(f, px)
    const placed: { text: string; x: number; dy: number; size: number }[] = []
    let x = 0
    let g = -1
    let gStart = 0
    let gEnd = 0
    for (const r of runs) {
        const size = r.level === 0 ? px : px * SUP_SCALE
        ctx.font = fontShorthand(f, size)
        const w = ctx.measureText(r.text).width + ls * r.text.length
        if (r.group !== g) {
            x = gEnd
            gStart = x
            g = r.group
        }
        const dy = r.level === 1 ? -px * SUP_RISE : r.level === -1 ? px * SUB_DROP : 0
        placed.push({ text: r.text, x: gStart, dy, size })
        gEnd = Math.max(gEnd, gStart + w + (r.level !== 0 ? px * 0.06 : 0))
    }
    return { width: gEnd, placed, ls }
}

function buildAtlas(f: FontLike | undefined, px: number, rgb: RGBA, dpr: number): Atlas {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const pad = Math.ceil(px * 0.3)
    const h = Math.ceil(px * 1.9)
    const baseline = Math.round(px * 1.2)
    const layouts = PARSED.map((runs) => layoutFormula(ctx, runs, f, px))
    const maxW = Math.max(...layouts.map((l) => l.width)) + pad * 2
    const atlasW = Math.max(1024, Math.ceil(maxW * dpr))
    const sprites: Sprite[] = []
    let cx = 0
    let cy = 0
    const rowH = Math.ceil(h * dpr) + 2
    for (const l of layouts) {
        const sw = Math.ceil((l.width + pad * 2) * dpr)
        if (cx + sw > atlasW) {
            cx = 0
            cy += rowH
        }
        sprites.push({ sx: cx, sy: cy, sw, sh: Math.ceil(h * dpr), w: sw / dpr, h: Math.ceil(h * dpr) / dpr, baseline })
        cx += sw + 2
    }
    canvas.width = atlasW
    canvas.height = cy + rowH
    const c = canvas.getContext("2d")!
    c.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
    c.textBaseline = "alphabetic"
    layouts.forEach((l, i) => {
        const s = sprites[i]
        c.setTransform(dpr, 0, 0, dpr, s.sx, s.sy)
        for (const p of l.placed) {
            c.font = fontShorthand(f, p.size)
            if ("letterSpacing" in c) (c as any).letterSpacing = `${l.ls}px`
            c.fillText(p.text, pad + p.x, baseline + p.dy)
        }
    })

    return { canvas, sprites }
}

interface Lane {
    y: number
    tier: number
    items: { f: number; x: number }[]
    cycle: number
    offset: number
}

function buildLanes(W: number, H: number, density: number, gap: number, bow: number, atlases: Atlas[]): Lane[] {
    const rnd = mulberry32(SEED)
    const span = H + Math.abs(bow) * 2 + 80
    const n = Math.max(1, density)
    const step = span / n
    const top = -Math.abs(bow) - 40 + step / 2
    const lanes: Lane[] = []
    for (let i = 0; i < n; i++) {
        const tier = Math.floor(rnd() * TIERS.length)
        const sprites = atlases[tier].sprites
        const order = FORMULAS.map((_, k) => k)
        for (let k = order.length - 1; k > 0; k--) {
            const j = Math.floor(rnd() * (k + 1))
            ;[order[k], order[j]] = [order[j], order[k]]
        }
        const g = gap * TIERS[tier].scale
        const items: { f: number; x: number }[] = []
        let x = 0
        let k = 0
        const maxW = Math.max(...sprites.map((s) => s.w))

        while (x < W + maxW + g || k < 3) {
            const fi = order[k % order.length]
            items.push({ f: fi, x })
            x += sprites[fi].w + g
            k++
        }
        lanes.push({
            y: top + i * step + (rnd() - 0.5) * step * 0.35,
            tier,
            items,
            cycle: x,
            offset: rnd() * x,
        })
    }
    return lanes
}

interface FormulaStreamProps {
    background?: string
    textColor?: string
    accent?: string
    font?: FontLike
    density?: number
    speed?: number
    curve?: number
    gap?: number
    hover?: number
    reach?: number
    style?: React.CSSProperties
}

const DEFAULTS = {
    background: "#0A0A0C",
    textColor: "rgba(232, 228, 220, 0.55)",
    accent: "#FF4900",
    font: {"variant":"Regular","fontSize":26,"fontStyle":"italic","textAlign":"left","fontFamily":"Georgia","fontWeight":400,"lineHeight":"1.5em","letterSpacing":"0em"} as FontLike,
    density: 18,
    speed: 69,
    curve: 50,
    gap: 81,
    hover: 139,
    reach: 240,
}

export default function FormulaStream(props: FormulaStreamProps) {
    const rootRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const propsRef = useRef(props)
    propsRef.current = props

    useEffect(() => {
        const root = rootRef.current
        const canvas = canvasRef.current
        if (!root || !canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let W = 0
        let H = 0
        let dpr = 1
        let atlasKey = ""
        let laneKey = ""
        let atlasBase: Atlas[] = []
        let atlasAccent: Atlas[] = []
        let lanes: Lane[] = []
        let fontEpoch = 0
        const pointer = { tx: 0, ty: 0, x: 0, y: 0, active: false, presence: 0 }

        const resize = () => {
            dpr = Math.min(2, window.devicePixelRatio || 1)
            W = root.offsetWidth || 1200
            H = root.offsetHeight || 800
            const bw = Math.round(W * dpr)
            const bh = Math.round(H * dpr)
            if (canvas.width !== bw || canvas.height !== bh) {
                canvas.width = bw
                canvas.height = bh
            }
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(root)

        const onFonts = () => {
            fontEpoch++
        }
        const fonts = (document as any).fonts
        fonts?.addEventListener?.("loadingdone", onFonts)

        const laneY = (baseY: number, x: number, bow: number, s: number, R: number) => {
            const u = (x - W / 2) / (W / 2)
            let y = baseY - bow * (1 - u * u)
            if (s > 0) {
                const dx = x - pointer.x
                const dy = y - pointer.y
                const q = (dx * dx + dy * dy) / (R * R)
                if (q < 1) {
                    const k = 1 - q
                    y += dy * s * k * k
                }
            }
            return y
        }

        let raf = 0
        let last = -1
        const frame = (now: number) => {
            const p = propsRef.current
            const background = p.background ?? DEFAULTS.background
            const font = p.font
            const density = Math.round(p.density ?? DEFAULTS.density)
            const speed = p.speed ?? DEFAULTS.speed
            const curve = p.curve ?? DEFAULTS.curve
            const gap = Math.max(0, p.gap ?? DEFAULTS.gap)
            const hover = Math.max(0, p.hover ?? DEFAULTS.hover)
            const reach = Math.max(10, p.reach ?? DEFAULTS.reach)
            const base = parseColor(p.textColor ?? DEFAULTS.textColor, [232, 228, 220, 0.55])
            const acc = parseColor(p.accent ?? DEFAULTS.accent, [255, 122, 69, 1])

            const dt = last < 0 ? 0 : Math.min(0.05, Math.max(0, (now - last) / 1000))
            last = now

            const px = fontPx(font)
            const fkey = `${font?.fontFamily}|${font?.fontWeight}|${font?.fontStyle}|${font?.letterSpacing}|${px}|${dpr}|${fontEpoch}`
            const aKey = `${fkey}|${base.slice(0, 3)}|${acc.slice(0, 3)}`
            if (aKey !== atlasKey) {
                atlasKey = aKey
                atlasBase = TIERS.map((t) => buildAtlas(font, px * t.scale, base, dpr))
                atlasAccent = TIERS.map((t) => buildAtlas(font, px * t.scale, acc, dpr))
            }
            const bow = (curve / 100) * CURVE_MAX * H
            const lKey = `${fkey}|${W}|${H}|${density}|${gap}|${Math.round(Math.abs(bow))}`
            if (lKey !== laneKey) {
                laneKey = lKey
                const prev = lanes
                lanes = buildLanes(W, H, density, gap, bow, atlasBase)

                for (let i = 0; i < lanes.length && i < prev.length; i++) {
                    if (prev[i].cycle > 0) lanes[i].offset = (prev[i].offset / prev[i].cycle) * lanes[i].cycle
                }
            }

            const ease = 1 - Math.exp(-dt * 10)
            pointer.x += (pointer.tx - pointer.x) * ease
            pointer.y += (pointer.ty - pointer.y) * ease
            const pe = 1 - Math.exp(-dt * 5)
            pointer.presence += ((pointer.active ? 1 : 0) - pointer.presence) * pe
            const strength = (hover / 100) * PUSH_MAX * pointer.presence
            const tintAmt = Math.min(1, hover / 100) * pointer.presence

            const rate = (speed / 50) * BASE_RATE
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            for (const lane of lanes) {
                const tier = TIERS[lane.tier]
                lane.offset = (((lane.offset + dt * rate * tier.rate) % lane.cycle) + lane.cycle) % lane.cycle
                const bSprites = atlasBase[lane.tier]
                const aSprites = atlasAccent[lane.tier]
                const alphaBase = base[3] * tier.alpha
                const alphaAcc = acc[3] * tier.alpha
                for (const it of lane.items) {
                    const s = bSprites.sprites[it.f]
                    for (const copy of [0, -lane.cycle]) {
                        const x0 = it.x + lane.offset + copy
                        if (x0 > W || x0 + s.w < 0) continue
                        const nStrips = Math.max(1, Math.ceil(s.w / STRIP_PX))
                        const stripW = s.w / nStrips
                        const srcStrip = s.sw / nStrips
                        let yL = laneY(lane.y, x0, bow, strength, reach)
                        for (let k = 0; k < nStrips; k++) {
                            const xl = x0 + k * stripW
                            const xr = xl + stripW
                            const yR = laneY(lane.y, xr, bow, strength, reach)
                            if (xr < 0 || xl > W) {
                                yL = yR
                                continue
                            }
                            const slope = (yR - yL) / stripW

                            ctx.setTransform(dpr, slope * dpr, 0, dpr, xl * dpr, (yL - s.baseline) * dpr)
                            const sx = s.sx + k * srcStrip

                            ctx.globalAlpha = alphaBase
                            ctx.drawImage(bSprites.canvas, sx, s.sy, srcStrip + 0.5, s.sh, 0, 0, stripW + 0.5 / dpr, s.h)
                            if (tintAmt > 0.005) {
                                const cxm = xl + stripW / 2
                                const cym = (yL + yR) / 2 - s.baseline * 0.35
                                const q = ((cxm - pointer.x) ** 2 + (cym - pointer.y) ** 2) / (reach * reach)
                                if (q < 1) {
                                    const k2 = (1 - q) * (1 - q)
                                    ctx.globalAlpha = alphaAcc * tintAmt * k2
                                    const as = aSprites.sprites[it.f]
                                    ctx.drawImage(aSprites.canvas, as.sx + k * srcStrip, as.sy, srcStrip + 0.5, as.sh, 0, 0, stripW + 0.5 / dpr, as.h)
                                }
                            }
                            yL = yR
                        }
                    }
                }
            }
            ctx.globalAlpha = 1
            root.style.backgroundColor = background

            raf = requestAnimationFrame(frame)
        }
        raf = requestAnimationFrame(frame)

        const onGlobalMove = (e: PointerEvent) => {
            const rect = root.getBoundingClientRect()
            if (
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            ) {
                const ox = e.clientX - rect.left
                const oy = e.clientY - rect.top
                pointer.tx = ox
                pointer.ty = oy
                if (!pointer.active && pointer.presence < 0.01) {
                    pointer.x = ox
                    pointer.y = oy
                }
                pointer.active = true
            } else {
                pointer.active = false
            }
        }

        window.addEventListener("pointermove", onGlobalMove, { passive: true })

        return () => {
            cancelAnimationFrame(raf)
            ro.disconnect()
            fonts?.removeEventListener?.("loadingdone", onFonts)
            window.removeEventListener("pointermove", onGlobalMove)
        }
    }, [])

    return (
        <div
            ref={rootRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minWidth: 1200,
                minHeight: 800,
                overflow: "hidden",
                backgroundColor: props.background ?? DEFAULTS.background,
                ...props.style,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
            />
        </div>
    )
}