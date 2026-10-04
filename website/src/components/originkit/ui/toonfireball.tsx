"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

const TEX_PERLIN =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
            <filter id="n">
                <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="4" seed="11"/>
                <feColorMatrix type="saturate" values="0"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#n)"/>
        </svg>
    `)

const TEX_SPARK =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
            <filter id="n">
                <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="23"/>
                <feColorMatrix type="saturate" values="0"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#n)"/>
        </svg>
    `)

const TEX_WATER =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
            <filter id="n">
                <feTurbulence type="fractalNoise" baseFrequency=".025 .07" numOctaves="3" seed="37"/>
                <feColorMatrix type="saturate" values="0"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#n)"/>
        </svg>
    `)

const REF_EYE = [
    0.0, 0.3, 4.8,
] as const
const REF_DIST = Math.hypot(REF_EYE[0], REF_EYE[1], REF_EYE[2])
const DEFAULT_DISTANCE = 6
const SCENE_SCALE = DEFAULT_DISTANCE / REF_DIST

const FOV = 75
const NEAR = 0.1
const FAR = 1000

const BLOOM_THRESHOLD = 0
const BLOOM_SMOOTH_WIDTH = 0.01
const BLOOM_KERNELS = [3, 5, 7, 9, 11]
const BLOOM_FACTORS = [1.0, 0.8, 0.6, 0.4, 0.2]

const MAX_DPR = 2
const ZOOM_STEP = 0.95
const MIN_DISTANCE = 1.5
const MAX_DISTANCE = 60

const QUAD_VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const BALL_VERT = `
attribute vec3 position;
attribute vec2 uv;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const BALL_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D perlinnoise;
uniform sampler2D sparknoise;
uniform float time;
uniform vec3 color0;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color5;

float setOpacity(float r, float g, float b, float tonethreshold) {
    float tone = (r + g + b) / 3.0;
    float alpha = 1.0;
    if (tone < tonethreshold) {
        alpha = 0.0;
    }
    return alpha;
}

vec3 rgbcol(vec3 col) {
    return vec3(col.r / 255.0, col.g / 255.0, col.b / 255.0);
}

vec2 UnityPolarCoordinates(vec2 UV, vec2 Center, float RadialScale, float LengthScale) {
    vec2 delta = UV - Center;
    float radius = length(delta) * 2.0 * RadialScale;
    float angle = atan(delta.x, delta.y) * 1.0 / 6.28 * LengthScale;
    return vec2(radius, angle);
}

void main() {
    float pct = distance(vUv, vec2(0.5));

    vec3 rgbcolor0 = rgbcol(color0);
    vec3 rgbcolor1 = rgbcol(color1);
    vec3 rgbcolor2 = rgbcol(color2);
    vec3 rgbcolor5 = rgbcol(color5);

    float y = smoothstep(0.16, 0.525, pct);
    vec3 backcolor = mix(rgbcolor0, rgbcolor5, y);
    gl_FragColor = vec4(backcolor, 1.0);

    vec2 center = vec2(0.5);
    vec2 cor = UnityPolarCoordinates(vec2(vUv.x, vUv.y), center, 1.0, 1.0);

    vec2 newUv = vec2(cor.x + time, cor.x * 0.2 + cor.y);
    vec3 noisetex = texture2D(perlinnoise, mod(newUv, 1.0)).rgb;
    vec3 noisetex2 = texture2D(sparknoise, mod(newUv, 1.0)).rgb;

    float tone0 = 1.0 - smoothstep(0.3, 0.6, noisetex.r);
    float tone1 = smoothstep(0.3, 0.6, noisetex2.r);

    float opacity0 = setOpacity(tone0, tone0, tone0, 0.29);
    float opacity1 = setOpacity(tone1, tone1, tone1, 0.49);

    if (opacity1 > 0.0) {
        gl_FragColor = vec4(rgbcolor2, 0.0) * vec4(opacity1);
    } else if (opacity0 > 0.0) {
        gl_FragColor = vec4(rgbcolor1, 0.0) * vec4(opacity0);
    }
}
`

const STEAM_VERT = `
attribute vec3 position;
attribute vec2 uv;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
varying vec2 vUv;
void main() {
    vUv = uv;
    vec3 pos = position;
    if (pos.y >= 1.87) {
        pos = vec3(
            position.x * (sin((position.y - 0.6) * 1.27) - 0.16),
            position.y,
            position.z * (sin((position.y - 0.6) * 1.27) - 0.16)
        );
    } else {
        pos = vec3(
            position.x * (sin((position.y / 2.0 - 0.01) * 0.11) + 0.75),
            position.y,
            position.z * (sin((position.y / 2.0 - 0.01) * 0.11) + 0.75)
        );
    }
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const STEAM_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D perlinnoise;
uniform vec3 color4;
uniform float time;

vec3 rgbcol(vec3 col) {
    return vec3(col.r / 255.0, col.g / 255.0, col.b / 255.0);
}

void main() {
    vec3 noisetex = texture2D(perlinnoise, mod(1.0 * vec2(vUv.y - time * 2.0, vUv.x + time * 1.0), 1.0)).rgb;
    gl_FragColor = vec4(noisetex.r);

    if (gl_FragColor.r >= 0.5) {
        gl_FragColor = vec4(rgbcol(color4), gl_FragColor.r);
    } else {
        gl_FragColor = vec4(0.0);
    }
    gl_FragColor *= vec4(sin(vUv.y) - 0.1);
    gl_FragColor *= vec4(smoothstep(0.3, 0.628, vUv.y));
}
`

const FLAME_VERT = `
attribute vec3 position;
attribute vec2 uv;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform sampler2D noise;
uniform float time;
varying vec2 vUv;
void main() {
    vUv = uv;
    vec3 pos = position;
    vec3 noisetex = texture2D(noise, mod(1.0 * vec2(vUv.y - time * 2.0, vUv.x + time * 1.0), 1.0)).rgb;
    if (pos.y >= 1.87) {
        pos = vec3(
            position.x * (sin((position.y - 0.64) * 1.27) - 0.12),
            position.y,
            position.z * (sin((position.y - 0.64) * 1.27) - 0.12)
        );
    } else {
        pos = vec3(
            position.x * (sin((position.y / 2.0 - 0.01) * 0.11) + 0.79),
            position.y,
            position.z * (sin((position.y / 2.0 - 0.01) * 0.11) + 0.79)
        );
    }
    pos.xz *= noisetex.r;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const FLAME_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D noise;
uniform vec3 color4;
uniform float time;

vec3 rgbcol(vec3 col) {
    return vec3(col.r / 255.0, col.g / 255.0, col.b / 255.0);
}

void main() {
    vec3 noisetex = texture2D(noise, mod(1.0 * vec2(vUv.y - time * 2.0, vUv.x + time * 1.0), 1.0)).rgb;
    gl_FragColor = vec4(noisetex.r);

    if (gl_FragColor.r >= 0.44) {
        gl_FragColor = vec4(rgbcol(color4), gl_FragColor.r);
    } else {
        gl_FragColor = vec4(0.0);
    }
    gl_FragColor *= vec4(smoothstep(0.2, 0.628, vUv.y));
}
`

const HIGHPASS_FRAG = `
precision highp float;
uniform sampler2D tDiffuse;
uniform vec3 defaultColor;
uniform float defaultOpacity;
uniform float luminosityThreshold;
uniform float smoothWidth;
varying vec2 vUv;
void main() {
    vec4 texel = texture2D(tDiffuse, vUv);
    vec3 luma = vec3(0.299, 0.587, 0.114);
    float v = dot(texel.xyz, luma);
    vec4 outputColor = vec4(defaultColor.rgb, defaultOpacity);
    float alpha = smoothstep(luminosityThreshold, luminosityThreshold + smoothWidth, v);
    gl_FragColor = mix(outputColor, texel, alpha);
}
`

const blurFrag = (radius: number) => `
precision highp float;
varying vec2 vUv;
uniform sampler2D colorTexture;
uniform vec2 texSize;
uniform vec2 direction;

#define KERNEL_RADIUS ${radius}
#define SIGMA ${radius}.0

float gaussianPdf(in float x, in float sigma) {
    return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
}
void main() {
    vec2 invSize = 1.0 / texSize;
    float fSigma = SIGMA;
    float weightSum = gaussianPdf(0.0, fSigma);
    vec3 diffuseSum = texture2D(colorTexture, vUv).rgb * weightSum;
    for (int i = 1; i < KERNEL_RADIUS; i++) {
        float x = float(i);
        float w = gaussianPdf(x, fSigma);
        vec2 uvOffset = direction * invSize * x;
        vec3 sample1 = texture2D(colorTexture, vUv + uvOffset).rgb;
        vec3 sample2 = texture2D(colorTexture, vUv - uvOffset).rgb;
        diffuseSum += (sample1 + sample2) * w;
        weightSum += 2.0 * w;
    }
    gl_FragColor = vec4(diffuseSum / weightSum, 1.0);
}
`

const COMPOSITE_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D blurTexture1;
uniform sampler2D blurTexture2;
uniform sampler2D blurTexture3;
uniform sampler2D blurTexture4;
uniform sampler2D blurTexture5;
uniform float bloomStrength;
uniform float bloomRadius;
uniform float bloomFactors[5];

float lerpBloomFactor(const in float factor) {
    float mirrorFactor = 1.2 - factor;
    return mix(factor, mirrorFactor, bloomRadius);
}

void main() {
    vec4 sum = bloomStrength * (
        lerpBloomFactor(bloomFactors[0]) * texture2D(blurTexture1, vUv) +
        lerpBloomFactor(bloomFactors[1]) * texture2D(blurTexture2, vUv) +
        lerpBloomFactor(bloomFactors[2]) * texture2D(blurTexture3, vUv) +
        lerpBloomFactor(bloomFactors[3]) * texture2D(blurTexture4, vUv) +
        lerpBloomFactor(bloomFactors[4]) * texture2D(blurTexture5, vUv)
    );
    gl_FragColor = vec4(clamp(sum.rgb, 0.0, 1.0), 1.0);
}
`

const COPY_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tDiffuse;
void main() {
    vec4 texel = texture2D(tDiffuse, vUv);
    float luma = max(texel.r, max(texel.g, texel.b));
    float dist = distance(vUv, vec2(0.5));
    float edge = 1.0 - smoothstep(0.36, 0.49, dist);
    float alpha = clamp(luma * 1.6, 0.0, 1.0) * edge;
    gl_FragColor = vec4(texel.rgb * alpha, alpha);
}
`

type Geo = { pos: Float32Array; uv: Float32Array; index: Uint16Array }

function sphereGeometry(radius: number, wSeg: number, hSeg: number): Geo {
    const pos: number[] = []
    const uv: number[] = []
    const index: number[] = []
    const grid: number[][] = []
    let n = 0

    for (let iy = 0; iy <= hSeg; iy++) {
        const row: number[] = []
        const v = iy / hSeg
        let uOffset = 0
        if (iy === 0) uOffset = 0.5 / wSeg
        else if (iy === hSeg) uOffset = -0.5 / wSeg

        for (let ix = 0; ix <= wSeg; ix++) {
            const u = ix / wSeg
            pos.push(
                -radius * Math.cos(u * Math.PI * 2) * Math.sin(v * Math.PI),
                radius * Math.cos(v * Math.PI),
                radius * Math.sin(u * Math.PI * 2) * Math.sin(v * Math.PI)
            )
            uv.push(u + uOffset, 1 - v)
            row.push(n++)
        }
        grid.push(row)
    }

    for (let iy = 0; iy < hSeg; iy++) {
        for (let ix = 0; ix < wSeg; ix++) {
            const a = grid[iy][ix + 1]
            const b = grid[iy][ix]
            const c = grid[iy + 1][ix]
            const d = grid[iy + 1][ix + 1]
            if (iy !== 0) index.push(a, b, d)
            if (iy !== hSeg - 1) index.push(b, c, d)
        }
    }

    return {
        pos: new Float32Array(pos),
        uv: new Float32Array(uv),
        index: new Uint16Array(index),
    }
}

function cylinderGeometry(
    rTop: number,
    rBottom: number,
    height: number,
    radialSeg: number,
    heightSeg: number
): Geo {
    const pos: number[] = []
    const uv: number[] = []
    const index: number[] = []
    const grid: number[][] = []
    const half = height / 2
    let n = 0

    for (let y = 0; y <= heightSeg; y++) {
        const row: number[] = []
        const v = y / heightSeg
        const r = v * (rBottom - rTop) + rTop
        for (let x = 0; x <= radialSeg; x++) {
            const u = x / radialSeg
            const theta = u * Math.PI * 2
            pos.push(r * Math.sin(theta), -v * height + half, r * Math.cos(theta))
            uv.push(u, 1 - v)
            row.push(n++)
        }
        grid.push(row)
    }

    for (let x = 0; x < radialSeg; x++) {
        for (let y = 0; y < heightSeg; y++) {
            const a = grid[y][x]
            const b = grid[y + 1][x]
            const c = grid[y + 1][x + 1]
            const d = grid[y][x + 1]
            if (rTop > 0 || y !== 0) index.push(a, b, d)
            if (rBottom > 0 || y !== heightSeg - 1) index.push(b, c, d)
        }
    }

    return {
        pos: new Float32Array(pos),
        uv: new Float32Array(uv),
        index: new Uint16Array(index),
    }
}

type M4 = Float32Array

function perspective(fovDeg: number, aspect: number, near: number, far: number): M4 {
    const f = 1 / Math.tan((fovDeg * Math.PI) / 360)
    const nf = 1 / (near - far)
    const m = new Float32Array(16)
    m[0] = f / aspect
    m[5] = f
    m[10] = (far + near) * nf
    m[11] = -1
    m[14] = 2 * far * near * nf
    return m
}

function lookAt(eye: number[], target: number[], up: number[]): M4 {
    let zx = eye[0] - target[0]
    let zy = eye[1] - target[1]
    let zz = eye[2] - target[2]
    let l = Math.hypot(zx, zy, zz) || 1
    zx /= l
    zy /= l
    zz /= l

    let xx = up[1] * zz - up[2] * zy
    let xy = up[2] * zx - up[0] * zz
    let xz = up[0] * zy - up[1] * zx
    l = Math.hypot(xx, xy, xz) || 1
    xx /= l
    xy /= l
    xz /= l

    const yx = zy * xz - zz * xy
    const yy = zz * xx - zx * xz
    const yz = zx * xy - zy * xx

    const m = new Float32Array(16)
    m[0] = xx; m[4] = xy; m[8] = xz
    m[1] = yx; m[5] = yy; m[9] = yz
    m[2] = zx; m[6] = zy; m[10] = zz
    m[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2])
    m[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2])
    m[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2])
    m[15] = 1
    return m
}

function compose(
    out: M4,
    tx: number,
    ty: number,
    tz: number,
    roll: number,
    sx: number,
    sy: number,
    sz: number
): M4 {
    const c = Math.cos(roll)
    const s = Math.sin(roll)
    out[0] = c * sx; out[1] = s * sx; out[2] = 0; out[3] = 0
    out[4] = -s * sy; out[5] = c * sy; out[6] = 0; out[7] = 0
    out[8] = 0; out[9] = 0; out[10] = sz; out[11] = 0
    out[12] = tx; out[13] = ty; out[14] = tz; out[15] = 1
    return out
}

function multiply(out: M4, a: M4, b: M4): M4 {
    for (let c = 0; c < 4; c++) {
        const b0 = b[c * 4], b1 = b[c * 4 + 1], b2 = b[c * 4 + 2], b3 = b[c * 4 + 3]
        out[c * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3
        out[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3
        out[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3
        out[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3
    }
    return out
}

function parseColor(input: string | undefined): [number, number, number] {
    if (!input) return [0, 0, 0]
    let s = String(input).trim()

    const token = s.match(/^var\(\s*--[^,)]+\s*,\s*(.+)\)\s*$/i)
    if (token) s = token[1].trim()

    const rgb = s.match(/rgba?\(([^)]+)\)/i)
    if (rgb) {
        const p = rgb[1].split(/[,\s/]+/).filter(Boolean).map(parseFloat)
        return [p[0] || 0, p[1] || 0, p[2] || 0]
    }

    const hsl = s.match(/hsla?\(([^)]+)\)/i)
    if (hsl) {
        const p = hsl[1].split(/[,\s/]+/).filter(Boolean)
        const h = (((parseFloat(p[0]) || 0) % 360) + 360) / 360
        const sat = (parseFloat(p[1]) || 0) / 100
        const li = (parseFloat(p[2]) || 0) / 100
        const q = li < 0.5 ? li * (1 + sat) : li + sat - li * sat
        const pp = 2 * li - q
        const chan = (t: number) => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1 / 6) return pp + (q - pp) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return pp + (q - pp) * (2 / 3 - t) * 6
            return pp
        }
        return [chan(h + 1 / 3) * 255, chan(h) * 255, chan(h - 1 / 3) * 255]
    }

    let hx = s.replace("#", "")
    if (hx.length === 3 || hx.length === 4) {
        hx = hx.split("").map((ch) => ch + ch).join("")
    }
    hx = hx.padEnd(6, "0")
    const v = (i: number) => {
        const n = parseInt(hx.slice(i, i + 2), 16)
        return Number.isFinite(n) ? n : 0
    }
    return [v(0), v(2), v(4)]
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (process.env.NODE_ENV !== "production" && !gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("[ToonFireball] shader compile error:", gl.getShaderInfoLog(sh))
    }
    return sh
}

function program(gl: WebGLRenderingContext, vs: string, fs: string) {
    const p = gl.createProgram()!
    const v = compile(gl, gl.VERTEX_SHADER, vs)
    const f = compile(gl, gl.FRAGMENT_SHADER, fs)
    gl.attachShader(p, v)
    gl.attachShader(p, f)
    gl.linkProgram(p)

    gl.deleteShader(v)
    gl.deleteShader(f)
    return p
}

type RT = { fb: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number }

function makeRT(gl: WebGLRenderingContext, w: number, h: number): RT {
    const tex = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    const fb = gl.createFramebuffer()!
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
    return { fb, tex, w, h }
}

export interface ToonFireballProps {
    background?: string
    baseColor?: string
    accentColor?: string

    speed?: number

    distance?: number

    interaction?: boolean

    dragSensitivity?: number
    fire?: { core?: string; trail?: string; steam?: string }

    bloom?: { strength?: number; radius?: number }
    className?: string
    style?: React.CSSProperties
}

const FIRE_DEFAULTS = { core: "#000000", trail: "#401b00", steam: "#4f4f4f" }
const BLOOM_DEFAULTS = { strength: 350, radius: 39 }

export default function ToonFireball(props: ToonFireballProps) {
    const {
        background = "#000000",
        baseColor = "#510e05",
        accentColor = "#b59c18",
        speed = 100,
        distance = 7,
        interaction = true,
        dragSensitivity = 100,
        fire,
        bloom,
        className,
        style,
    } = props

    const f = { ...FIRE_DEFAULTS, ...(fire || {}) }
    const b = { ...BLOOM_DEFAULTS, ...(bloom || {}) }

    const hostRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const live = useRef({
        color0: parseColor(f.core),
        color1: parseColor(baseColor),
        color2: parseColor(accentColor),
        color4: parseColor(f.steam),
        color5: parseColor(f.trail),
        speed,
        strength: b.strength / 100,
        radius: b.radius / 100,
        interactionEnabled: interaction,
        dragSensitivity: dragSensitivity / 50,
    })
    live.current.color0 = parseColor(f.core)
    live.current.color1 = parseColor(baseColor)
    live.current.color2 = parseColor(accentColor)
    live.current.color4 = parseColor(f.steam)
    live.current.color5 = parseColor(f.trail)
    live.current.speed = speed
    live.current.strength = b.strength / 100
    live.current.radius = b.radius / 100
    live.current.interactionEnabled = interaction
    live.current.dragSensitivity = dragSensitivity / 50

    const orbit = useRef({
        theta: Math.atan2(REF_EYE[0], REF_EYE[2]),
        phi: Math.acos(REF_EYE[1] / REF_DIST),
        radius: distance,
    })

    useEffect(() => {
        orbit.current.radius = distance
    }, [distance])

    useEffect(() => {
        const canvas = canvasRef.current
        const host = hostRef.current
        if (!canvas || !host) return

        const ctxOpts: WebGLContextAttributes = {
            alpha: true,
            antialias: false,
            premultipliedAlpha: true,
        }
        const gl = (canvas.getContext("webgl2", ctxOpts) ||
            canvas.getContext("webgl", ctxOpts)) as WebGLRenderingContext | null
        if (!gl) return

        let disposed = false

        const mkMesh = (g: Geo) => {
            const pos = gl.createBuffer()!
            gl.bindBuffer(gl.ARRAY_BUFFER, pos)
            gl.bufferData(gl.ARRAY_BUFFER, g.pos, gl.STATIC_DRAW)
            const uv = gl.createBuffer()!
            gl.bindBuffer(gl.ARRAY_BUFFER, uv)
            gl.bufferData(gl.ARRAY_BUFFER, g.uv, gl.STATIC_DRAW)
            const idx = gl.createBuffer()!
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx)
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.index, gl.STATIC_DRAW)
            return { pos, uv, idx, count: g.index.length }
        }
        type Mesh = ReturnType<typeof mkMesh>
        const mBall = mkMesh(sphereGeometry(1, 30, 30))
        const mFlame = mkMesh(cylinderGeometry(1, 0, 5.3, 50, 50))
        const mSteam = mkMesh(cylinderGeometry(1.11, 0, 5.3, 50, 50))

        const quad = gl.createBuffer()!
        gl.bindBuffer(gl.ARRAY_BUFFER, quad)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

        const pBall = program(gl, BALL_VERT, BALL_FRAG)
        const pFlame = program(gl, FLAME_VERT, FLAME_FRAG)
        const pSteam = program(gl, STEAM_VERT, STEAM_FRAG)
        const pHigh = program(gl, QUAD_VERT, HIGHPASS_FRAG)
        const pBlur = BLOOM_KERNELS.map((k) => program(gl, QUAD_VERT, blurFrag(k)))
        const pComp = program(gl, QUAD_VERT, COMPOSITE_FRAG)
        const pCopy = program(gl, QUAD_VERT, COPY_FRAG)

        const loc = (p: WebGLProgram, names: string[]) => {
            const o: Record<string, WebGLUniformLocation | null> = {}
            for (const n of names) o[n] = gl.getUniformLocation(p, n)
            return o
        }
        const uBall = loc(pBall, [
            "projectionMatrix", "modelViewMatrix", "perlinnoise", "sparknoise",
            "time", "color0", "color1", "color2", "color5",
        ])
        const uFlame = loc(pFlame, ["projectionMatrix", "modelViewMatrix", "noise", "time", "color4"])
        const uSteam = loc(pSteam, ["projectionMatrix", "modelViewMatrix", "perlinnoise", "time", "color4"])
        const uHigh = loc(pHigh, [
            "tDiffuse", "defaultColor", "defaultOpacity", "luminosityThreshold", "smoothWidth",
        ])
        const uBlur = pBlur.map((p) => loc(p, ["colorTexture", "texSize", "direction"]))
        const uComp = loc(pComp, [
            "blurTexture1", "blurTexture2", "blurTexture3", "blurTexture4",
            "blurTexture5", "bloomStrength", "bloomRadius", "bloomFactors[0]",
        ])
        const uCopy = loc(pCopy, ["tDiffuse"])

        const attrs = (p: WebGLProgram) => ({
            position: gl.getAttribLocation(p, "position"),
            uv: gl.getAttribLocation(p, "uv"),
        })
        const aBall = attrs(pBall)
        const aFlame = attrs(pFlame)
        const aSteam = attrs(pSteam)
        const aQuadHigh = gl.getAttribLocation(pHigh, "aPos")
        const aQuadBlur = pBlur.map((p) => gl.getAttribLocation(p, "aPos"))
        const aQuadComp = gl.getAttribLocation(pComp, "aPos")
        const aQuadCopy = gl.getAttribLocation(pCopy, "aPos")

        const mkTex = (src: string) => {
            const tex = gl.createTexture()!
            gl.bindTexture(gl.TEXTURE_2D, tex)
            gl.texImage2D(
                gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([128, 128, 128, 255])
            )
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            const img = new Image()
            img.onload = () => {
                if (disposed) return
                gl.bindTexture(gl.TEXTURE_2D, tex)
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
                gl.generateMipmap(gl.TEXTURE_2D)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0)
            }
            img.src = src
            return tex
        }
        const texPerlin = mkTex(TEX_PERLIN)
        const texSpark = mkTex(TEX_SPARK)
        const texWater = mkTex(TEX_WATER)

        let rtScene: RT | null = null
        let rtDepth: WebGLRenderbuffer | null = null
        let rtBright: RT | null = null
        let rtH: RT[] = []
        let rtV: RT[] = []
        const blurSize: [number, number][] = []
        let vw = 0
        let vh = 0

        const dropRT = (rt: RT | null) => {
            if (!rt) return
            gl.deleteFramebuffer(rt.fb)
            gl.deleteTexture(rt.tex)
        }
        const dropAllRTs = () => {
            dropRT(rtScene)
            dropRT(rtBright)
            rtH.forEach(dropRT)
            rtV.forEach(dropRT)
            if (rtDepth) gl.deleteRenderbuffer(rtDepth)
            rtScene = null
            rtBright = null
            rtDepth = null
            rtH = []
            rtV = []
            blurSize.length = 0
        }

        const resize = () => {
            const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1)
            const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
            const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
            if (w === vw && h === vh) return
            vw = w
            vh = h
            canvas.width = w
            canvas.height = h

            dropAllRTs()

            rtScene = makeRT(gl, w, h)
            rtDepth = gl.createRenderbuffer()
            gl.bindRenderbuffer(gl.RENDERBUFFER, rtDepth)
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h)
            gl.bindFramebuffer(gl.FRAMEBUFFER, rtScene.fb)
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rtDepth)

            let rx = Math.round(w / 2)
            let ry = Math.round(h / 2)
            rtBright = makeRT(gl, Math.max(1, rx), Math.max(1, ry))
            for (let i = 0; i < BLOOM_KERNELS.length; i++) {
                rtH.push(makeRT(gl, Math.max(1, rx), Math.max(1, ry)))
                rtV.push(makeRT(gl, Math.max(1, rx), Math.max(1, ry)))
                blurSize.push([Math.max(1, rx), Math.max(1, ry)])
                rx = Math.round(rx / 2)
                ry = Math.round(ry / 2)
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        }

        const ro = new ResizeObserver(resize)
        ro.observe(host)
        resize()

        let dragging = false
        let lastX = 0
        let lastY = 0

        const onDown = (e: PointerEvent) => {
            if (!live.current.interactionEnabled || e.button !== 0) return
            dragging = true
            lastX = e.clientX
            lastY = e.clientY
        }
        const onMove = (e: PointerEvent) => {
            if (!dragging) return
            const h = canvas.clientHeight || 1
            const sens = live.current.dragSensitivity
            orbit.current.theta -= (2 * Math.PI * (e.clientX - lastX) * sens) / h
            orbit.current.phi -= (2 * Math.PI * (e.clientY - lastY) * sens) / h
            const EPS = 0.000001
            orbit.current.phi = Math.max(EPS, Math.min(Math.PI - EPS, orbit.current.phi))
            lastX = e.clientX
            lastY = e.clientY
        }
        const onUp = () => {
            dragging = false
        }
        const onWheel = (e: WheelEvent) => {
            if (!live.current.interactionEnabled) return
            e.preventDefault()
            const base = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP
            const s = Math.pow(base, live.current.dragSensitivity)
            orbit.current.radius = Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, orbit.current.radius * s))
        }
        canvas.addEventListener("pointerdown", onDown)
        window.addEventListener("pointermove", onMove)
        window.addEventListener("pointerup", onUp)
        window.addEventListener("pointercancel", onUp)
        canvas.addEventListener("wheel", onWheel, { passive: false })

        const proj = new Float32Array(16)
        const view = new Float32Array(16)
        const model = new Float32Array(16)
        const mv = new Float32Array(16)
        const eye = [0, 0, 0]

        const drawMesh = (mesh: Mesh, a: { position: number; uv: number }) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.pos)
            gl.enableVertexAttribArray(a.position)
            gl.vertexAttribPointer(a.position, 3, gl.FLOAT, false, 0, 0)
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uv)
            gl.enableVertexAttribArray(a.uv)
            gl.vertexAttribPointer(a.uv, 2, gl.FLOAT, false, 0, 0)
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.idx)
            gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0)
            gl.disableVertexAttribArray(a.position)
            gl.disableVertexAttribArray(a.uv)
        }

        const fullscreen = (attr: number) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, quad)
            gl.enableVertexAttribArray(attr)
            gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0)
            gl.drawArrays(gl.TRIANGLES, 0, 3)
            gl.disableVertexAttribArray(attr)
        }

        let acc = 0
        let last = 0
        let raf = 0

        const frame = (now: number) => {
            raf = requestAnimationFrame(frame)
            const dt = last ? Math.min(50, now - last) : 0
            last = now
            const L = live.current
            acc += dt * (L.speed / 50)
            resize()
            if (!rtScene || !rtBright) return

            const tBall = -acc / 2000
            const tCone = -acc / 6000

            const o = orbit.current
            const sp = Math.sin(o.phi)
            eye[0] = o.radius * sp * Math.sin(o.theta)
            eye[1] = o.radius * Math.cos(o.phi)
            eye[2] = o.radius * sp * Math.cos(o.theta)
            proj.set(perspective(FOV, vw / vh, NEAR, FAR))
            view.set(lookAt(eye, [0, 0, 0], [0, 1, 0]))

            gl.bindFramebuffer(gl.FRAMEBUFFER, rtScene.fb)
            gl.viewport(0, 0, vw, vh)
            gl.clearColor(0, 0, 0, 1)
            gl.enable(gl.DEPTH_TEST)
            gl.depthMask(true)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
            gl.disable(gl.BLEND)
            gl.enable(gl.CULL_FACE)
            gl.cullFace(gl.BACK)
            gl.frontFace(gl.CCW)

            gl.useProgram(pBall)
            compose(model, 1 * SCENE_SCALE, 0, 0, 0, 0.78 * SCENE_SCALE, 0.78 * SCENE_SCALE, 0.78 * SCENE_SCALE)
            multiply(mv, view, model)
            gl.uniformMatrix4fv(uBall.projectionMatrix, false, proj)
            gl.uniformMatrix4fv(uBall.modelViewMatrix, false, mv)
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, texPerlin)
            gl.uniform1i(uBall.perlinnoise, 0)
            gl.activeTexture(gl.TEXTURE1)
            gl.bindTexture(gl.TEXTURE_2D, texSpark)
            gl.uniform1i(uBall.sparknoise, 1)
            gl.uniform1f(uBall.time, tBall)
            gl.uniform3fv(uBall.color0, L.color0)
            gl.uniform3fv(uBall.color1, L.color1)
            gl.uniform3fv(uBall.color2, L.color2)
            gl.uniform3fv(uBall.color5, L.color5)
            drawMesh(mBall, aBall)

            gl.disable(gl.CULL_FACE)
            gl.depthMask(false)
            gl.enable(gl.BLEND)
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

            const coneZ = (x: number) => view[2] * x + view[14]
            const flameX = (1 - 4.78) * SCENE_SCALE
            const steamX = (1 - 4.05) * SCENE_SCALE
            const drawFlame = () => {
                gl.useProgram(pFlame)
                compose(model, flameX, 0, 0, -Math.PI / 2, 2 * SCENE_SCALE, 2 * SCENE_SCALE, 2 * SCENE_SCALE)
                multiply(mv, view, model)
                gl.uniformMatrix4fv(uFlame.projectionMatrix, false, proj)
                gl.uniformMatrix4fv(uFlame.modelViewMatrix, false, mv)
                gl.activeTexture(gl.TEXTURE0)
                gl.bindTexture(gl.TEXTURE_2D, texPerlin)
                gl.uniform1i(uFlame.noise, 0)
                gl.uniform1f(uFlame.time, tCone)
                gl.uniform3fv(uFlame.color4, L.color5)
                drawMesh(mFlame, aFlame)
            }
            const drawSteam = () => {
                gl.useProgram(pSteam)
                compose(model, steamX, 0, 0, -Math.PI / 2, 1.5 * SCENE_SCALE, 1.7 * SCENE_SCALE, 1.5 * SCENE_SCALE)
                multiply(mv, view, model)
                gl.uniformMatrix4fv(uSteam.projectionMatrix, false, proj)
                gl.uniformMatrix4fv(uSteam.modelViewMatrix, false, mv)
                gl.activeTexture(gl.TEXTURE0)
                gl.bindTexture(gl.TEXTURE_2D, texWater)
                gl.uniform1i(uSteam.perlinnoise, 0)
                gl.uniform1f(uSteam.time, tCone)
                gl.uniform3fv(uSteam.color4, L.color4)
                drawMesh(mSteam, aSteam)
            }
            if (coneZ(flameX) <= coneZ(steamX)) {
                drawFlame()
                drawSteam()
            } else {
                drawSteam()
                drawFlame()
            }

            gl.disable(gl.DEPTH_TEST)
            gl.disable(gl.BLEND)
            gl.bindFramebuffer(gl.FRAMEBUFFER, rtBright.fb)
            gl.viewport(0, 0, rtBright.w, rtBright.h)
            gl.useProgram(pHigh)
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, rtScene.tex)
            gl.uniform1i(uHigh.tDiffuse, 0)
            gl.uniform3f(uHigh.defaultColor, 0, 0, 0)
            gl.uniform1f(uHigh.defaultOpacity, 0)
            gl.uniform1f(uHigh.luminosityThreshold, BLOOM_THRESHOLD)
            gl.uniform1f(uHigh.smoothWidth, BLOOM_SMOOTH_WIDTH)
            fullscreen(aQuadHigh)

            let src: RT = rtBright
            for (let i = 0; i < pBlur.length; i++) {
                const [bw, bh] = blurSize[i]
                gl.useProgram(pBlur[i])
                gl.uniform2f(uBlur[i].texSize, bw, bh)

                gl.bindFramebuffer(gl.FRAMEBUFFER, rtH[i].fb)
                gl.viewport(0, 0, rtH[i].w, rtH[i].h)
                gl.activeTexture(gl.TEXTURE0)
                gl.bindTexture(gl.TEXTURE_2D, src.tex)
                gl.uniform1i(uBlur[i].colorTexture, 0)
                gl.uniform2f(uBlur[i].direction, 1, 0)
                fullscreen(aQuadBlur[i])

                gl.bindFramebuffer(gl.FRAMEBUFFER, rtV[i].fb)
                gl.viewport(0, 0, rtV[i].w, rtV[i].h)
                gl.activeTexture(gl.TEXTURE0)
                gl.bindTexture(gl.TEXTURE_2D, rtH[i].tex)
                gl.uniform1i(uBlur[i].colorTexture, 0)
                gl.uniform2f(uBlur[i].direction, 0, 1)
                fullscreen(aQuadBlur[i])

                src = rtV[i]
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER, rtH[0].fb)
            gl.viewport(0, 0, rtH[0].w, rtH[0].h)
            gl.useProgram(pComp)
            for (let i = 0; i < 5; i++) {
                gl.activeTexture(gl.TEXTURE0 + i)
                gl.bindTexture(gl.TEXTURE_2D, rtV[i].tex)
                gl.uniform1i(uComp["blurTexture" + (i + 1)], i)
            }
            gl.uniform1f(uComp.bloomStrength, L.strength)
            gl.uniform1f(uComp.bloomRadius, L.radius)
            gl.uniform1fv(uComp["bloomFactors[0]"], BLOOM_FACTORS)
            fullscreen(aQuadComp)

            gl.bindFramebuffer(gl.FRAMEBUFFER, null)
            gl.viewport(0, 0, vw, vh)
            gl.clearColor(0, 0, 0, 0)
            gl.clear(gl.COLOR_BUFFER_BIT)
            gl.enable(gl.BLEND)
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
            gl.useProgram(pCopy)
            gl.uniform1i(uCopy.tDiffuse, 0)
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, rtScene.tex)
            fullscreen(aQuadCopy)

            gl.bindTexture(gl.TEXTURE_2D, rtH[0].tex)
            fullscreen(aQuadCopy)
            gl.disable(gl.BLEND)
        }
        raf = requestAnimationFrame(frame)

        return () => {
            disposed = true
            cancelAnimationFrame(raf)
            ro.disconnect()
            canvas.removeEventListener("pointerdown", onDown)
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerup", onUp)
            window.removeEventListener("pointercancel", onUp)
            canvas.removeEventListener("wheel", onWheel)

            dropAllRTs()
            for (const m of [mBall, mFlame, mSteam]) {
                gl.deleteBuffer(m.pos)
                gl.deleteBuffer(m.uv)
                gl.deleteBuffer(m.idx)
            }
            gl.deleteBuffer(quad)
            for (const p of [pBall, pFlame, pSteam, pHigh, pComp, pCopy, ...pBlur]) {
                gl.deleteProgram(p)
            }
            gl.deleteTexture(texPerlin)
            gl.deleteTexture(texSpark)
            gl.deleteTexture(texWater)

        }
    }, [])

    return (
        <div
            ref={hostRef}
            className={className}
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
                background,
                ...style,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    display: "block",
                    touchAction: "none",
                }}
            />
        </div>
    )
}